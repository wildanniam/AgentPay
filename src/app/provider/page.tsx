import { ProviderToolForm } from "@/components/provider-tool-form";
import { isRegistrationProtected } from "@/lib/registration";

export const dynamic = "force-dynamic";

export default function ProviderDashboardPage() {
  return (
    <section className="space-y-6">
      <div className="section-shell grid gap-5 p-5 lg:grid-cols-[1fr_340px] lg:items-end">
        <div>
          <p className="font-mono text-xs uppercase text-moss">Provider Console</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-semibold">
            Publish an API as a paid tool.
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-steel">
            Add the provider endpoint, set a USDC price, and AgentPay will expose a
            discoverable x402 wrapper for external agents.
          </p>
        </div>
        <div className="border border-ink bg-ink p-4 text-paper">
          <p className="font-mono text-xs uppercase text-paper/60">Publish mode</p>
          <p className="mt-2 text-xl font-semibold">
            {isRegistrationProtected() ? "Invite-gated registration" : "Public registration"}
          </p>
          <p className="mt-2 text-sm leading-6 text-paper/70">
            {isRegistrationProtected()
              ? "Only providers with the access token can add tools on this deployment."
              : "Anyone with a valid provider endpoint can register a tool on this deployment."}
          </p>
        </div>
      </div>
      <ProviderToolForm registrationProtected={isRegistrationProtected()} />
    </section>
  );
}
