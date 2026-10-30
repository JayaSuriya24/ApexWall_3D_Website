import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readSecrets, SESSION_COOKIE } from "@/lib/server/config";
import { bad, buildDeps, isSameOrigin, readJson } from "@/lib/server/http";
import { readSession, recordLeadAction } from "@/lib/server/otp-service";

// POST { action, details } → records what a verified lead did (download, share, quote, contact)
export async function POST(req: NextRequest) {
  if (!isSameOrigin(req)) return bad("forbidden", 403);
  const phone = readSession(req.cookies.get(SESSION_COOKIE)?.value, readSecrets().sessionSecret);
  if (!phone) return bad("not_verified", 401);
  const built = buildDeps();
  if ("error" in built) return built.error;
  const body = await readJson(req, 8_000);
  if (!body) return bad("bad_request");
  const ok = await recordLeadAction(built.deps.store, phone, String(body.action ?? ""), body.details);
  return ok ? NextResponse.json({ ok: true }) : bad("unknown_action");
}
