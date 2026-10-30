import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { bad, buildDeps, isSameOrigin, readJson, setSessionCookie } from "@/lib/server/http";
import { checkCode } from "@/lib/server/otp-service";
import { maskPhone } from "@/lib/phone";

// POST { phone, code, source? } → on success sets the signed verified-phone cookie
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return bad("forbidden", 403);
  const built = buildDeps();
  if ("error" in built) return built.error;
  const body = await readJson(req);
  if (!body) return bad("bad_request");

  const result = await checkCode(built.deps, {
    phone: String(body.phone ?? ""),
    code: String(body.code ?? ""),
    source: String(body.source ?? req.headers.get("referer") ?? ""),
    userAgent: req.headers.get("user-agent") ?? "",
  });
  if (!result.ok) return NextResponse.json(result, { status: result.error === "locked" ? 429 : 400 });

  const res = NextResponse.json({ ok: true, phone: result.phone, masked: maskPhone(result.phone) });
  setSessionCookie(res, result.sessionToken, result.maxAgeSeconds);
  return res;
}
