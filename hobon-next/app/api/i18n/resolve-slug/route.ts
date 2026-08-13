import { NextRequest, NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n/config";
import {
  resolveSiblingSlug,
  type LocalizedDocType,
} from "@/lib/sanity/locale-mapping";
import { client } from "@/lib/sanity/client";

const TYPES = new Set<LocalizedDocType>(["sector", "product", "insightArticle"]);

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const documentType = searchParams.get("documentType") as LocalizedDocType | null;
  const sourceLocale = searchParams.get("sourceLocale");
  const targetLocale = searchParams.get("targetLocale");
  const sourceSlug = searchParams.get("sourceSlug");

  if (!documentType || !TYPES.has(documentType) || !sourceLocale || !targetLocale || !sourceSlug) {
    return NextResponse.json({ error: "invalid_params" }, { status: 400 });
  }
  if (!isLocale(sourceLocale) || !isLocale(targetLocale)) {
    return NextResponse.json({ error: "invalid_locale" }, { status: 400 });
  }

  const resolved = await resolveSiblingSlug(
    documentType,
    sourceLocale,
    sourceSlug,
    targetLocale,
    (query, params) => client.fetch(query, params),
  );

  if ("path" in resolved) {
    return NextResponse.json({ path: resolved.path });
  }

  return NextResponse.json({ slug: resolved.slug });
}
