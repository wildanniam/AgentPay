import { CopyButton } from "@/components/copy-button";
import { getActiveTools } from "@/lib/tools";
import { shortAddress } from "@/lib/text";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const tools = await getActiveTools();

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 border-b border-ink/10 pb-6">
        <p className="font-mono text-xs uppercase text-moss">
          Marketplace
        </p>
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h1 className="max-w-3xl text-4xl font-semibold text-ink">
              Paid API tools external agents can discover and call.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-steel">
              Register APIs as x402-paid tools, expose discovery metadata, and let external
              agent runtimes pay on Stellar testnet before receiving data.
            </p>
          </div>
          <code className="border border-ink bg-mint px-3 py-2 font-mono text-sm">
            GET /.well-known/agentpay-tools.json
          </code>
        </div>
      </div>
      <div className="grid gap-4">
        {tools.map((tool) => (
          <article
            key={tool.id}
            className="grid gap-4 border border-ink/10 bg-white/74 p-5 shadow-line lg:grid-cols-[1fr_300px]"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="border border-moss/20 bg-mint px-2 py-1 font-mono text-xs text-moss">
                  {tool.category}
                </span>
                <span className="border border-ink/10 bg-paper px-2 py-1 font-mono text-xs text-steel">
                  {tool.network}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-semibold">{tool.name}</h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-steel">{tool.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <CopyButton value={`/api/tools/${tool.id}/call`} label="Copy endpoint" />
                <CopyButton value={tool.id} label="Copy tool id" />
              </div>
            </div>

            <div className="grid gap-3 border border-ink/10 bg-paper/60 p-4">
              <Metric label="Price" value={`${tool.priceAmount} ${tool.priceAsset}`} />
              <Metric label="Provider" value={tool.provider.displayName} />
              <Metric label="Wallet" value={shortAddress(tool.providerWallet)} mono />
              <Metric label="Method" value={tool.method} mono />
            </div>
          </article>
        ))}

        {tools.length === 0 ? (
          <div className="border border-dashed border-ink/30 bg-white/60 p-8 text-sm text-steel">
            No tools registered yet. Seed the database or register a provider tool.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function Metric({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="font-mono text-[11px] uppercase text-steel">{label}</p>
      <p className={`mt-1 text-sm font-semibold ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}
