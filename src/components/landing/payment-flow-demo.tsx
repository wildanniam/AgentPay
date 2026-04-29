"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Check,
  Clipboard,
  ExternalLink,
  Pause,
  Play,
  Radio,
  ReceiptText,
  Server,
  Sparkles,
  Wallet
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { CopyButton } from "@/components/copy-button";

export type LandingProof = {
  status: string;
  toolName: string;
  amount: string;
  asset: string;
  payerAddress: string;
  providerWallet: string;
  txHash: string;
  createdAt: string;
};

const fallbackProof: LandingProof = {
  status: "paid",
  toolName: "Stellar Explainer",
  amount: "0.01",
  asset: "USDC",
  payerAddress: "GAQUADIOO6CECKYEN4P3TUOXUD2PZRRRQJAXPW2QYKW42YYKZ4ZMUZ62",
  providerWallet: "GAVJ6P6SV5GSC7BFZY6IQSJNUYKBIA3AN4DCUURJ3Q6BMWCGQL4LUNWG",
  txHash: "0eae19718cde5cde9528937423abea25a916ef3726bc0c53e576feb62df36262",
  createdAt: "Fallback demo state"
};

const steps = [
  {
    id: "discover",
    title: "Discover tool",
    label: "AI Agent",
    detail: "Reads the public registry",
    icon: Sparkles
  },
  {
    id: "wrapper",
    title: "402 required",
    label: "AgentPay Wrapper",
    detail: "Returns payment terms",
    icon: Server
  },
  {
    id: "payment",
    title: "Pay 0.01 USDC",
    label: "Stellar x402",
    detail: "Signs the testnet payment",
    icon: Wallet
  },
  {
    id: "provider",
    title: "Call provider",
    label: "Provider API",
    detail: "Forwards the paid request",
    icon: Radio
  },
  {
    id: "response",
    title: "Return answer",
    label: "Response",
    detail: "Stores receipt and proof",
    icon: ReceiptText
  }
];

export function PaymentFlowDemo({ proof }: { proof?: LandingProof | null }) {
  const resolvedProof = proof ?? fallbackProof;
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveStep((current) => {
        return (current + 1) % steps.length;
      });
    }, 2200);

    return () => window.clearInterval(interval);
  }, [isPlaying]);

  const active = steps[activeStep];

  const nodePositions = useMemo(
    () => [
      { x: 70, y: 150 },
      { x: 240, y: 78 },
      { x: 430, y: 150 },
      { x: 620, y: 78 },
      { x: 790, y: 150 }
    ],
    []
  );

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <div className="section-shell p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink/10 pb-3">
          <div>
            <p className="font-mono text-xs uppercase text-steel">Interactive request path</p>
            <h2 className="mt-1 text-xl font-semibold text-ink">{active.title}</h2>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge tone={activeStep === 2 ? "payment" : activeStep >= 3 ? "success" : "network"}>
              {active.id}
            </StatusBadge>
            <button
              type="button"
              onClick={() => setIsPlaying((value) => !value)}
              className="inline-flex items-center gap-2 border border-ink bg-ink px-3 py-2 text-sm font-semibold text-paper transition hover:bg-moss"
            >
              {isPlaying ? <Pause className="size-4" /> : <Play className="size-4" />}
              {isPlaying ? "Pause" : "Play"}
            </button>
          </div>
        </div>

        <div className="relative min-h-[320px] overflow-hidden bg-paper/70">
          <div className="absolute inset-0 flow-grid opacity-80" />
          <svg className="absolute inset-0 hidden h-full w-full md:block" viewBox="0 0 860 300" aria-hidden="true">
            <path
              d="M92 150 C150 150 160 78 240 78 S350 150 430 150 S540 78 620 78 S730 150 790 150"
              fill="none"
              stroke="rgba(21,23,19,0.24)"
              strokeWidth="2"
              strokeDasharray="7 8"
            />
            <motion.circle
              r="7"
              fill="#efb84a"
              animate={{
                cx: nodePositions[activeStep].x,
                cy: nodePositions[activeStep].y
              }}
              transition={{ type: "spring", stiffness: 90, damping: 18 }}
            />
            <motion.circle
              r="15"
              fill="rgba(239,184,74,0.18)"
              animate={{
                cx: nodePositions[activeStep].x,
                cy: nodePositions[activeStep].y,
                opacity: [0.4, 0.9, 0.4]
              }}
              transition={{ duration: 1.4, repeat: Infinity }}
            />
          </svg>

          <div className="relative grid h-full min-h-[320px] grid-cols-1 items-stretch gap-3 px-4 py-5 md:grid-cols-5 md:items-center md:gap-2 md:px-5 md:py-8">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = index === activeStep;
              const isDone = index < activeStep;

              return (
                <motion.button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveStep(index)}
                  className={`relative z-10 grid min-h-28 content-between border p-3 text-left transition md:min-h-40 ${
                    isActive
                      ? "border-ink bg-white shadow-lift"
                      : "border-ink/10 bg-white/70 hover:border-ink/40"
                  }`}
                  animate={{ y: isActive ? -8 : 0 }}
                  transition={{ type: "spring", stiffness: 140, damping: 18 }}
                >
                  <span
                    className={`flex size-10 items-center justify-center border ${
                      isActive ? "border-ink bg-ink text-paper" : "border-ink/20 bg-paper text-ink"
                    }`}
                  >
                    {isDone ? <Check className="size-4" /> : <Icon className="size-4" />}
                  </span>
                  <span>
                    <span className="block font-semibold text-ink">{step.label}</span>
                    <span className="mt-1 block text-sm leading-5 text-steel">{step.detail}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-ink/10 pt-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                type="button"
                aria-label={`Go to ${step.title}`}
                onClick={() => setActiveStep(index)}
                className={`size-2.5 border border-ink transition ${
                  index === activeStep ? "bg-ink" : "bg-white"
                }`}
              />
            ))}
          </div>
          <code className="border border-ink/10 bg-white px-3 py-2 font-mono text-xs text-ink">
            HTTP 402 {">"} payment {">"} retry {">"} provider response
          </code>
        </div>
      </div>

      <PaymentReceipt proof={resolvedProof} />
    </div>
  );
}

