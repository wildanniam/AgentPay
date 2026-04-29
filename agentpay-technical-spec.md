# AgentPay Technical Specification

Version: 0.1  
Date: 2026-04-28  
Owner: Wildan  
Target program: Stellar Journey to Mastery - Monthly Builder Challenges  
Primary build mode: AI-agent-assisted autonomous development with OpenSpec planning

---

## 1. Executive Summary

AgentPay is an x402-powered marketplace where developers can register paid APIs as tools, and an AI agent can discover, pay for, and call those tools automatically using Stellar testnet payments.

The MVP must prove one clear idea:

> An AI agent can discover a paid API from a marketplace, pay for it through x402 on Stellar, call the API after payment, and show the result plus payment proof.

This is not a general API directory. It is a payment-enabled tool marketplace for autonomous agents.

---

## 2. Product Positioning

### 2.1 Problem

AI agents can call tools, APIs, and external services, but paid access is usually built for humans:

- sign up for an account
- create an API key
- add a credit card
- subscribe to a plan
- manage billing manually

This breaks autonomous workflows. An agent cannot smoothly decide, pay, and continue execution if every API requires manual setup.

### 2.2 Solution

AgentPay lets API providers register their API as a paid tool. AgentPay wraps the provider API with a payment-gated endpoint. An AI agent can discover tools from the AgentPay registry, choose the right tool, pay through x402 on Stellar, and then receive the API result.

### 2.3 One-Sentence Pitch

AgentPay turns any API into a paid tool that AI agents can discover, pay for, and use through x402 payments on Stellar.

### 2.4 Demo Pitch

> I built AgentPay, an x402-powered API marketplace for AI agents. Developers can register APIs as paid tools. The AI agent reads the marketplace, chooses the best tool for a user task, pays per request on Stellar testnet, calls the API, and shows the result with payment proof.

---

## 3. MVP Scope

### 3.1 MVP Goal

Build a demoable Level 1 third-party provider marketplace:

- Providers can register API tools.
- Registered tools appear in a marketplace.
- A user can ask an AI agent to complete a task.
- The AI agent selects a tool from the marketplace.
- The selected tool is protected by x402 payment.
- Payment is made on Stellar testnet.
- After payment, AgentPay forwards the request to the provider API.
- The result is shown to the user.
- Payment and usage logs are visible in the dashboard.

### 3.2 MVP Non-Goals

Do not build these in the first version:

- full decentralized marketplace registry
- production provider verification
- production abuse prevention
- refund and dispute system
- browser wallet signing for every user
- provider self-hosted x402 endpoints
- complex smart contract marketplace
- revenue split between multiple parties
- on-chain rating or review system
- production compliance layer

### 3.3 The Important Tradeoff

The MVP should keep the core idea strong:

- marketplace
- AI agent tool selection
- x402 payment
- Stellar settlement
- API call after payment
- payment proof

The MVP may simplify everything around that core:

- provider accounts can be lightweight
- database can be off-chain
- provider APIs can be regular HTTP APIs
- the agent wallet can be server-managed for demo
- smart contract can be optional or tiny

---

## 4. Target Users

### 4.1 API Provider

A developer who owns an API and wants to monetize it per request without building billing infrastructure.

Provider wants to:

- register an API endpoint
- set a price per call
- set a wallet address to receive payments
- see request and payment history
- test that their API works through AgentPay

### 4.2 Agent User

A user who asks the built-in AI agent to complete a task.

Agent user wants to:

- enter a natural language task
- let the agent choose a tool
- see which tool was selected and why
- see payment status
- receive the final result

### 4.3 Judge / Demo Viewer

A hackathon/challenge judge who wants to see clear Stellar usage and a working product.

Judge wants to see:

- provider onboarding
- marketplace listing
- AI agent choosing a tool
- x402 payment flow
- Stellar testnet payment proof
- working API response

---

## 5. Core User Flows

### 5.1 Provider Registers a Tool

1. Provider opens Provider Dashboard.
2. Provider fills tool form:
   - tool name
   - description
   - category
   - endpoint URL
   - HTTP method
   - price
   - asset
   - provider wallet address
   - input example
   - output example
