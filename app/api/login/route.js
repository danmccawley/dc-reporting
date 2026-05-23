import { NextResponse } from "next/server";

const PASSWORD = process.env.SITE_PASSWORD || "YpsiBarn2026!!";

export async function POST(req) {
  let body = {};
  try { body = await req.json(); } catch {}
  if ((body.password || "") === PASSWORD) {
    const res = NextResponse.json({ ok: true });
    res.cookies.set("dcr_auth", "ok", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return res;
  }
  return NextResponse.json({ ok: false }, { status: 401 });
}
