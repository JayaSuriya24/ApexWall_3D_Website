// @vitest-environment node
import { describe, expect, it, vi, beforeEach } from "vitest";
import { maskPhone, normalizeIndianMobile } from "@/lib/phone";
import { generateOtp, hashOtp, signSession, verifySession } from "../crypto";
import { checkCode, readSession, recordLeadAction, sendCode, type OtpDeps } from "../otp-service";
import { MemoryStore } from "../store";
import { missingProductionSettings } from "../config";

const PHONE = "+919840765477";

function setup() {
  let now = 1_800_000_000_000;
  const sent: string[] = [];
  const store = new MemoryStore();
  const deps: OtpDeps = {
    store,
    sender: { send: async (_p, code) => (sent.push(code), { ok: true }) },
    botCheck: { verify: async (token) => token !== "bad" },
    sessionSecret: "s".repeat(32),
    otpHashSecret: "h".repeat(32),
    now: () => now,
  };
  return { deps, store, sent, advance: (ms: number) => (now += ms), now: () => now };
}
const send = (deps: OtpDeps, over: Partial<{ phone: string; consent: boolean; botToken: string; ip: string }> = {}) =>
  sendCode(deps, { phone: "98407 65477", consent: true, botToken: "ok", ip: "1.2.3.4", ...over });
const check = (deps: OtpDeps, code: string) => checkCode(deps, { phone: PHONE, code, source: "/preview", userAgent: "test" });

describe("phone numbers", () => {
  it("accepts Indian mobiles in common formats", () => {
    for (const n of ["9840765477", "98407 65477", "+91 98407-65477", "919840765477", "09840765477"]) expect(normalizeIndianMobile(n)).toBe(PHONE);
  });
  it("rejects landlines, short numbers and other countries", () => {
    for (const n of ["4423456789", "98407654", "+1 415 555 0100", "abc"]) expect(normalizeIndianMobile(n)).toBeNull();
  });
  it("masks for display", () => expect(maskPhone(PHONE)).toBe("+91 98••••5477"));
});

describe("codes and the verified pass", () => {
  it("makes 6-digit codes and stores only a keyed hash", () => {
    const c = generateOtp();
    expect(c).toMatch(/^\d{6}$/);
    expect(hashOtp(PHONE, c, "k")).not.toContain(c);
    expect(hashOtp(PHONE, c, "k")).not.toBe(hashOtp(PHONE, c, "other-key"));
  });
  it("signed pass verifies, rejects tampering, wrong key and expiry", () => {
    const t = signSession({ phone: PHONE, exp: 2_000 }, "secret");
    expect(verifySession(t, "secret", 1_000)?.phone).toBe(PHONE);
    expect(verifySession(t, "wrong", 1_000)).toBeNull();
    expect(verifySession(t, "secret", 3_000)).toBeNull();
    const forged = Buffer.from(JSON.stringify({ phone: "+919999999999", exp: 9e15 })).toString("base64url") + "." + t.split(".")[1];
    expect(verifySession(forged, "secret", 1_000)).toBeNull();
  });
});

describe("sending codes", () => {
  it("needs a valid number, consent and a passed bot check", async () => {
    const { deps } = setup();
    expect(await send(deps, { phone: "123" })).toMatchObject({ ok: false, error: "invalid_phone" });
    expect(await send(deps, { consent: false })).toMatchObject({ ok: false, error: "consent_required" });
    expect(await send(deps, { botToken: "bad" })).toMatchObject({ ok: false, error: "bot_check_failed" });
  });
  it("waits 30 s between codes and allows 3 per number per hour", async () => {
    const { deps, advance } = setup();
    expect((await send(deps)).ok).toBe(true);
    expect(await send(deps)).toMatchObject({ ok: false, error: "too_soon" });
    advance(31_000);
    expect((await send(deps)).ok).toBe(true);
    advance(31_000);
    expect((await send(deps)).ok).toBe(true);
    advance(31_000);
    expect(await send(deps)).toMatchObject({ ok: false, error: "too_many" });
    advance(3_600_000);
    expect((await send(deps)).ok).toBe(true);
  });
  it("limits one device (IP) to 10 codes an hour across numbers", async () => {
    const { deps } = setup();
    for (let i = 0; i < 10; i++) expect((await send(deps, { phone: `98400000${String(i).padStart(2, "0")}` })).ok).toBe(true);
    expect(await send(deps, { phone: "9840000099" })).toMatchObject({ ok: false, error: "too_many" });
  });
  it("does not save a code when delivery fails", async () => {
    const { deps, store } = setup();
    deps.sender = { send: async () => ({ ok: false, reason: "provider down" }) };
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect(await send(deps)).toMatchObject({ ok: false, error: "send_failed" });
    expect(await store.getCode(PHONE)).toBeNull();
  });
  it("only hands the code back in development mode", async () => {
    const { deps } = setup();
    expect("devCode" in (await send(deps))).toBe(false);
  });
});

