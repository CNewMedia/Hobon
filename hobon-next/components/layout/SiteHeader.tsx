import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/paths";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ArrowNavIcon } from "./icons";
import { headerLinks, navLabels } from "./nav";

export function SiteHeader({
  locale,
  logoSrc,
}: {
  locale: Locale;
  logoSrc: string;
}) {
  const t = navLabels(locale);
  const links = headerLinks(locale);
  const home = `/${locale}/`;
  const contactHref = buildLocalizedPath(locale, [{ type: "key", key: "contact" }]);

  return (
    <>
      <header className="hdr" id="hdr">
        <Link href={home} className="hdr-logo" aria-label="Hobon">
          <Image src={logoSrc} alt="Hobon" width={160} height={44} className="h-11 w-auto max-h-11" priority />
        </Link>
        <nav className="hdr-nav">
          {links.map((l) => (
            <Link key={l.href} href={l.href}>
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mr-3 hidden items-center gap-3 lg:flex">
          <LocaleSwitcher active={locale} />
        </div>
        <Link href={contactHref} className="hdr-cta">
          <span>{t.cta}</span>
        </Link>
        <button
          className="hdr-hamburger"
          id="hambtn"
          type="button"
          aria-label="Menu openen"
          aria-expanded="false"
        >
          <span />
          <span />
          <span />
        </button>
      </header>

      <nav className="mob-nav" id="mobnav" aria-hidden="true">
        {links.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
            <ArrowNavIcon />
          </Link>
        ))}
        <Link href={contactHref} className="mob-nav-cta">
          {t.cta}
        </Link>
        <div className="flex justify-center px-6 pb-6 pt-2 lg:hidden">
          <LocaleSwitcher active={locale} />
        </div>
      </nav>
    </>
  );
}
