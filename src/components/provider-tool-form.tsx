"use client";

import { useState } from "react";
import { Plus, AlertCircle, CheckCircle2 } from "lucide-react";
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

export function ProviderToolForm() {
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
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
      setForm(initialState);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Registration failed.");
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-5 border border-ink/10 bg-white/72 p-5 shadow-line">
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

      <Field label="Description">
        <textarea
          value={form.description}
          onChange={(event) => update("description", event.target.value)}
          className="input min-h-24"
          required
        />
      </Field>

      <Field label="Provider endpoint URL">
        <input
          value={form.endpointUrl}
          onChange={(event) => update("endpointUrl", event.target.value)}
          className="input font-mono"
          placeholder="https://example.com/api/tool"
          required
        />
      </Field>

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

      <div className="flex flex-col gap-3 border-t border-ink/10 pt-4 md:flex-row md:items-center md:justify-between">
        {message ? (
          <div
            className={`inline-flex items-center gap-2 text-sm ${
              status === "error" ? "text-red-700" : "text-moss"
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
          <span className="text-sm text-steel">POST tools only. Network defaults to Stellar testnet.</span>
        )}
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex items-center justify-center gap-2 border border-ink bg-ink px-4 py-2.5 text-sm font-semibold text-paper transition hover:bg-moss disabled:cursor-not-allowed disabled:opacity-60"
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
