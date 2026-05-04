import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const pathNoTrailing = pathname.replace(/\/+$/, "") || "/";

  /** Legacy NL sector URL → canonical slug (Deel 1.1). Exact paths only (niet `voedingsindustrie`). */
  if (pathNoTrailing === "/nl/sectoren/voeding") {
    const u = request.nextUrl.clone();
    u.pathname = "/nl/sectoren/voedingsindustrie";
    return NextResponse.redirect(u, 301);
  }

  if (pathname === "/") {
    return NextResponse.redirect(new URL("/nl/", request.url));
  }

  const first = pathname.split("/").filter(Boolean)[0];
  let locale = "nl";
  if (first === "studio") {
    locale = "nl";
  } else if (["nl", "fr", "en"].includes(first)) {
    locale = first;
  }

  const res = NextResponse.next();
  res.headers.set("x-locale", locale);
  res.headers.set("x-pathname", pathname);
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4)$).*)",
  ],
};