describe("checking codes", () => {
  let ctx: ReturnType<typeof setup>;
  beforeEach(() => {
    ctx = setup();
  });

  it("the right code verifies once, saves the lead and issues a 30-day pass", async () => {
    await send(ctx.deps);
    const r = await check(ctx.deps, ctx.sent[0]);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(readSession(r.sessionToken, ctx.deps.sessionSecret, ctx.now())).toBe(PHONE);
    expect(readSession(r.sessionToken, ctx.deps.sessionSecret, ctx.now() + 31 * 86_400_000)).toBeNull();
    expect(ctx.store.leads.get(PHONE)).toMatchObject({ consentVersion: expect.any(String), source: "/preview" });
    expect(await check(ctx.deps, ctx.sent[0])).toMatchObject({ ok: false, error: "no_code" }); // single use
  });
  it("3 wrong tries lock the code, even the right one afterwards", async () => {
    await send(ctx.deps);
    const wrong = ctx.sent[0] === "000000" ? "111111" : "000000";
    expect(await check(ctx.deps, wrong)).toMatchObject({ ok: false, error: "invalid_code", attemptsLeft: 2 });
    expect(await check(ctx.deps, wrong)).toMatchObject({ ok: false, error: "invalid_code", attemptsLeft: 1 });
    expect(await check(ctx.deps, wrong)).toMatchObject({ ok: false, error: "locked" });
    expect(await check(ctx.deps, ctx.sent[0])).toMatchObject({ ok: false, error: "no_code" });
  });
  it("codes expire after 5 minutes", async () => {
    await send(ctx.deps);
    ctx.advance(5 * 60_000 + 1);
    expect(await check(ctx.deps, ctx.sent[0])).toMatchObject({ ok: false, error: "expired" });
  });
  it("a new code replaces the old one", async () => {
    await send(ctx.deps);
    ctx.advance(31_000);
    await send(ctx.deps);
    if (ctx.sent[0] !== ctx.sent[1]) expect((await check(ctx.deps, ctx.sent[0])).ok).toBe(false);
    expect((await check(ctx.deps, ctx.sent[1])).ok).toBe(true);
  });
});

describe("lead activity", () => {
  it("records known actions with cleaned details, refuses others", async () => {
    const store = new MemoryStore();
    expect(await recordLeadAction(store, PHONE, "mockup_download", { design: "Mandala", size: 12, nested: { x: 1 }, fn: "x".repeat(5000) })).toBe(true);
    expect(store.events[0].details).toEqual({ design: "Mandala", size: 12, fn: "x".repeat(1000) });
    expect(await recordLeadAction(store, PHONE, "drop_table", {})).toBe(false);
  });
});

describe("production settings", () => {
  it("lists every missing key in production, none in development", () => {
    vi.stubEnv("NODE_ENV", "production");
    expect(missingProductionSettings({ sessionSecret: "", otpHashSecret: "" })).toEqual([
      "SESSION_SECRET",
      "OTP_HASH_SECRET",
      "MSG91_AUTH_KEY",
      "MSG91_TEMPLATE_ID",
      "SUPABASE_URL",
      "SUPABASE_SERVICE_ROLE_KEY",
      "TURNSTILE_SECRET_KEY",
    ]);
    vi.stubEnv("NODE_ENV", "development");
    expect(missingProductionSettings({ sessionSecret: "", otpHashSecret: "" })).toEqual([]);
    vi.unstubAllEnvs();
  });
});
