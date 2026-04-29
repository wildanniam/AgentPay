import Link from "next/link";
import { Activity, Boxes, Home, ScrollText } from "lucide-react";
import { Toaster } from "sonner";
import { StatusBadge } from "@/components/ui/status-badge";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/marketplace", label: "Marketplace", icon: Boxes },
  { href: "/provider", label: "Provider Dashboard", icon: Activity },
  { href: "/logs", label: "Payment Logs", icon: ScrollText }
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-ink/10 bg-paper/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center border border-ink bg-ink text-sm font-semibold text-paper shadow-[4px_4px_0_#efb84a]">
              AP
            </span>
            <span>
              <span className="block text-lg font-semibold leading-none">AgentPay</span>
              <span className="block pt-1 font-mono text-xs text-steel">
                x402 tool marketplace
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 border border-ink/10 bg-white/60 px-3 py-2 text-sm font-medium text-ink transition hover:border-ink hover:bg-white"
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-2 xl:flex">
            <StatusBadge tone="network">Stellar Testnet</StatusBadge>
            <StatusBadge tone="payment">x402</StatusBadge>
            <StatusBadge tone="success">USDC</StatusBadge>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-5 pb-4 lg:hidden">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex shrink-0 items-center gap-2 border border-ink/10 bg-white/70 px-3 py-2 text-sm font-medium text-ink"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-5 py-8">{children}</main>
      <Toaster richColors position="top-right" />
    </div>
  );
}
