import { draftMode } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { signPreviewToken, verifyPreviewSecret, verifyPreviewToken } from "@/lib/sanity/previewToken";
import { isPreviewableDocumentId, resolvePreviewPath } from "@/lib/sanity/resolvePreviewPath";

function siteOrigin(request: NextRequest): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    `${request.nextUrl.protocol}//${request.nextUrl.host}`
  );
}

function buildDraftEnableUrl(origin: string, documentId: string): string {
  const { expires, sig } = signPreviewToken(documentId);
  const url = new URL("/api/draft", origin);
  url.searchParams.set("documentId", documentId);
  url.searchParams.set("expires", expires);
  url.searchParams.set("sig", sig);
  return url.toString();
}

function isSameOriginRequest(request: NextRequest): boolean {
  const host = request.headers.get("host");
  const origin = request.headers.get("origin");
  if (origin && host) return origin.includes(host);
  const referer = request.headers.get("referer");
  return Boolean(referer && host && referer.includes(host));
}

/** Studio: issue a signed preview URL (secret never sent to the browser). */
export async function POST(request: NextRequest) {
  if (!isSameOriginRequest(request)) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let documentId: string | undefined;
  try {
    const body = (await request.json()) as { documentId?: string };
    documentId = body.documentId?.trim();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!documentId || !isPreviewableDocumentId(documentId)) {
    return NextResponse.json({ error: "invalid_document" }, { status: 400 });
  }

  try {
    const path = await resolvePreviewPath(documentId);
    if (!path) {
      return NextResponse.json({ error: "unresolved_path" }, { status: 404 });
    }

    const enableUrl = new URL(buildDraftEnableUrl(siteOrigin(request), documentId));
    enableUrl.searchParams.set("redirect", path);

    return NextResponse.json({ url: enableUrl.toString(), path });
  } catch (err) {
    console.error("[draft POST]", err);
    return NextResponse.json({ error: "preview_unavailable" }, { status: 503 });
  }
}

/** Enable draft mode and redirect to the preview page. */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const documentId = searchParams.get("documentId")?.trim();
  const redirectTo = searchParams.get("redirect")?.trim();
  const expires = searchParams.get("expires");
  const sig = searchParams.get("sig");
  const secret = searchParams.get("secret");

  if (!documentId || !isPreviewableDocumentId(documentId)) {
    return new NextResponse("Invalid document", { status: 400 });
  }

  const signedOk = expires && sig && verifyPreviewToken(documentId, expires, sig);
  const secretOk = verifyPreviewSecret(secret);

  if (!signedOk && !secretOk) {
    return new NextResponse("Invalid or expired preview token", { status: 401 });
  }

  let path = redirectTo;
  if (!path) {
    try {
      path = (await resolvePreviewPath(documentId)) ?? undefined;
    } catch (err) {
      console.error("[draft GET resolve]", err);
      return new NextResponse("Preview unavailable (check SANITY_API_READ_TOKEN)", { status: 503 });
    }
  }

  if (!path || !path.startsWith("/")) {
    return new NextResponse("Could not resolve preview URL", { status: 404 });
  }

  const draft = await draftMode();
  draft.enable();

  return NextResponse.redirect(new URL(path, siteOrigin(request)));
}