3. Provider clicks Save.
4. AgentPay validates the endpoint URL and stores the tool.
5. Tool appears in Marketplace.
6. AgentPay creates an internal paid wrapper route for the tool.

Acceptance criteria:

- A tool can be created without editing code.
- Tool appears immediately in Marketplace.
- Tool has a generated AgentPay call endpoint.
- Invalid provider wallet addresses are rejected.
- Invalid endpoint URLs are rejected.

### 5.2 User Runs the Agent

1. User opens Agent Runner.
2. User enters a task, for example:
   - "Summarize this abstract."
   - "Answer this campus FAQ."
   - "Explain Soroban to a beginner."
3. AgentPay loads active tools from the registry.
4. AI agent selects one tool.
5. UI shows:
   - selected tool
   - selection reason
   - price
   - provider wallet
6. Agent calls the AgentPay paid wrapper endpoint.
7. x402 returns payment requirement.
8. AgentPay client signs payment using the server-managed agent wallet.
9. x402 facilitator verifies and settles the payment on Stellar testnet.
10. AgentPay forwards the request to the provider API.
11. Provider API returns result.
12. UI shows result and payment proof.

Acceptance criteria:

- User can run an end-to-end agent task in one flow.
- Agent selection is visible.
- Payment status is visible.
- API result is visible only after payment succeeds.
- Usage log is created.

### 5.3 Provider Reviews Payment Logs

1. Provider opens Payment Logs.
2. Provider sees rows with:
   - tool name
   - amount
   - asset
   - payer address
   - provider wallet
   - payment status
   - tx hash or facilitator payment reference
   - timestamp
3. Provider can filter by tool.

Acceptance criteria:

- Each successful tool call has a log row.
- Failed calls are logged with error reason.
- Payment proof can be copied or opened in Stellar explorer if available.

---

## 6. System Architecture

### 6.1 Recommended Stack

Frontend and backend:

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui or simple custom components
- lucide-react for icons

Database:

- Prisma with SQLite for fastest local MVP
- Optional Supabase Postgres if deployment needs persistent data

AI:

- OpenAI API for tool selection and optional seed tools
- Fallback deterministic keyword router if OpenAI API is unavailable

Stellar / x402:

- `@x402/core`
- `@x402/express`
- `@x402/fetch`
- `@x402/stellar`
- `@stellar/stellar-sdk`
- Stellar testnet
- x402 facilitator URL from docs/config

Deployment:

- Vercel for Next.js app
- Separate Vercel/Render deployment for one external provider demo API

### 6.2 High-Level Components

```text
User Browser
  |
  | opens Marketplace / Provider Dashboard / Agent Runner
  v
Next.js App
  |
  |-- UI pages
  |-- Agent planner API
  |-- Tool registry API
  |-- Payment/usage log API
  |-- Paid wrapper endpoint
  |
  v
Database
  |
  | stores tools, providers, usage logs
  v
x402 Client + Agent Wallet
  |
  | pays payment requirement
  v
x402 Facilitator
  |
  | verifies and settles payment
  v
Stellar Testnet
  |
  v
Provider API
```

### 6.3 Important Architecture Decision

Provider APIs do not need to implement x402 in the MVP.

Instead:

```text
Provider API:
https://provider.example.com/summarize

AgentPay paid wrapper:
https://agentpay.app/api/tools/{toolId}/call
```

The agent calls the AgentPay wrapper, not the provider API directly.

AgentPay is responsible for:

- reading tool price and provider wallet
- requiring payment
- verifying/settling payment through x402
- forwarding the request to the provider endpoint
- logging usage

This makes provider onboarding much easier.

---

## 7. x402 Payment Design

### 7.1 Payment Flow

The MVP payment flow should follow this pattern:

1. Client requests protected AgentPay wrapper endpoint.
2. Wrapper endpoint responds with `402 Payment Required`.
3. Response contains machine-readable payment requirements.
4. AgentPay's x402 client creates a signed payment payload.
5. AgentPay retries request with payment payload.
6. x402 facilitator verifies and settles payment on Stellar.
7. Wrapper endpoint forwards request to provider API.
8. Provider API response is returned to the agent.

### 7.2 Who Handles What

AgentPay:

