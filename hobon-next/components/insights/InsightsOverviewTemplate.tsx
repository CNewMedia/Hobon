/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/paths";
import { imageWithAltToUrl, resolveImageSrc } from "@/lib/sanity/resolveImageSrc";
import { ArrowBtnIcon } from "@/components/layout/icons";
import { InsightCategoryChips, type InsightCategoryChip } from "@/components/insights/InsightCategoryChips";

export type InsightsOverviewPageDoc = {
  hero?: { headline?: string | null; subline?: string | null } | null;
  intro?: string | null;
  articleCardFallbackImage?: { image?: unknown; alt?: string | null } | null;
};

export type InsightListItem = {
  _id: string;
  title?: string | null;
  slug?: string | null;
  lead?: string | null;
  publishedAt?: string | null;
  featuredImage?: { image?: unknown; alt?: string | null } | null;
  category?: { title?: string | null; slug?: string | null; color?: string | null } | null;
};

function formatArticleDate(locale: Locale, iso: string | null | undefined) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const tag =
    locale === "nl" ? "nl-BE" : locale === "fr" ? "fr-BE" : "en-GB";
  return new Intl.DateTimeFormat(tag, { day: "numeric", month: "short", year: "numeric" }).format(d);
}

function CardImagePlaceholder() {
  return (
    <div className="p-hero-placeholder" aria-hidden="true">
      <div className="p-hero-placeholder-grid" />
      <span className="p-hero-placeholder-label">Hobon</span>
    </div>
  );
}

export function InsightsOverviewTemplate({
  locale,
  page,
  articles,
  categories,
}: {
  locale: Locale;
  page: InsightsOverviewPageDoc | null;
  articles: InsightListItem[];
  categories: InsightCategoryChip[];
}) {
  const hero = page?.hero;
  const cardFallbackSrc = imageWithAltToUrl(page?.articleCardFallbackImage, { width: 640, quality: 80 });

  return (
    <div className="ins-page">
      <section className="ins-hero ins-hero--overview">
        <div className="ins-hero-l">
          {hero?.headline ? <h1 className="ins-hero-h1">{hero.headline}</h1> : <h1 className="ins-hero-h1">Insights</h1>}
          {hero?.subline ? <p className="ins-hero-intro">{hero.subline}</p> : null}
          {page?.intro ? <p className="ins-hero-intro">{page.intro}</p> : null}
          <InsightCategoryChips categories={categories} />
        </div>
      </section>

      <section className="ins-list">
        <div className="ins-list-hdr">
          <div>
            <h2 className="ins-list-h2">Artikels</h2>
            <p className="ins-list-sub">Praktische inzichten voor uw verpakkingslijn.</p>
          </div>
        </div>

        {articles.length === 0 ? (
          <p className="text-[#5a5f72]">Nog geen artikels in deze taal.</p>
        ) : (
          <div className="ins-grid">
            {articles.map((a) => {
              if (!a.slug) return null;
              const href = buildLocalizedPath(locale, [
                { type: "key", key: "insights" },
                { type: "slug", value: a.slug },
              ]);
              const featured = resolveImageSrc(a.featuredImage, { width: 640, quality: 80 });
              const imgSrc = featured.src ?? cardFallbackSrc;
              const imgAlt = featured.alt || a.featuredImage?.alt || a.title || "";
              return (
                <article key={a._id} className="ins-card">
                  <Link href={href} className="ins-card-link">
                    <div className="ins-card-media">
                      {imgSrc ? <img src={imgSrc} alt={imgAlt} /> : <CardImagePlaceholder />}
                    </div>
                    <div className="ins-card-body">
                      {a.category?.title ? (
                        <span className="ins-card-cat">{a.category.title}</span>
                      ) : null}
                      <h3 className="ins-card-title">{a.title}</h3>
                      {a.lead ? <p className="ins-card-intro">{a.lead}</p> : null}
                      <div className="ins-card-meta">
                        <span>{formatArticleDate(locale, a.publishedAt)}</span>
                        <span aria-hidden>·</span>
                        <ArrowBtnIcon size={12} />
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="ins-cta">
        <div className="ins-cta-inner" style={{ gridTemplateColumns: "1fr" }}>
          <div>
            <h2 className="ins-cta-h2">
              Vraag over folie of lijn?
              <span>We denken technisch mee.</span>
            </h2>
            <p className="ins-cta-body">Neem contact op voor advies op maat — zonder verplichting.</p>
            <Link href={buildLocalizedPath(locale, [{ type: "key", key: "contact" }])} className="btn-primary">
              <span>Naar contact</span>
              <ArrowBtnIcon size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
