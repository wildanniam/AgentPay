## Context

AgentPay starts as a greenfield project. The current folder contains the technical specification and OpenSpec artifacts, but no app code yet. The MVP is a real x402-powered API marketplace for external AI agents, not an in-app AI chatbot. The first demo must show a provider registering an API tool, an external consumer discovering tools, paying with a demo Stellar testnet wallet through x402, calling the paid wrapper, and viewing usage/payment logs.

The x402/Stellar implementation will follow the current Stellar x402 quickstart package set: `@x402/core`, `@x402/fetch`, `@x402/stellar`, `@stellar/stellar-sdk`, and a server integration package such as `@x402/next` or `@x402/express` depending on the route adapter that works cleanly in Next.js. The app must run without `OPENAI_API_KEY`; OpenAI-based selection is optional later.

## Goals / Non-Goals

**Goals:**

- Build AgentPay as a separate project from PayGate.
- Provide provider tool registration and validation.
- Expose machine-readable discovery via `GET /api/tools` and `GET /.well-known/agentpay-tools.json`.
- Protect `POST /api/tools/{toolId}/call` with x402 payment on `stellar:testnet`.
- Forward paid requests to provider endpoints only after successful payment.
- Persist usage/payment logs with enough payment proof metadata for dashboard review.
- Add `examples/agent-consumer` with `npm run demo:agent -- "<prompt>"`.
- Use `KeywordToolSelector` as the first `ToolSelector` implementation.
- Keep UI focused on marketplace, provider dashboard, and payment logs.

**Non-Goals:**

- No Agent Runner/chatbot as a primary navigation item.
- No requirement for OpenAI planner in the core MVP.
- No production auth, provider KYC, billing account system, or mainnet support.
- No custom Soroban registry contract in the first implementation pass.
- No PayGate code reuse or product coupling.

## Decisions

### Next.js Monolith With Prisma SQLite

Use Next.js App Router, TypeScript, Tailwind, Prisma, and SQLite for the MVP. This keeps UI, APIs, data model, and demo seed endpoints in one deployable unit.

Alternatives considered:

- Separate Express API and React frontend: easier x402 middleware fit, but slower to ship and adds deployment complexity.
- Reusing PayGate: rejected because AgentPay is a separate product with different framing and core flows.

### Machine-Readable Discovery First

Treat API discovery as a core product surface. `GET /api/tools` will support the app marketplace and `GET /.well-known/agentpay-tools.json` will be stable for external agents.

The discovery payload will include tool id, name, description, category, price, asset, network, provider wallet, input example/schema, and paid call URL. It will not expose provider secrets or internal-only fields.

### Dynamic Paid Wrapper Per Tool

Use `POST /api/tools/[toolId]/call` as the only call path external agents use. The route loads tool pricing and provider wallet from the database, builds the x402 payment requirement dynamically, then forwards the request body to the provider endpoint after settlement succeeds.

For Next.js integration, prefer `@x402/next` `withX402` for route handlers if it supports the Stellar scheme cleanly. If the package surface is unstable, implement a small adapter around the x402 resource server primitives from `@x402/core/server` and `@x402/stellar/exact/server`, following the Stellar quickstart flow.

### Real x402, No Mock Payment Path

The core paid wrapper and demo consumer must use real x402/Stellar testnet packages. A mock adapter will not be wired into the default flow. Development can still fail clearly if required x402 env vars or wallet trustlines are missing.

### Provider Forwarding Safety

Provider URLs will be validated on registration and again before forwarding. Local development may allow `http://localhost` seed/demo providers, but production mode must require HTTPS and block private network targets. Provider calls will use a timeout and log request/response previews rather than full large payloads.

### External Agent Consumer as Canonical Demo

`examples/agent-consumer` is the demo agent. It will fetch discovery, select a tool with `KeywordToolSelector`, make an unpaid request, parse the `402 Payment Required` response, sign with `AGENT_STELLAR_SECRET_KEY`, retry with payment headers, then print provider response and payment proof.

An optional `OpenAIToolSelector` can be added later behind the same interface, but absence of `OPENAI_API_KEY` must not block the product demo.

### UI Direction

The UI should feel like a focused API/payment operations console: dense, scannable, and useful. Primary nav will be Marketplace, Provider Dashboard, and Payment Logs. It will not include a landing page hero or an Agent Runner tab in the core MVP.

## Risks / Trade-offs

- x402 package/API drift → Verify package exports during implementation and keep the wrapper isolated in `lib/x402`.
- Stellar testnet wallet/trustline setup fails → Surface clear environment and trustline errors; document setup in README.
- Next.js route integration does not support the Stellar scheme cleanly → Use a route-local adapter or a small server integration layer while preserving the same public endpoint contract.
- Provider API is unavailable during demo → Include seed provider endpoints inside AgentPay and seed them as first-party tools.
- Keyword selector chooses poorly → Keep matching rules simple, visible, and testable; allow prompt examples in README.
- Logging leaks sensitive data → Store previews only and never log secret keys or raw payment payloads.

## Migration Plan

1. Create Next.js app and Prisma schema in the current AgentPay folder.
2. Add environment validation and seed data.
3. Implement registration/discovery APIs.
4. Implement x402 paid wrapper and forwarding.
5. Add marketplace/dashboard UI.
6. Add external agent consumer example and demo script.
7. Validate OpenSpec, run build/lint/tests, and document setup.

Rollback is simple during MVP development: remove generated app files or revert the `build-agentpay-mvp` change before archiving. No production data migration is required.

## Open Questions

- Which managed facilitator URL will be used for the final demo environment.
- Whether the first public demo will use only first-party seed provider APIs or also one external deployed provider endpoint.
