import { defineEnableDraftMode } from "next-sanity/draft-mode";
import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { client } from "@/lib/sanity/client";

const { GET: enablePresentationDraftMode } = defineEnableDraftMode({
  client: client.withConfig({
    token: process.env.SANITY_API_READ_TOKEN,
  }),
});

function isSafePathname(pathname: string): boolean {
  return pathname.startsWith("/") && !pathname.startsWith("//");
}

export async function GET(request: NextRequest) {
  const sharedSecret = request.nextUrl.searchParams.get("secret");

  // Shared-secret flow (SANITY_PREVIEW_SECRET) used by manual / signed preview links.
  if (sharedSecret !== null) {
    const expected = process.env.SANITY_PREVIEW_SECRET;
    if (!expected || sharedSecret !== expected) {
      return new NextResponse("Invalid secret", { status: 401 });
    }

    const pathname =
      request.nextUrl.searchParams.get("pathname") ??
      request.nextUrl.searchParams.get("sanity-preview-pathname") ??
      "/";

    if (!isSafePathname(pathname)) {
      return new NextResponse("Invalid pathname", { status: 400 });
    }

    (await draftMode()).enable();
    return NextResponse.redirect(new URL(pathname, request.url), 307);
  }

  // Sanity Presentation / preview-url-secret handshake.
  return enablePresentationDraftMode(request);
}
