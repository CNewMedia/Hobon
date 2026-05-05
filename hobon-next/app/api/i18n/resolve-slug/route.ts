import { NextRequest, NextResponse } from "next/server";
import { isLocale } from "@/lib/i18n/config";
import {
  getDocKeyBySlug,
  getLocalizedSlug,
  getOverviewFallbackPath,
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

  const fetcher = <T,>(query: string, params: Record<string, string>) => client.fetch<T>(query, params);

  const docKey = await getDocKeyBySlug(documentType, sourceLocale, sourceSlug, fetcher);
  if (!docKey) {
    return NextResponse.json({ path: getOverviewFallbackPath(documentType, targetLocale) });
  }

  const slugOrFallback = await getLocalizedSlug(documentType, docKey, targetLocale, fetcher);
  if (slugOrFallback.startsWith("/")) {
    return NextResponse.json({ path: slugOrFallback });
  }

  return NextResponse.json({ slug: slugOrFallback });
}
