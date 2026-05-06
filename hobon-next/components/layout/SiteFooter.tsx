"use client";

import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { urlFor } from "@/lib/sanity/image";
import { resolveInternalHref, type InternalLinkTarget } from "@/lib/sanity/resolveInternalHref";
import { useUILabels } from "@/components/providers/UILabelsProvider";

type ImageWithAlt = { image?: unknown; alt?: string | null } | null;

type FooterLink = {
  label?: string | null;
  linkType?: string | null;
  internalLink?: InternalLinkTarget;
  externalUrl?: string | null;
};

type FooterColumn = {
  title?: string | null;
  links?: FooterLink[] | null;
};

type FooterNav = {
  slogan?: string | null;
  columns?: FooterColumn[] | null;
  bottomLinks?: FooterLink[] | null;
  copyright?: string | null;
  showBrcBadge?: boolean | null;
} | null;

type SiteSettings = {
  companyName?: string | null;
  logo?: ImageWithAlt;
  brcBadge?: ImageWithAlt;
  primaryPhone?: string | null;
  primaryEmail?: string | null;
  locations?: Array<{
    name?: string | null;
    streetAddress?: string | null;
    postalCode?: string | null;
    city?: string | null;
  }> | null;
} | null;

function imageSrc(iwa: ImageWithAlt, width: number): string | null {
  if (!iwa?.image) return null;
  try {
    return urlFor(iwa.image as Parameters<typeof urlFor>[0]).width(width).url();
  } catch {
    return null;
  }
}

function FooterAnchor({ link, locale }: { link: FooterLink; locale: Locale }) {
  const label = link.label ?? "";
  if (link.linkType === "external" && link.externalUrl) {
    const url = link.externalUrl.trim();
    if (url.startsWith("/")) {
      return <Link href={url}>{label}</Link>;
    }
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        {label}
      </a>
    );
  }
  const href = resolveInternalHref(locale, link.internalLink ?? null);
  if (!href) return null;
  return <Link href={href}>{label}</Link>;
}

export function SiteFooter({
  locale,
  footerNav,
  siteSettings,
  fallbackLogoSrc,
}: {
  locale: Locale;
  footerNav: FooterNav;
  siteSettings: SiteSettings;
  fallbackLogoSrc: string;
}) {
  const labels = useUILabels();
  const logoSrc = imageSrc(siteSettings?.logo ?? null, 320) ?? fallbackLogoSrc;
  const logoAlt =
    siteSettings?.logo?.alt?.trim() || siteSettings?.companyName?.trim() || "Hobon";
  const slogan = footerNav?.slogan ?? "";
  const columns = footerNav?.columns ?? [];
  const bottomLinks = footerNav?.bottomLinks ?? [];
  const copyright = footerNav?.copyright ?? "";
  const showBrc = footerNav?.showBrcBadge !== false;
  const brcImg = imageSrc(siteSettings?.brcBadge ?? null, 120);
  const brcAlt = siteSettings?.brcBadge?.alt?.trim() ?? labels.uiBrcLevelLabel;

  const phone = siteSettings?.primaryPhone;
  const email = siteSettings?.primaryEmail;
  const loc0 = siteSettings?.locations?.[0];

  return (
    <footer>
      <div className="ft">
        <div>
          <Image
            src={logoSrc}
            alt={logoAlt}
            width={160}
            height={44}
            className="ft-logo h-auto max-h-11 w-auto"
            style={{ height: "auto" }}
          />
          {slogan ? <p className="ft-tagline">{slogan}</p> : null}
          {(phone || email || loc0) && (
            <div className="mt-6 space-y-2 text-sm text-[#5a5f72]">
              {loc0 ? (
                <div>
                  {loc0.name ? <div className="font-medium text-[var(--ink)]">{loc0.name}</div> : null}
                  <div>
                    {loc0.streetAddress}
                    <br />
                    {loc0.postalCode} {loc0.city}
                  </div>
                </div>
              ) : null}
              {phone ? (
                <div>
                  <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
                </div>
              ) : null}
              {email ? (
                <div>
                  <a href={`mailto:${email}`}>{email}</a>
                </div>
              ) : null}
            </div>
          )}
        </div>
        {columns.map((col, i) => (
          <div key={col.title ?? `col-${i}`}>
            <div className="ft-col-h">{col.title}</div>
            <nav className="ft-links">
              {(col.links ?? []).map((link, j) => (
                <FooterAnchor key={`${i}-${j}`} link={link} locale={locale} />
              ))}
            </nav>
          </div>
        ))}
      </div>
      <div className="ft-bottom">
        <div className="ft-bottom-left flex flex-col gap-2">
          <p className="ft-copy">{copyright}</p>
          <nav className="ft-bottom-links flex flex-wrap gap-x-4 gap-y-1 text-sm text-[#aab0c0]">
            {bottomLinks.map((link, i) => (
              <FooterAnchor key={`b-${i}`} link={link} locale={locale} />
            ))}
          </nav>
        </div>
        {showBrc ? (
          <div className="ft-brc">
            {brcImg ? (
              <Image src={brcImg} alt={brcAlt} width={56} height={56} className="h-14 w-auto" style={{ width: "auto" }} />
            ) : (
              <>
                <div className="ft-brc-box">
                  <span>
                    BRC
                    <br />
                    AA
                  </span>
                </div>
                <span className="ft-brc-txt">{labels.uiBrcLevelLabel}</span>
              </>
            )}
          </div>
        ) : null}
      </div>
    </footer>
  );
}
