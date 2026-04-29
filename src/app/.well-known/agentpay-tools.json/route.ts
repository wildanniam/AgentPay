import { NextResponse } from "next/server";
import { toAgentPayDiscovery } from "@/lib/discovery";
import { getActiveTools } from "@/lib/tools";

export async function GET(request: Request) {
  const tools = await getActiveTools();
  const origin = new URL(request.url).origin;

  return NextResponse.json(toAgentPayDiscovery(tools, origin), {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
