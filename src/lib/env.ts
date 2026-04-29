import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().default("file:./dev.db"),
  NEXT_PUBLIC_APP_URL: z.string().url().default("http://localhost:3000"),
  STELLAR_NETWORK: z.literal("stellar:testnet").default("stellar:testnet"),
  STELLAR_RPC_URL: z.string().url().default("https://soroban-testnet.stellar.org"),
  X402_FACILITATOR_URL: z.string().url().default("https://www.x402.org/facilitator"),
  DEMO_PROVIDER_STELLAR_PUBLIC_KEY: z.string().optional(),
  AGENT_STELLAR_SECRET_KEY: z.string().optional(),
  PROVIDER_REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(12000)
});

export const env = envSchema.parse(process.env);
