import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { urlFor } from "@/lib/sanity/image";
import { resolveInternalHref, type InternalLinkTarget } from "@/lib/sanity/resolveInternalHref";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ArrowNavIcon } from "./icons";

type ImageWithAlt = { image?: unknown; alt?: string | null } | null;

type MenuItem = {
  _key?: string;
  label?: string | null;
  linkType?: string | null;
  internalLink?: InternalLinkTarget;
  externalUrl?: string | null;
  subItems?: MenuItem[] | null;
};

type HeaderNav = {
  logo?: ImageWithAlt;
  menuItems?: MenuItem[] | null;
  ctaButton?: {
    label?: string | null;
    url?: string | null;
    style?: string | null;
  } | null;
} | null;

type SiteSettings = {
  companyName?: string | null;
  logo?: ImageWithAlt;
} | null;

function imageSrc(iwa: ImageWithAlt, width: number): string | null {
  if (!iwa?.image) return null;
  try {
    return urlFor(iwa.image as Parameters<typeof urlFor>[0]).width(width).url();
  } catch {
    return null;
  }
}

function MenuRows({
  items,
  locale,
  mobile,
}: {
  items: MenuItem[];
  locale: Locale;
  mobile: boolean;
}) {
  return (
    <>
      {items.map((item, idx) => {
        const key = item._key ?? `mi-${idx}`;
        if (item.linkType === "dropdown" && item.subItems?.length) {
          return (
            <div key={key} className={mobile ? "mob-nav-dd" : "hdr-dd"}>
              <span className={mobile ? "mob-nav-dd-label" : "hdr-dd-label"} tabIndex={0}>
                {item.label}
              </span>
              <div className={mobile ? "mob-nav-dd-panel" : "hdr-dd-panel"}>
                {item.subItems.map((sub, sidx) => (
                  <MenuLink key={sub._key ?? `${key}-s-${sidx}`} item={sub} locale={locale} mobile={mobile} />
                ))}
              </div>
            </div>
          );
        }
        return <MenuLink key={key} item={item} locale={locale} mobile={mobile} />;
      })}
    </>
  );
}

function MenuLink({ item, locale, mobile }: { item: MenuItem; locale: Locale; mobile: boolean }) {
  const label = item.label ?? "";
  if (item.linkType === "external" && item.externalUrl) {
    return (
      <a
        href={item.externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={mobile ? "mob-nav-dd-link" : undefined}
      >
        {label}
        {mobile ? <ArrowNavIcon /> : null}
      </a>
    );
  }
  const href = resolveInternalHref(locale, item.internalLink ?? null);
  if (!href) return null;
  return (
    <Link href={href} className={mobile ? "mob-nav-dd-link" : undefined}>
      {label}
      {mobile ? <ArrowNavIcon /> : null}
    </Link>
  );
}

export function SiteHeader({
  locale,
  headerNav,
  siteSettings,
  fallbackLogoSrc,
}: {
  locale: Locale;
  headerNav: HeaderNav;
  siteSettings: SiteSettings;
  fallbackLogoSrc: string;
}) {
  const logoFromNav = imageSrc(headerNav?.logo ?? null, 320);
  const logoFromSettings = imageSrc(siteSettings?.logo ?? null, 320);
  const logoSrc = logoFromNav ?? logoFromSettings ?? fallbackLogoSrc;
  const logoAlt =
    headerNav?.logo?.alt?.trim() ||
    siteSettings?.logo?.alt?.trim() ||
    siteSettings?.companyName?.trim() ||
    "Hobon";

  const home = `/${locale}/`;
  const items = headerNav?.menuItems ?? [];
  const cta = headerNav?.ctaButton;
  const ctaLabel = cta?.label ?? "";
  const ctaUrl = cta?.url?.trim() ?? "";
  const ctaIsExternal = /^https?:\/\//i.test(ctaUrl);

  const ctaClass =
    cta?.style === "secondary"
      ? "hdr-cta hdr-cta--secondary inline-flex items-center gap-2 border border-[var(--rule-lt)] bg-transparent text-[var(--ink)] hover:bg-[rgba(0,0,0,.04)]"
      : "hdr-cta";

  return (
    <>
      <header className="hdr" id="hdr">
        <Link href={home} className="hdr-logo" aria-label={logoAlt}>
          <Image src={logoSrc} alt={logoAlt} width={160} height={44} className="h-11 w-auto max-h-11" priority />
        </Link>
        <nav className="hdr-nav">
          <MenuRows items={items} locale={locale} mobile={false} />
        </nav>
        <div className="mr-3 hidden items-center gap-3 lg:flex">
          <LocaleSwitcher active={locale} />
        </div>
        {ctaUrl ? (
          ctaIsExternal ? (
            <a href={ctaUrl} className={ctaClass} target="_blank" rel="noopener noreferrer">
              <span>{ctaLabel}</span>
            </a>
          ) : (
            <Link href={ctaUrl} className={ctaClass}>
              <span>{ctaLabel}</span>
            </Link>
          )
        ) : null}
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
        <MenuRows items={items} locale={locale} mobile={true} />
        {ctaUrl ? (
          ctaIsExternal ? (
            <a href={ctaUrl} className="mob-nav-cta" target="_blank" rel="noopener noreferrer">
              {ctaLabel}
            </a>
          ) : (
            <Link href={ctaUrl} className="mob-nav-cta">
              {ctaLabel}
            </Link>
          )
        ) : null}
        <div className="flex justify-center px-6 pb-6 pt-2 lg:hidden">
          <LocaleSwitcher active={locale} />
        </div>
      </nav>
    </>
  );
}
