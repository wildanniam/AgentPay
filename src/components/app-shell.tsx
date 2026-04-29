import Link from "next/link";
import { Activity, Boxes, ScrollText } from "lucide-react";

const navItems = [
  { href: "/", label: "Marketplace", icon: Boxes },
  { href: "/provider", label: "Provider Dashboard", icon: Activity },
  { href: "/logs", label: "Payment Logs", icon: ScrollText }
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-ink/10 bg-paper/88 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center border border-ink bg-ink text-sm font-semibold text-paper">
              AP
            </span>
            <span>
              <span className="block text-lg font-semibold leading-none">AgentPay</span>
              <span className="block pt-1 font-mono text-xs text-steel">
                x402 tool marketplace
              </span>
            </span>
          </Link>
          <nav className="flex items-center gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 border border-ink/10 bg-white/55 px-3 py-2 text-sm font-medium text-ink transition hover:border-ink hover:bg-white"
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">{children}</main>
    </div>
  );
}
