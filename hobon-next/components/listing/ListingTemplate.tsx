"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { buildLocalizedPath, type PathPart } from "@/lib/i18n/paths";
import { HeroMediaPanel } from "@/components/hero/HeroMedia";
import type { HeroMediaData } from "@/components/hero/heroMediaTypes";
import { hasHeroMedia } from "@/components/hero/heroMediaTypes";
import { productListingCardSrc, sectorListingCardSrc } from "@/components/hero/listingCardImage";
import { ArrowBtnIcon } from "@/components/layout/icons";
import { SectorCtaForm } from "@/components/sector/SectorCtaForm";
import { useUILabels } from "@/components/providers/UILabelsProvider";

export type OverviewPageDoc = {
  heroEyebrow?: string | null;
  heroTitle?: string | null;
  heroIntro?: string | null;
  title?: string | null;
  intro?: string | null;
  heroMedia?: HeroMediaData;
  ctaBandTitle?: string | null;
  ctaBandBody?: string | null;
  ctaBandPrimary?: { label?: string | null; href?: string | null } | null;
};

export type SectorListingItem = {
  _id: string;
  title?: string | null;
  slug?: string | null;
  navLabel?: string | null;
  sortOrder?: number | null;
  listingEyebrow?: string | null;
  listingDescription?: string | null;
  listingPills?: string[] | null;
  heroMainImage?: { image?: unknown; alt?: string | null } | null;
  heroMainImageUrl?: string | null;
};

export type ProductListingItem = {
  _id: string;
  title?: string | null;
  slug?: string | null;
  listingEyebrow?: string | null;
  listingDescription?: string | null;
  heroEyebrow?: string | null;
  heroHeadline?: string | null;
  heroImage?: { image?: unknown; alt?: string | null } | null;
  seo?: { metaDescription?: string | null } | null;
};

type ListingKey = "sectors" | "products";

const HERO_OVERLAY_STYLE = {
  background:
    "linear-gradient(to right, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.0) 100%)",
} as const;

function ListingCardPlaceholder() {
  return (
    <div className="p-hero-placeholder listing-sc-ph" aria-hidden="true">
      <div className="p-hero-placeholder-grid" />
      <span className="p-hero-placeholder-label">Hobon</span>
    </div>
  );
}

