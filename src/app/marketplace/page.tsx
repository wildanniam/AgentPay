import { getActiveTools } from "@/lib/tools";
import { parseJsonField } from "@/lib/tools";
import { ToolRegistry, type RegistryTool } from "@/components/marketplace/tool-registry";
import { fallbackRegistryTools } from "@/lib/demo-data";

export const dynamic = "force-dynamic";

export default async function MarketplacePage() {
  const toolsResult = await getActiveTools()
    .then((tools) => ({ tools, isFallback: false }))
    .catch(() => ({ tools: [], isFallback: true }));
  const tools = toolsResult.tools;
  const registryIsFallback = toolsResult.isFallback;
  const registryTools: RegistryTool[] = tools.map((tool) => ({
    id: tool.id,
    name: tool.name,
    description: tool.description,
    category: tool.category,
    network: tool.network,
    method: tool.method,
    priceAmount: tool.priceAmount,
    priceAsset: tool.priceAsset,
    providerName: tool.provider.displayName,
    providerWallet: tool.providerWallet,
    inputExample: parseJsonField(tool.inputExampleJson, {}),
    outputExample: parseJsonField(tool.outputExampleJson, {})
  }));

  const visibleTools = registryTools.length > 0 ? registryTools : registryIsFallback ? fallbackRegistryTools : [];

  return (
    <section className="space-y-6">
      <div className="section-shell flex flex-col gap-3 p-5">
        <p className="font-mono text-xs uppercase text-moss">Marketplace</p>
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="max-w-3xl text-4xl font-semibold text-ink">
              Paid API tools agents can discover and call.
            </h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-steel">
              This is the human view of the same registry exposed to external agents.
              Each tool has a wrapper endpoint that requires x402 payment before provider access.
            </p>
          </div>
          <code className="border border-ink bg-mint px-3 py-2 font-mono text-sm">
            GET /.well-known/agentpay-tools.json
          </code>
        </div>
      </div>
      <ToolRegistry tools={visibleTools} isFallback={registryIsFallback} />
    </section>
  );
}
