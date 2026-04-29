# AgentPay

**An x402-powered API marketplace where external AI agents discover tools, pay per request with Stellar testnet USDC, and receive provider responses only after settlement.**

AgentPay turns ordinary HTTP APIs into paid, agent-readable tools. Providers register an endpoint and price. External agents fetch the marketplace registry, call a paid wrapper endpoint, complete the x402 payment flow, and get the API response after the payment is settled.

🌐 **Live Demo:** [https://agent-pay-jet.vercel.app](https://agent-pay-jet.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-App%20Router-black)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)
![Stellar](https://img.shields.io/badge/Stellar-Testnet-7D5CFF)
![x402](https://img.shields.io/badge/x402-Payments-f6b73c)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E)
![Status](https://img.shields.io/badge/status-MVP-green)

---

## Table of Contents

- [What Is AgentPay?](#what-is-agentpay)
- [Why This Matters](#why-this-matters)
- [Live Review Path](#live-review-path)
- [Core Flow](#core-flow)
- [Architecture](#architecture)
- [Features](#features)
- [API Surface](#api-surface)
- [External Agent Demo](#external-agent-demo)
- [Smart Contract Note](#smart-contract-note)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Verification Checklist](#verification-checklist)
- [Project Structure](#project-structure)
- [MVP Boundaries](#mvp-boundaries)
- [Roadmap](#roadmap)

---

## What Is AgentPay?

AgentPay is a marketplace infrastructure layer for **paid agent tools**.

Instead of making AI agents go through human-style checkout flows, AgentPay exposes APIs through:

- a human-readable marketplace,
- a machine-readable discovery endpoint,
- an x402 paid wrapper endpoint,
- Stellar testnet USDC settlement,
- and payment/usage logs.

The core product is **not** an in-app chatbot. AgentPay is built for external agent runtimes, scripts, and AI systems that need to discover and pay for APIs autonomously.

---

## Why This Matters

Most API monetization still assumes a human buyer:

- create an account,
- enter a credit card,
- subscribe to a plan,
- manage billing manually,
- then call the API.

That does not fit autonomous agents well. Agents need something more direct:

1. discover available tools,
2. understand the price,
3. pay for a single request,
4. get the result,
5. keep moving.

AgentPay demonstrates this agent-native payment pattern using HTTP `402 Payment Required`, x402, and Stellar testnet USDC.

---

## Live Review Path

For judges or reviewers, the fastest path is:

1. Open the live app: [https://agent-pay-jet.vercel.app](https://agent-pay-jet.vercel.app)
2. Visit `/marketplace` to inspect available paid tools.
3. Open `/.well-known/agentpay-tools.json` to see the agent-facing discovery document.
4. Run the external consumer demo:

```bash
npm run demo:agent -- "Explain x402 on Stellar"
```

5. Open `/logs` to verify that the paid call produced a payment and usage receipt.

---

## Core Flow

```mermaid
sequenceDiagram
  participant Provider
  participant AgentPay
  participant Agent as External Agent
  participant Stellar as Stellar Testnet

  Provider->>AgentPay: Register API endpoint, wallet, and price
  Agent->>AgentPay: GET /.well-known/agentpay-tools.json
  AgentPay-->>Agent: Tool registry + payment metadata
  Agent->>AgentPay: POST /api/tools/{toolId}/call
  AgentPay-->>Agent: HTTP 402 Payment Required
  Agent->>Stellar: Sign and submit x402 payment
  Agent->>AgentPay: Retry request with payment proof
  AgentPay->>Stellar: Verify and settle payment
  AgentPay->>Provider: Forward paid request
  Provider-->>AgentPay: Provider API response
  AgentPay-->>Agent: Tool result + payment status
```

---

## Architecture

```mermaid
flowchart LR
  Agent["External Agent Consumer"] --> Discovery["Tool Discovery API"]
  Discovery --> Registry["Supabase Postgres Registry"]
  Agent --> Wrapper["x402 Paid Wrapper"]
  Wrapper --> Facilitator["x402 Facilitator"]
  Facilitator --> Stellar["Stellar Testnet USDC"]
  Wrapper --> Provider["Provider API Endpoint"]
  Wrapper --> Logs["Payment & Usage Logs"]
  Logs --> Dashboard["AgentPay Dashboard"]
```

### Stack

- **Frontend:** Next.js App Router, React, Tailwind CSS
- **Backend:** Next.js Route Handlers
- **Database:** Supabase Postgres via Prisma
- **Payment:** x402 + Stellar testnet USDC
- **Demo consumer:** TypeScript CLI in `examples/agent-consumer`
- **UI motion:** Motion + Sonner

---

## Features

### Provider Side

- Register an API as a paid tool.
- Set a USDC per-call price.
- Provide a Stellar testnet wallet that receives payment.
- Publish input/output examples for agent consumers.
- Gate public registration with `TOOL_REGISTRATION_TOKEN`.

### Agent Side

- Fetch a machine-readable tool registry.
- Select a tool with a keyword router.
- Call an x402-protected endpoint.
- Handle HTTP `402 Payment Required`.
- Pay with Stellar testnet USDC.
- Retry the request with payment proof.
- Receive the provider response after settlement.

### Dashboard Side

- Browse active tools.
- Inspect paid call logs.
- See payer/provider wallets.
- Copy payment proof or transaction hash.
- Open transaction proof in Stellar explorer.

---

## API Surface

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Checks app and database connectivity |
| `GET` | `/api/tools` | Lists active tools |
| `POST` | `/api/tools` | Registers a provider API as a paid tool |
| `GET` | `/.well-known/agentpay-tools.json` | Agent-facing discovery document |
| `POST` | `/api/tools/{toolId}/call` | x402-protected paid wrapper endpoint |
| `GET` | `/api/logs` | Returns recent payment and usage logs |

### Tool Discovery Example

```http
GET /.well-known/agentpay-tools.json
```

Example response shape:

```json
{
  "name": "AgentPay",
  "version": "0.1",
  "protocol": "agentpay-tools",
  "tools": [
    {
      "id": "tool_id",
      "name": "Stellar Explainer",
      "description": "Explains Stellar, Soroban, x402, wallets, and testnet payment concepts.",
      "callUrl": "/api/tools/tool_id/call",
      "absoluteCallUrl": "https://agent-pay-jet.vercel.app/api/tools/tool_id/call",
      "payment": {
        "protocol": "x402",
        "scheme": "exact",
        "price": "$0.01",
        "asset": "USDC",
        "network": "stellar:testnet",
        "payTo": "G..."
      }
    }
  ]
}
```

### Register Tool Example

```http
POST /api/tools
x-agentpay-registration-token: <token>
Content-Type: application/json
```

```json
{
  "providerName": "Example Provider",
  "providerWallet": "G...",
  "name": "Example Tool",
  "description": "A paid API tool exposed through AgentPay.",
  "category": "utility",
  "endpointUrl": "https://example.com/api/tool",
  "method": "POST",
  "priceAmount": "0.01",
  "priceAsset": "USDC",
  "inputExampleJson": {
    "input": "hello"
  },
  "outputExampleJson": {
    "result": "world"
  }
}
```

### Paid Tool Call

```http
POST /api/tools/{toolId}/call
```

If no payment is provided, AgentPay returns HTTP `402`. The external agent signs and submits the x402 Stellar payment, then retries the same request with payment headers.

---

## External Agent Demo

The demo consumer lives outside the app:

```txt
examples/agent-consumer/index.ts
```

Run it with:

```bash
npm run demo:agent -- "Explain x402 on Stellar"
```

The consumer:

1. fetches `/.well-known/agentpay-tools.json`,
2. selects a tool using `KeywordToolSelector`,
3. calls the paid wrapper endpoint,
4. receives HTTP `402`,
5. signs an x402 Stellar payment using `AGENT_STELLAR_SECRET_KEY`,
6. retries the request,
7. prints payment proof and provider response.

OpenAI-based tool selection is optional future work. The MVP works without `OPENAI_API_KEY`.

---

## Smart Contract Note

AgentPay currently does **not** deploy a custom smart contract.

The payment layer uses the x402 Stellar integration and Stellar testnet USDC settlement. In the current MVP, the on-chain/payment proof comes from the Stellar payment transaction handled through x402, not from a custom AgentPay escrow or registry contract.

Future versions could add custom contracts for escrow, revenue splitting, provider staking, refunds, or an on-chain tool registry.

---

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Create Environment Files

```bash
cp .env.example .env
cp .env.local.example .env.local
```

Use:

- `.env` for database/runtime config
- `.env.local` for local wallet secrets

### 3. Push Schema And Seed

```bash
npm run db:push:direct
npm run db:seed:direct
```

The seed creates:

- Paper Summarizer
- Campus FAQ RAG
- Stellar Explainer

### 4. Start Development Server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

---

## Environment Variables

### `.env`

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="http://localhost:3000"

STELLAR_NETWORK="stellar:testnet"
STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
X402_FACILITATOR_URL="https://www.x402.org/facilitator"
PROVIDER_REQUEST_TIMEOUT_MS="12000"

DEMO_PROVIDER_STELLAR_PUBLIC_KEY="G..."
TOOL_REGISTRATION_TOKEN="long-random-token"
```

### `.env.local`

```bash
AGENT_STELLAR_SECRET_KEY="S..."
DEMO_PROVIDER_STELLAR_PUBLIC_KEY="G..."
```

Do not commit secret keys. The agent wallet secret belongs to the external consumer runtime, not the marketplace server.

---

## Deployment

AgentPay is deployed on Vercel with Supabase Postgres.

Required Vercel variables:

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="https://agent-pay-jet.vercel.app"
STELLAR_NETWORK="stellar:testnet"
STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
X402_FACILITATOR_URL="https://www.x402.org/facilitator"
PROVIDER_REQUEST_TIMEOUT_MS="12000"
DEMO_PROVIDER_STELLAR_PUBLIC_KEY="G..."
TOOL_REGISTRATION_TOKEN="long-random-token"
```

Do **not** add `AGENT_STELLAR_SECRET_KEY` to Vercel unless a server-side demo runner is intentionally added later.

After deployment, seed again from your local machine so demo provider endpoints point to the deployed URL:

```bash
NEXT_PUBLIC_APP_URL="https://agent-pay-jet.vercel.app" npm run db:seed:direct
```

Full guide: [docs/deployment.md](docs/deployment.md)

---

## Verification Checklist

```bash
npm run lint
npm run build
```

Check the deployed app:

```bash
curl https://agent-pay-jet.vercel.app/api/health
curl https://agent-pay-jet.vercel.app/.well-known/agentpay-tools.json
```

Run the paid flow:

```bash
npm run demo:agent -- "Explain x402 on Stellar"
```

An unpaid wrapper call should return HTTP `402`:

```bash
curl -i -X POST https://agent-pay-jet.vercel.app/api/tools/<toolId>/call \
  -H "Content-Type: application/json" \
  --data '{"question":"What is x402 on Stellar?"}'
```

After a successful paid call, open:

```txt
https://agent-pay-jet.vercel.app/logs
```

---

## Project Structure

```txt
src/app/
  api/
    health/
    logs/
    provider-seed/
    tools/
  logs/
  marketplace/
  provider/

src/components/
  landing/
  marketplace/
  provider-tool-form.tsx

src/lib/
  discovery.ts
  env.ts
  provider-forwarding.ts
  registration.ts
  tools.ts
  validation.ts
  x402-server.ts

examples/
  agent-consumer/

prisma/
  schema.prisma
  seed.ts
```

---

## MVP Boundaries

- Payments use Stellar testnet USDC, not mainnet funds.
- The marketplace uses Supabase Postgres as the off-chain registry.
- The current version has no custom smart contract.
- Demo tool selection uses a keyword router.
- Provider registration can be protected with `TOOL_REGISTRATION_TOKEN`.
- Provider endpoints must use HTTPS in production.
- Seeded tools are included for judge-friendly testing.

---

## Roadmap

- Provider accounts and authenticated dashboards
- Mainnet-ready payment controls
- Provider verification and moderation
- Revenue analytics
- Optional OpenAI-powered tool selector
- Agent SDKs
- Webhooks for provider payment events
- Custom smart contracts for escrow or revenue splitting

---

## References

- [x402 documentation](https://docs.x402.org/)
- [Stellar x402 quickstart](https://developers.stellar.org/docs/build/agentic-payments/x402/quickstart-guide)
- [Supabase Prisma guide](https://supabase.com/docs/guides/database/prisma)
- [Vercel environment variables](https://vercel.com/docs/environment-variables)
