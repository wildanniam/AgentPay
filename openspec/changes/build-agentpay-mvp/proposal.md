## Why

AgentPay needs to prove a focused marketplace primitive: API providers can publish paid tools, and external AI agents can discover, pay for, and call those tools through x402 on Stellar testnet. The MVP should avoid becoming an in-app chatbot and instead make the x402-powered API marketplace usable by external agent runtimes.

## What Changes

- Create a new AgentPay web app with provider tool registration, marketplace visibility, and usage/payment dashboards.
- Add tool discovery APIs for external agents:
  - `GET /api/tools`
  - `GET /.well-known/agentpay-tools.json`
- Add paid wrapper endpoints for each tool:
  - `POST /api/tools/{toolId}/call`
- Require x402/Stellar testnet payment before forwarding paid calls to provider APIs.
- Persist providers, tools, agent/payment usage logs, and payment proof metadata.
- Add `examples/agent-consumer` as the canonical external consumer demo using a keyword tool selector and x402 client payment flow.
- Keep OpenAI planning optional and outside the core marketplace path.
- Do not add Agent Runner/chatbot as a primary app navigation item for the MVP.

## Capabilities

### New Capabilities

- `provider-tools`: Provider registration, validation, and storage of paid API tools.
- `tool-discovery`: Marketplace and machine-readable tool discovery for external agents.
- `x402-paid-wrapper`: Payment-gated tool wrapper endpoints using x402 on Stellar testnet.
- `usage-logs`: Payment and usage logging with provider-visible dashboard data.
- `agent-consumer-demo`: External agent consumer example that discovers tools, selects one, pays, calls, and prints results.

### Modified Capabilities

- None.

## Impact

- New Next.js App Router TypeScript application with Tailwind UI.
- New Prisma SQLite data model for providers, tools, and logs.
- New API routes for tool registration, discovery, paid wrapper calls, logs, and seed/demo provider endpoints.
- New x402/Stellar dependencies and environment variables for testnet payment.
- New CLI/example package or script under `examples/agent-consumer`.
- New OpenSpec artifacts under `openspec/changes/build-agentpay-mvp`.
