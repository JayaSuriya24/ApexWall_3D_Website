// Phone verification settings and secrets. Server only.
//
// Development (no keys set): codes are printed in the server console and data lives
// in memory. Production refuses to verify until every key below is configured.

export const OTP_RULES = {
  codeLength: 6,
  codeTtlMs: 5 * 60_000, // a code works for 5 minutes
  maxAttempts: 3, // wrong guesses before the code is thrown away
  resendCooldownMs: 30_000, // wait before another code to the same number
  maxSendsPerPhonePerHour: 3,
  maxSendsPerIpPerHour: 10,
  sessionDays: 30, // how long a verified visitor is remembered
};

/** Bump when the consent wording changes; stored with every lead. */
export const CONSENT_VERSION = "2026-10-16";
export const CONSENT_TEXT =
  "I agree that ApexWall 3D may contact me on this number about my enquiry, as described in the privacy policy.";

export const SESSION_COOKIE = "apexwall_phone";

export const isProduction = () => process.env.NODE_ENV === "production";

export interface ServerSecrets {
  sessionSecret: string;
  otpHashSecret: string;
  msg91AuthKey?: string;
  msg91TemplateId?: string;
  supabaseUrl?: string;
  supabaseServiceKey?: string;
  turnstileSecret?: string;
}

// Fixed development-only secrets, so sessions survive hot reloads. Never used in production.
const DEV_SECRET = "apexwall-dev-only-secret-do-not-use-in-production";

export function readSecrets(): ServerSecrets {
  const e = process.env;
  return {
    sessionSecret: e.SESSION_SECRET || (isProduction() ? "" : DEV_SECRET),
    otpHashSecret: e.OTP_HASH_SECRET || (isProduction() ? "" : DEV_SECRET),
    msg91AuthKey: e.MSG91_AUTH_KEY,
    msg91TemplateId: e.MSG91_TEMPLATE_ID,
    supabaseUrl: e.SUPABASE_URL,
    supabaseServiceKey: e.SUPABASE_SERVICE_ROLE_KEY,
    turnstileSecret: e.TURNSTILE_SECRET_KEY,
  };
}

/** Names of the settings production still needs (empty in development or when complete). */
export function missingProductionSettings(s: ServerSecrets = readSecrets()): string[] {
  if (!isProduction()) return [];
  const required: [keyof ServerSecrets, string][] = [
    ["sessionSecret", "SESSION_SECRET"],
    ["otpHashSecret", "OTP_HASH_SECRET"],
    ["msg91AuthKey", "MSG91_AUTH_KEY"],
    ["msg91TemplateId", "MSG91_TEMPLATE_ID"],
    ["supabaseUrl", "SUPABASE_URL"],
    ["supabaseServiceKey", "SUPABASE_SERVICE_ROLE_KEY"],
    ["turnstileSecret", "TURNSTILE_SECRET_KEY"],
  ];
  return required.filter(([k]) => !s[k]).map(([, name]) => name);
}
