import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { readSecrets, SESSION_COOKIE } from "@/lib/server/config";
import { isSameOrigin } from "@/lib/server/http";
import { readSession } from "@/lib/server/otp-service";
import { maskPhone } from "@/lib/phone";

// GET → is this browser verified? (only the visitor's own number is ever returned)
export async function GET(req: NextRequest) {
  const phone = readSession(req.cookies.get(SESSION_COOKIE)?.value, readSecrets().sessionSecret);
  return NextResponse.json(phone ? { verified: true, phone, masked: maskPhone(phone) } : { verified: false }, {
    headers: { "Cache-Control": "no-store" },
  });
}

// DELETE → forget the verified number on this browser
export async function DELETE(req: NextRequest) {
  if (!isSameOrigin(req)) return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 });
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
