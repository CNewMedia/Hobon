/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { Fragment } from "react";
import type { Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/paths";
import { urlFor } from "@/lib/sanity/image";
import { ArrowBtnIcon } from "@/components/layout/icons";
import { SectorCtaForm } from "./SectorCtaForm";
import { SectorFaqs, type FaqItem } from "./SectorFaqs";

export type SectorNav = { slug: string | null; navLabel?: string | null; title: string };

export type SectorDoc = {
  title?: string | null;
  slug?: { current?: string | null } | null;
  navLabel?: string | null;
  heroEyebrow?: string | null;
  heroHeadline?: string[] | null;
  heroIntro?: string | null;
  heroPrimaryCta?: { label?: string | null; href?: string | null } | null;
  heroSecondaryCta?: { label?: string | null; href?: string | null } | null;
  heroMainImageUrl?: string | null;
  heroMainImage?: { image?: unknown; alt?: string | null } | null;
  heroThumbs?: { imageUrl?: string | null; label?: string | null }[] | null;
  tapeItems?: string[] | null;
  problemBand?: {
    variant?: string | null;
    label?: string | null;
    title?: string | null;
    description?: string | null;
  }[] | null;
  solutionsTag?: string | null;
  solutionsTitle1?: string | null;
  solutionsTitle2?: string | null;
  solutionsCta?: { label?: string | null; href?: string | null } | null;
  solutionCards?: {
    imageUrl?: string | null;
    num?: string | null;
    title?: string | null;
    description?: string | null;
    tags?: string[] | null;
    cta?: { label?: string | null; href?: string | null } | null;
  }[] | null;
  uspStrip?: { num?: string | null; title?: string | null; description?: string | null }[] | null;
  deepTag?: string | null;
  deepTitle1?: string | null;
  deepTitle2?: string | null;
  deepBody?: string | null;
  deepPhotoUrl?: string | null;
  deepPhotoCaptionTag?: string | null;
  deepPhotoCaption?: string | null;
  deepPrimaryCta?: { label?: string | null; href?: string | null } | null;
  deepFaqs?: FaqItem[] | null;
  complianceBig?: string | null;
  complianceIntro?: string | null;
  complianceItems?: { num?: string | null; title?: string | null; description?: string | null }[] | null;
  caseStudies?: {
    featured?: boolean | null;
    imageUrl?: string | null;
    sectorLabel?: string | null;
    title?: string | null;
    description?: string | null;
    resultValue?: string | null;
    resultLabel?: string | null;
    quote?: string | null;
    quoteAttr?: string | null;
  }[] | null;
  ctaBandTag?: string | null;
  ctaBandTitle1?: string | null;
  ctaBandTitle2?: string | null;
  ctaBandBody?: string | null;
  ctaBandTeam?: { initials?: string | null; name?: string | null; role?: string | null }[] | null;
};

export function SectorTemplate({
  locale,
  sector,
  navSectors,
  currentSlug,
}: {
  locale: Locale;
  sector: SectorDoc;
  navSectors: SectorNav[];
  currentSlug: string;
}) {
  const contactHref = buildLocalizedPath(locale, [{ type: "key", key: "contact" }]);

  const mainImg =
    sector.heroMainImage?.image != null
      ? urlFor(sector.heroMainImage.image).width(1000).quality(80).url()
      : sector.heroMainImageUrl ??
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&q=80&auto=format&fit=crop";

  const deepPhoto =
    sector.deepPhotoUrl ??
    "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=700&q=80&auto=format&fit=crop";

  return (
    <>
      <section className="s-hero">
        <div className="s-hero-dots" aria-hidden="true" />
        <div className="s-hero-glow" aria-hidden="true" />

        <div className="s-hero-l">
          <div className="s-hero-sector-nav">
            {navSectors.map((s) => {
              if (!s.slug) return null;
              const href = buildLocalizedPath(locale, [
                { type: "key", key: "sectors" },
                { type: "slug", value: s.slug },
              ]);
              const active = s.slug === currentSlug;
              return (
                <Link key={s.slug} href={href} className={`sn-item ${active ? "active" : ""}`}>
                  {s.navLabel ?? s.title}
                </Link>
              );
            })}
          </div>

          <div className="s-hero-eyebrow">
            <div className="s-hero-eyebrow-line" />
            <span className="s-hero-eyebrow-txt">{sector.heroEyebrow}</span>
          </div>

          <h1 className="s-hero-h1">
            {(sector.heroHeadline ?? []).map((line, i, arr) => (
              <Fragment key={`${line}-${i}`}>
                {i > 0 ? <br /> : null}
                {i === arr.length - 1 ? <span className="soft">{line}</span> : line}
              </Fragment>
            ))}
          </h1>

          {sector.heroIntro ? (
            <p className="s-hero-intro" dangerouslySetInnerHTML={{ __html: sector.heroIntro }} />
          ) : null}

          <div className="s-hero-btns">
            <Link href={sector.heroPrimaryCta?.href ?? contactHref} className="btn-primary">
              <span>{sector.heroPrimaryCta?.label}</span>
              <ArrowBtnIcon size={14} />
            </Link>
            <Link href={sector.heroSecondaryCta?.href ?? "#oplossingen"} className="btn-ghost">
              <span>{sector.heroSecondaryCta?.label}</span>
              <ArrowBtnIcon size={13} />
            </Link>
          </div>

          <div className="s-hero-certs">
            <div className="cert-badge">
              <div className="cert-badge-icon">
                <span className="cert-badge-big">AA</span>
                <span className="cert-badge-sm">BRC</span>
              </div>
              <div className="cert-badge-info">
                <span className="cert-badge-title">BRC Packaging Level AA</span>
                <span className="cert-badge-sub">Hoogste certificeringsniveau</span>
              </div>
            </div>
            <div className="cert-sep" />
            <div className="cert-stat">
              <div className="cert-stat-val">40+</div>
              <div className="cert-stat-lbl">Jaar food-expertise</div>
            </div>
            <div className="cert-sep" />
            <div className="cert-stat">
              <div className="cert-stat-val">Virgin</div>
              <div className="cert-stat-lbl">Materialen voor voeding</div>
            </div>
          </div>
        </div>

        <div className="s-hero-r">
          <div className="s-hero-r-main">
            <img src={mainImg} alt={sector.heroMainImage?.alt ?? sector.title ?? ""} />
          </div>
          <div
            className="s-hero-r-overlay"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.0) 100%)",
            }}
          />
          <div className="s-hero-thumbs">
            {(sector.heroThumbs ?? []).map((t) => (
              <div key={t.label} className="s-hero-thumb">
                <img src={t.imageUrl ?? ""} alt={t.label ?? ""} />
                <span className="s-hero-thumb-lbl">{t.label}</span>
              </div>
            ))}
          </div>
          <div className="s-hero-scroll">
            <span className="s-hero-scroll-txt">Scroll</span>
            <div className="s-hero-scroll-bar">
              <div className="s-hero-scroll-fill" />
            </div>
          </div>
        </div>
      </section>

      <div className="tape" aria-hidden="true">
        <div className="tape-track">
          {(sector.tapeItems ?? []).map((item) => (
            <span key={item} className="tape-item">
              {item}
              <span className="tape-dot" />
            </span>
          ))}
        </div>
      </div>

      <section className="prob-band">
        {(sector.problemBand ?? []).map((col, i) => (
          <Fragment key={col.title}>
            <div className={`prob-col rv ${i ? `d${i}` : ""}`}>
              <div className="prob-label">
                <div
                  className="prob-label-icon"
                  style={
                    col.variant === "approach"
                      ? { background: "rgba(26,45,107,.8)" }
                      : undefined
                  }
                >
                  {col.variant === "approach" ? (
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path
                        d="M4 8h8M8 12l4-4-4-4"
                        stroke="white"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path d="M8 3v5M8 11v1" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                {col.label}
              </div>
              <h3 className="prob-title">{col.title}</h3>
              <p className="prob-desc">{col.description}</p>
            </div>
            {i < (sector.problemBand?.length ?? 0) - 1 ? <div className="prob-divider" /> : null}
          </Fragment>
        ))}
      </section>

      <section className="solutions" id="oplossingen">
        <div className="solutions-hdr">
          <div>
            <div className="sec-tag rv">
              <div className="sec-tag-line" />
              <span className="sec-tag-txt">{sector.solutionsTag}</span>
            </div>
            <h2 className="solutions-h2 rv d1">
              {sector.solutionsTitle1}
              <span>{sector.solutionsTitle2}</span>
            </h2>
          </div>
          <Link
            href={sector.solutionsCta?.href ?? contactHref}
            className="btn-ghost rv d2"
            style={{ color: "rgba(26,45,107,.5)", borderColor: "rgba(26,45,107,.2)" }}
          >
            <span style={{ color: "var(--navy)" }}>{sector.solutionsCta?.label}</span>
            <ArrowBtnIcon size={13} />
          </Link>
        </div>
        <div
          className="sol-grid"
          data-sol-count={(sector.solutionCards ?? []).length}
        >
          {(sector.solutionCards ?? []).map((sol, i) => (
            <div key={sol.title} className={`sol rv ${i ? `d${i % 4}` : ""}`}>
              <div className="sol-photo">
                <img src={sol.imageUrl ?? ""} alt={sol.title ?? ""} />
                <div className="sol-photo-overlay" />
              </div>
              <span className="sol-n">{sol.num}</span>
              <h3 className="sol-title">{sol.title}</h3>
              <p className="sol-desc">{sol.description}</p>
              <div className="sol-specs">
                {(sol.tags ?? []).map((tag) => (
                  <span key={tag} className="sol-spec">
                    {tag}
                  </span>
                ))}
              </div>
              <Link href={sol.cta?.href ?? contactHref} className="sol-cta">
                {sol.cta?.label ?? "Meer info"}
                <ArrowBtnIcon size={11} />
              </Link>
            </div>
          ))}
        </div>
      </section>

      <div className="usp-strip">
        {(sector.uspStrip ?? []).map((u, i) => (
          <div key={u.title} className={`usp-s rv ${i ? `d${i}` : ""}`}>
            <div className="usp-s-n">{u.num}</div>
            <div className="usp-s-icon" aria-hidden>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 3l1.5 4.5H18l-3.75 2.75L15.75 15 12 12.25 8.25 15l1.5-4.75L6 7.5h4.5L12 3z"
                  stroke="rgba(245,163,0,.8)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="usp-s-title">{u.title}</div>
            <p className="usp-s-desc">{u.description}</p>
          </div>
        ))}
      </div>

      <section className="deep">
        <div className="deep-grid">
          <div className="deep-sticky rvl">
            <div className="sec-tag">
              <div className="sec-tag-line" />
              <span className="sec-tag-txt">{sector.deepTag}</span>
            </div>
            <h2 className="deep-h2">
              {sector.deepTitle1}
              <span>{sector.deepTitle2}</span>
            </h2>
            {sector.deepBody ? (
              <p className="deep-body" dangerouslySetInnerHTML={{ __html: sector.deepBody }} />
            ) : null}
            <div className="deep-photo">
              <img src={deepPhoto} alt="" />
              <div className="deep-photo-cap">
                <div className="deep-photo-cap-tag">{sector.deepPhotoCaptionTag}</div>
                <div className="deep-photo-cap-txt">{sector.deepPhotoCaption}</div>
              </div>
            </div>
            <Link href={sector.deepPrimaryCta?.href ?? contactHref} className="btn-primary">
              <span>{sector.deepPrimaryCta?.label}</span>
              <ArrowBtnIcon size={14} />
            </Link>
          </div>
          <div>
            <div className="sec-tag rvr">
              <div className="sec-tag-line" />
              <span className="sec-tag-txt">Veelgestelde uitdagingen</span>
            </div>
            <SectorFaqs items={sector.deepFaqs ?? []} />
          </div>
        </div>
      </section>

      <div className="compliance">
        <div className="comp-l rvl">
          <div className="comp-big" dangerouslySetInnerHTML={{ __html: sector.complianceBig ?? "" }} />
          <div className="comp-sub" dangerouslySetInnerHTML={{ __html: sector.complianceIntro ?? "" }} />
        </div>
        <div className="comp-r rvr">
          <div className="sec-tag" style={{ marginBottom: 28 }}>
            <div className="sec-tag-line" />
            <span className="sec-tag-txt">Compliance garanties</span>
          </div>
          <div className="comp-items">
            {(sector.complianceItems ?? []).map((c) => (
              <div key={c.title} className="ci">
                <span className="ci-n">{c.num}</span>
                <div>
                  <div className="ci-title">{c.title}</div>
                  <p className="ci-desc">{c.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="cases">
        <div className="cases-hdr">
          <div className="sec-tag rv">
            <div className="sec-tag-line" />
            <span className="sec-tag-txt">Toepassingen in de praktijk</span>
          </div>
          <h2 className="cases-h2 rv d1">
            Typische uitdagingen<span>die wij oplossen</span>
          </h2>
        </div>
        <div className="cases-grid">
          {(sector.caseStudies ?? []).map((cs, i) => (
            <div key={cs.title} className={`case rv ${cs.featured ? "featured" : i ? `d${i}` : ""}`}>
              <div className="case-photo">
                <img src={cs.imageUrl ?? ""} alt="" />
                <div className="case-photo-overlay" />
              </div>
              <span className="case-sector">{cs.sectorLabel}</span>
              <h3 className="case-title">{cs.title}</h3>
              <p className="case-desc">{cs.description}</p>
              <div className="case-result">
                <span className="case-result-val">{cs.resultValue}</span>
                <span
                  className="case-result-lbl"
                  dangerouslySetInnerHTML={{ __html: (cs.resultLabel ?? "").replace(/\n/g, "<br/>") }}
                />
              </div>
              {cs.quote ? (
                <div className="case-quote">
                  <p className="case-quote-txt">{cs.quote}</p>
                  <span className="case-quote-attr">{cs.quoteAttr}</span>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="other-sectors">
        <div className="sec-tag rv">
          <div className="sec-tag-line" />
          <span className="sec-tag-txt">Andere sectoren</span>
        </div>
        <h2 className="os-h2 rv d1">Ook actief in</h2>
        <div className="os-grid rv d2">
          {navSectors
            .filter((s) => s.slug && s.slug !== currentSlug)
            .map((s) => (
              <Link
                key={s.slug}
                href={buildLocalizedPath(locale, [
                  { type: "key", key: "sectors" },
                  { type: "slug", value: s.slug ?? "" },
                ])}
                className="os-item"
              >
                <div className="os-item-photo">
                  <img
                    src="https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&q=65&auto=format&fit=crop"
                    alt=""
                  />
                  <div className="os-item-photo-overlay" />
                </div>
                <div className="os-item-body">
                  <div className="os-item-title">{s.title}</div>
                  <div className="os-item-sub">{s.navLabel ?? ""}</div>
                </div>
                <div className="os-item-arrow">
                  <ArrowBtnIcon size={10} />
                </div>
              </Link>
            ))}
        </div>
      </section>

      <section className="cta-band" id="contact">
        <div className="cta-inner">
          <div>
            <div className="sec-tag rv" style={{ marginBottom: 18 }}>
              <div className="sec-tag-line" />
              <span className="sec-tag-txt" style={{ color: "rgba(245,163,0,.7)" }}>
                {sector.ctaBandTag}
              </span>
            </div>
            <h2 className="cta-h2 rv d1">
              {sector.ctaBandTitle1}
              <span>{sector.ctaBandTitle2}</span>
            </h2>
            {sector.ctaBandBody ? (
              <p className="cta-body rv d2" dangerouslySetInnerHTML={{ __html: sector.ctaBandBody }} />
            ) : null}
            <div className="cta-team rv d3">
              {(sector.ctaBandTeam ?? []).map((m) => (
                <div key={m.name} className="cta-ct">
                  <div className="cta-av">{m.initials}</div>
                  <div>
                    <div className="cta-name">{m.name}</div>
                    <div className="cta-role">{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rv d2">
            <SectorCtaForm />
          </div>
        </div>
      </section>

    </>
  );
}