- manages tool registry
- hosts wrapper endpoints
- signs payment for demo with server-managed agent wallet
- logs payments and usage
- forwards paid requests to provider APIs

x402 facilitator:

- verifies signed payment payload
- settles payment on Stellar
- returns verification result

Stellar testnet:

- executes settlement
- provides payment proof

Provider:

- supplies an HTTP endpoint
- receives payment to their Stellar wallet

### 7.3 Demo Wallet Model

Use a server-managed agent wallet for MVP.

Reason:

- better for autonomous agent demo
- avoids wallet popup complexity
- stable during judging
- easier to test repeatedly

Rules:

- Secret key must only live in `.env`.
- Use testnet only.
- UI must label this as a demo agent wallet.
- Do not expose secret key to the browser.

### 7.4 Asset Choice

Preferred:

- USDC on Stellar testnet, if trustlines and facilitator setup are stable.

Fallback:

- XLM/testnet payment simulation if USDC setup blocks progress.

Important:

- The desired final demo should use x402 with Stellar testnet settlement.
- If blocked, keep UI and architecture ready for x402, document the blocker, and use a mock payment adapter only for local fallback.

---

## 8. Data Model

Use Prisma-style models as implementation guidance.

### 8.1 Provider

```ts
type Provider = {
  id: string;
  name: string;
  displayName: string;
  email?: string;
  walletAddress: string;
  createdAt: Date;
  updatedAt: Date;
};
```

### 8.2 Tool

```ts
type Tool = {
  id: string;
  providerId: string;
  name: string;
  slug: string;
  description: string;
  category: "research" | "campus" | "stellar" | "data" | "utility";
  endpointUrl: string;
  method: "POST";
  priceAmount: string;
  priceAsset: "USDC" | "XLM";
  network: "stellar:testnet";
  providerWallet: string;
  inputSchemaJson: unknown;
  outputSchemaJson: unknown;
  inputExampleJson: unknown;
  outputExampleJson: unknown;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};
```

### 8.3 AgentRun

```ts
type AgentRun = {
  id: string;
  userPrompt: string;
  selectedToolId?: string;
  selectionReason?: string;
  status: "planned" | "payment_required" | "paid" | "calling_tool" | "completed" | "failed";
  finalAnswer?: string;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
};
```

### 8.4 UsageLog

```ts
type UsageLog = {
  id: string;
  agentRunId?: string;
  toolId: string;
  providerId: string;
  payerAddress?: string;
  providerWallet: string;
  amount: string;
  asset: "USDC" | "XLM";
  network: "stellar:testnet";
  paymentStatus: "pending" | "paid" | "failed" | "mocked";
  paymentProof?: string;
  txHash?: string;
  requestPayloadPreview?: string;
  responsePreview?: string;
  errorMessage?: string;
  createdAt: Date;
};
```

---

## 9. API Specification

### 9.1 `GET /api/tools`

Returns active tools for marketplace and agent planner.

Response:

```json
{
  "tools": [
    {
      "id": "tool_paper_summarizer",
      "name": "Paper Summarizer",
      "description": "Summarizes academic abstracts and papers.",
      "category": "research",
      "price": "0.01",
      "asset": "USDC",
      "providerWallet": "G...",
      "callUrl": "/api/tools/tool_paper_summarizer/call"
    }
  ]
}
```

### 9.2 `POST /api/tools`

Creates a tool from Provider Dashboard.

Request:

```json
{
  "providerName": "Wildan",
  "providerWallet": "G...",
  "name": "Paper Summarizer",
  "description": "Summarizes academic abstracts and papers.",
  "category": "research",
  "endpointUrl": "https://example.com/api/summarize",
  "priceAmount": "0.01",
  "priceAsset": "USDC",
  "inputExampleJson": {
    "text": "Long abstract here"
  },
  "outputExampleJson": {
    "summary": "Short summary here"
  }
}
```

Response:

```json
{
  "tool": {
    "id": "tool_123",
    "callUrl": "/api/tools/tool_123/call"
  }
}
```

Validation:

- `endpointUrl` must be HTTPS in production.
- `providerWallet` must look like a valid Stellar public key.
- `priceAmount` must be positive.
- `name` and `description` are required.

