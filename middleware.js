import { NextResponse } from "next/server";

export function middleware(req) {
  const authed = req.cookies.get("dcr_auth")?.value === "ok";
  const { pathname } = req.nextUrl;
  if (authed || pathname === "/login" || pathname === "/api/login") {
    return NextResponse.next();
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|icon.png|apple-icon.png|robots.txt).*)"],
};
