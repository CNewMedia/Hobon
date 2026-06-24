import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const draft = await draftMode();
  draft.disable();

  const redirectTo = request.nextUrl.searchParams.get("redirect")?.trim() || "/nl/";
  const safePath = redirectTo.startsWith("/") ? redirectTo : "/nl/";

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    `${request.nextUrl.protocol}//${request.nextUrl.host}`;

  return NextResponse.redirect(new URL(safePath, origin));
}