### 9.3 `POST /api/agent/run`

Runs the agent planner and tool call.

Request:

```json
{
  "prompt": "Summarize this abstract: ...",
  "mode": "auto"
}
```

Response:

```json
{
  "runId": "run_123",
  "selectedTool": {
    "id": "tool_paper_summarizer",
    "name": "Paper Summarizer",
    "price": "0.01",
    "asset": "USDC"
  },
  "selectionReason": "The prompt asks for summarization of academic text.",
  "payment": {
    "status": "paid",
    "proof": "payment_reference_or_tx_hash"
  },
  "toolResponse": {
    "summary": "..."
  },
  "finalAnswer": "Here is the summary: ..."
}
```

### 9.4 `POST /api/tools/{toolId}/call`

Protected paid wrapper endpoint.

Behavior:

- Requires x402 payment.
- Uses tool price and provider wallet from database.
- After payment succeeds, forwards request body to provider endpoint.
- Stores usage log.
- Returns provider response.

Request:

```json
{
  "input": {
    "text": "..."
  },
  "agentRunId": "run_123"
}
```

Response after payment:

```json
{
  "toolId": "tool_123",
  "paymentStatus": "paid",
  "providerResponse": {
    "summary": "..."
  }
}
```

### 9.5 `GET /api/logs`

Returns payment and usage logs.

Response:

```json
{
  "logs": [
    {
      "id": "log_123",
      "toolName": "Paper Summarizer",
      "amount": "0.01",
      "asset": "USDC",
      "paymentStatus": "paid",
      "paymentProof": "payment_reference_or_tx_hash",
      "createdAt": "2026-04-28T10:00:00.000Z"
    }
  ]
}
```

---

## 10. Agent Planner Design

### 10.1 Planner Responsibility

The planner decides which tool best matches the user prompt.

Input:

- user prompt
- active tools list
- tool descriptions
- tool categories
- input examples

Output:

- selected tool ID
- reason
- normalized input payload for selected tool

### 10.2 Planner Rules

The agent MUST:

- choose exactly one tool for MVP
- explain the selection reason in one short sentence
- not invent tools
- not call inactive tools
- not call a tool if the prompt is clearly unrelated to all tools
- produce JSON that can be parsed by the backend

### 10.3 Planner Prompt Template

Use this as a starting point:

```text
You are AgentPay's tool-selection agent.

Your job is to choose the best paid API tool for the user's task.

Available tools:
{{TOOLS_JSON}}

User task:
{{USER_PROMPT}}

Return JSON only:
{
  "toolId": "string",
  "reason": "short reason",
  "input": {}
}

Rules:
- Choose only from available tools.
- If no tool fits, return {"toolId": null, "reason": "...", "input": {}}.
- Match the input shape to the selected tool's input example.
```

### 10.4 Fallback Router

If the AI planner fails, use keyword routing:

- prompt contains `paper`, `abstract`, `summarize`, `summary` -> Paper Summarizer
- prompt contains `campus`, `kuliah`, `sidang`, `skripsi`, `TA` -> Campus FAQ RAG
- prompt contains `stellar`, `soroban`, `wallet`, `testnet`, `x402` -> Stellar Explainer

---

## 11. Seed Tools

### 11.1 Paper Summarizer

Purpose:

- Summarize academic abstracts or short paper excerpts.

Endpoint:

- internal seed endpoint or external demo endpoint

Input:

```json
{
  "text": "..."
}
```

Output:

```json
{
  "summary": "...",
  "keyPoints": ["...", "..."],
  "recommendedUse": "..."
}
```

### 11.2 Campus FAQ RAG

Purpose:

- Answer campus/student FAQ questions.

Input:

```json
{
  "question": "Apa syarat sidang TA?"
}
```

Output:

```json
{
  "answer": "...",
  "confidence": 0.82,
  "source": "Seed FAQ dataset"
}
```

### 11.3 Stellar Explainer

Purpose:

- Explain Stellar, Soroban, wallet, x402, and payment concepts to builders.

Input:

```json
{
  "question": "What is x402 on Stellar?"
}
```

Output:

```json
{
  "answer": "...",
  "difficulty": "beginner",
  "nextStep": "..."
}
```

