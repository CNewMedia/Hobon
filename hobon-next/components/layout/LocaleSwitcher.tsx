"use client";

import { locales, type Locale } from "@/lib/i18n/config";
import {
  isDetailLocalePath,
  resolveLocaleSwitchHrefsClient,
  switchLocalePath,
  type LocaleSwitchMap,
  type LocaleSwitchResult,
} from "@/lib/i18n/switch-locale";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const labels: Record<Locale, string> = {
  nl: "NL",
  fr: "FR",
  en: "EN",
};

const fallbackTitle: Record<Locale, string> = {
  nl: "Geen vertaling — overzicht",
  fr: "Pas de traduction — aperçu",
  en: "No translation — overview",
};

function syncMap(pathname: string): LocaleSwitchMap {
  return {
    nl: { href: switchLocalePath(pathname, "nl"), isFallback: false },
    fr: { href: switchLocalePath(pathname, "fr"), isFallback: false },
    en: { href: switchLocalePath(pathname, "en"), isFallback: false },
  };
}

export function LocaleSwitcher({
  active,
  initialHrefs,
  initialPathname,
}: {
  active: Locale;
  /** Correct hrefs from the server render for `initialPathname`. */
  initialHrefs: LocaleSwitchMap;
  initialPathname: string;
}) {
  const pathname = usePathname() ?? initialPathname;
  const [hrefs, setHrefs] = useState<LocaleSwitchMap>(initialHrefs);
  /** False only while resolving a client navigation on a detail page — no guessed hrefs. */
  const [linksReady, setLinksReady] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function resolveHrefs() {
      if (pathname === initialPathname) {
        setHrefs(initialHrefs);
        setLinksReady(true);
        return;
      }

      if (!isDetailLocalePath(pathname)) {
        setHrefs(syncMap(pathname));
        setLinksReady(true);
        return;
      }

      // Detail route after client navigation: wait for resolved slugs — never emit guessed URLs.
      setLinksReady(false);
      const next = await resolveLocaleSwitchHrefsClient(pathname);
      if (!isCancelled) {
        setHrefs(next);
        setLinksReady(true);
      }
    }

    void resolveHrefs();
    return () => {
      isCancelled = true;
    };
  }, [pathname, initialPathname, initialHrefs]);

  return (
    <div className="flex items-center gap-1 rounded border border-[var(--rule-lt)] bg-white/90 px-1 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(15,17,23,0.45)]">
      {locales.map((loc) => {
        const entry: LocaleSwitchResult | undefined = hrefs[loc];
        const isOn = loc === active;
        const showLink = linksReady && Boolean(entry?.href);

        if (!showLink) {
          return (
            <span
              key={loc}
              className={`rounded px-2 py-1 ${isOn ? "bg-[var(--orange)] text-[var(--ink)]" : "opacity-40"}`}
              aria-busy={!linksReady}
              aria-label={labels[loc]}
            >
              {labels[loc]}
            </span>
          );
        }

        const { href, isFallback } = entry;
        return (
          <Link
            key={loc}
            href={href}
            title={isFallback ? fallbackTitle[active] : undefined}
            aria-label={isFallback ? `${labels[loc]} — ${fallbackTitle[active]}` : labels[loc]}
            className={`rounded px-2 py-1 transition-colors ${
              isOn
                ? "bg-[var(--orange)] text-[var(--ink)]"
                : isFallback
                  ? "opacity-55 hover:opacity-100 hover:text-[var(--navy)]"
                  : "hover:text-[var(--navy)]"
            }`}
            hrefLang={isFallback ? undefined : loc}
          >
            {labels[loc]}
            {isFallback ? <span aria-hidden="true">*</span> : null}
          </Link>
        );
      })}
    </div>
  );
}
