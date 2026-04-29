import { CopyButton } from "@/components/copy-button";
import { StatusBadge } from "@/components/ui/status-badge";
import { prisma } from "@/lib/prisma";
import { shortAddress } from "@/lib/text";
import { ExternalLink } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PaymentLogsPage() {
  const logsResult = await prisma.usageLog
    .findMany({
      include: { tool: true, provider: true },
      orderBy: { createdAt: "desc" },
      take: 100
    })
    .then((logs) => ({ logs, isUnavailable: false }))
    .catch(() => ({ logs: [], isUnavailable: true }));
  const logs = logsResult.logs;
  const logsUnavailable = logsResult.isUnavailable;
  const paidLogs = logs.filter((log) => log.paymentStatus === "paid");
  const totalSettled = paidLogs.reduce((sum, log) => sum + Number(log.amount), 0);
  const latest = logs[0];

  return (
    <section className="space-y-6">
      <div className="section-shell p-5">
        <p className="font-mono text-xs uppercase text-moss">Payment Logs</p>
        <div className="mt-3 grid gap-4 lg:grid-cols-[1fr_340px] lg:items-end">
          <div>
            <h1 className="text-4xl font-semibold">Receipts for every paid API call.</h1>
            <p className="mt-3 max-w-2xl text-base leading-7 text-steel">
              Each paid wrapper call leaves evidence: payer, provider, amount, transaction
              hash, request preview, and provider response preview.
            </p>
          </div>
          <div className="border border-ink bg-ink p-4 text-paper">
            <p className="font-mono text-xs uppercase text-paper/60">Latest proof</p>
            <p className="mt-2 break-all font-mono text-xs text-paper/80">
              {latest?.txHash ?? "No payment has settled yet."}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <SummaryTile label="Paid calls" value={String(paidLogs.length)} />
        <SummaryTile label="USDC settled" value={totalSettled.toFixed(2)} />
        <SummaryTile label="Latest status" value={latest?.paymentStatus ?? "none"} />
      </div>

      {logsUnavailable ? (
        <div className="border border-signal/40 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
          Payment logs are waiting for a database connection. Connect Supabase, run the
          schema push, then seed or run the external agent demo.
        </div>
      ) : null}

      <div className="section-shell overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left text-sm">
            <thead className="bg-paper/80 font-mono text-xs uppercase text-steel">
              <tr>
                <th className="border-b border-ink/10 px-4 py-3">Tool</th>
                <th className="border-b border-ink/10 px-4 py-3">Amount</th>
                <th className="border-b border-ink/10 px-4 py-3">Status</th>
                <th className="border-b border-ink/10 px-4 py-3">Wallets</th>
                <th className="border-b border-ink/10 px-4 py-3">Proof</th>
                <th className="border-b border-ink/10 px-4 py-3">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-ink/10 last:border-b-0">
                  <td className="px-4 py-4">
                    <p className="font-semibold">{log.tool.name}</p>
                    <p className="mt-1 text-xs text-steel">{log.provider.displayName}</p>
                    <div className="mt-3 hidden gap-1 lg:flex">
                      <Step done label="402" />
                      <Step done={log.paymentStatus === "paid"} label="paid" />
                      <Step done={log.paymentStatus === "paid"} label="provider" />
                      <Step done={log.paymentStatus === "paid"} label="done" />
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono">
                    {log.amount} {log.asset}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge tone={log.paymentStatus === "paid" ? "success" : "danger"}>
                      {log.paymentStatus}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-steel">
                    <p>to {shortAddress(log.providerWallet)}</p>
                    {log.payerAddress ? <p>from {shortAddress(log.payerAddress)}</p> : null}
                  </td>
                  <td className="px-4 py-4">
                    {log.paymentProof ? (
                      <div className="flex flex-wrap gap-2">
                        <CopyButton value={log.paymentProof} label="Copy proof" />
                        {log.txHash ? (
                          <a
                            href={`https://stellar.expert/explorer/testnet/tx/${log.txHash}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 border border-ink/20 bg-white px-2.5 py-1.5 text-xs font-medium transition hover:border-ink"
                          >
                            <ExternalLink className="size-3.5" />
                            Stellar
                          </a>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-xs text-steel">{log.errorMessage ?? "No proof"}</span>
                    )}
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-steel">
                    {log.createdAt.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {logs.length === 0 ? (
          <div className="border-t border-ink/10 p-8 text-sm leading-6 text-steel">
            No paid wrapper calls have been logged yet. Run the external consumer demo once
            after seeding the database to populate this page.
          </div>
        ) : null}
      </div>
    </section>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="section-shell p-4">
      <p className="font-mono text-xs uppercase text-steel">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function Step({ done, label }: { done: boolean; label: string }) {
  return (
    <span
      className={`border px-1.5 py-0.5 font-mono text-[10px] ${
        done ? "border-moss/20 bg-mint text-moss" : "border-ink/10 bg-paper text-steel"
      }`}
    >
      {label}
    </span>
  );
}
