"use client";

import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { resolveInternalHref } from "@/lib/sanity/resolveInternalHref";
import { SimpleRichText } from "@/components/portable/SimpleRichText";
import { HeroMediaPanel } from "@/components/hero/HeroMedia";
import type { HeroMediaData } from "@/components/hero/heroMediaTypes";
import { ArrowBtnIcon } from "@/components/layout/icons";
import { useUILabels } from "@/components/providers/UILabelsProvider";

export type AboutPageDoc = {
  hero?: { headline?: string | null; subline?: string | null } | null;
  heroMedia?: HeroMediaData;
  storyBlocks?: { headline?: string | null; body?: unknown }[] | null;
  keyFacts?: { number?: string | null; label?: string | null; description?: string | null }[] | null;
  approach?: { headline?: string | null; body?: unknown } | null;
  cta?: {
    title?: string | null;
    buttonLabel?: string | null;
    buttonLink?: { _type?: string; slug?: string | null } | null;
  } | null;
};

export function AboutTemplate({ locale, aboutPage }: { locale: Locale; aboutPage: AboutPageDoc | null }) {
  const labels = useUILabels();
  const hero = aboutPage?.hero;
  const ctaHref = resolveInternalHref(locale, aboutPage?.cta?.buttonLink ?? null);

  return (
    <div className="abt-page">
      <section className="abt-hero">
        {hero?.headline ? <h1 className="abt-hero-h1">{hero.headline}</h1> : <h1 className="abt-hero-h1">Over Hobon</h1>}
        {hero?.subline ? <p className="abt-hero-sub">{hero.subline}</p> : null}
      </section>

      <HeroMediaPanel media={aboutPage?.heroMedia} className="page-hero-media s-hero-r listing-overview-hero-r" />

      {(aboutPage?.storyBlocks ?? []).map((block, i) => (
        <section key={`${block.headline ?? "s"}-${i}`} className="abt-story">
          {block.headline ? <h2 className="abt-story-h2">{block.headline}</h2> : null}
          <SimpleRichText value={block.body} />
        </section>
      ))}

      {(aboutPage?.keyFacts?.length ?? 0) > 0 ? (
        <section className="abt-kf">
          <h2 className="abt-kf-h2">{labels.aboutKeyFactsTitle}</h2>
          <div className="abt-kf-grid">
            {(aboutPage?.keyFacts ?? []).map((kf, i) => (
              <div key={`${kf.label ?? i}`} className="abt-kf-card">
                {kf.number ? <div className="abt-kf-num">{kf.number}</div> : null}
                {kf.label ? <div className="abt-kf-lbl">{kf.label}</div> : null}
                {kf.description ? <p className="abt-kf-desc">{kf.description}</p> : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {aboutPage?.approach?.headline || aboutPage?.approach?.body ? (
        <section className="abt-story">
          {aboutPage.approach.headline ? <h2 className="abt-story-h2">{aboutPage.approach.headline}</h2> : null}
          <SimpleRichText value={aboutPage.approach.body} />
        </section>
      ) : null}

      {aboutPage?.cta?.title ? (
        <section className="cta-band">
          <div className="cta-inner" style={{ gridTemplateColumns: "1fr" }}>
            <div>
              <h2 className="cta-h2">{aboutPage.cta.title}</h2>
              {ctaHref && aboutPage.cta.buttonLabel ? (
                <Link href={ctaHref} className="btn-primary">
                  <span>{aboutPage.cta.buttonLabel}</span>
                  <ArrowBtnIcon size={14} />
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
