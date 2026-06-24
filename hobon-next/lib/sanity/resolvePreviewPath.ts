import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import { resolveInternalHref } from "@/lib/sanity/resolveInternalHref";
import { createPreviewClient } from "@/lib/sanity/previewClient";
import {
  PREVIEW_SINGLETON_TYPES,
  PREVIEW_SLUG_TYPES,
  PREVIEW_SCHEMA_TYPES,
} from "@/lib/sanity/previewTypes";

const SINGLETON_TYPES = new Set<string>(PREVIEW_SINGLETON_TYPES);
const SLUG_TYPES = new Set<string>(PREVIEW_SLUG_TYPES);

function normalizeDocumentId(id: string): string {
  return id.startsWith("drafts.") ? id.slice(7) : id;
}

function parseDocumentMeta(id: string): { type: string; locale: Locale } | null {
  const cleanId = normalizeDocumentId(id);
  for (const locale of ["nl", "fr", "en"] as const) {
    for (const type of [...PREVIEW_SINGLETON_TYPES, ...PREVIEW_SLUG_TYPES]) {
      const prefix = `${type}-${locale}`;
      if (cleanId === prefix || cleanId.startsWith(`${prefix}-`)) {
        return { type, locale };
      }
    }
  }
  return null;
}

export async function resolvePreviewPath(documentId: string): Promise<string | null> {
  const meta = parseDocumentMeta(documentId);
  if (!meta) return null;

  if (SINGLETON_TYPES.has(meta.type)) {
    return resolveInternalHref(meta.locale, { _type: meta.type });
  }

  if (!SLUG_TYPES.has(meta.type)) return null;

  const cleanId = normalizeDocumentId(documentId);
  const previewClient = createPreviewClient();
  const doc = await previewClient.fetch<{ slug?: { current?: string } | null }>(
    `*[_id == $id || _id == $draftId][0]{ slug }`,
    { id: cleanId, draftId: `drafts.${cleanId}` },
  );

  const slug = doc?.slug?.current?.trim();
  if (!slug) return null;

  return resolveInternalHref(meta.locale, { _type: meta.type, slug });
}

export function isPreviewableDocumentId(documentId: string): boolean {
  const meta = parseDocumentMeta(documentId);
  return meta !== null && PREVIEW_SCHEMA_TYPES.has(meta.type);
}

export function parsePreviewDocumentLocale(documentId: string): Locale | null {
  const meta = parseDocumentMeta(documentId);
  if (!meta || !isLocale(meta.locale)) return null;
  return meta.locale;
}
