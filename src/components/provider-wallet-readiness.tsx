"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Plug,
  RefreshCcw,
  Send,
  Unplug,
  Wallet
} from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/ui/status-badge";
import {
  READINESS_PING_AMOUNT,
  connectFreighterWallet,
  getFreighterAddressIfAllowed,
  loadWalletReadiness,
  sendReadinessPing,
  type WalletReadiness
} from "@/lib/stellar-browser";
import { shortAddress } from "@/lib/text";

type PingState = {
  status: "idle" | "pending" | "success" | "error";
  message: string;
  hash?: string;
  ledger?: number;
};

export function ProviderWalletReadiness({
  value,
  onWalletChange
}: {
  value: string;
  onWalletChange: (wallet: string) => void;
}) {
  const [readiness, setReadiness] = useState<WalletReadiness | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [message, setMessage] = useState("");
  const [ping, setPing] = useState<PingState>({ status: "idle", message: "" });

  const wallet = value;
  const recipient = process.env.NEXT_PUBLIC_STELLAR_READINESS_RECIPIENT_PUBLIC_KEY ?? "";
  const isSelfPing = Boolean(wallet && recipient && wallet === recipient);
  const canPing = Boolean(wallet && recipient && readiness && !isSelfPing && ping.status !== "pending");
  const walletLabel = wallet ? shortAddress(wallet) : "No wallet connected";

  useEffect(() => {
    let cancelled = false;

    getFreighterAddressIfAllowed()
      .then(async (address) => {
        if (!address || cancelled) {
          return;
        }

        onWalletChange(address);
        await refreshReadiness(address, false);
      })
      .catch(() => undefined);

    return () => {
      cancelled = true;
    };
    // Only run on initial mount; this should not re-prompt Freighter.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const proofSummary = useMemo(() => {
    if (!readiness) {
      return [
        { label: "Network", value: "Waiting for Freighter", tone: "muted" as const },
        { label: "XLM balance", value: "-", tone: "muted" as const },
        { label: "USDC trustline", value: "-", tone: "muted" as const }
      ];
    }

    return [
      { label: "Network", value: readiness.network, tone: "success" as const },
      { label: "XLM balance", value: formatBalance(readiness.xlmBalance), tone: "network" as const },
      {
        label: "USDC trustline",
        value: readiness.hasUsdcTrustline ? "Ready" : "Missing",
        tone: readiness.hasUsdcTrustline ? ("success" as const) : ("danger" as const)
      }
    ];
  }, [readiness]);

  async function connect() {
    setStatus("loading");
    setMessage("Opening Freighter permission request...");

    try {
      const address = await connectFreighterWallet();
      onWalletChange(address);
      await refreshReadiness(address, true);
      toast.success("Provider wallet connected", {
        description: shortAddress(address)
      });
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to connect Freighter.");
    }
  }

  function disconnect() {
    setReadiness(null);
    setStatus("idle");
    setMessage("Disconnected locally. Freighter authorization remains controlled by the extension.");
    setPing({ status: "idle", message: "" });
    onWalletChange("");
  }

  async function refreshReadiness(address = wallet, showToast = true) {
    if (!address) {
      setStatus("idle");
      setMessage("Connect Freighter to check the payout wallet.");
      return;
    }

    setStatus("loading");
    setMessage("Checking Stellar testnet wallet readiness...");

    try {
      const walletReadiness = await loadWalletReadiness(address);
      setReadiness(walletReadiness);
      setStatus("ready");
      setMessage(
        walletReadiness.hasUsdcTrustline
          ? "Wallet can receive x402 USDC payments on testnet."
          : "Wallet is connected, but the USDC trustline is still missing."
      );

      if (showToast) {
        toast.success("Wallet readiness checked");
      }
    } catch (error) {
      setReadiness(null);
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to check wallet readiness.");
    }
  }

  async function sendPing() {
    if (!recipient) {
      setPing({
        status: "error",
        message: "Set NEXT_PUBLIC_STELLAR_READINESS_RECIPIENT_PUBLIC_KEY before sending a ping."
      });
      return;
    }

    if (isSelfPing) {
      setPing({
        status: "error",
        message: "Readiness recipient must be different from the connected provider wallet."
      });
      return;
    }

    setPing({ status: "pending", message: "Waiting for Freighter signature..." });

    try {
      const result = await sendReadinessPing({ source: wallet, destination: recipient });
      setPing({
        status: "success",
        message: "Readiness ping confirmed on Stellar testnet.",
        hash: result.hash,
        ledger: result.ledger
      });
      toast.success("Readiness ping confirmed", {
        description: shortAddress(result.hash)
      });
      await refreshReadiness(wallet, false);
    } catch (error) {
      setPing({
        status: "error",
        message: error instanceof Error ? error.message : "Readiness ping failed."
      });
    }
  }

  return (
    <div className="form-section">
      <div className="mb-4 grid gap-3 border-b border-ink/10 pb-4 md:grid-cols-[220px_1fr]">
        <div className="flex items-center gap-2 font-mono text-xs uppercase text-moss">
          <span className="flex size-8 items-center justify-center border border-moss/20 bg-mint">
            <Wallet className="size-4" />
          </span>
          Wallet readiness
        </div>
        <div>
          <h2 className="text-xl font-semibold">Connect the provider payout wallet.</h2>
          <p className="mt-1 text-sm leading-6 text-steel">
            This wallet receives paid API calls and signs the on-chain tool registration proof.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
        <div className="grid gap-3">
          <div className="border border-ink/10 bg-paper/60 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="font-mono text-xs uppercase text-steel">Freighter wallet</p>
                <p className="mt-2 break-all font-mono text-sm text-ink">{walletLabel}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {wallet ? (
                  <>
                    <button
                      type="button"
                      onClick={() => refreshReadiness()}
                      disabled={status === "loading"}
                      className="inline-flex items-center gap-2 border border-ink/20 bg-white px-3 py-2 text-sm font-semibold transition hover:border-ink disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <RefreshCcw className="size-4" />
                      Refresh
                    </button>
                    <button
                      type="button"
                      onClick={disconnect}
                      className="inline-flex items-center gap-2 border border-ink bg-ink px-3 py-2 text-sm font-semibold text-paper transition hover:bg-moss"
                    >
                      <Unplug className="size-4" />
                      Disconnect
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={connect}
                    disabled={status === "loading"}
                    className="inline-flex items-center gap-2 border border-ink bg-ink px-3 py-2 text-sm font-semibold text-paper transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Plug className="size-4" />
                    Connect Freighter
                  </button>
                )}
              </div>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {proofSummary.map((item) => (
                <div key={item.label} className="border border-ink/10 bg-white p-3">
                  <p className="font-mono text-[11px] uppercase text-steel">{item.label}</p>
                  <div className="mt-2">
                    <StatusBadge tone={item.tone}>{item.value}</StatusBadge>
                  </div>
                </div>
              ))}
            </div>

            {message ? (
              <div
                className={`mt-4 flex items-start gap-2 border p-3 text-sm leading-6 ${
                  status === "error"
                    ? "border-red-200 bg-red-50 text-red-800"
                    : "border-moss/20 bg-mint/70 text-moss"
                }`}
              >
                {status === "error" ? (
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                ) : (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                )}
                <span>{message}</span>
              </div>
            ) : null}
          </div>
        </div>

        <div className="border border-ink bg-ink p-4 text-paper">
          <p className="font-mono text-xs uppercase text-paper/60">Testnet readiness ping</p>
          <p className="mt-3 text-sm leading-6 text-paper/75">
            Sends {READINESS_PING_AMOUNT} XLM to a configured testnet recipient so judges can see
            a real wallet-signed transaction flow.
          </p>
          <button
            type="button"
            onClick={sendPing}
            disabled={!canPing}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 border border-paper bg-paper px-3 py-2 text-sm font-semibold text-ink transition hover:bg-mint disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="size-4" />
            {ping.status === "pending" ? "Signing ping" : "Send readiness ping"}
          </button>
          {isSelfPing ? (
            <p className="mt-3 text-xs leading-5 text-red-200">
              Ping recipient equals this wallet. Use a different recipient address.
            </p>
          ) : null}
          {ping.message ? (
            <div
              className={`mt-4 border p-3 text-xs leading-5 ${
                ping.status === "success"
                  ? "border-mint/40 bg-mint/10 text-mint"
                  : ping.status === "error"
                    ? "border-red-200/50 bg-red-950/20 text-red-100"
                    : "border-paper/20 bg-paper/5 text-paper/75"
              }`}
            >
              <p>{ping.message}</p>
              {ping.hash ? (
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${ping.hash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-2 border border-paper/20 px-2 py-1 font-mono text-[11px] hover:border-paper"
                >
                  <ExternalLink className="size-3.5" />
                  {shortAddress(ping.hash)}
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function formatBalance(balance: string) {
  const value = Number(balance);

  if (!Number.isFinite(value)) {
    return balance;
  }

  return `${value.toLocaleString(undefined, {
    maximumFractionDigits: 4
  })} XLM`;
}
