import { describe, expect, it } from "vitest";
import { computeToolMetadataHash } from "@/lib/tool-metadata";

describe("tool metadata hash", () => {
  it("is deterministic for the same canonical tool metadata", () => {
    const first = computeToolMetadataHash({
      providerName: "AgentPay Provider",
      providerWallet: "GAVJ6P6SV5GSC7BFZY6IQSJNUYKBIA3AN4DCUURJ3Q6BMWCGQL4LUNWG",
      name: "Stellar Explainer",
      description: "Explains x402 payments on Stellar testnet.",
      category: "stellar",
      endpointUrl: "https://api.example.com/stellar",
      method: "POST",
      priceAmount: "0.01",
      priceAsset: "USDC",
      inputExampleJson: { question: "Explain x402 on Stellar", nested: { b: 2, a: 1 } },
      outputExampleJson: { nested: { z: true, a: true }, answer: "x402 uses HTTP 402." }
    });

    const second = computeToolMetadataHash({
      providerName: "AgentPay Provider",
      providerWallet: "GAVJ6P6SV5GSC7BFZY6IQSJNUYKBIA3AN4DCUURJ3Q6BMWCGQL4LUNWG",
      name: "Stellar Explainer",
      description: "Explains x402 payments on Stellar testnet.",
      category: "stellar",
      endpointUrl: "https://api.example.com/stellar",
      method: "POST",
      priceAmount: "0.01",
      priceAsset: "USDC",
      inputExampleJson: { nested: { a: 1, b: 2 }, question: "Explain x402 on Stellar" },
      outputExampleJson: { answer: "x402 uses HTTP 402.", nested: { a: true, z: true } }
    });

    expect(first).toMatch(/^[a-f0-9]{64}$/);
    expect(first).toBe(second);
  });
});
