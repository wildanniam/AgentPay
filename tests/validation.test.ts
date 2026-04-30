import { afterEach, describe, expect, it } from "vitest";
import { isAllowedProviderUrl } from "@/lib/validation";

const originalNodeEnv = process.env.NODE_ENV;

describe("provider URL validation", () => {
  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  it("allows localhost during development", () => {
    process.env.NODE_ENV = "development";

    expect(isAllowedProviderUrl("http://localhost:3000/api/mock-provider")).toBe(true);
  });

  it("requires public HTTPS URLs in production", () => {
    process.env.NODE_ENV = "production";

    expect(isAllowedProviderUrl("http://api.example.com/tool")).toBe(false);
    expect(isAllowedProviderUrl("https://192.168.1.10/tool")).toBe(false);
    expect(isAllowedProviderUrl("https://api.example.com/tool")).toBe(true);
  });
});
