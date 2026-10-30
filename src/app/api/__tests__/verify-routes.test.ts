// @vitest-environment node
import { describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { POST as sendPOST } from "../verify/send/route";
import { POST as checkPOST } from "../verify/check/route";
import { GET as sessionGET } from "../verify/session/route";
import { POST as eventPOST } from "../leads/event/route";

// Development mode: in-memory store, codes printed (we read them from the response)
vi.spyOn(console, "info").mockImplementation(() => {});

const req = (path: string, body?: unknown, headers: Record<string, string> = {}) =>
  new NextRequest(`http://localhost:3000${path}`, {
    method: body === undefined ? "GET" : "POST",
    headers: { host: "localhost:3000", origin: "http://localhost:3000", "content-type": "application/json", "x-forwarded-for": "9.9.9.9", ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

describe("verification API (development mode)", () => {
  it("full flow: send → check → cookie → session → lead event", async () => {
    const sent = await sendPOST(req("/api/verify/send", { phone: "9876501234", consent: true }));
    expect(sent.status).toBe(200);
    const { devCode } = await sent.json();
    expect(devCode).toMatch(/^\d{6}$/);

    const checked = await checkPOST(req("/api/verify/check", { phone: "9876501234", code: devCode }));
    expect(checked.status).toBe(200);
    expect(await checked.json()).toMatchObject({ ok: true, masked: "+91 98••••1234" });
    const cookie = checked.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(/apexwall_phone=.+;/);
    expect(cookie.toLowerCase()).toContain("httponly");
    expect(cookie.toLowerCase()).toContain("samesite=lax");

    const token = cookie.split(";")[0];
    const session = await sessionGET(req("/api/verify/session", undefined, { cookie: token }));
    expect(await session.json()).toMatchObject({ verified: true, phone: "+919876501234" });

    const ev = await eventPOST(req("/api/leads/event", { action: "mockup_download", details: { design: "Mandala" } }, { cookie: token }));
    expect(ev.status).toBe(200);
  });

  it("refuses requests from other websites", async () => {
    const r = await sendPOST(req("/api/verify/send", { phone: "9876501235", consent: true }, { origin: "https://evil.example" }));
    expect(r.status).toBe(403);
  });

  it("lead events need a verified number", async () => {
    const r = await eventPOST(req("/api/leads/event", { action: "mockup_download" }));
    expect(r.status).toBe(401);
  });

  it("a forged cookie is not verified", async () => {
    const r = await sessionGET(req("/api/verify/session", undefined, { cookie: "apexwall_phone=eyJwaG9uZSI6IisxIn0.fake" }));
    expect(await r.json()).toEqual({ verified: false });
  });

  it("rejects non-JSON and oversized bodies", async () => {
    const r = await sendPOST(req("/api/verify/send", "x".repeat(10), { "content-type": "text/plain" }));
    expect(r.status).toBe(400);
  });
});
