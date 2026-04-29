import { StrKey } from "@stellar/stellar-sdk";
import { z } from "zod";

export const toolCategories = ["research", "campus", "stellar", "data", "utility"] as const;
export const toolAssets = ["USDC"] as const;

export const registerToolSchema = z.object({
  providerName: z.string().trim().min(2),
  providerWallet: z.string().trim().refine(isValidStellarPublicKey, {
    message: "Provider wallet must be a valid Stellar public key."
  }),
  name: z.string().trim().min(3),
  description: z.string().trim().min(12),
  category: z.enum(toolCategories),
  endpointUrl: z.string().trim().refine(isAllowedProviderUrl, {
    message: "Endpoint URL must be valid. Production endpoints must use HTTPS."
  }),
  method: z.literal("POST").default("POST"),
  priceAmount: z
    .string()
    .trim()
    .refine((value) => Number(value) > 0, "Price must be positive."),
  priceAsset: z.enum(toolAssets).default("USDC"),
  inputExampleJson: z.unknown(),
  outputExampleJson: z.unknown()
});

export type RegisterToolInput = z.infer<typeof registerToolSchema>;

export function isValidStellarPublicKey(value: string) {
  try {
    return StrKey.isValidEd25519PublicKey(value);
  } catch {
    return false;
  }
}

export function isAllowedProviderUrl(value: string) {
  try {
    const url = new URL(value);

    if (process.env.NODE_ENV === "production") {
      return url.protocol === "https:" && !isPrivateHost(url.hostname);
    }

    return url.protocol === "https:" || isLocalhost(url.hostname);
  } catch {
    return false;
  }
}

function isLocalhost(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1";
}

function isPrivateHost(hostname: string) {
  return (
    isLocalhost(hostname) ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}
