export const fallbackRegistryTools = [
  {
    id: "demo-stellar-explainer",
    name: "Stellar Explainer",
    description: "Explains Stellar, Soroban, x402, wallets, and testnet payment concepts.",
    category: "stellar",
    network: "stellar:testnet",
    method: "POST",
    priceAmount: "0.01",
    priceAsset: "USDC",
    providerName: "AgentPay Seed Provider",
    providerWallet: "GAVJ6P6SV5GSC7BFZY6IQSJNUYKBIA3AN4DCUURJ3Q6BMWCGQL4LUNWG",
    inputExample: { question: "What is x402 on Stellar?" },
    outputExample: {
      answer: "x402 lets agents satisfy HTTP 402 payment requests with Stellar settlement.",
      difficulty: "beginner"
    }
  },
  {
    id: "demo-paper-summarizer",
    name: "Paper Summarizer",
    description: "Summarizes academic abstracts and extracts key points for research workflows.",
    category: "research",
    network: "stellar:testnet",
    method: "POST",
    priceAmount: "0.01",
    priceAsset: "USDC",
    providerName: "AgentPay Seed Provider",
    providerWallet: "GAVJ6P6SV5GSC7BFZY6IQSJNUYKBIA3AN4DCUURJ3Q6BMWCGQL4LUNWG",
    inputExample: { text: "Long academic abstract..." },
    outputExample: {
      summary: "Short summary.",
      keyPoints: ["Main contribution", "Method", "Result"]
    }
  }
];
