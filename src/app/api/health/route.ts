import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { isRegistrationProtected } from "@/lib/registration";

export const runtime = "nodejs";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json({
      ok: true,
      service: "agentpay",
      network: env.STELLAR_NETWORK,
      registrationProtected: isRegistrationProtected(),
      checkedAt: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        service: "agentpay",
        error: error instanceof Error ? error.message : "Database health check failed.",
        checkedAt: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
