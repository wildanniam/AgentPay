import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const text = body.text ?? body.input?.text ?? "";
  const sentences = String(text)
    .split(/(?<=[.!?])\s+/)
    .map((item) => item.trim())
    .filter(Boolean);

  const summary =
    sentences.slice(0, 2).join(" ") ||
    "This text discusses a research problem, its proposed method, and expected contribution.";

  return NextResponse.json({
    summary,
    keyPoints: [
      "Identifies the main research problem.",
      "Condenses the method and contribution.",
      "Useful as a first-pass review before deeper reading."
    ],
    recommendedUse: "Use this as a short briefing, then verify details against the full paper."
  });
}
