/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/paths";
import { urlFor } from "@/lib/sanity/image";
import { ArrowBtnIcon } from "@/components/layout/icons";
import { ArticlePortableText } from "@/components/portable/ArticlePortableText";
import { estimateReadingMinutesFromPortableText } from "@/lib/insights/readingTime";

const HERO_FALLBACK =
  "https://images.unsplash.com/photo-1581090700227-1e37b190418e?w=1400&q=80&auto=format&fit=crop";

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

export function InsightDetailTemplate({ locale, article }: { locale: Locale; article: InsightArticleDetail }) {
  const insightsHref = buildLocalizedPath(locale, [{ type: "key", key: "insights" }]);
  const contactHref = buildLocalizedPath(locale, [{ type: "key", key: "contact" }]);
  const readMin = estimateReadingMinutesFromPortableText(article.body);
  const heroImg =
    article.featuredImage?.image != null
      ? urlFor(article.featuredImage.image as Parameters<typeof urlFor>[0]).width(1400).quality(82).url()
      : HERO_FALLBACK;

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
            <img src={heroImg} alt={article.featuredImage?.alt ?? article.title ?? ""} />
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
              const img =
                r.featuredImage?.image != null
                  ? urlFor(r.featuredImage.image as Parameters<typeof urlFor>[0]).width(520).quality(78).url()
                  : HERO_FALLBACK;
              return (
                <article key={r.slug} className="ins-card">
                  <Link href={href} className="ins-card-link">
                    <div className="ins-card-media">
                      <img src={img} alt={r.featuredImage?.alt ?? r.title ?? ""} />
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
          <Link href={insightsHref} className="ins-detail-back">
            Terug naar overzicht
          </Link>
        </section>
      )}

      <section className="ins-cta ins-cta--detail">
        <div className="ins-cta-inner" style={{ gridTemplateColumns: "1fr" }}>
          <div>
            <h2 className="ins-cta-h2">
              Heb je een verpakkingsvraag?
              <span>Bespreek het met ons</span>
            </h2>
            <p className="ins-cta-body">Onze specialisten vertalen uw lijncontext naar concrete foliekeuzes.</p>
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
