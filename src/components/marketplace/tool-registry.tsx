"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Code2, ExternalLink, Hash, Search, ShieldCheck, Terminal, Wallet } from "lucide-react";
import { CopyButton } from "@/components/copy-button";
import { StatusBadge } from "@/components/ui/status-badge";

export type RegistryTool = {
  id: string;
  name: string;
  description: string;
  category: string;
  network: string;
  method: string;
  priceAmount: string;
  priceAsset: string;
  providerName: string;
  providerWallet: string;
  inputExample: unknown;
  outputExample: unknown;
  metadataHash?: string | null;
  onchain?: {
    status: string;
    contractId?: string | null;
    txHash?: string | null;
    ledger?: number | null;
    registeredAt?: string | null;
  };
};

export function ToolRegistry({
  tools,
  isFallback = false
}: {
  tools: RegistryTool[];
  isFallback?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [openToolId, setOpenToolId] = useState<string | null>(tools[0]?.id ?? null);
  const openTool = tools.find((tool) => tool.id === openToolId) ?? tools[0];

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(tools.map((tool) => tool.category)))],
    [tools]
  );

  const filteredTools = tools.filter((tool) => {
    const matchesCategory = category === "all" || tool.category === category;
    const searchable = `${tool.name} ${tool.description} ${tool.category}`.toLowerCase();
    const matchesQuery = searchable.includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <Stat label="Active tools" value={String(tools.length)} />
        <Stat label="Payment rail" value="x402" />
        <Stat label="Network" value="Stellar testnet" />
      </div>

      {isFallback ? (
        <div className="border border-signal/40 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Showing fallback demo tools because the database is not reachable yet. Connect
          Supabase and seed the database to publish real marketplace entries.
        </div>
      ) : null}

      <div className="section-shell grid gap-3 p-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <label className="flex items-center gap-3 border border-ink/10 bg-paper px-3 py-2">
          <Search className="size-4 text-steel" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tools, categories, capabilities"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`border px-3 py-2 text-sm font-medium transition ${
                category === item
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/10 bg-white text-ink hover:border-ink"
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3">
        {filteredTools.map((tool) => {
          const isOpen = openToolId === tool.id;
          const endpoint = `/api/tools/${tool.id}/call`;
          const demoCommand = demoCommandForTool(tool);

          return (
            <article key={tool.id} className="section-shell overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenToolId(isOpen ? null : tool.id)}
                className="grid w-full gap-4 p-4 text-left lg:grid-cols-[1.2fr_0.8fr_auto] lg:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge tone="network">{tool.category}</StatusBadge>
                    <StatusBadge tone="payment">x402</StatusBadge>
                    <StatusBadge tone="success">{tool.network}</StatusBadge>
                    {tool.onchain?.status === "registered" ? (
                      <StatusBadge tone="ink">on-chain registered</StatusBadge>
                    ) : (
                      <StatusBadge tone="muted">off-chain listing</StatusBadge>
                    )}
                  </div>
                  <h2 className="mt-3 text-2xl font-semibold">{tool.name}</h2>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-steel">
                    {tool.description}
                  </p>
                </div>

                <div className="grid gap-2 font-mono text-xs text-steel">
                  <span>price {tool.priceAmount} {tool.priceAsset}/call</span>
                  <span>provider {tool.providerName}</span>
                  <span>wallet {shorten(tool.providerWallet)}</span>
                  <span>{tool.method} wrapper endpoint</span>
                </div>

                <span className="flex items-center gap-2 justify-self-start border border-ink/10 bg-paper px-3 py-2 text-sm font-semibold lg:justify-self-end">
                  Details
                  <ChevronDown className={`size-4 transition ${isOpen ? "rotate-180" : ""}`} />
                </span>
              </button>

              {isOpen ? (
                <div className="grid gap-4 border-t border-ink/10 bg-paper/65 p-4 lg:grid-cols-[0.9fr_1.1fr]">
                  <div className="space-y-3">
                    <div className="grid gap-3">
                      <DetailLine
                        icon={<Code2 className="size-4" />}
                        label="Paid wrapper"
                        value={endpoint}
                      />
                      <DetailLine
                        icon={<Wallet className="size-4" />}
                        label="Provider wallet"
                        value={tool.providerWallet}
                      />
                      {tool.metadataHash ? (
                        <DetailLine
                          icon={<Hash className="size-4" />}
                          label="Metadata hash"
                          value={tool.metadataHash}
                        />
                      ) : null}
                      {tool.onchain?.txHash ? (
                        <ProofLine tool={tool} />
                      ) : null}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <CopyButton value={endpoint} label="Copy endpoint" />
                      <CopyButton value={tool.id} label="Copy tool id" />
                      {tool.metadataHash ? (
                        <CopyButton value={tool.metadataHash} label="Copy hash" />
                      ) : null}
                      <CopyButton
                        value={demoCommand}
                        label="Copy demo command"
                      />
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    <ExampleBlock title="Input example" value={tool.inputExample} />
                    <ExampleBlock title="Output example" value={tool.outputExample} />
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {filteredTools.length === 0 ? (
        <div className="section-shell border-dashed p-8 text-sm leading-6 text-steel">
          No tools match this search. Try a broader category or clear the search box.
        </div>
      ) : null}

      <div className="flex items-center gap-3 border border-ink bg-ink p-4 text-paper">
        <Terminal className="size-5 text-signal" />
        <code className="break-all font-mono text-sm">
          {openTool ? demoCommandForTool(openTool) : 'npm run demo:agent -- "Explain x402 on Stellar"'}
        </code>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="section-shell p-4">
      <p className="font-mono text-xs uppercase text-steel">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function DetailLine({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="grid gap-3 border border-ink/10 bg-white p-3 md:grid-cols-[32px_120px_1fr] md:items-center">
      <span className="flex size-8 items-center justify-center border border-ink/10 bg-paper text-moss">
        {icon}
      </span>
      <p className="font-mono text-xs uppercase text-steel">{label}</p>
      <code className="break-all font-mono text-xs text-ink">{value}</code>
    </div>
  );
}

function ProofLine({ tool }: { tool: RegistryTool }) {
  return (
    <div className="grid gap-3 border border-moss/20 bg-mint/60 p-3 md:grid-cols-[32px_120px_1fr] md:items-center">
      <span className="flex size-8 items-center justify-center border border-moss/20 bg-white text-moss">
        <ShieldCheck className="size-4" />
      </span>
      <p className="font-mono text-xs uppercase text-moss">On-chain proof</p>
      <div className="flex flex-wrap items-center gap-2">
        <code className="break-all font-mono text-xs text-ink">{tool.onchain?.txHash}</code>
        <a
          href={`https://stellar.expert/explorer/testnet/tx/${tool.onchain?.txHash}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 border border-moss/20 bg-white px-2 py-1 text-xs font-semibold text-moss transition hover:border-moss"
        >
          <ExternalLink className="size-3.5" />
          View
        </a>
      </div>
    </div>
  );
}

function ExampleBlock({ title, value }: { title: string; value: unknown }) {
  return (
    <div>
      <p className="font-mono text-xs uppercase text-steel">{title}</p>
      <pre className="mt-2 max-h-52 overflow-auto border border-ink/10 bg-white p-3 font-mono text-xs leading-5 text-ink">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}

function shorten(value: string, size = 6) {
  if (value.length <= size * 2) {
    return value;
  }

  return `${value.slice(0, size)}...${value.slice(-size)}`;
}

function demoCommandForTool(tool: RegistryTool) {
  const prompt = demoPromptForTool(tool).replace(/"/g, '\\"');

  return `npm run demo:agent -- "${prompt}"`;
}

function demoPromptForTool(tool: RegistryTool) {
  const haystack = `${tool.name} ${tool.description} ${tool.category}`.toLowerCase();

  if (haystack.includes("pitch") || haystack.includes("startup") || haystack.includes("critic")) {
    return "Critique this startup pitch: WorkflowAI sells a paid API that reviews research notes for student founders.";
  }

  if (haystack.includes("json") || haystack.includes("schema") || haystack.includes("payload")) {
    return 'Validate this JSON payload: {"tool":"agentpay","paid":true}';
  }

  if (
    haystack.includes("meeting") ||
    haystack.includes("action") ||
    haystack.includes("transcript")
  ) {
    return "Extract meeting actions: Wildan will deploy the app today. The team agreed to record a demo video.";
  }

  if (tool.category === "research" || haystack.includes("paper") || haystack.includes("abstract")) {
    return "Summarize this abstract: Autonomous agents need payment-aware API discovery to call external services safely.";
  }

  if (tool.category === "campus" || haystack.includes("faq")) {
    return "Apa syarat sidang TA?";
  }

  if (tool.category === "stellar" || haystack.includes("stellar") || haystack.includes("x402")) {
    return "Explain x402 on Stellar";
  }

  return `Use the ${tool.name} tool with its input example.`;
}
