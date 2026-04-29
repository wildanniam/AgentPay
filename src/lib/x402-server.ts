import { HTTPFacilitatorClient, x402ResourceServer } from "@x402/core/server";
import type { RouteConfig, SettleFailureContext, SettleResultContext } from "@x402/core/server";
import { ExactStellarScheme } from "@x402/stellar/exact/server";
import { env } from "@/lib/env";
import type { ToolWithProvider } from "@/lib/tools";

type X402HookOptions = {
  onAfterSettle?: (context: SettleResultContext) => Promise<void>;
  onSettleFailure?: (context: SettleFailureContext) => Promise<void>;
};

export function createX402Server(options: X402HookOptions = {}) {
  const server = new x402ResourceServer(
    new HTTPFacilitatorClient({ url: env.X402_FACILITATOR_URL })
  ).register(env.STELLAR_NETWORK, new ExactStellarScheme());

  if (options.onAfterSettle) {
    server.onAfterSettle(options.onAfterSettle);
  }

  if (options.onSettleFailure) {
    server.onSettleFailure(options.onSettleFailure);
  }

  return server;
}

export function createToolRouteConfig(tool: ToolWithProvider): RouteConfig {
  return {
    accepts: {
      scheme: "exact",
      price: `$${tool.priceAmount}`,
      network: env.STELLAR_NETWORK,
      payTo: tool.providerWallet
    },
    description: tool.description,
    mimeType: "application/json",
    unpaidResponseBody: () => ({
      contentType: "application/json",
      body: {
        error: "x402 payment required",
        tool: {
          id: tool.id,
          name: tool.name,
          price: tool.priceAmount,
          asset: tool.priceAsset,
          network: tool.network,
          payTo: tool.providerWallet
        }
      }
    }),
    settlementFailedResponseBody: (_context, settleResult) => ({
      contentType: "application/json",
      body: {
        error: "x402 settlement failed",
        details: settleResult
      }
    })
  };
}
