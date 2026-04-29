# AgentPay

x402-powered API marketplace for external AI agents on Stellar testnet.

AgentPay lets API providers register HTTP endpoints as paid tools. External agents can discover those tools, receive an HTTP 402 payment requirement, pay through x402 on Stellar testnet, and receive the provider response after settlement.

## Core MVP

- Provider Dashboard for registering paid API tools.
- Marketplace UI for active tools.
- Machine-readable discovery:
  - `GET /api/tools`
  - `GET /.well-known/agentpay-tools.json`
- Paid wrapper endpoint:
  - `POST /api/tools/{toolId}/call`
- x402/Stellar testnet payment before provider forwarding.
- Usage/payment logs dashboard.
- External consumer demo in `examples/agent-consumer`.

AgentPay does not make an in-app chatbot the core product. The demo agent is an external runtime/client that consumes marketplace discovery.

## Setup

```bash
npm install
npm run db:push
npm run db:seed
npm run dev
```

The app defaults to `http://localhost:3000`. If Next.js chooses another port, update `NEXT_PUBLIC_APP_URL` in `.env` or `.env.local`, then run `npm run db:seed` again so seed provider endpoint URLs match the running app.

## Environment

Copy `.env.example` values into local env files as needed. The committed `.env` only contains non-secret local defaults.

Required for the full paid consumer demo:

```bash
AGENT_STELLAR_SECRET_KEY="S..."
DEMO_PROVIDER_STELLAR_PUBLIC_KEY="G..."
X402_FACILITATOR_URL="https://www.x402.org/facilitator"
```

Use Stellar testnet only. Keep secret keys in `.env.local`; never put them in chat or commit them.

## Demo Consumer

Run the app first, then:

```bash
npm run demo:agent -- "Summarize this abstract: ..."
```

The consumer will:

1. Fetch `/.well-known/agentpay-tools.json`.
2. Select a tool with `KeywordToolSelector`.
3. Call the paid wrapper endpoint.
4. Handle HTTP 402 with an x402 Stellar payment.
5. Retry with payment headers.
6. Print payment proof and provider response.

OpenAI selection is optional later. The core flow works without `OPENAI_API_KEY`.

## Verification

```bash
npm run lint
npm run build
OPENSPEC_TELEMETRY=0 openspec validate build-agentpay-mvp
```

Smoke-test discovery while the dev server is running:

```bash
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
