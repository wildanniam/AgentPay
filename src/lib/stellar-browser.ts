"use client";

import { Buffer } from "buffer";
import {
  Address,
  Asset,
  Contract,
  Horizon,
  Networks,
  Operation,
  TransactionBuilder,
  nativeToScVal,
  rpc
} from "@stellar/stellar-sdk";
import { getAddress, getNetwork, isConnected, requestAccess, signTransaction } from "@stellar/freighter-api";

export const STELLAR_TESTNET_PASSPHRASE =
  process.env.NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE ?? Networks.TESTNET;
export const STELLAR_HORIZON_URL =
  process.env.NEXT_PUBLIC_STELLAR_HORIZON_URL ?? "https://horizon-testnet.stellar.org";
export const STELLAR_RPC_URL =
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org";
export const READINESS_PING_AMOUNT =
  process.env.NEXT_PUBLIC_STELLAR_READINESS_PING_AMOUNT ?? "0.00001";

export type WalletReadiness = {
  address: string;
  network: string;
  xlmBalance: string;
  hasUsdcTrustline: boolean;
};

export async function connectFreighterWallet() {
  const connected = await isConnected();

  if (connected.error || !connected.isConnected) {
    throw new Error(formatFreighterError(connected.error, "Freighter is not installed or is not available in this browser."));
  }

  const access = await requestAccess();

  if (access.error || !access.address) {
    throw new Error(formatFreighterError(access.error, "Freighter access was rejected."));
  }

  return access.address;
}

export async function getFreighterAddressIfAllowed() {
  const connected = await isConnected();

  if (connected.error || !connected.isConnected) {
    return null;
  }

  const address = await getAddress();
  return address.error || !address.address ? null : address.address;
}

export async function loadWalletReadiness(address: string): Promise<WalletReadiness> {
  const network = await getNetwork();

  if (network.error) {
    throw new Error(formatFreighterError(network.error, "Unable to read the Freighter network."));
  }

  if (network.network !== "TESTNET") {
    throw new Error("Freighter must be set to Stellar Testnet.");
  }

  const response = await fetch(`${STELLAR_HORIZON_URL}/accounts/${address}`, {
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error("Unable to load wallet balances from Stellar testnet.");
  }

  const account = (await response.json()) as {
    balances: Array<{
      balance: string;
      asset_type: string;
      asset_code?: string;
    }>;
  };
  const nativeBalance = account.balances.find((balance) => balance.asset_type === "native");
  const hasUsdcTrustline = account.balances.some((balance) => balance.asset_code === "USDC");

  return {
    address,
    network: network.network,
    xlmBalance: nativeBalance?.balance ?? "0",
    hasUsdcTrustline
  };
}

export async function sendReadinessPing({
  source,
  destination
}: {
  source: string;
  destination: string;
}) {
  if (source === destination) {
    throw new Error("Readiness ping recipient must be different from the connected wallet.");
  }

  const server = new Horizon.Server(STELLAR_HORIZON_URL);
  const account = await server.loadAccount(source);
  const fee = String(await server.fetchBaseFee());
  const transaction = new TransactionBuilder(account, {
    fee,
    networkPassphrase: STELLAR_TESTNET_PASSPHRASE
  })
    .addOperation(
      Operation.payment({
        destination,
        asset: Asset.native(),
        amount: READINESS_PING_AMOUNT
      })
    )
    .setTimeout(60)
    .build();

  const signed = await signTransaction(transaction.toXDR(), {
    networkPassphrase: STELLAR_TESTNET_PASSPHRASE,
    address: source
  });

  if (signed.error || !signed.signedTxXdr) {
    throw new Error(formatFreighterError(signed.error, "Freighter did not return a signed transaction."));
  }

  const signedTransaction = TransactionBuilder.fromXDR(
    signed.signedTxXdr,
    STELLAR_TESTNET_PASSPHRASE
  );
  const result = await server.submitTransaction(signedTransaction);

  return {
    hash: result.hash,
    ledger: result.ledger
  };
}

export async function registerToolOnchain({
  source,
  contractId,
  toolId,
  metadataHash
}: {
  source: string;
  contractId: string;
  toolId: string;
  metadataHash: string;
}) {
  const server = new rpc.Server(STELLAR_RPC_URL);
  const account = await server.getAccount(source);
  const contract = new Contract(contractId);
  const hashBytes = Buffer.from(metadataHash, "hex");
  const transaction = new TransactionBuilder(account, {
    fee: "100000",
    networkPassphrase: STELLAR_TESTNET_PASSPHRASE
  })
    .addOperation(
      contract.call(
        "register_tool",
        new Address(source).toScVal(),
        nativeToScVal(toolId, { type: "string" }),
        nativeToScVal(hashBytes)
      )
    )
    .setTimeout(60)
    .build();

  const simulation = await server.simulateTransaction(transaction);

  if (rpc.Api.isSimulationError(simulation)) {
    throw new Error(simulation.error);
  }

  const prepared = rpc.assembleTransaction(transaction, simulation).build();
  const signed = await signTransaction(prepared.toXDR(), {
    networkPassphrase: STELLAR_TESTNET_PASSPHRASE,
    address: source
  });

  if (signed.error || !signed.signedTxXdr) {
    throw new Error(
      formatFreighterError(signed.error, "Freighter did not return a signed contract transaction.")
    );
  }

  const signedTransaction = TransactionBuilder.fromXDR(
    signed.signedTxXdr,
    STELLAR_TESTNET_PASSPHRASE
  );
  const submission = await server.sendTransaction(signedTransaction);

  if (submission.status === "ERROR") {
    throw new Error(submission.errorResult?.toString() ?? "Contract transaction submission failed.");
  }

  const final = await waitForSorobanTransaction(server, submission.hash);

  if (final.status !== "SUCCESS") {
    throw new Error(`Contract transaction ended with status ${final.status}.`);
  }

  return {
    hash: submission.hash,
    ledger: final.ledger
  };
}

async function waitForSorobanTransaction(server: rpc.Server, hash: string) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const transaction = await server.getTransaction(hash);

    if (transaction.status !== "NOT_FOUND") {
      return transaction;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 1000));
  }

  throw new Error("Timed out waiting for Stellar contract transaction confirmation.");
}

function formatFreighterError(error: unknown, fallback: string) {
  if (!error) {
    return fallback;
  }

  if (typeof error === "string") {
    return error;
  }

  if (typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return fallback;
}
