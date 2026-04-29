import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "@x402/next";
import type { ToolWithProvider } from "@/lib/tools";
import { getToolById } from "@/lib/tools";
import { createToolRouteConfig, createX402Server } from "@/lib/x402-server";
import { forwardToProvider } from "@/lib/provider-forwarding";
import { prisma } from "@/lib/prisma";
import { truncatePreview } from "@/lib/text";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ toolId: string }> | { toolId: string };
};

export async function POST(request: NextRequest, context: RouteContext) {
  const { toolId } = await Promise.resolve(context.params);
  const tool = await getToolById(toolId);

  if (!tool) {
    return NextResponse.json({ error: "Tool not found." }, { status: 404 });
  }

  let requestPayload: unknown = {};
  let providerResponseBody: unknown = {};
  let providerStatus = 200;
  let logWritten = false;

  const writeUsageLog = async (
    paymentStatus: "paid" | "failed",
    input: {
      payerAddress?: string;
      paymentProof?: string;
      txHash?: string;
      facilitatorResponseJson?: string;
      errorMessage?: string;
    } = {}
  ) => {
    if (logWritten) {
      return;
    }

    logWritten = true;

    await prisma.usageLog.create({
      data: {
        toolId: tool.id,
        providerId: tool.providerId,
        payerAddress: input.payerAddress,
        providerWallet: tool.providerWallet,
        amount: tool.priceAmount,
        asset: tool.priceAsset,
        network: tool.network,
        paymentStatus,
        paymentProof: input.paymentProof,
        txHash: input.txHash,
        facilitatorResponseJson: input.facilitatorResponseJson,
        requestPayloadPreview: truncatePreview(requestPayload),
        responsePreview: truncatePreview(providerResponseBody),
        errorMessage: input.errorMessage
      }
    });
  };

  const routeConfig = createToolRouteConfig(tool);
  const server = createX402Server({
    onAfterSettle: async ({ result }) => {
      await writeUsageLog("paid", {
        payerAddress: result.payer,
        paymentProof: result.transaction,
        txHash: result.transaction,
        facilitatorResponseJson: JSON.stringify(result)
      });
    },
    onSettleFailure: async ({ error }) => {
      await writeUsageLog("failed", {
        errorMessage: error.message
      });
    }
  });

  const handler = async (paidRequest: NextRequest) => {
    requestPayload = await paidRequest.json().catch(() => ({}));
    const forwarded = await forwardToProvider(tool as ToolWithProvider, requestPayload);

    providerResponseBody = forwarded.body;
    providerStatus = forwarded.status;

    if (!forwarded.ok) {
      await writeUsageLog("failed", {
        errorMessage: `Provider returned HTTP ${forwarded.status}`
      });

      return NextResponse.json(
        {
          toolId: tool.id,
          paymentStatus: "not_settled",
          providerStatus,
          providerResponse: providerResponseBody
        },
        { status: forwarded.status }
      );
    }

    return NextResponse.json({
      toolId: tool.id,
      paymentStatus: "paid",
      providerStatus,
      providerResponse: providerResponseBody
    });
  };

  return withX402(handler, routeConfig, server)(request);
}
