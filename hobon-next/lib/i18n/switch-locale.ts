import type { Locale } from "./config";
import { isLocale } from "./config";
import { buildLocalizedPath, type PathPart } from "./paths";
import { segmentToKey } from "./segments";

/** Switch locale while preserving route identity (uses localized segments per target locale). */
export function switchLocalePath(pathname: string, target: Locale): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return `/${target}/`;

  const maybeLocale = segments[0];
  if (!isLocale(maybeLocale)) return `/${target}/`;

  const rest = segments.slice(1);
  if (rest.length === 0) return `/${target}/`;

  const key = segmentToKey(rest[0]);
  const tail = rest.slice(1).map((s) => decodeURIComponent(s));

  if (key) {
    const parts: PathPart[] = [{ type: "key", key }];
    for (const s of tail) parts.push({ type: "slug", value: s });
    return buildLocalizedPath(target, parts);
  }

  return "/" + [target, ...rest].join("/");
}
