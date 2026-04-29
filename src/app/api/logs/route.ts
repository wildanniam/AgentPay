import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const logs = await prisma.usageLog.findMany({
    include: {
      tool: true,
      provider: true
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return NextResponse.json({
    logs: logs.map((log) => ({
      id: log.id,
      toolId: log.toolId,
      toolName: log.tool.name,
      providerName: log.provider.displayName,
      providerWallet: log.providerWallet,
      payerAddress: log.payerAddress,
      amount: log.amount,
      asset: log.asset,
      network: log.network,
      paymentStatus: log.paymentStatus,
      paymentProof: log.paymentProof,
      txHash: log.txHash,
      requestPayloadPreview: log.requestPayloadPreview,
      responsePreview: log.responsePreview,
      errorMessage: log.errorMessage,
      createdAt: log.createdAt.toISOString()
    }))
  });
}
