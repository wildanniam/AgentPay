import type { ToolWithProvider } from "@/lib/tools";
import { env } from "@/lib/env";

export type ProviderForwardResult = {
  ok: boolean;
  status: number;
  body: unknown;
};

export async function forwardToProvider(
  tool: ToolWithProvider,
  payload: unknown
): Promise<ProviderForwardResult> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.PROVIDER_REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(tool.endpointUrl, {
      method: tool.method,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload ?? {}),
      signal: controller.signal
    });

    const contentType = response.headers.get("content-type") ?? "";
    const text = await response.text();
    const body = parseResponseBody(text, contentType);

    return {
      ok: response.ok,
      status: response.status,
      body
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      return {
        ok: false,
        status: 504,
        body: { error: "Provider request timed out." }
      };
    }

    return {
      ok: false,
      status: 502,
      body: {
        error: error instanceof Error ? error.message : "Provider request failed."
      }
    };
  } finally {
    clearTimeout(timeout);
  }
}

function parseResponseBody(text: string, contentType: string) {
  if (!text) {
    return {};
  }

  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return { raw: text };
    }
  }

  return { raw: text };
}
