import { EyeOpenIcon } from "@sanity/icons";
import type { DocumentActionComponent } from "sanity";
import { useRouter } from "sanity/router";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import { resolveInternalHref } from "@/lib/sanity/resolveInternalHref";

const SLUG_TYPES = new Set(["product", "sector", "insightArticle"]);

const PAGE_SINGLETON_TYPES = new Set([
  "homePage",
  "aboutPage",
  "sustainabilityPage",
  "contactPage",
  "productOverviewPage",
  "sectorOverviewPage",
  "insightsOverviewPage",
]);

export const PREVIEW_SCHEMA_TYPES = new Set<string>([
  ...SLUG_TYPES,
  ...PAGE_SINGLETON_TYPES,
]);

export function isPreviewableSchemaType(type: string): boolean {
  return PREVIEW_SCHEMA_TYPES.has(type);
}

type PreviewDoc = {
  language?: string;
  slug?: { current?: string } | null;
};

function resolvePreviewHref(type: string, doc: PreviewDoc | null): string | null {
  const locale = doc?.language;
  if (!locale || !isLocale(locale)) return null;

  const slug = doc?.slug?.current?.trim() || undefined;
  if (SLUG_TYPES.has(type) && !slug) return null;

  return resolveInternalHref(locale as Locale, { _type: type, slug });
}

export const openPreviewAction: DocumentActionComponent = (props) => {
  const { navigateIntent } = useRouter();

  if (!isPreviewableSchemaType(props.type)) return null;

  const doc = (props.draft || props.published) as PreviewDoc | null;
  const preview = resolvePreviewHref(props.type, doc);
  if (!preview) return null;

  return {
    label: "Open preview",
    icon: EyeOpenIcon,
    onHandle: () => {
      navigateIntent("edit", {
        id: props.id,
        type: props.type,
        mode: "presentation",
        preview,
      });
    },
  };
};
