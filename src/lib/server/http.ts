// Shared plumbing for the verification API routes. Server only.
import { NextResponse, type NextRequest } from "next/server";
import { isProduction, missingProductionSettings, readSecrets, SESSION_COOKIE } from "./config";
import type { OtpDeps } from "./otp-service";
import { consoleSender, msg91Sender, noBotCheck, turnstileCheck } from "./senders";
import { getStore } from "./store";

/** Builds the verification parts from the environment, or a 503 if production isn't configured. */
export function buildDeps(): { deps: OtpDeps } | { error: NextResponse } {
  const missing = missingProductionSettings();
  if (missing.length) {
    console.error(`[OTP] phone verification is not configured; missing: ${missing.join(", ")}`);
    return { error: NextResponse.json({ ok: false, error: "not_configured" }, { status: 503 }) };
  }
  const s = readSecrets();
  return {
    deps: {
      store: getStore(s.supabaseUrl, s.supabaseServiceKey),
      sender: s.msg91AuthKey && s.msg91TemplateId ? msg91Sender(s.msg91AuthKey, s.msg91TemplateId) : consoleSender,
      botCheck: s.turnstileSecret ? turnstileCheck(s.turnstileSecret) : noBotCheck,
      sessionSecret: s.sessionSecret,
      otpHashSecret: s.otpHashSecret,
      exposeCodeForDev: !isProduction(),
    },
  };
}

export function clientIp(req: NextRequest): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
}

/** Blocks cross-site form posts: the request must come from a page on this site. */
export function isSameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return !isProduction(); // tools like curl in development
  try {
    return new URL(origin).host === req.headers.get("host");
  } catch {
    return false;
  }
}

export async function readJson(req: NextRequest, maxBytes = 4_000): Promise<Record<string, unknown> | null> {
  if (!req.headers.get("content-type")?.includes("application/json")) return null;
  const text = await req.text();
  if (text.length > maxBytes) return null;
  try {
    const value = JSON.parse(text);
    return value && typeof value === "object" && !Array.isArray(value) ? value : null;
  } catch {
    return null;
  }
}

export const bad = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export function setSessionCookie(res: NextResponse, token: string, maxAgeSeconds: number) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true, // not readable by page scripts
    secure: isProduction(),
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}