### 11.4 External Provider Demo

Purpose:

- Prove that AgentPay can call an API not hardcoded inside the main app.

Implementation:

- Deploy a tiny separate API to Vercel or Render.
- Register its URL from Provider Dashboard.
- Use it during demo.

Example:

```text
https://agentpay-provider-demo.vercel.app/api/keyword-insight
```

---

## 12. UI Specification

### 12.1 Navigation

Primary nav:

- Marketplace
- Agent Runner
- Provider Dashboard
- Payment Logs

### 12.2 Marketplace Page

Goal:

- Show all registered tools clearly.

Elements:

- tool cards/table
- category filter
- price
- provider wallet shortened
- call endpoint
- active status
- button: "Try with Agent"

Important:

- This page should feel like a functional app, not a landing page.

### 12.3 Agent Runner Page

Goal:

- Main demo surface.

Elements:

- prompt textarea
- run button
- selected tool panel
- payment status stepper
- final response panel
- raw debug accordion

States:

- idle
- planning
- tool selected
- payment required
- payment settled
- calling provider
- completed
- failed

### 12.4 Provider Dashboard

Goal:

- Let a provider register a tool without editing code.

Fields:

- provider name
- provider wallet
- tool name
- description
- category
- endpoint URL
- price
- asset
- input example JSON
- output example JSON

Validation:

- show inline errors
- validate JSON fields before submit
- test endpoint button if time allows

### 12.5 Payment Logs Page

Goal:

- Prove that payment and usage are tracked.

Elements:

- table
- status badges
- tool filter
- copy proof button
- tx/explorer link if available

---

## 13. Smart Contract Strategy

### 13.1 MVP Decision

Custom smart contract is optional for MVP.

Reason:

- x402 on Stellar already provides the core payment settlement.
- The marketplace registry can be off-chain for faster iteration.
- A custom contract can slow down a one-day build.

### 13.2 If There Is Time

Build a tiny Soroban contract only for proof-of-registry and proof-of-usage events.

Contract name:

```text
ToolRegistry
```

Functions:

```text
register_tool(tool_id, provider_wallet, price_amount, price_asset)
record_usage(tool_id, payer_wallet, payment_ref)
```

Events:

```text
ToolRegistered(tool_id, provider_wallet, price_amount, price_asset)
ToolUsed(tool_id, payer_wallet, payment_ref)
```

Do not store:

- full endpoint URLs
- full descriptions
- API request bodies
- API responses

Store only:

- tool ID
- provider wallet
- price
- usage proof reference

### 13.3 Why This Contract Is Small

The contract exists to show a Stellar smart contract touchpoint and event handling. It does not need to own all marketplace logic in MVP.

---

## 14. Security and Safety

### 14.1 Server-Managed Wallet

Rules:

- Store secret key in `.env`.
- Never expose secret key to browser.
- Use testnet only.
- Add spending limit in server config.
- Add a warning in UI: "Demo agent wallet on Stellar testnet."

### 14.2 Provider Endpoint Safety

Validate provider endpoint:

- allow only `https://` in deployed mode
- block localhost/private IPs in deployed mode
- set request timeout
- limit request body size
- do not forward internal headers or secrets

### 14.3 Logs

Do not log:

- private keys
- full payment payload if sensitive
- large user documents
- full API responses if too long

Log previews only.

### 14.4 Error Handling

Handle:

- planner cannot choose tool
- x402 payment fails
- facilitator unavailable
- provider endpoint returns error
- provider endpoint times out
- invalid JSON from provider

---

## 15. Environment Variables

```bash
DATABASE_URL="file:./dev.db"

OPENAI_API_KEY=""

STELLAR_NETWORK="stellar:testnet"
STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
STELLAR_PRIVATE_KEY=""
X402_FACILITATOR_URL=""

NEXT_PUBLIC_APP_URL="http://localhost:3000"
ENABLE_MOCK_PAYMENT="false"
DEMO_SPENDING_LIMIT_USD="1.00"
```

Notes:

- `STELLAR_PRIVATE_KEY` is the demo agent wallet.
- `X402_FACILITATOR_URL` must follow current Stellar x402 docs.
- `ENABLE_MOCK_PAYMENT` is fallback only, not the primary demo.

