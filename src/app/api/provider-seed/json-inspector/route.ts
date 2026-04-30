import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const rawInput = body.json ?? body.text ?? body.input?.json ?? body.input?.text ?? body.input ?? body;
  const rawText = typeof rawInput === "string" ? rawInput : JSON.stringify(rawInput);
  const candidate = extractJsonCandidate(rawText);

  try {
    const parsed = JSON.parse(candidate);

    return NextResponse.json({
      valid: true,
      type: Array.isArray(parsed) ? "array" : typeof parsed,
      keys: parsed && !Array.isArray(parsed) && typeof parsed === "object" ? Object.keys(parsed) : [],
      normalizedJson: JSON.stringify(parsed, null, 2),
      issues: [],
      suggestedUse: "Use this output before sending structured payloads into paid tools."
    });
  } catch (error) {
    return NextResponse.json({
      valid: false,
      type: "unknown",
      keys: [],
      normalizedJson: null,
      issues: [
        {
          message: error instanceof Error ? error.message : "Invalid JSON payload.",
          hint: "Check commas, quotes, brackets, and trailing characters."
        }
      ],
      suggestedUse: "Fix the JSON before using it as an agent tool payload."
    });
  }
}

function extractJsonCandidate(input: string) {
  const trimmed = input.trim();
  const objectIndex = trimmed.indexOf("{");
  const arrayIndex = trimmed.indexOf("[");
  const starts = [objectIndex, arrayIndex].filter((index) => index >= 0);

  if (starts.length === 0) {
    return trimmed;
  }

  return trimmed.slice(Math.min(...starts));
}
