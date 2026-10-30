import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { bad, buildDeps, clientIp, isSameOrigin, readJson } from "@/lib/server/http";
import { sendCode } from "@/lib/server/otp-service";

// POST { phone, consent, botToken? } → sends a 6-digit code
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return bad("forbidden", 403);
  const built = buildDeps();
  if ("error" in built) return built.error;
  const body = await readJson(req);
  if (!body) return bad("bad_request");

  const result = await sendCode(built.deps, {
    phone: String(body.phone ?? ""),
    consent: body.consent === true,
    botToken: typeof body.botToken === "string" ? body.botToken : undefined,
    ip: clientIp(req),
  });
  const status = result.ok ? 200 : result.error === "too_soon" || result.error === "too_many" ? 429 : result.error === "send_failed" ? 502 : 400;
  return NextResponse.json(result, { status });
}