---

## 16. Implementation Plan

### Phase 0 - Project and OpenSpec Setup

1. Create Next.js TypeScript project.
2. Install OpenSpec.
3. Run `openspec init`.
4. Create OpenSpec proposal for the MVP.
5. Validate OpenSpec artifacts before implementation.

### Phase 1 - App Shell and Data

1. Build navigation and layout.
2. Set up Prisma/SQLite.
3. Create Provider, Tool, AgentRun, UsageLog models.
4. Seed 3 first-party tools.
5. Build Marketplace page.

### Phase 2 - Provider Dashboard

1. Build create tool form.
2. Validate endpoint URL, JSON examples, wallet address, price.
3. Save tool to database.
4. Show registered tool in Marketplace.

### Phase 3 - Agent Runner

1. Build prompt UI.
2. Implement tool planner.
3. Add fallback keyword router.
4. Show selected tool and reason.
5. Create AgentRun record.

### Phase 4 - Paid Wrapper and x402

1. Implement `POST /api/tools/{toolId}/call`.
2. Add x402 payment requirement based on tool price and provider wallet.
3. Add x402 client for server-managed agent wallet.
4. Settle payment on Stellar testnet.
5. Forward request to provider endpoint after payment.
6. Store UsageLog.

### Phase 5 - Logs and Demo Polish

1. Build Payment Logs page.
2. Add step-by-step status in Agent Runner.
3. Add clear error messages.
4. Add demo seed data.
5. Add README with setup and demo script.
6. Deploy.

### Phase 6 - Optional Smart Contract

1. Create tiny `ToolRegistry` Soroban contract.
2. Add `register_tool`.
3. Add `record_usage`.
4. Emit events.
5. Show event references in logs.

---

## 17. OpenSpec Instructions for the Autonomous Agent

The autonomous coding agent MUST use OpenSpec before implementation.

### 17.1 Install and Initialize

Run inside the project root:

```bash
npm install -g @fission-ai/openspec@latest
openspec init
```

OpenSpec requires Node.js 20.19.0 or higher.

### 17.2 Required OpenSpec Change

Create a change:

```text
/opsx:propose build-agentpay-mvp
```

The change folder should be:

```text
openspec/changes/build-agentpay-mvp/
```

Required artifacts:

```text
openspec/changes/build-agentpay-mvp/
├── proposal.md
├── design.md
├── tasks.md
└── specs/
    ├── marketplace/
    │   └── spec.md
    ├── agent-runner/
    │   └── spec.md
    ├── x402-payments/
    │   └── spec.md
    └── provider-tools/
        └── spec.md
```

### 17.3 Suggested `proposal.md`

```md
# Proposal: Build AgentPay MVP

## Intent

Build a demoable x402-powered API marketplace where providers register APIs as paid tools and an AI agent can discover, pay for, and call those tools through Stellar testnet payments.

## Scope

- Marketplace for active paid API tools
- Provider dashboard to register tools
- Agent runner that selects tools from a user prompt
- x402 paid wrapper endpoint for each tool
- Stellar testnet payment through server-managed demo agent wallet
- Payment and usage logs
- Seed tools for demo reliability

## Non-Goals

- Full decentralized marketplace registry
- Production-grade provider verification
- Refund/dispute system
- Browser wallet signing
- Complex smart contract marketplace
- Mainnet payments

## Approach

Use Next.js, TypeScript, Prisma/SQLite, OpenAI tool selection, x402 Stellar packages, and a server-managed testnet wallet. Store registry and logs off-chain for MVP. Wrap provider APIs behind AgentPay paid endpoints.
```

### 17.4 Suggested Spec Delta: Marketplace

```md
# Delta for Marketplace

## ADDED Requirements

### Requirement: Tool marketplace listing
The system SHALL display active paid API tools registered in AgentPay.

#### Scenario: Active tools are visible
- GIVEN at least one active tool exists
- WHEN a user opens the Marketplace page
- THEN the tool name, description, provider, price, asset, and category are shown

### Requirement: Tool call endpoint exposure
The system SHALL show an AgentPay wrapper endpoint for each tool.

#### Scenario: Tool has wrapper endpoint
- GIVEN a tool is registered
- WHEN the marketplace displays the tool
- THEN the system shows or internally uses `/api/tools/{toolId}/call` as the paid call endpoint
```

