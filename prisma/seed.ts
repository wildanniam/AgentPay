import { PrismaClient } from "@prisma/client";
import { StrKey } from "@stellar/stellar-sdk";
import { config } from "dotenv";
import { computeToolMetadataHash } from "../src/lib/tool-metadata";

config({ path: ".env.local", override: true, quiet: true });

const prisma = new PrismaClient();

const FALLBACK_PROVIDER_WALLET = "GAGCUG2H3XR4XXQLYFAN4RH7HJXSVUMIBAP5F77RD6Y4E7HSK6GMDDG6";

function providerWallet() {
  const configured = process.env.DEMO_PROVIDER_STELLAR_PUBLIC_KEY;

  if (configured && StrKey.isValidEd25519PublicKey(configured)) {
    return configured;
  }

  return FALLBACK_PROVIDER_WALLET;
}

function appUrl() {
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

async function main() {
  const wallet = providerWallet();
  const provider = await prisma.provider.upsert({
    where: { walletAddress: wallet },
    update: {
      name: "agentpay-seed",
      displayName: "AgentPay Seed Provider"
    },
    create: {
      name: "agentpay-seed",
      displayName: "AgentPay Seed Provider",
      walletAddress: wallet
    }
  });

  const seedTools = [
    {
      slug: "paper-summarizer",
      name: "Paper Summarizer",
      description: "Summarizes academic abstracts and extracts key points for research workflows.",
      category: "research",
      endpointUrl: `${appUrl()}/api/provider-seed/paper-summarizer`,
      priceAmount: "0.01",
      inputExampleJson: { text: "Long academic abstract..." },
      outputExampleJson: {
        summary: "Short summary.",
        keyPoints: ["Main contribution", "Method", "Result"],
        recommendedUse: "Use as a first-pass reading aid."
      }
    },
    {
      slug: "campus-faq-rag",
      name: "Campus FAQ RAG",
      description: "Answers student and campus process questions from a compact seeded FAQ set.",
      category: "campus",
      endpointUrl: `${appUrl()}/api/provider-seed/campus-faq`,
      priceAmount: "0.01",
      inputExampleJson: { question: "Apa syarat sidang TA?" },
      outputExampleJson: {
        answer: "Syarat umum mencakup berkas administrasi dan persetujuan pembimbing.",
        confidence: 0.82,
        source: "Seed FAQ dataset"
      }
    },
    {
      slug: "stellar-explainer",
      name: "Stellar Explainer",
      description: "Explains Stellar, Soroban, x402, wallets, and testnet payment concepts.",
      category: "stellar",
      endpointUrl: `${appUrl()}/api/provider-seed/stellar-explainer`,
      priceAmount: "0.01",
      inputExampleJson: { question: "What is x402 on Stellar?" },
      outputExampleJson: {
        answer: "x402 lets clients satisfy HTTP 402 payment requests with Stellar settlement.",
        difficulty: "beginner",
        nextStep: "Create and fund a testnet wallet with USDC."
      }
    },
    {
      slug: "pitch-critic",
      name: "Startup Pitch Critic",
      description: "Reviews startup pitches and returns strengths, risks, and a sharper one-line rewrite.",
      category: "utility",
      endpointUrl: `${appUrl()}/api/provider-seed/pitch-critic`,
      priceAmount: "0.01",
      inputExampleJson: {
        pitch:
          "AgentPay is an API marketplace where external agents discover paid tools and pay with Stellar testnet USDC."
      },
      outputExampleJson: {
        verdict: "promising",
        score: 82,
        strengths: ["Names a concrete audience or workflow."],
        risks: ["The pitch should show why this product is urgent now."],
        suggestedIteration:
          "Rewrite the pitch as: user segment, painful workflow, paid action, proof point, and next milestone."
      }
    },
    {
      slug: "json-inspector",
      name: "JSON Inspector",
      description: "Validates and normalizes JSON payloads before agents send structured requests.",
      category: "data",
      endpointUrl: `${appUrl()}/api/provider-seed/json-inspector`,
      priceAmount: "0.01",
      inputExampleJson: { json: "{\"tool\":\"agentpay\",\"paid\":true}" },
      outputExampleJson: {
        valid: true,
        type: "object",
        keys: ["tool", "paid"],
        normalizedJson: "{\n  \"tool\": \"agentpay\",\n  \"paid\": true\n}"
      }
    },
    {
      slug: "meeting-actions",
      name: "Meeting Action Extractor",
      description: "Turns meeting transcripts into action items, decisions, and follow-up reminders.",
      category: "utility",
      endpointUrl: `${appUrl()}/api/provider-seed/meeting-actions`,
      priceAmount: "0.01",
      inputExampleJson: {
        transcript:
          "Wildan will deploy the app today. The team agreed to record a demo video. We should update the README."
      },
      outputExampleJson: {
        summary: "Wildan will deploy the app today.",
        actionItems: [
          {
            id: 1,
            owner: "Wildan",
            task: "Wildan will deploy the app today.",
            priority: "high"
          }
        ],
        decisions: ["The team agreed to record a demo video."]
      }
    }
  ];

  for (const tool of seedTools) {
    const hashInput = {
      providerName: provider.displayName,
      providerWallet: wallet,
      name: tool.name,
      description: tool.description,
      category: tool.category as "research" | "campus" | "stellar" | "data" | "utility",
      endpointUrl: tool.endpointUrl,
      method: "POST" as const,
      priceAmount: tool.priceAmount,
      priceAsset: "USDC" as const,
      inputExampleJson: tool.inputExampleJson,
      outputExampleJson: tool.outputExampleJson
    };
    const metadataHash = computeToolMetadataHash(hashInput);

    await prisma.tool.upsert({
      where: { slug: tool.slug },
      update: {
        ...tool,
        method: "POST",
        priceAsset: "USDC",
        network: "stellar:testnet",
        providerWallet: wallet,
        metadataHash,
        inputExampleJson: JSON.stringify(tool.inputExampleJson),
        outputExampleJson: JSON.stringify(tool.outputExampleJson),
        providerId: provider.id,
        isActive: true
      },
      create: {
        ...tool,
        method: "POST",
        priceAsset: "USDC",
        network: "stellar:testnet",
        providerWallet: wallet,
        metadataHash,
        inputExampleJson: JSON.stringify(tool.inputExampleJson),
        outputExampleJson: JSON.stringify(tool.outputExampleJson),
        providerId: provider.id,
        isActive: true
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
