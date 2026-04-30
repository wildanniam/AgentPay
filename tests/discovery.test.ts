import { describe, expect, it } from "vitest";
import { toPublicTool } from "@/lib/discovery";
import type { ToolWithProvider } from "@/lib/tools";

describe("tool discovery", () => {
  it("includes payment terms and on-chain metadata", () => {
    const now = new Date("2026-04-30T00:00:00.000Z");
    const tool = {
      id: "tool_123",
      providerId: "provider_123",
      name: "Stellar Explainer",
      slug: "stellar-explainer",
      description: "Explains x402 payments on Stellar.",
      category: "stellar",
      endpointUrl: "https://api.example.com/stellar",
      method: "POST",
      priceAmount: "0.01",
      priceAsset: "USDC",
      network: "stellar:testnet",
      providerWallet: "GAVJ6P6SV5GSC7BFZY6IQSJNUYKBIA3AN4DCUURJ3Q6BMWCGQL4LUNWG",
      inputExampleJson: JSON.stringify({ question: "Explain x402" }),
      outputExampleJson: JSON.stringify({ answer: "HTTP 402 plus Stellar settlement." }),
      metadataHash: "a".repeat(64),
      onchainStatus: "registered",
      onchainContractId: "C".padEnd(56, "A"),
      onchainTxHash: "b".repeat(64),
      onchainLedger: 12345,
      onchainRegisteredAt: now,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      provider: {
        id: "provider_123",
        name: "agentpay-provider",
        displayName: "AgentPay Provider",
        walletAddress: "GAVJ6P6SV5GSC7BFZY6IQSJNUYKBIA3AN4DCUURJ3Q6BMWCGQL4LUNWG",
        createdAt: now,
        updatedAt: now
      }
    } as unknown as ToolWithProvider;

    const publicTool = toPublicTool(tool, "https://agentpay.example");

    expect(publicTool.payment).toMatchObject({
      protocol: "x402",
      asset: "USDC",
      network: "stellar:testnet",
      payTo: tool.providerWallet
    });
    expect(publicTool.metadataHash).toBe(tool.metadataHash);
    expect(publicTool.onchain).toMatchObject({
      status: "registered",
      contractId: tool.onchainContractId,
      txHash: tool.onchainTxHash,
      ledger: 12345,
      registeredAt: now.toISOString()
    });
    expect(publicTool.absoluteCallUrl).toBe("https://agentpay.example/api/tools/tool_123/call");
  });
});
