# AgentPay

AgentPay is an x402-powered API marketplace for external AI agents on Stellar testnet.

Providers register normal HTTP APIs as paid tools. External agents discover those tools,
receive an HTTP 402 payment requirement, pay through x402 with Stellar testnet USDC, and
receive the provider response after settlement.

## What Is Included

- Product-first landing page for judges and users.
- Marketplace UI for active paid tools.
- Provider console for registering APIs.
- Machine-readable discovery:
  - `GET /api/tools`
  - `GET /.well-known/agentpay-tools.json`
- Paid wrapper endpoint:
  - `POST /api/tools/{toolId}/call`
- x402/Stellar testnet payment before provider forwarding.
- Payment and usage logs dashboard.
- External consumer demo in `examples/agent-consumer`.

AgentPay does not make an in-app chatbot the core product. The demo agent is an external runtime/client that consumes marketplace discovery.

## Local Setup

```bash
npm install
cp .env.example .env
cp .env.local.example .env.local
```

Fill `.env` with Supabase Postgres credentials so Prisma CLI commands can read
`DATABASE_URL`. Keep wallet secrets in `.env.local`.

```bash
npm run db:push
npm run db:seed
npm run dev
```

The app defaults to `http://localhost:3000`. If Next.js chooses another port, update `NEXT_PUBLIC_APP_URL`, then run `npm run db:seed` again so seeded provider endpoint URLs match the running app.

## Required Environment

Use Supabase Postgres for deployable state. SQLite is no longer the target runtime.
For local work, put database URLs in `.env` and wallet-only secrets in `.env.local`.

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"
STELLAR_NETWORK="stellar:testnet"
STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
X402_FACILITATOR_URL="https://www.x402.org/facilitator"
PROVIDER_REQUEST_TIMEOUT_MS="12000"
DEMO_PROVIDER_STELLAR_PUBLIC_KEY="G..."
AGENT_STELLAR_SECRET_KEY="S..."
```

Optional:

```bash
TOOL_REGISTRATION_TOKEN="long-random-token"
```

If `TOOL_REGISTRATION_TOKEN` is set, provider registration requires the token in the UI or the `x-agentpay-registration-token` request header.

Keep `AGENT_STELLAR_SECRET_KEY` in `.env.local`; do not commit it and do not add it to Vercel unless you intentionally build a server-side demo runner.

## Demo Consumer

Run the app first, then:

```bash
npm run demo:agent -- "Explain x402 on Stellar"
```

The consumer will:

1. Fetch `/.well-known/agentpay-tools.json`.
2. Select a tool with `KeywordToolSelector`.
3. Call the paid wrapper endpoint.
4. Handle HTTP 402 with an x402 Stellar payment.
5. Retry with payment headers.
6. Print payment proof and provider response.

OpenAI selection is optional later. The core flow works without `OPENAI_API_KEY`.

## Deploy

See [docs/deployment.md](docs/deployment.md).

Short version:

```bash
DATABASE_URL="$DIRECT_URL" npm run db:push
DATABASE_URL="$DIRECT_URL" npm run db:seed
npm run build
```

Then add the same runtime env values to Vercel and deploy.

## Verification

```bash
npm run lint
npm run build
curl http://localhost:3000/api/health
curl http://localhost:3000/api/tools
curl http://localhost:3000/.well-known/agentpay-tools.json
```

An unpaid wrapper call should return HTTP 402:

```bash
curl -i -X POST http://localhost:3000/api/tools/<toolId>/call \
  -H "Content-Type: application/json" \
  --data '{"question":"What is x402 on Stellar?"}'
```

## References

- [Stellar x402 quickstart](https://developers.stellar.org/docs/build/agentic-payments/x402/quickstart-guide)
- [x402 seller quickstart](https://docs.x402.org/getting-started/quickstart-for-sellers)
