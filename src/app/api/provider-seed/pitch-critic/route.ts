import { NextResponse } from "next/server";

const marketKeywords = ["agent", "api", "wallet", "payment", "research", "developer", "student"];
const revenueKeywords = ["price", "paid", "subscription", "marketplace", "fee", "revenue", "usdc"];
const riskKeywords = ["maybe", "general", "everyone", "all users", "viral", "soon"];

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const pitch = pickText(body, ["pitch", "text"]) || pickNestedText(body, "input") || "";
  const normalized = pitch.toLowerCase();

  const marketSignals = countMatches(normalized, marketKeywords);
  const revenueSignals = countMatches(normalized, revenueKeywords);
  const riskSignals = countMatches(normalized, riskKeywords);
  const wordCount = pitch.split(/\s+/).filter(Boolean).length;

  const score = Math.max(
    35,
    Math.min(94, 48 + marketSignals * 8 + revenueSignals * 7 + Math.min(wordCount, 80) / 4 - riskSignals * 6)
  );

  const strengths = [
    marketSignals > 0
      ? "Names a concrete audience or workflow."
      : "Can become stronger by naming a very specific first user.",
    revenueSignals > 0
      ? "Includes a path toward monetization."
      : "Needs a clearer payment or pricing reason.",
    wordCount >= 30
      ? "Provides enough detail for a first-pass review."
      : "Short enough to scan, but it needs more operating detail."
  ];

  const risks = [
    riskSignals > 0
      ? "Some language is broad or speculative; sharpen it into a measurable claim."
      : "The core risk is proving users will repeat the workflow.",
    "The pitch should show why this product is urgent now, not merely useful.",
    "A judge or investor will look for proof that the first niche is reachable."
  ];

  return NextResponse.json({
    verdict: score >= 75 ? "promising" : score >= 58 ? "needs a sharper wedge" : "too broad",
    score: Math.round(score),
    strengths,
    risks,
    suggestedIteration:
      "Rewrite the pitch as: user segment, painful workflow, paid action, proof point, and next milestone.",
    oneLineRewrite: buildOneLineRewrite(pitch)
  });
}

function pickText(body: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = body[key];

    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return "";
}

function pickNestedText(body: Record<string, unknown>, key: string) {
  const value = body[key];

  if (typeof value === "string") {
    return value.trim();
  }

  if (value && typeof value === "object") {
    return pickText(value as Record<string, unknown>, ["pitch", "text", "input"]);
  }

  return "";
}

function countMatches(input: string, keywords: string[]) {
  return keywords.filter((keyword) => input.includes(keyword)).length;
}

function buildOneLineRewrite(pitch: string) {
  const clean = pitch.replace(/\s+/g, " ").trim();

  if (!clean) {
    return "We help a specific user complete a costly workflow through a paid, measurable API action.";
  }

  return clean.length > 150 ? `${clean.slice(0, 147)}...` : clean;
}
