# AgentPay Deployment Guide

This project is now prepared for Vercel with Supabase Postgres.

## 1. Create Supabase Project

1. Open Supabase and create a new project.
2. Go to **Project Settings -> Database**.
3. Copy two connection strings:
   - Pooled/runtime connection string for `DATABASE_URL`.
   - Direct connection string for `DIRECT_URL`.
4. Replace the password placeholder with your database password.

Use the pooled URL on Vercel. Use the direct URL when pushing schema changes from your laptop.

## 2. Local Env

Use two local files:

- `.env` for database and non-wallet runtime config. Prisma CLI reads this file.
- `.env.local` for wallet secrets and local-only values. Next.js reads this file, and it is gitignored.

Create them from the templates:

```bash
cp .env.example .env
cp .env.local.example .env.local
```

Put this in `.env`:

```bash
DATABASE_URL="postgresql://postgres.PROJECT_REF:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:PASSWORD@db.PROJECT_REF.supabase.co:5432/postgres"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

STELLAR_NETWORK="stellar:testnet"
STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
NEXT_PUBLIC_STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"
NEXT_PUBLIC_STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
NEXT_PUBLIC_STELLAR_READINESS_RECIPIENT_PUBLIC_KEY="G..."
NEXT_PUBLIC_STELLAR_READINESS_PING_AMOUNT="0.00001"
NEXT_PUBLIC_AGENTPAY_REGISTRY_CONTRACT_ID="C..."
X402_FACILITATOR_URL="https://www.x402.org/facilitator"
PROVIDER_REQUEST_TIMEOUT_MS="12000"
TOOL_REGISTRATION_TOKEN="your-invite-token"
```

Put wallet-only values in `.env.local`:

```bash
DEMO_PROVIDER_STELLAR_PUBLIC_KEY="G..."
AGENT_STELLAR_SECRET_KEY="S..."
```

If you already put a testnet secret key in chat or a screenshot, rotate that wallet before a serious public demo.

## 3. Push Schema And Seed

Use the direct Supabase URL for schema setup:

```bash
npm run db:push:direct
npm run db:seed:direct
```

After seeding, set `NEXT_PUBLIC_APP_URL` to the final deployed Vercel URL and run the seed again so seeded provider endpoints point at the deployed app:

```bash
NEXT_PUBLIC_APP_URL="https://your-vercel-app.vercel.app" DATABASE_URL="$DIRECT_URL" npm run db:seed
```

## 4. Vercel Env

Add these to Vercel project environment variables:

```bash
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_APP_URL="https://your-vercel-app.vercel.app"
STELLAR_NETWORK="stellar:testnet"
STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
NEXT_PUBLIC_STELLAR_HORIZON_URL="https://horizon-testnet.stellar.org"
NEXT_PUBLIC_STELLAR_RPC_URL="https://soroban-testnet.stellar.org"
NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
NEXT_PUBLIC_STELLAR_READINESS_RECIPIENT_PUBLIC_KEY="G..."
NEXT_PUBLIC_STELLAR_READINESS_PING_AMOUNT="0.00001"
NEXT_PUBLIC_AGENTPAY_REGISTRY_CONTRACT_ID="C..."
X402_FACILITATOR_URL="https://www.x402.org/facilitator"
PROVIDER_REQUEST_TIMEOUT_MS="12000"
DEMO_PROVIDER_STELLAR_PUBLIC_KEY="G..."
TOOL_REGISTRATION_TOKEN="your-invite-token"
```

Do not add `AGENT_STELLAR_SECRET_KEY` to Vercel unless you intentionally build a server-side demo runner. The external agent wallet should live in the consumer runtime, not the marketplace server.

## 5. Deploy AgentPayRegistry Contract

Build and deploy the registry contract from your laptop:

```bash
stellar contract build --manifest-path Cargo.toml --package agentpay_registry
stellar keys generate agentpay-deployer --network testnet --fund

stellar contract deploy \
  --wasm target/wasm32v1-none/release/agentpay_registry.wasm \
  --source-account agentpay-deployer \
  --network testnet \
  --alias agentpay_registry
```

Copy the returned `C...` contract id into:

- local `.env`
- Vercel `NEXT_PUBLIC_AGENTPAY_REGISTRY_CONTRACT_ID`
- README submission evidence table

## 6. Verify Deployment

```bash
curl https://your-vercel-app.vercel.app/api/health
curl https://your-vercel-app.vercel.app/.well-known/agentpay-tools.json
npm run demo:agent -- "Explain x402 on Stellar"
```

The demo agent command should be run from your laptop or another external runtime with `AGENT_STELLAR_SECRET_KEY` in `.env.local`.

## 7. Recommended Public Demo Mode

For judging, keep registration invite-gated with `TOOL_REGISTRATION_TOKEN`. You can still give the token to testers who want to register their own API. This avoids random public writes while keeping the product flow real.
