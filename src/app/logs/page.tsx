import { CopyButton } from "@/components/copy-button";
import { prisma } from "@/lib/prisma";
import { shortAddress } from "@/lib/text";

export const dynamic = "force-dynamic";

export default async function PaymentLogsPage() {
  const logs = await prisma.usageLog.findMany({
    include: { tool: true, provider: true },
    orderBy: { createdAt: "desc" },
    take: 100
  });

  return (
    <section className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase text-moss">
          Payment Logs
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Payment and usage evidence.</h1>
      </div>
      <div className="overflow-hidden border border-ink/10 bg-white/74 shadow-line">
        <table className="w-full border-collapse text-left text-sm">
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
                </td>
                <td className="px-4 py-4 font-mono">
                  {log.amount} {log.asset}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`border px-2 py-1 font-mono text-xs ${
                      log.paymentStatus === "paid"
                        ? "border-moss/25 bg-mint text-moss"
                        : "border-red-200 bg-red-50 text-red-700"
                    }`}
                  >
                    {log.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-4 font-mono text-xs text-steel">
                  <p>to {shortAddress(log.providerWallet)}</p>
                  {log.payerAddress ? <p>from {shortAddress(log.payerAddress)}</p> : null}
                </td>
                <td className="px-4 py-4">
                  {log.paymentProof ? (
                    <CopyButton value={log.paymentProof} label="Copy proof" />
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

        {logs.length === 0 ? (
          <div className="border-t border-ink/10 p-8 text-sm text-steel">
            No paid wrapper calls have been logged yet.
          </div>
        ) : null}
      </div>
    </section>
  );
}
