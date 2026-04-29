import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { prisma } from "@/lib/prisma";
import { getActiveTools } from "@/lib/tools";
import { toPublicTool } from "@/lib/discovery";
import { registerToolSchema } from "@/lib/validation";
import { slugify } from "@/lib/text";

export async function GET(request: Request) {
  const tools = await getActiveTools();
  const origin = new URL(request.url).origin;

  return NextResponse.json({
    tools: tools.map((tool) => toPublicTool(tool, origin))
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = registerToolSchema.parse(body);

    const provider = await prisma.provider.upsert({
      where: { walletAddress: input.providerWallet },
      update: {
        name: slugify(input.providerName),
        displayName: input.providerName
      },
      create: {
        name: slugify(input.providerName),
        displayName: input.providerName,
        walletAddress: input.providerWallet
      }
    });

    const baseSlug = slugify(input.name);
    const existing = await prisma.tool.findUnique({ where: { slug: baseSlug } });
    const slug = existing ? `${baseSlug}-${Date.now().toString(36)}` : baseSlug;

    const tool = await prisma.tool.create({
      data: {
        providerId: provider.id,
        name: input.name,
        slug,
        description: input.description,
        category: input.category,
        endpointUrl: input.endpointUrl,
        method: input.method,
        priceAmount: input.priceAmount,
        priceAsset: input.priceAsset,
        network: "stellar:testnet",
        providerWallet: input.providerWallet,
        inputExampleJson: JSON.stringify(input.inputExampleJson),
        outputExampleJson: JSON.stringify(input.outputExampleJson),
        isActive: true
      },
      include: { provider: true }
    });

    return NextResponse.json({ tool: toPublicTool(tool) }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Invalid tool registration.",
          issues: error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message
          }))
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unable to register tool." },
      { status: 500 }
    );
  }
}
