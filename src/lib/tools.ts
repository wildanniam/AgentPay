import type { Tool, Provider } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type ToolWithProvider = Tool & {
  provider: Provider;
};

export async function getActiveTools() {
  return prisma.tool.findMany({
    where: { isActive: true },
    include: { provider: true },
    orderBy: [{ createdAt: "desc" }]
  });
}

export async function getToolById(toolId: string) {
  return prisma.tool.findFirst({
    where: { id: toolId, isActive: true },
    include: { provider: true }
  });
}

export function parseJsonField<T = unknown>(value: string | null | undefined, fallback: T): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
