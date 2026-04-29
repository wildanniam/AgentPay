import { clsx } from "clsx";

type StatusBadgeTone = "ink" | "success" | "network" | "payment" | "muted" | "danger";

const toneClasses: Record<StatusBadgeTone, string> = {
  ink: "border-ink bg-ink text-paper",
  success: "border-moss/25 bg-mint text-moss",
  network: "border-cyan-700/20 bg-cyan-50 text-cyan-800",
  payment: "border-signal/30 bg-amber-50 text-amber-800",
  muted: "border-ink/10 bg-white/60 text-steel",
  danger: "border-red-200 bg-red-50 text-red-700"
};

export function StatusBadge({
  children,
  tone = "muted",
  className
}: {
  children: React.ReactNode;
  tone?: StatusBadgeTone;
  className?: string;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 border px-2.5 py-1 font-mono text-xs font-medium",
        toneClasses[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
