import { config } from "dotenv";
import { Transaction, TransactionBuilder } from "@stellar/stellar-sdk";
import { x402Client, x402HTTPClient } from "@x402/fetch";
import { createEd25519Signer, getNetworkPassphrase } from "@x402/stellar";
import { ExactStellarScheme } from "@x402/stellar/exact/client";

config({ path: ".env", quiet: true });
config({ path: ".env.local", override: true, quiet: true });

type DiscoveredTool = {
  id: string;
  name: string;
  description: string;
  category: string;
  absoluteCallUrl: string;
  inputExample?: unknown;
  payment: {
    price: string;
    network: string;
    payTo: string;
  };
};

type DiscoveryDocument = {
  tools: DiscoveredTool[];
};

type ToolSelection = {
  tool: DiscoveredTool;
  reason: string;
  payload: unknown;
};

interface ToolSelector {
  select(prompt: string, tools: DiscoveredTool[]): ToolSelection | null;
}

class KeywordToolSelector implements ToolSelector {
  select(prompt: string, tools: DiscoveredTool[]): ToolSelection | null {
    const normalized = prompt.toLowerCase();
    const scored = tools
      .map((tool) => ({
        tool,
        score: scoreTool(normalized, tool)
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score);

    const selected = scored[0]?.tool;

    if (!selected) {
      return null;
    }

    return {
      tool: selected,
      reason: `Keyword selector matched ${selected.category} intent.`,
      payload: normalizePayload(prompt, selected)
    };
  }
}

async function main() {
  const prompt = process.argv.slice(2).join(" ").trim();

  if (!prompt) {
    throw new Error('Usage: npm run demo:agent -- "Summarize this abstract: ..."');
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const secretKey = process.env.AGENT_STELLAR_SECRET_KEY;
  const network = (process.env.STELLAR_NETWORK ?? "stellar:testnet") as `${string}:${string}`;
  const rpcUrl = process.env.STELLAR_RPC_URL ?? "https://soroban-testnet.stellar.org";

  if (!secretKey) {
    throw new Error("AGENT_STELLAR_SECRET_KEY is required in .env.local for the demo agent.");
  }

  const discoveryUrl = new URL("/.well-known/agentpay-tools.json", appUrl).toString();
  const discovery = await fetchJson<DiscoveryDocument>(discoveryUrl);
  const selector = new KeywordToolSelector();
  const selection = selector.select(prompt, discovery.tools);

  if (!selection) {
    console.log("No matching AgentPay tool found. No payment attempted.");
    process.exit(0);
  }

  const signer = createEd25519Signer(secretKey, network);
  const client = new x402Client().register(
    "stellar:*",
    new ExactStellarScheme(signer, { url: rpcUrl })
  );
  const httpClient = new x402HTTPClient(client);

  const body = JSON.stringify(selection.payload);
  const targetUrl = selection.tool.absoluteCallUrl;

  console.log("AgentPay consumer");
  console.log(`Prompt: ${prompt}`);
  console.log(`Selected: ${selection.tool.name}`);
  console.log(`Reason: ${selection.reason}`);
  console.log(`Price: ${selection.tool.payment.price} on ${selection.tool.payment.network}`);
  console.log(`Paying from: ${signer.address}`);
  console.log(`Paying to: ${selection.tool.payment.payTo}`);

  const firstTry = await fetch(targetUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body
  });

  if (firstTry.status !== 402) {
    const responseText = await firstTry.text();
    throw new Error(`Expected HTTP 402, received ${firstTry.status}: ${responseText}`);
  }

  const paymentRequired = httpClient.getPaymentRequiredResponse((name) =>
    firstTry.headers.get(name)
  );
  let paymentPayload = await client.createPaymentPayload(paymentRequired);
  paymentPayload = normalizeStellarFee(paymentPayload, network);

  const paymentHeaders = httpClient.encodePaymentSignatureHeader(paymentPayload);
  const paidResponse = await fetch(targetUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...paymentHeaders
    },
    body
  });

  const responseBody = await paidResponse.json().catch(async () => ({
    raw: await paidResponse.text()
  }));

  if (!paidResponse.ok) {
    console.log("Paid request failed:");
    console.dir(responseBody, { depth: null });
    process.exit(1);
  }

  const paymentProof = httpClient.getPaymentSettleResponse((name) =>
    paidResponse.headers.get(name)
  );

  console.log("Payment proof:");
  console.dir(paymentProof, { depth: null });
  console.log("Provider response:");
  console.dir(responseBody, { depth: null });
}

function scoreTool(prompt: string, tool: DiscoveredTool) {
  let score = 0;
  const haystack = `${tool.name} ${tool.description} ${tool.category}`.toLowerCase();

  const keywordSets: Record<string, string[]> = {
    research: ["paper", "abstract", "summarize", "summary", "research", "journal"],
    campus: ["campus", "kuliah", "sidang", "skripsi", "ta", "krs"],
    stellar: ["stellar", "soroban", "wallet", "testnet", "x402", "usdc"]
  };

  for (const [category, keywords] of Object.entries(keywordSets)) {
    if (tool.category === category) {
      score += keywords.filter((keyword) => prompt.includes(keyword)).length * 3;
    }
  }

  for (const word of prompt.split(/\W+/).filter(Boolean)) {
    if (word.length > 3 && haystack.includes(word)) {
      score += 1;
    }
  }

  return score;
}

function normalizePayload(prompt: string, tool: DiscoveredTool) {
  if (tool.category === "research") {
    return { text: prompt.replace(/^summarize\s+(this\s+)?(abstract:)?/i, "").trim() || prompt };
  }

  if (tool.category === "campus") {
    return { question: prompt };
  }

  if (tool.category === "stellar") {
    return { question: prompt };
  }

  return { input: prompt };
}

function normalizeStellarFee(
  paymentPayload: Awaited<ReturnType<x402Client["createPaymentPayload"]>>,
  network: `${string}:${string}`
) {
  const networkPassphrase = getNetworkPassphrase(network);
  const stellarPayload = paymentPayload.payload as { transaction?: unknown };

  if (typeof stellarPayload.transaction !== "string") {
    return paymentPayload;
  }

  const tx = new Transaction(stellarPayload.transaction, networkPassphrase);
  const sorobanData = tx.toEnvelope().v1()?.tx()?.ext()?.sorobanData();

  if (!sorobanData) {
    return paymentPayload;
  }

  return {
    ...paymentPayload,
    payload: {
      ...paymentPayload.payload,
      transaction: TransactionBuilder.cloneFrom(tx, {
        fee: "1",
        sorobanData,
        networkPassphrase
      })
        .build()
        .toXDR()
    }
  };
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: "application/json" }
  });

  if (!response.ok) {
    throw new Error(`Unable to fetch ${url}: ${response.status}`);
  }

  return (await response.json()) as T;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
