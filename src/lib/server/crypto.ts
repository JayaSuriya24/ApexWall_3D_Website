// One-time codes and the signed "verified" pass. Server only.
import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

export function generateOtp(length = 6): string {
  return String(randomInt(0, 10 ** length)).padStart(length, "0");
}

/** Codes are stored only as a keyed hash, never as the digits themselves. */
export function hashOtp(phone: string, code: string, secret: string): string {
  return createHmac("sha256", secret).update(`${phone}:${code}`).digest("hex");
}

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export interface SessionPayload {
  phone: string;
  /** Expiry, ms since epoch. */
  exp: number;
}

const b64 = (s: string) => Buffer.from(s).toString("base64url");
const sign = (data: string, secret: string) => createHmac("sha256", secret).update(data).digest("base64url");

/** "<payload>.<signature>": readable by the server only with the secret, tamper-evident. */
export function signSession(payload: SessionPayload, secret: string): string {
  const data = b64(JSON.stringify(payload));
  return `${data}.${sign(data, secret)}`;
}

export function verifySession(token: string | undefined, secret: string, now = Date.now()): SessionPayload | null {
  if (!token || !secret) return null;
  const [data, sig] = token.split(".");
  if (!data || !sig || !safeEqual(sig, sign(data, secret))) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as SessionPayload;
    return typeof payload.phone === "string" && typeof payload.exp === "number" && payload.exp > now ? payload : null;
  } catch {
    return null;
  }
}
