import { NextResponse } from "next/server";

const actionPattern =
  /\b(need to|needs to|should|will|must|todo|follow up|send|prepare|review|deploy|test|record|submit|publish|fix|update)\b/i;
const decisionPattern = /\b(decided|agreed|approved|confirmed|chose|selected)\b/i;

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const transcript = String(
    body.transcript ?? body.text ?? body.input?.transcript ?? body.input?.text ?? body.input ?? ""
  );
  const sentences = splitSentences(transcript);
  const actionSentences = sentences.filter((sentence) => actionPattern.test(sentence));
  const decisionSentences = sentences.filter((sentence) => decisionPattern.test(sentence));

  const actionItems = actionSentences.slice(0, 6).map((sentence, index) => ({
    id: index + 1,
    owner: inferOwner(sentence),
    task: cleanSentence(sentence),
    priority: inferPriority(sentence)
  }));

  return NextResponse.json({
    summary:
      sentences.slice(0, 2).join(" ") ||
      "No transcript detail was provided, so no meeting summary could be extracted.",
    actionItems,
    decisions: decisionSentences.slice(0, 4).map(cleanSentence),
    followUps:
      actionItems.length > 0
        ? ["Confirm owners and deadlines for each action item.", "Share the action list with the team."]
        : ["Add a longer transcript with explicit action verbs."],
    confidence: actionItems.length > 0 ? 0.82 : 0.36
  });
}

function splitSentences(input: string) {
  return input
    .split(/(?<=[.!?])\s+|\n+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function cleanSentence(input: string) {
  return input.replace(/\s+/g, " ").trim();
}

function inferOwner(sentence: string) {
  const match = sentence.match(/\b([A-Z][a-z]+)\s+(will|should|must|needs to|need to)\b/);

  return match?.[1] ?? "Unassigned";
}

function inferPriority(sentence: string) {
  const normalized = sentence.toLowerCase();

  if (normalized.includes("urgent") || normalized.includes("today") || normalized.includes("deadline")) {
    return "high";
  }

  if (normalized.includes("later") || normalized.includes("nice to have")) {
    return "low";
  }

  return "medium";
}
