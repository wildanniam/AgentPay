import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url))
    }
  },
  test: {
    environment: "node",
    env: {
      DATABASE_URL: "file:./dev.db",
      NEXT_PUBLIC_APP_URL: "http://localhost:3000",
      STELLAR_NETWORK: "stellar:testnet",
      STELLAR_RPC_URL: "https://soroban-testnet.stellar.org",
      X402_FACILITATOR_URL: "https://www.x402.org/facilitator"
    }
  }
});
