import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const question = String(body.question ?? body.input?.question ?? "").toLowerCase();

  let answer =
    "Stellar is a fast, low-cost payments network. It is useful for micropayments because transactions settle quickly with very small fees.";
  let nextStep = "Create a testnet wallet, fund it with XLM, then add a testnet USDC trustline.";

  if (question.includes("x402")) {
    answer =
      "x402 uses HTTP 402 Payment Required as a machine-readable payment flow. On Stellar, an agent can receive a payment requirement, sign a testnet USDC payment payload, retry the request, and get the API response after settlement.";
    nextStep = "Run the AgentPay consumer demo against a paid tool endpoint.";
  } else if (question.includes("soroban")) {
    answer =
      "Soroban is Stellar's smart contract platform. AgentPay does not need a custom contract for the MVP because x402 already handles the paid HTTP flow and Stellar settlement.";
    nextStep = "Add a tiny registry contract later only if the demo needs on-chain marketplace events.";
  }

  return NextResponse.json({
    answer,
    difficulty: "beginner",
    nextStep
  });
}
