CREATE TABLE "Provider" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "email" TEXT,
  "walletAddress" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Tool" (
  "id" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "endpointUrl" TEXT NOT NULL,
  "method" TEXT NOT NULL DEFAULT 'POST',
  "priceAmount" TEXT NOT NULL,
  "priceAsset" TEXT NOT NULL DEFAULT 'USDC',
  "network" TEXT NOT NULL DEFAULT 'stellar:testnet',
  "providerWallet" TEXT NOT NULL,
  "inputSchemaJson" TEXT,
  "outputSchemaJson" TEXT,
  "inputExampleJson" TEXT NOT NULL,
  "outputExampleJson" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Tool_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UsageLog" (
  "id" TEXT NOT NULL,
  "toolId" TEXT NOT NULL,
  "providerId" TEXT NOT NULL,
  "payerAddress" TEXT,
  "providerWallet" TEXT NOT NULL,
  "amount" TEXT NOT NULL,
  "asset" TEXT NOT NULL,
  "network" TEXT NOT NULL,
  "paymentStatus" TEXT NOT NULL,
  "paymentProof" TEXT,
  "txHash" TEXT,
  "facilitatorResponseJson" TEXT,
  "requestPayloadPreview" TEXT,
  "responsePreview" TEXT,
  "errorMessage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UsageLog_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Provider_walletAddress_key" ON "Provider"("walletAddress");
CREATE UNIQUE INDEX "Tool_slug_key" ON "Tool"("slug");
CREATE INDEX "Tool_providerId_idx" ON "Tool"("providerId");
CREATE INDEX "Tool_category_idx" ON "Tool"("category");
CREATE INDEX "Tool_isActive_idx" ON "Tool"("isActive");
CREATE INDEX "UsageLog_toolId_idx" ON "UsageLog"("toolId");
CREATE INDEX "UsageLog_providerId_idx" ON "UsageLog"("providerId");
CREATE INDEX "UsageLog_paymentStatus_idx" ON "UsageLog"("paymentStatus");
CREATE INDEX "UsageLog_createdAt_idx" ON "UsageLog"("createdAt");

ALTER TABLE "Tool"
  ADD CONSTRAINT "Tool_providerId_fkey"
  FOREIGN KEY ("providerId") REFERENCES "Provider"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UsageLog"
  ADD CONSTRAINT "UsageLog_toolId_fkey"
  FOREIGN KEY ("toolId") REFERENCES "Tool"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UsageLog"
  ADD CONSTRAINT "UsageLog_providerId_fkey"
  FOREIGN KEY ("providerId") REFERENCES "Provider"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
