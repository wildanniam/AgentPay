import type { ToolWithProvider } from "@/lib/tools";
import { env } from "@/lib/env";
import { parseJsonField } from "@/lib/tools";

export function toPublicTool(tool: ToolWithProvider, baseUrl = env.NEXT_PUBLIC_APP_URL) {
  const callUrl = `/api/tools/${tool.id}/call`;
  const absoluteCallUrl = new URL(callUrl, baseUrl).toString();

  return {
    id: tool.id,
    name: tool.name,
    slug: tool.slug,
    description: tool.description,
    category: tool.category,
    provider: {
      id: tool.provider.id,
      name: tool.provider.displayName,
      walletAddress: tool.providerWallet
    },
    price: tool.priceAmount,
    asset: tool.priceAsset,
    network: tool.network,
    method: tool.method,
    callUrl,
    absoluteCallUrl,
    inputExample: parseJsonField(tool.inputExampleJson, {}),
    outputExample: parseJsonField(tool.outputExampleJson, {}),
    payment: {
      protocol: "x402",
      scheme: "exact",
      price: `$${tool.priceAmount}`,
      asset: tool.priceAsset,
      network: tool.network,
      payTo: tool.providerWallet
    }
  };
}

export function toAgentPayDiscovery(tools: ToolWithProvider[], baseUrl = env.NEXT_PUBLIC_APP_URL) {
  return {
    name: "AgentPay",
    version: "0.1",
    protocol: "agentpay-tools",
    generatedAt: new Date().toISOString(),
    tools: tools.map((tool) => toPublicTool(tool, baseUrl))
  };
}
