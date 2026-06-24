/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/paths";
import { imageWithAltToUrl, resolveImageSrc } from "@/lib/sanity/resolveImageSrc";
import { ArrowBtnIcon } from "@/components/layout/icons";
import { ArticlePortableText } from "@/components/portable/ArticlePortableText";
import { estimateReadingMinutesFromPortableText } from "@/lib/insights/readingTime";

export type InsightArticleDetail = {
  title?: string | null;
  slug?: string | null;
  lead?: string | null;
  publishedAt?: string | null;
  body?: unknown;
  featuredImage?: { image?: unknown; alt?: string | null } | null;
  category?: { title?: string | null; slug?: string | null } | null;
  relatedArticles?: {
    title?: string | null;
    slug?: string | null;
    lead?: string | null;
    publishedAt?: string | null;
    featuredImage?: { image?: unknown; alt?: string | null } | null;
    category?: { title?: string | null } | null;
  }[] | null;
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

function articleHeroSrc(
  featuredImage: InsightArticleDetail["featuredImage"],
  fallbackSrc: string | null,
  width: number,
) {
  const featured = resolveImageSrc(featuredImage, { width, quality: width >= 1000 ? 82 : 78 });
  return {
    src: featured.src ?? fallbackSrc,
    alt: featured.alt || featuredImage?.alt || "",
  };
}

export function InsightDetailTemplate({
  locale,
  article,
  cardFallbackImage,
}: {
  locale: Locale;
  article: InsightArticleDetail;
  cardFallbackImage?: { image?: unknown; alt?: string | null } | null;
}) {
  const insightsHref = buildLocalizedPath(locale, [{ type: "key", key: "insights" }]);
  const contactHref = buildLocalizedPath(locale, [{ type: "key", key: "contact" }]);
  const readMin = estimateReadingMinutesFromPortableText(article.body);
  const cardFallbackSrc = imageWithAltToUrl(cardFallbackImage, { width: 640, quality: 80 });
  const hero = articleHeroSrc(article.featuredImage, cardFallbackSrc, 1400);

  const related = (article.relatedArticles ?? []).filter((r) => r.slug);

  return (
    <div className="ins-detail-page">
      <article className="ins-detail">
        <header className="ins-detail-hero">
          <div className="ins-detail-meta">
            <Link href={insightsHref} className="ins-detail-back">
              Terug naar insights
            </Link>
            {article.category?.title ? <span className="ins-detail-cat">{article.category.title}</span> : null}
            <div className="ins-detail-meta-row">
              <span>{formatArticleDate(locale, article.publishedAt)}</span>
              <span aria-hidden>·</span>
              <span>{readMin} min leestijd</span>
            </div>
          </div>
          <h1 className="ins-detail-title">{article.title}</h1>
          {article.lead ? <p className="ins-detail-intro">{article.lead}</p> : null}
          <div className="ins-detail-hero-media">
            {hero.src ? (
              <img src={hero.src} alt={hero.alt || article.title || ""} />
            ) : (
              <CardImagePlaceholder />
            )}
          </div>
        </header>

        <div className="ins-detail-body" style={{ gridTemplateColumns: "1fr" }}>
          <div className="ins-detail-main">
            <ArticlePortableText value={article.body} />
          </div>
        </div>
      </article>

      {related.length > 0 ? (
        <section className="ins-related">
          <div className="ins-related-hdr">
            <h2 className="ins-related-h2">
              Verder lezen
              <span>Gerelateerde artikels</span>
            </h2>
          </div>
          <div className="ins-related-grid">
            {related.slice(0, 3).map((r) => {
              const href = buildLocalizedPath(locale, [
                { type: "key", key: "insights" },
                { type: "slug", value: r.slug as string },
              ]);
              const card = articleHeroSrc(r.featuredImage, cardFallbackSrc, 520);
              return (
                <article key={r.slug} className="ins-card">
                  <Link href={href} className="ins-card-link">
                    <div className="ins-card-media">
                      {card.src ? (
                        <img src={card.src} alt={card.alt || r.title || ""} />
                      ) : (
                        <CardImagePlaceholder />
                      )}
                    </div>
                    <div className="ins-card-body">
                      {r.category?.title ? <span className="ins-card-cat">{r.category.title}</span> : null}
                      <h3 className="ins-card-title">{r.title}</h3>
                      {r.lead ? <p className="ins-card-intro">{r.lead}</p> : null}
                      <div className="ins-card-meta">
                        <span>{formatArticleDate(locale, r.publishedAt)}</span>
                        <ArrowBtnIcon size={12} />
                      </div>
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="ins-list" style={{ paddingTop: 48 }}>
          <Link href={insightsHref} className="btn-primary">
            <span>Alle insights</span>
            <ArrowBtnIcon size={14} />
          </Link>
        </section>
      )}

      <section className="ins-cta">
        <div className="ins-cta-inner" style={{ gridTemplateColumns: "1fr" }}>
          <div>
            <h2 className="ins-cta-h2">
              Vraag over folie of lijn?
              <span>We denken technisch mee.</span>
            </h2>
            <p className="ins-cta-body">Neem contact op voor advies op maat — zonder verplichting.</p>
            <Link href={contactHref} className="btn-primary">
              <span>Naar contact</span>
              <ArrowBtnIcon size={14} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
