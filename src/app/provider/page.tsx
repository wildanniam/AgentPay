import { ProviderToolForm } from "@/components/provider-tool-form";

export default function ProviderDashboardPage() {
  return (
    <section className="space-y-6">
      <div>
        <p className="font-mono text-xs uppercase text-moss">
          Provider Dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold">Register an API as a paid tool.</h1>
      </div>
      <ProviderToolForm />
    </section>
  );
}
