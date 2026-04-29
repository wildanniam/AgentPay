import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Code2,
  Database,
  PlugZap,
  ScrollText,
  Server,
  ShieldCheck,
  Wallet
} from "lucide-react";
import { PaymentFlowDemo, type LandingProof } from "@/components/landing/payment-flow-demo";
import { StatusBadge } from "@/components/ui/status-badge";
import { fallbackRegistryTools } from "@/lib/demo-data";
import { prisma } from "@/lib/prisma";
import { getActiveTools } from "@/lib/tools";

export const dynamic = "force-dynamic";

type ToolsResult = {
  tools: Awaited<ReturnType<typeof getActiveTools>>;
  isFallback: boolean;
};

const providerPoints = [
  "List an existing API without rebuilding it around a new protocol.",
  "Set a per-call USDC price and provider wallet.",
  "Receive traffic through a paid wrapper instead of sharing the raw endpoint."
];

const agentPoints = [
  "Discover available tools from a normal JSON registry.",
  "Receive machine-readable HTTP 402 payment terms.",
  "Pay, retry the request, and get the provider response after settlement."
];

export default async function LandingPage() {
  const [latestLog, dbTools] = await Promise.all([
    prisma.usageLog
      .findFirst({
        include: { tool: true },
        orderBy: { createdAt: "desc" },
        where: { paymentStatus: "paid" }
      })
      .catch(() => null),
    getActiveTools()
      .then<ToolsResult>((tools) => ({ tools, isFallback: false }))
      .catch<ToolsResult>(() => ({ tools: [], isFallback: true }))
  ]);

  const registryIsFallback = dbTools.isFallback;
  const tools = dbTools.tools.length > 0 ? dbTools.tools : registryIsFallback ? fallbackRegistryTools : [];

  const proof: LandingProof | null = latestLog
    ? {
        status: latestLog.paymentStatus,
        toolName: latestLog.tool.name,
        amount: latestLog.amount,
        asset: latestLog.asset,
        payerAddress: latestLog.payerAddress ?? "Unknown payer",
        providerWallet: latestLog.providerWallet,
        txHash: latestLog.txHash ?? latestLog.paymentProof ?? "No transaction hash",
        createdAt: latestLog.createdAt.toISOString()
      }
    : null;

  const latestTool = tools[0];

  return (
    <div className="space-y-12">
      <section className="relative overflow-hidden border border-ink bg-ink text-paper shadow-lift">
        <div className="absolute inset-0 circuit-grid opacity-80" />
        <HeroSignal />
        <div className="relative min-h-[440px] px-5 py-6 md:min-h-[520px] md:px-8 md:py-8 lg:px-10">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge tone="payment">x402 payments</StatusBadge>
            <StatusBadge tone="network">Stellar testnet</StatusBadge>
            <StatusBadge tone="success">USDC per call</StatusBadge>
          </div>

          <div className="mt-10 max-w-4xl md:mt-16">
            <p className="font-mono text-xs uppercase text-paper/60">AgentPay Marketplace</p>
            <h1 className="mt-4 text-4xl font-semibold leading-none text-paper md:text-7xl">
              Turn APIs into paid tools for AI agents.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-paper/70 md:mt-6 md:text-lg md:leading-8">
              AgentPay gives providers a registry, an x402 payment wrapper, and a receipt
              trail. External agents discover a tool, pay with Stellar testnet USDC, then
              receive the API response.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3 md:mt-8">
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 border border-paper bg-paper px-4 py-3 text-sm font-semibold text-ink transition hover:bg-mint"
            >
              Explore tools
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/provider"
              className="inline-flex items-center gap-2 border border-paper/25 bg-paper/10 px-4 py-3 text-sm font-semibold text-paper transition hover:bg-paper hover:text-ink"
            >
              Register an API
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 border-y border-paper/20 py-3 text-sm text-paper/75 md:mt-14 md:py-4">
            <HeroMetric label="Published tools" value={String(tools.length)} />
            <HeroMetric
              label="Latest paid call"
              value={proof ? `${proof.amount} ${proof.asset}` : "Demo receipt ready"}
            />
            <HeroMetric
              label="Discovery JSON"
              value="agentpay-tools.json"
              mono
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <AudiencePanel
          icon={<Server className="size-5" />}
          eyebrow="For API providers"
          title="Keep your API. Add a paid entry point."
          points={providerPoints}
          href="/provider"
          action="Publish a tool"
        />
        <AudiencePanel
          icon={<Wallet className="size-5" />}
          eyebrow="For agent builders"
          title="Call useful tools without manual checkout."
          points={agentPoints}
          href="/marketplace"
          action="Browse registry"
        />
      </section>

      <section id="workflow" className="space-y-4">
        <SectionIntro
          eyebrow="Payment flow"
          title="One API call, with payment built into the request."
          body="The demo below mirrors the real wrapper endpoint. The agent asks first, receives HTTP 402, pays, retries, and only then reaches the provider."
        />
        <PaymentFlowDemo proof={proof} />
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="section-shell p-5">
          <SectionIntro
            eyebrow="Marketplace"
            title="The registry is made for external agents."
            body="Human users can browse the marketplace, but the important surface is the JSON discovery document and per-tool paid endpoint."
          />
          <div className="mt-5 grid gap-3">
            <EndpointRow icon={<Database className="size-4" />} label="List tools" value="GET /api/tools" />
            <EndpointRow
              icon={<PlugZap className="size-4" />}
              label="Agent discovery"
              value="GET /.well-known/agentpay-tools.json"
            />
            <EndpointRow
              icon={<ShieldCheck className="size-4" />}
              label="Paid wrapper"
              value="POST /api/tools/{toolId}/call"
            />
          </div>
        </div>

        <div className="section-shell p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-xs uppercase text-moss">Live registry preview</p>
              <h2 className="mt-2 text-2xl font-semibold">
                {latestTool ? latestTool.name : "No tools registered yet"}
              </h2>
              {registryIsFallback ? (
                <p className="mt-2 text-sm leading-6 text-steel">
                  Showing fallback demo tools until the database is connected.
                </p>
              ) : null}
            </div>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 border border-ink/20 bg-white px-3 py-2 text-sm font-semibold transition hover:border-ink"
            >
              <Boxes className="size-4" />
              Open marketplace
            </Link>
          </div>

          {latestTool ? (
            <div className="mt-5 grid gap-3">
              {tools.slice(0, 3).map((tool) => (
                <div
                  key={tool.id}
                  className="grid gap-3 border border-ink/10 bg-paper/65 p-4 md:grid-cols-[1fr_auto] md:items-center"
                >
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <StatusBadge tone="network">{tool.category}</StatusBadge>
                      <StatusBadge tone="payment">{tool.priceAmount} {tool.priceAsset}/call</StatusBadge>
                    </div>
                    <p className="mt-3 font-semibold text-ink">{tool.name}</p>
                    <p className="mt-1 line-clamp-2 text-sm leading-6 text-steel">
                      {tool.description}
                    </p>
                  </div>
                  <code className="break-all border border-ink/10 bg-white px-3 py-2 font-mono text-xs">
                    /api/tools/{tool.id}/call
                  </code>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 border border-dashed border-ink/25 bg-paper/60 p-6 text-sm leading-6 text-steel">
              Seed demo tools or publish a provider API to populate the registry.
            </div>
          )}
        </div>
      </section>

      <section className="ink-panel grid gap-5 p-5 lg:grid-cols-[1fr_auto] lg:items-center">
        <div>
          <p className="font-mono text-xs uppercase text-paper/60">External agent demo</p>
          <h2 className="mt-2 text-2xl font-semibold">Run the marketplace like an agent would.</h2>
          <code className="mt-4 block break-all border border-paper/20 bg-paper/10 p-3 font-mono text-sm text-paper">
            npm run demo:agent -- &quot;Explain x402 on Stellar&quot;
          </code>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/logs"
            className="inline-flex items-center gap-2 border border-paper/25 px-4 py-3 text-sm font-semibold text-paper transition hover:bg-paper hover:text-ink"
          >
            <ScrollText className="size-4" />
            View logs
          </Link>
          <Link
            href="/provider"
            className="inline-flex items-center gap-2 border border-paper bg-paper px-4 py-3 text-sm font-semibold text-ink transition hover:bg-mint"
          >
            <Code2 className="size-4" />
            Add API
          </Link>
        </div>
      </section>
    </div>
  );
}

function HeroMetric({
  label,
  value,
  mono = false
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="font-mono text-xs uppercase text-paper/50">{label}</p>
      <p className={`mt-2 text-base font-semibold text-paper ${mono ? "break-all font-mono text-sm" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function AudiencePanel({
  icon,
  eyebrow,
  title,
  points,
  href,
  action
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  points: string[];
  href: "/" | "/marketplace" | "/provider" | "/logs";
  action: string;
}) {
  return (
    <div className="section-shell p-5">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center border border-ink bg-ink text-paper">
          {icon}
        </span>
        <p className="font-mono text-xs uppercase text-moss">{eyebrow}</p>
      </div>
      <h2 className="mt-5 text-3xl font-semibold leading-tight">{title}</h2>
      <div className="mt-5 grid gap-3">
        {points.map((point) => (
          <div key={point} className="flex items-start gap-3 border-t border-ink/10 pt-3">
            <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-moss" />
            <p className="text-sm leading-6 text-steel">{point}</p>
          </div>
        ))}
      </div>
      <Link
        href={href}
        className="mt-6 inline-flex items-center gap-2 border border-ink bg-ink px-4 py-3 text-sm font-semibold text-paper transition hover:bg-moss"
      >
        {action}
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}

function SectionIntro({
  eyebrow,
  title,
  body
}: {
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div>
      <p className="font-mono text-xs uppercase text-moss">{eyebrow}</p>
      <h2 className="mt-2 max-w-3xl text-3xl font-semibold leading-tight">{title}</h2>
      <p className="mt-3 max-w-2xl text-base leading-7 text-steel">{body}</p>
    </div>
  );
}

function EndpointRow({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="grid gap-3 border border-ink/10 bg-paper/65 p-3 md:grid-cols-[36px_150px_1fr] md:items-center">
      <span className="flex size-9 items-center justify-center border border-ink/10 bg-white text-moss">
        {icon}
      </span>
      <p className="text-sm font-semibold text-ink">{label}</p>
      <code className="break-all font-mono text-xs text-steel">{value}</code>
    </div>
  );
}

function HeroSignal() {
  return (
    <svg
      aria-hidden="true"
      className="pointer-events-none absolute right-[-80px] top-[-40px] h-[680px] w-[760px] opacity-70"
      viewBox="0 0 760 680"
      fill="none"
    >
      <path
        d="M107 374C171 250 247 179 336 162C469 137 514 240 625 172"
        stroke="#dff6e8"
        strokeOpacity="0.28"
        strokeWidth="2"
        strokeDasharray="10 12"
      />
      <path
        d="M86 463C218 421 272 475 362 417C452 359 482 292 676 323"
        stroke="#efb84a"
        strokeOpacity="0.45"
        strokeWidth="2"
      />
      <path
        d="M170 226H318L374 282H520L584 346"
        stroke="#f5f1e8"
        strokeOpacity="0.22"
        strokeWidth="2"
      />
      {[
        [107, 374, 38],
        [336, 162, 58],
        [625, 172, 42],
        [86, 463, 30],
        [362, 417, 52],
        [676, 323, 36],
        [170, 226, 28],
        [520, 282, 46],
        [584, 346, 34]
      ].map(([cx, cy, r]) => (
        <g key={`${cx}-${cy}`}>
          <circle cx={cx} cy={cy} r={r} fill="#151713" stroke="#f5f1e8" strokeOpacity="0.35" />
          <circle cx={cx} cy={cy} r={Math.max(6, r / 4)} fill="#efb84a" fillOpacity="0.82" />
        </g>
      ))}
      <rect x="402" y="384" width="184" height="82" fill="#151713" stroke="#f5f1e8" strokeOpacity="0.36" />
      <path d="M428 410H560M428 434H514" stroke="#f5f1e8" strokeOpacity="0.55" strokeWidth="8" />
    </svg>
  );
}
