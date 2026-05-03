"use client";

import { locales, type Locale } from "@/lib/i18n/config";
import { switchLocalePath } from "@/lib/i18n/switch-locale";
import Link from "next/link";
import { usePathname } from "next/navigation";

const labels: Record<Locale, string> = {
  nl: "NL",
  fr: "FR",
  en: "EN",
};

export function LocaleSwitcher({ active }: { active: Locale }) {
  const pathname = usePathname() ?? "/";

  return (
    <div className="flex items-center gap-1 rounded border border-[var(--rule-lt)] bg-white/90 px-1 py-0.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-[rgba(15,17,23,0.45)]">
      {locales.map((loc) => {
        const href = switchLocalePath(pathname, loc);
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
