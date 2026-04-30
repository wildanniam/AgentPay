import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { hasRegistrationAccess } from "@/lib/registration";
import { onchainProofSchema } from "@/lib/validation";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ toolId: string }> | { toolId: string };
};

export async function POST(request: Request, context: RouteContext) {
  try {
    if (!hasRegistrationAccess(request)) {
      return NextResponse.json(
        { error: "On-chain proof update is protected by the registration access token." },
        { status: 401 }
      );
    }

    const { toolId } = await Promise.resolve(context.params);
    const input = onchainProofSchema.parse(await request.json());
    const tool = await prisma.tool.findUnique({ where: { id: toolId } });

    if (!tool) {
      return NextResponse.json({ error: "Tool not found." }, { status: 404 });
    }

    if (tool.providerWallet !== input.providerWallet) {
      return NextResponse.json(
        { error: "Connected wallet does not match the tool provider wallet." },
        { status: 409 }
      );
    }

    if (tool.metadataHash && tool.metadataHash.toLowerCase() !== input.metadataHash.toLowerCase()) {
      return NextResponse.json(
        { error: "Metadata hash does not match the registered tool metadata." },
        { status: 409 }
      );
    }

    const updated = await prisma.tool.update({
      where: { id: toolId },
      data: {
        metadataHash: input.metadataHash.toLowerCase(),
        onchainStatus: "registered",
        onchainContractId: input.contractId,
        onchainTxHash: input.txHash.toLowerCase(),
        onchainLedger: input.ledger,
        onchainRegisteredAt: new Date()
      },
      include: { provider: true }
    });

    return NextResponse.json({
      tool: {
        id: updated.id,
        metadataHash: updated.metadataHash,
        onchain: {
          status: updated.onchainStatus,
          contractId: updated.onchainContractId,
          txHash: updated.onchainTxHash,
          ledger: updated.onchainLedger,
          registeredAt: updated.onchainRegisteredAt?.toISOString() ?? null
        }
      }
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid on-chain proof.",
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to store on-chain proof." },
      { status: 500 }
    );
  }
}
