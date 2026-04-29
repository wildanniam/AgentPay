## 1. Project Foundation

- [x] 1.1 Scaffold Next.js App Router TypeScript app in the AgentPay root
- [x] 1.2 Add Tailwind, lint/build scripts, and shared UI primitives
- [x] 1.3 Add Prisma SQLite schema for providers, tools, and usage logs
- [x] 1.4 Add environment validation and `.env.example`
- [x] 1.5 Add README setup and demo instructions

## 2. Provider Tools

- [x] 2.1 Implement provider/tool validation helpers
- [x] 2.2 Implement Prisma seed data for Paper Summarizer, Campus FAQ RAG, and Stellar Explainer
- [x] 2.3 Implement `POST /api/tools` for provider registration
- [x] 2.4 Build Provider Dashboard form with inline validation

## 3. Tool Discovery

- [x] 3.1 Implement public tool serialization helpers
- [x] 3.2 Implement `GET /api/tools`
- [x] 3.3 Implement `GET /.well-known/agentpay-tools.json`
- [x] 3.4 Build Marketplace page for active tools

## 4. x402 Paid Wrapper

- [x] 4.1 Add x402/Stellar dependencies and wrapper utility module
- [x] 4.2 Implement dynamic x402 payment requirement for `POST /api/tools/{toolId}/call`
- [x] 4.3 Forward paid requests to provider endpoints after settlement
- [x] 4.4 Handle missing tools, payment failures, provider errors, and timeouts
- [x] 4.5 Add first-party seed provider endpoints for repeatable demos

## 5. Usage Logs

- [x] 5.1 Store success and failure usage logs from paid wrapper calls
- [x] 5.2 Implement `GET /api/logs`
- [x] 5.3 Build Payment Logs dashboard with proof copy behavior
- [x] 5.4 Ensure logs store bounded previews and no secrets

## 6. External Agent Consumer

- [x] 6.1 Create `examples/agent-consumer` with TypeScript entrypoint
- [x] 6.2 Implement `ToolSelector` and default `KeywordToolSelector`
- [x] 6.3 Implement discovery fetch and prompt-to-payload normalization
- [x] 6.4 Implement x402 402 handling, Stellar signing, retry, and proof printing
- [x] 6.5 Add root `npm run demo:agent -- "<prompt>"` script

## 7. Verification

- [x] 7.1 Run OpenSpec validation for `build-agentpay-mvp`
- [x] 7.2 Run Prisma generation and seed smoke test
- [x] 7.3 Run lint/build checks
- [x] 7.4 Smoke-test discovery endpoints locally
- [x] 7.5 Smoke-test external agent consumer flow with configured Stellar testnet wallet
