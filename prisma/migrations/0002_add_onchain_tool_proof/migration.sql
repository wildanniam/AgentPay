ALTER TABLE "Tool"
  ADD COLUMN "metadataHash" TEXT,
  ADD COLUMN "onchainStatus" TEXT NOT NULL DEFAULT 'not_registered',
  ADD COLUMN "onchainContractId" TEXT,
  ADD COLUMN "onchainTxHash" TEXT,
  ADD COLUMN "onchainLedger" INTEGER,
  ADD COLUMN "onchainRegisteredAt" TIMESTAMP(3);

CREATE INDEX "Tool_onchainStatus_idx" ON "Tool"("onchainStatus");
