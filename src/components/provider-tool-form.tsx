"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  Braces,
  CheckCircle2,
  KeyRound,
  Plus,
  ReceiptText,
  Server,
  ShieldCheck,
  Wallet
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { toolCategories } from "@/lib/validation";

const defaultInputExample = JSON.stringify({ text: "Long abstract here..." }, null, 2);
const defaultOutputExample = JSON.stringify(
  {
    summary: "Short summary.",
    keyPoints: ["Point one", "Point two"]
  },
  null,
  2
);

type FormState = {
  registrationToken: string;
  providerName: string;
  providerWallet: string;
  name: string;
  description: string;
  category: (typeof toolCategories)[number];
  endpointUrl: string;
  priceAmount: string;
  inputExampleJson: string;
  outputExampleJson: string;
};

const initialState: FormState = {
  registrationToken: "",
  providerName: "",
  providerWallet: "",
  name: "",
  description: "",
  category: "utility",
  endpointUrl: "",
  priceAmount: "0.01",
  inputExampleJson: defaultInputExample,
  outputExampleJson: defaultOutputExample
};

export function ProviderToolForm({
  registrationProtected
}: {
  registrationProtected: boolean;
}) {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const inputExampleJson = JSON.parse(form.inputExampleJson);
      const outputExampleJson = JSON.parse(form.outputExampleJson);

      const response = await fetch("/api/tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(registrationProtected && form.registrationToken
            ? { "x-agentpay-registration-token": form.registrationToken }
            : {})
        },
        body: JSON.stringify({
          ...form,
          registrationToken: undefined,
          method: "POST",
          priceAsset: "USDC",
          inputExampleJson,
          outputExampleJson
        })
      });

      const body = await response.json();

      if (!response.ok) {
        const issue = body.issues?.[0];
        throw new Error(issue ? `${issue.path}: ${issue.message}` : body.error);
      }

      setStatus("success");
      setMessage(`Registered ${body.tool.name}`);
      toast.success("Tool published", {
        description: `${body.tool.name} is now discoverable from the AgentPay marketplace.`
      });
      setForm(initialState);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Registration failed.");
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-5">
      {registrationProtected ? (
        <div className="form-section">
          <SectionHeader
            icon={<KeyRound className="size-4" />}
            eyebrow="Access"
            title="Enter the registration access token."
            note="This keeps the public deployment from being filled by random tool registrations during judging."
          />
          <Field label="Registration access token">
            <input
              value={form.registrationToken}
              onChange={(event) => update("registrationToken", event.target.value)}
              className="input font-mono"
              type="password"
              autoComplete="off"
              required
            />
          </Field>
        </div>
      ) : null}

      <div className="form-section">
        <SectionHeader
          icon={<Wallet className="size-4" />}
          eyebrow="Provider"
          title="Who receives the payment?"
          note="Only the public wallet address is needed. The provider wallet must have a USDC trustline on Stellar testnet."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Provider name">
            <input
              value={form.providerName}
              onChange={(event) => update("providerName", event.target.value)}
              className="input"
              required
            />
          </Field>
          <Field label="Provider Stellar wallet">
            <input
              value={form.providerWallet}
              onChange={(event) => update("providerWallet", event.target.value)}
              className="input font-mono"
              placeholder="G..."
              required
            />
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <StatusBadge tone="network">stellar:testnet</StatusBadge>
          <StatusBadge tone="success">USDC trustline required</StatusBadge>
          <StatusBadge tone="payment">public key only</StatusBadge>
        </div>
      </div>

      <div className="form-section">
        <SectionHeader
          icon={<Server className="size-4" />}
          eyebrow="Tool"
          title="Describe the API external agents will discover."
          note="This metadata appears in the marketplace and in the well-known discovery document."
        />
        <div className="grid gap-4 md:grid-cols-[1fr_180px_160px]">
          <Field label="Tool name">
            <input
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
              className="input"
              required
            />
          </Field>
          <Field label="Category">
            <select
              value={form.category}
              onChange={(event) => update("category", event.target.value as FormState["category"])}
              className="input"
            >
              {toolCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </Field>
          <Field label="USDC price">
            <input
              value={form.priceAmount}
              onChange={(event) => update("priceAmount", event.target.value)}
              className="input font-mono"
              inputMode="decimal"
              required
            />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(event) => update("description", event.target.value)}
              className="input min-h-24"
              required
            />
          </Field>
        </div>
      </div>

      <div className="form-section">
        <SectionHeader
          icon={<ReceiptText className="size-4" />}
          eyebrow="Endpoint"
          title="Where should AgentPay forward paid requests?"
          note="External agents call the AgentPay wrapper, not this provider URL directly."
        />
        <Field label="Provider endpoint URL">
          <input
            value={form.endpointUrl}
            onChange={(event) => update("endpointUrl", event.target.value)}
            className="input font-mono"
            placeholder="https://example.com/api/tool"
            required
          />
        </Field>
        <div className="mt-4 grid gap-3 border border-ink/10 bg-paper/60 p-3 text-sm leading-6 text-steel md:grid-cols-[auto_1fr]">
          <span className="flex size-8 items-center justify-center border border-moss/20 bg-mint text-moss">
            <ShieldCheck className="size-4" />
          </span>
          <p>
            Production deployments only accept HTTPS provider URLs. Localhost is allowed in
            development so seeded demo tools can still run on your machine.
          </p>
        </div>
      </div>

      <div className="form-section">
        <SectionHeader
          icon={<Braces className="size-4" />}
          eyebrow="Examples"
          title="Show agents the expected input and output shape."
          note="These examples help external consumers build the correct payload before paying."
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Input example JSON">
            <textarea
              value={form.inputExampleJson}
              onChange={(event) => update("inputExampleJson", event.target.value)}
              className="input min-h-44 font-mono text-xs"
              spellCheck={false}
            />
          </Field>
          <Field label="Output example JSON">
            <textarea
              value={form.outputExampleJson}
              onChange={(event) => update("outputExampleJson", event.target.value)}
              className="input min-h-44 font-mono text-xs"
              spellCheck={false}
            />
          </Field>
        </div>
      </div>

      <div className="flex flex-col gap-3 border border-ink bg-ink p-4 text-paper md:flex-row md:items-center md:justify-between">
        {message ? (
          <div
            className={`inline-flex items-center gap-2 text-sm ${
              status === "error" ? "text-red-200" : "text-mint"
            }`}
          >
            {status === "error" ? (
              <AlertCircle className="size-4" />
            ) : (
              <CheckCircle2 className="size-4" />
            )}
            {message}
          </div>
        ) : (
          <span className="text-sm text-paper/70">
            POST tools only. Network defaults to Stellar testnet.
          </span>
        )}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center gap-2 border border-paper bg-paper px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-mint disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Plus className="size-4" />
          {status === "submitting" ? "Registering" : "Register Tool"}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="font-mono text-xs uppercase text-steel">{label}</span>
      {children}
    </label>
  );
}

function SectionHeader({
  icon,
  eyebrow,
  title,
  note
}: {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  note: string;
}) {
  return (
    <div className="mb-4 grid gap-3 border-b border-ink/10 pb-4 md:grid-cols-[220px_1fr]">
      <div className="flex items-center gap-2 font-mono text-xs uppercase text-moss">
        <span className="flex size-8 items-center justify-center border border-moss/20 bg-mint">
          {icon}
        </span>
        {eyebrow}
      </div>
      <div>
        <h2 className="text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-steel">{note}</p>
      </div>
    </div>
  );
}