export function ListingTemplate({
  locale,
  overview,
  items,
  variant,
  pathKey,
  itemCountAttr,
}: {
  locale: Locale;
  overview: OverviewPageDoc | null;
  items: SectorListingItem[] | ProductListingItem[];
  variant: "sectors" | "products";
  pathKey: ListingKey;
  itemCountAttr: "data-sol-count" | "data-pc-count";
}) {
  const labels = useUILabels();
  const segment: PathPart = { type: "key", key: pathKey };

  const h1 = (overview?.heroTitle ?? overview?.title)?.trim() || "";
  const intro = (overview?.heroIntro ?? overview?.intro)?.trim() || "";
  const eyebrow = overview?.heroEyebrow?.trim() || "";
  const overviewHeroMedia = overview?.heroMedia;

  const hasHero = Boolean(h1 || intro || eyebrow || hasHeroMedia(overviewHeroMedia));
  const hasCtaBand = Boolean(
    overview?.ctaBandTitle?.trim() ||
      overview?.ctaBandBody?.trim() ||
      (overview?.ctaBandPrimary?.label && overview?.ctaBandPrimary?.href),
  );

  const wrapClass = variant === "sectors" ? "listing-sector-wrap" : "listing-product-wrap";

  return (
    <>
      {hasHero ? (
        <section className="s-hero listing-overview-hero">
          <div className="s-hero-dots" aria-hidden="true" />
          <div className="s-hero-glow" aria-hidden="true" />

          <div className="s-hero-l listing-overview-hero-l">
            {eyebrow ? (
              <div className="s-hero-eyebrow">
                <div className="s-hero-eyebrow-line" />
                <span className="s-hero-eyebrow-txt">{eyebrow}</span>
              </div>
            ) : null}
            {h1 ? <h1 className="s-hero-h1 listing-overview-h1">{h1}</h1> : null}
            {intro ? <p className="s-hero-intro whitespace-pre-line">{intro}</p> : null}
          </div>

          {hasHeroMedia(overviewHeroMedia) ? (
            <HeroMediaPanel media={overviewHeroMedia} />
          ) : (
            <div className="s-hero-r listing-overview-hero-r">
              <div className="s-hero-r-main">
                <div className="p-hero-placeholder listing-overview-ph" aria-hidden="true">
                  <div className="p-hero-placeholder-grid" />
                  <span className="p-hero-placeholder-label">Hobon</span>
                </div>
              </div>
              <div className="s-hero-r-overlay" style={HERO_OVERLAY_STYLE} />
            </div>
          )}
        </section>
      ) : null}

      <section className={wrapClass}>
        <div
          className={
            variant === "sectors"
              ? "listing-grid listing-grid--sectors"
              : "listing-grid listing-grid--products"
          }
          {...{ [itemCountAttr]: String(items.length) }}
        >
          {variant === "sectors"
            ? (items as SectorListingItem[]).map((sc, idx) => {
                if (!sc.slug) return null;
                const href = buildLocalizedPath(locale, [segment, { type: "slug", value: sc.slug }]);
                const n = String(sc.sortOrder ?? idx + 1).padStart(2, "0");
                const img = sectorListingCardSrc(sc.heroMainImage, sc.heroMainImageUrl);
                return (
                  <Link key={sc._id} href={href} className="sc listing-sc-card">
                    <div className="sc-img">
                      {img ? (
                        <>
                          <img src={img} alt={sc.heroMainImage?.alt ?? sc.title ?? ""} />
                          <div className="sc-img-overlay" />
                        </>
                      ) : (
                        <ListingCardPlaceholder />
                      )}
                    </div>
                    <div className="sc-body">
                      <div className="sc-bg-n">{n}</div>
                      <span className="sc-tag">{sc.listingEyebrow ?? labels.listingSectorFallback}</span>
                      <h3 className="sc-title">{sc.title}</h3>
                      <p className="sc-desc">{sc.listingDescription ?? ""}</p>
                      <div className="sc-tags">
                        {(sc.listingPills ?? []).map((p) => (
                          <span key={p} className="sc-tag-pill">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="sc-arrow">
                      <ArrowBtnIcon size={12} />
                    </div>
                  </Link>
                );
              })
            : (items as ProductListingItem[]).map((pc) => {
                if (!pc.slug) return null;
                const href = buildLocalizedPath(locale, [segment, { type: "slug", value: pc.slug }]);
                const desc =
                  pc.listingDescription?.trim() ||
                  pc.seo?.metaDescription?.trim() ||
                  "";
                const tag = pc.listingEyebrow?.trim() || pc.heroEyebrow?.trim() || labels.listingProductFallback;
                const img = productListingCardSrc(pc.heroImage);
                return (
                  <Link key={pc._id} href={href} className="pc rv listing-pc-card listing-pc-card--with-img">
                    {img ? (
                      <div className="sc-img listing-pc-img">
                        <img src={img} alt={pc.heroImage?.alt ?? pc.title ?? ""} />
                        <div className="sc-img-overlay" />
                      </div>
                    ) : null}
                    <span className="pc-tag">{tag}</span>
                    <h3 className="pc-title">{pc.title}</h3>
                    {desc ? <p className="pc-desc">{desc}</p> : null}
                    <span className="pc-cta">
                      {labels.listingReadMore}
                      <ArrowBtnIcon size={11} />
                    </span>
                  </Link>
                );
              })}
        </div>
      </section>

      {overview && hasCtaBand ? (
        <section className="cta-band" id="contact">
          <div className="cta-inner">
            <div>
              <div className="sec-tag rv" style={{ marginBottom: 18 }}>
                <div className="sec-tag-line" />
                <span className="sec-tag-txt" style={{ color: "rgba(245,163,0,.7)" }}>
                  {labels.listingContact}
                </span>
              </div>
              {overview.ctaBandTitle ? <h2 className="cta-h2 rv d1">{overview.ctaBandTitle}</h2> : null}
              {overview.ctaBandBody ? (
                <p className="cta-body rv d2 whitespace-pre-line">{overview.ctaBandBody}</p>
              ) : null}
              {overview.ctaBandPrimary?.href ? (
                <div className="rv d3" style={{ marginTop: 24 }}>
                  <Link href={overview.ctaBandPrimary.href} className="btn-primary">
                    <span>{overview.ctaBandPrimary.label}</span>
                    <ArrowBtnIcon size={14} />
                  </Link>
                </div>
              ) : null}
            </div>
            <div className="rv d2">
              <SectorCtaForm />
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
