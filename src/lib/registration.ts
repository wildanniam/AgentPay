import { env } from "@/lib/env";

const REGISTRATION_HEADER = "x-agentpay-registration-token";

export function isRegistrationProtected() {
  return Boolean(env.TOOL_REGISTRATION_TOKEN);
}

export function hasRegistrationAccess(request: Request) {
  const expected = env.TOOL_REGISTRATION_TOKEN;

  if (!expected) {
    return true;
  }

  const headerToken = request.headers.get(REGISTRATION_HEADER);
  const authorization = request.headers.get("authorization");
  const bearerToken = authorization?.toLowerCase().startsWith("bearer ")
    ? authorization.slice(7).trim()
    : undefined;

  return headerToken === expected || bearerToken === expected;
}

export function registrationHeaderName() {
  return REGISTRATION_HEADER;
}