function PaymentReceipt({ proof }: { proof: LandingProof }) {
  const txUrl = `https://stellar.expert/explorer/testnet/tx/${proof.txHash}`;

  return (
    <aside className="ink-panel p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase text-paper/60">Latest proof</p>
          <h3 className="mt-2 text-2xl font-semibold">Payment settled</h3>
        </div>
        <StatusBadge tone="success">paid</StatusBadge>
      </div>

      <div className="mt-6 grid gap-4">
        <ReceiptRow label="Tool" value={proof.toolName} />
        <ReceiptRow label="Amount" value={`${proof.amount} ${proof.asset}`} />
        <ReceiptRow label="From" value={shorten(proof.payerAddress)} mono />
        <ReceiptRow label="To" value={shorten(proof.providerWallet)} mono />
        <div className="border-t border-paper/20 pt-4">
          <p className="font-mono text-xs uppercase text-paper/60">Transaction</p>
          <div className="mt-2 flex items-center justify-between gap-2">
            <code className="break-all font-mono text-xs text-paper">{shorten(proof.txHash, 8)}</code>
            <div className="flex shrink-0 items-center gap-2">
              <CopyButton value={proof.txHash} label="Copy" />
              <a
                href={txUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 border border-paper/25 px-2.5 py-1.5 text-xs font-medium text-paper transition hover:bg-paper hover:text-ink"
              >
                <ExternalLink className="size-3.5" />
                View
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 border border-paper/20 bg-paper/10 p-3">
        <div className="flex items-center gap-2 text-sm text-paper">
          <Clipboard className="size-4 text-signal" />
          The provider response is released only after the payment settles.
        </div>
      </div>
    </aside>
  );
}

function ReceiptRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="border-b border-paper/10 pb-3">
      <p className="font-mono text-xs uppercase text-paper/60">{label}</p>
      <p className={`mt-1 text-sm font-semibold text-paper ${mono ? "font-mono" : ""}`}>{value}</p>
    </div>
  );
}

function shorten(value: string, size = 6) {
  if (!value || value.length <= size * 2) {
    return value;
  }

  return `${value.slice(0, size)}...${value.slice(-size)}`;
}