### 17.5 Suggested Spec Delta: Provider Tools

```md
# Delta for Provider Tools

## ADDED Requirements

### Requirement: Provider tool registration
The system SHALL allow a provider to register an HTTP API as a paid tool.

#### Scenario: Provider registers a valid tool
- GIVEN a provider enters a valid endpoint URL, wallet address, price, description, and examples
- WHEN the provider submits the form
- THEN the system stores the tool
- AND the tool appears in the marketplace

### Requirement: Registration validation
The system SHALL reject invalid provider tool registrations.

#### Scenario: Invalid endpoint URL
- GIVEN a provider enters an invalid endpoint URL
- WHEN the provider submits the form
- THEN the system rejects the registration
- AND explains the validation error
```

### 17.6 Suggested Spec Delta: Agent Runner

```md
# Delta for Agent Runner

## ADDED Requirements

### Requirement: Tool selection from prompt
The system SHALL select the best active tool for a user's natural language task.

#### Scenario: User asks for paper summarization
- GIVEN the Paper Summarizer tool is active
- WHEN the user asks to summarize an academic abstract
- THEN the agent selects the Paper Summarizer tool
- AND returns a short reason

### Requirement: No matching tool handling
The system SHALL avoid calling a tool when no active tool matches the task.

#### Scenario: Prompt does not match any tool
- GIVEN no active tool can satisfy the prompt
- WHEN the user runs the agent
- THEN the system returns a clear no-tool-found message
- AND no payment is attempted
```

### 17.7 Suggested Spec Delta: x402 Payments

```md
# Delta for x402 Payments

## ADDED Requirements

### Requirement: Paid tool wrapper
The system SHALL protect tool wrapper endpoints with x402 payment requirements.

#### Scenario: Request without payment
- GIVEN an active paid tool exists
- WHEN a client calls the tool wrapper endpoint without payment
- THEN the endpoint responds with HTTP 402 Payment Required
- AND includes machine-readable payment requirements

### Requirement: Paid request execution
The system SHALL call the provider API only after payment succeeds.

#### Scenario: Payment succeeds
- GIVEN the agent receives payment requirements
- WHEN the agent signs and submits a valid x402 payment
- THEN the payment is settled on Stellar testnet
- AND the wrapper forwards the request to the provider API
- AND the provider response is returned

### Requirement: Payment log
The system SHALL record payment and usage information for each paid tool call.

#### Scenario: Tool call completes
- GIVEN a paid tool call succeeds
- WHEN the provider response is returned
- THEN a usage log is stored with tool, amount, asset, status, provider wallet, and payment proof
```

### 17.8 Required `tasks.md` Structure

```md
# Tasks

## 1. Project Foundation
- [ ] 1.1 Create Next.js TypeScript app
- [ ] 1.2 Add Tailwind and UI primitives
- [ ] 1.3 Set up Prisma with SQLite
- [ ] 1.4 Add environment variable validation

## 2. Marketplace and Provider Tools
- [ ] 2.1 Create database models
- [ ] 2.2 Seed demo tools
- [ ] 2.3 Build Marketplace page
- [ ] 2.4 Build Provider Dashboard form
- [ ] 2.5 Implement tool registration API

## 3. Agent Runner
- [ ] 3.1 Build Agent Runner UI
- [ ] 3.2 Implement AI planner
- [ ] 3.3 Implement fallback keyword router
- [ ] 3.4 Create AgentRun records

## 4. x402 Payment Flow
- [ ] 4.1 Add x402 dependencies
- [ ] 4.2 Implement paid wrapper endpoint
- [ ] 4.3 Configure server-managed Stellar testnet wallet
- [ ] 4.4 Implement payment retry flow
- [ ] 4.5 Forward request to provider API after payment

## 5. Logs and Demo
- [ ] 5.1 Store usage logs
- [ ] 5.2 Build Payment Logs page
- [ ] 5.3 Add demo status stepper
- [ ] 5.4 Add README setup guide
- [ ] 5.5 Run end-to-end demo test

## 6. Optional Soroban Contract
- [ ] 6.1 Create minimal ToolRegistry contract
- [ ] 6.2 Emit ToolRegistered event
- [ ] 6.3 Emit ToolUsed event
- [ ] 6.4 Show event reference in logs
```

