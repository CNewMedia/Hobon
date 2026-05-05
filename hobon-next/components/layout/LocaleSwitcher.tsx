"use client";

import { locales, type Locale } from "@/lib/i18n/config";
import { switchLocalePath, switchLocalePathWithSlugLookup } from "@/lib/i18n/switch-locale";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const labels: Record<Locale, string> = {
  nl: "NL",
  fr: "FR",
  en: "EN",
};

export function LocaleSwitcher({ active }: { active: Locale }) {
  const pathname = usePathname() ?? "/";
  const [hrefs, setHrefs] = useState<Record<Locale, string>>({
    nl: switchLocalePath(pathname, "nl"),
    fr: switchLocalePath(pathname, "fr"),
    en: switchLocalePath(pathname, "en"),
  });

  useEffect(() => {
    let isCancelled = false;

    async function resolveHrefs() {
      const entries = await Promise.all(
        locales.map(async (loc) => [loc, await switchLocalePathWithSlugLookup(pathname, loc)] as const),
      );
      if (!isCancelled) setHrefs(Object.fromEntries(entries) as Record<Locale, string>);
    }

    // Fast fallback first, then swap in slug-aware links.
    setHrefs({
      nl: switchLocalePath(pathname, "nl"),
      fr: switchLocalePath(pathname, "fr"),
      en: switchLocalePath(pathname, "en"),
    });
    void resolveHrefs();

    return () => {
      isCancelled = true;
    };
  }, [pathname]);

  return (
    <div className="flex items-center gap-1 rounded border border-[var(--rule-lt)] bg-white/90 px-1 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(15,17,23,0.45)]">
      {locales.map((loc) => {
        const href = hrefs[loc];
        const isOn = loc === active;
        return (
          <Link
            key={loc}
            href={href}
            className={`rounded px-2 py-1 transition-colors ${
              isOn ? "bg-[var(--orange)] text-[var(--ink)]" : "hover:text-[var(--navy)]"
            }`}
            hrefLang={loc}
          >
            {labels[loc]}
          </Link>
        );
      })}
    </div>
  );
}
