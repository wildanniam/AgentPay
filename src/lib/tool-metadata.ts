import { createHash } from "node:crypto";
import type { RegisterToolInput } from "@/lib/validation";

export type ToolMetadataHashInput = Pick<
  RegisterToolInput,
  | "providerName"
  | "providerWallet"
  | "name"
  | "description"
  | "category"
  | "endpointUrl"
  | "method"
  | "priceAmount"
  | "priceAsset"
  | "inputExampleJson"
  | "outputExampleJson"
>;

export function canonicalizeToolMetadata(input: ToolMetadataHashInput) {
  return stableStringify({
    providerName: input.providerName.trim(),
    providerWallet: input.providerWallet.trim(),
    name: input.name.trim(),
    description: input.description.trim(),
    category: input.category,
    endpointUrl: input.endpointUrl.trim(),
    method: input.method,
    priceAmount: input.priceAmount.trim(),
    priceAsset: input.priceAsset,
    inputExampleJson: input.inputExampleJson,
    outputExampleJson: input.outputExampleJson
  });
}

export function computeToolMetadataHash(input: ToolMetadataHashInput) {
  return createHash("sha256").update(canonicalizeToolMetadata(input)).digest("hex");
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}