### 17.9 OpenSpec Validation Commands

Run these during planning and before coding:

```bash
openspec list
openspec show build-agentpay-mvp
openspec validate build-agentpay-mvp
```

After implementation:

```text
/opsx:archive
```

---

## 18. Testing Plan

### 18.1 Unit Tests

Test:

- tool validation
- wallet address validation
- price validation
- planner output parser
- fallback router
- log creation

### 18.2 Integration Tests

Test:

- create tool -> appears in marketplace
- agent prompt -> tool selected
- paid wrapper rejects unpaid call
- successful payment -> provider API called
- provider API error -> usage log failed

### 18.3 Manual Demo Test

Checklist:

- [ ] Seed tools visible
- [ ] Provider can add a tool
- [ ] Added tool appears in marketplace
- [ ] Agent selects correct tool
- [ ] x402 payment completes on Stellar testnet
- [ ] API result is shown
- [ ] Payment log appears
- [ ] Demo can be repeated

---

## 19. Demo Script

### 19.1 Opening

"AgentPay is a paid API marketplace for AI agents. Developers register APIs as tools, and agents can pay per request through x402 on Stellar."

### 19.2 Provider Demo

1. Open Provider Dashboard.
2. Register a demo API.
3. Show it appearing in Marketplace.

### 19.3 Agent Demo

1. Open Agent Runner.
2. Enter:

```text
Summarize this research abstract and give me three key points:
<paste short abstract>
```

3. Show selected tool.
4. Show payment status.
5. Show final result.

### 19.4 Proof Demo

1. Open Payment Logs.
2. Show tool usage.
3. Show payment proof or tx reference.
4. Explain funds settle to provider wallet.

### 19.5 Closing

"The MVP starts with first-party and demo provider APIs, but the provider dashboard already supports external API registration. The next step is production provider verification, browser wallet funding, and optional Soroban registry events."

---

## 20. Success Criteria

The project is successful if:

- a judge understands the idea in under 30 seconds
- a provider can register a tool
- the marketplace shows registered tools
- the agent can select a tool from a prompt
- x402/Stellar payment is part of the actual call path
- the API is called only after payment
- logs show usage and payment proof
- demo is repeatable

---

## 21. Known Risks and Fallbacks

### 21.1 x402 Setup Blocks Progress

Risk:

- Facilitator, USDC trustline, or package integration takes too long.

Fallback:

- Keep x402 adapter interface.
- Implement mock payment adapter for UI/dev only.
- Continue trying real x402 in parallel.
- Be honest in README about what is real and what is fallback.

### 21.2 Provider API Is Down

Risk:

- External API fails during demo.

Fallback:

- Use first-party seed APIs for main demo.
- Keep one external provider API as bonus proof.

### 21.3 AI Planner Returns Bad JSON

Risk:

- Agent planner output cannot be parsed.

Fallback:

- Use structured JSON mode if available.
- Add parser repair.
- Fall back to keyword router.

### 21.4 Time Runs Out

Minimum viable demo:

- Marketplace with seed tools
- Agent Runner
- x402 paid call to one tool
- Payment Logs

Cut if needed:

- Provider Dashboard polish
- external provider demo
- optional smart contract
- filtering/search

---

## 22. Source Notes

OpenSpec:

- OpenSpec homepage: https://openspec.dev/
- GitHub repository: https://github.com/Fission-AI/OpenSpec/
- Getting started docs: https://github.com/Fission-AI/OpenSpec/blob/main/docs/getting-started.md

Stellar / x402:

- Stellar x402 overview: https://stellar.org/x402
- Stellar x402 quickstart: https://developers.stellar.org/docs/build/agentic-payments/x402/quickstart-guide
- Stellar agentic payments overview: https://developers.stellar.org/docs/build/agentic-payments
- Stellar wallet integration: https://developers.stellar.org/docs/tools/developer-tools/wallets
- Stellar smart contract overview: https://developers.stellar.org/docs/build/smart-contracts/overview

