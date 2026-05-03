import type { Locale } from "./config";
import { segmentByLocale, type SegmentKey } from "./segments";

export type PathPart =
  | { type: "key"; key: SegmentKey }
  | { type: "slug"; value: string };

/** Builds a path like `/nl/sectoren/voeding`. Empty parts → `/nl/` */
export function buildLocalizedPath(locale: Locale, parts: PathPart[] = []): string {
  if (!parts.length) return `/${locale}/`;
  const loc = locale as Locale;
  const bits: string[] = [loc];
  const segMap = segmentByLocale[loc];
  for (const p of parts) {
    if (p.type === "key") bits.push(segMap[p.key]);
    else bits.push(p.value);
  }
  return "/" + bits.join("/");
}
