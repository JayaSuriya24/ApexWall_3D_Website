// Phone verification rules: sending codes, checking them, issuing the verified pass,
// and recording what a verified lead does. Pure logic with injected parts, so it can be tested.
import { normalizeIndianMobile } from "@/lib/phone";
import { CONSENT_TEXT, CONSENT_VERSION, OTP_RULES } from "./config";
import { generateOtp, hashOtp, safeEqual, signSession, verifySession } from "./crypto";
import type { BotCheck, CodeSender } from "./senders";
import type { Store } from "./store";

export interface OtpDeps {
  store: Store;
  sender: CodeSender;
  botCheck: BotCheck;
  sessionSecret: string;
  otpHashSecret: string;
  now?: () => number;
  /** Development only: hand the code back so the screen can show it. */
  exposeCodeForDev?: boolean;
}

export type SendOutcome =
  | { ok: true; resendInSeconds: number; devCode?: string }
  | { ok: false; error: "invalid_phone" | "consent_required" | "bot_check_failed" | "too_soon" | "too_many" | "send_failed"; retryInSeconds?: number };

export type VerifyOutcome =
  | { ok: true; phone: string; sessionToken: string; maxAgeSeconds: number }
  | { ok: false; error: "invalid_phone" | "invalid_code" | "no_code" | "expired" | "locked"; attemptsLeft?: number };

const HOUR = 3_600_000;

export async function sendCode(
  deps: OtpDeps,
  input: { phone: string; consent: boolean; botToken?: string; ip: string },
): Promise<SendOutcome> {
  const now = deps.now?.() ?? Date.now();
  const phone = normalizeIndianMobile(input.phone);
  if (!phone) return { ok: false, error: "invalid_phone" };
  if (!input.consent) return { ok: false, error: "consent_required" };
  if (!(await deps.botCheck.verify(input.botToken, input.ip))) return { ok: false, error: "bot_check_failed" };

  const existing = await deps.store.getCode(phone);
  if (existing && now - existing.createdAt < OTP_RULES.resendCooldownMs) {
    return { ok: false, error: "too_soon", retryInSeconds: Math.ceil((OTP_RULES.resendCooldownMs - (now - existing.createdAt)) / 1000) };
  }
  const [byPhone, byIp] = await Promise.all([
    deps.store.countSends({ phone }, now - HOUR),
    deps.store.countSends({ ip: input.ip }, now - HOUR),
  ]);
  if (byPhone >= OTP_RULES.maxSendsPerPhonePerHour || byIp >= OTP_RULES.maxSendsPerIpPerHour) {
    return { ok: false, error: "too_many", retryInSeconds: 3600 };
  }

  const code = generateOtp(OTP_RULES.codeLength);
  const result = await deps.sender.send(phone, code);
  if (!result.ok) {
    console.error(`[OTP] sending to ${phone.slice(0, 5)}… failed: ${result.reason}`);
    return { ok: false, error: "send_failed" };
  }
  await deps.store.saveCode({
    phone,
    codeHash: hashOtp(phone, code, deps.otpHashSecret),
    expiresAt: now + OTP_RULES.codeTtlMs,
    attempts: 0,
    createdAt: now,
  });
  await deps.store.logSend(phone, input.ip, now);
  return { ok: true, resendInSeconds: OTP_RULES.resendCooldownMs / 1000, ...(deps.exposeCodeForDev ? { devCode: code } : {}) };
}

export async function checkCode(
  deps: OtpDeps,
  input: { phone: string; code: string; source: string; userAgent: string },
): Promise<VerifyOutcome> {
  const now = deps.now?.() ?? Date.now();
  const phone = normalizeIndianMobile(input.phone);
  if (!phone) return { ok: false, error: "invalid_phone" };
  const stored = await deps.store.getCode(phone);
  if (!stored) return { ok: false, error: "no_code" };
  if (stored.expiresAt <= now) {
    await deps.store.deleteCode(phone);
    return { ok: false, error: "expired" };
  }
  if (stored.attempts >= OTP_RULES.maxAttempts) {
    await deps.store.deleteCode(phone);
    return { ok: false, error: "locked" };
  }
  const code = input.code.replace(/\D/g, "");
  if (code.length !== OTP_RULES.codeLength || !safeEqual(hashOtp(phone, code, deps.otpHashSecret), stored.codeHash)) {
    const attempts = await deps.store.addAttempt(phone);
    const attemptsLeft = Math.max(0, OTP_RULES.maxAttempts - attempts);
    if (attemptsLeft === 0) {
      await deps.store.deleteCode(phone);
      return { ok: false, error: "locked" };
    }
    return { ok: false, error: "invalid_code", attemptsLeft };
  }

  // Verified: the code is single-use
  await deps.store.deleteCode(phone);
  await deps.store.upsertLead(
    { phone, consentVersion: CONSENT_VERSION, consentText: CONSENT_TEXT, source: input.source.slice(0, 200), userAgent: input.userAgent.slice(0, 300) },
    now,
  );
  const maxAgeSeconds = OTP_RULES.sessionDays * 86_400;
  return { ok: true, phone, sessionToken: signSession({ phone, exp: now + maxAgeSeconds * 1000 }, deps.sessionSecret), maxAgeSeconds };
}

export function readSession(token: string | undefined, sessionSecret: string, now = Date.now()): string | null {
  return verifySession(token, sessionSecret, now)?.phone ?? null;
}

/** What a verified lead can be recorded doing. */
export const LEAD_ACTIONS = ["mockup_download", "mockup_share", "whatsapp_quote", "contact_form"] as const;
export type LeadAction = (typeof LEAD_ACTIONS)[number];

export async function recordLeadAction(
  store: Store,
  phone: string,
  action: string,
  details: unknown,
  now = Date.now(),
): Promise<boolean> {
  if (!(LEAD_ACTIONS as readonly string[]).includes(action)) return false;
  // Keep only short, flat text/number values: never trust the browser's payload shape
  const clean: Record<string, string | number> = {};
  if (details && typeof details === "object") {
    for (const [k, v] of Object.entries(details as Record<string, unknown>).slice(0, 15)) {
      if (typeof v === "number" && Number.isFinite(v)) clean[k.slice(0, 40)] = v;
      else if (typeof v === "string") clean[k.slice(0, 40)] = v.slice(0, 1000);
    }
  }
  await store.logEvent(phone, action, clean, now);
  return true;
}
