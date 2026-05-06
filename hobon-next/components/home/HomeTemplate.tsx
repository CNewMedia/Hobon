"use client";

/* eslint-disable @next/next/no-img-element -- mock parity / remote CDN images */
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/paths";
import { urlFor } from "@/lib/sanity/image";
import { ArrowBtnIcon } from "@/components/layout/icons";
import { useUILabels } from "@/components/providers/UILabelsProvider";

type Cta = { label?: string | null; href?: string | null } | null;

export type SectorCard = {
  _id: string;
  title: string;
  slug: string | null;
  sortOrder?: number | null;
  listingEyebrow?: string | null;
  listingDescription?: string | null;
  listingImageUrl?: string | null;
  listingPills?: string[] | null;
};

export type HomeData = {
  heroEyebrow?: string | null;
  heroH1Line1?: string | null;
  heroH1Accent?: string | null;
  heroH1Soft?: string | null;
  heroSub?: string | null;
  heroPrimaryCta?: Cta;
  heroSecondaryCta?: Cta;
  brcTitle?: string | null;
  brcSub?: string | null;
  tapeItems?: string[] | null;
  stats?: { kind?: string | null; value?: string | null; label?: string | null }[] | null;
  aboutTag?: string | null;
  aboutHeadline1?: string | null;
  aboutHeadlineSub?: string | null;
  aboutBody?: string | null;
  aboutImage?: {
    image?: unknown;
    alt?: string | null;
  } | null;
  aboutPhotoTag?: string | null;
  aboutPhotoCaption?: string | null;
  aboutFloatNum?: string | null;
  aboutFloatTitle?: string | null;
  aboutFloatSub?: string | null;
  usps?: { title?: string | null; body?: string | null }[] | null;
  processTag?: string | null;
  processTitle1?: string | null;
  processTitle2?: string | null;
  processCta?: Cta;
  processSteps?: { step?: string | null; title?: string | null; description?: string | null }[] | null;
  productsTag?: string | null;
  productsTitle1?: string | null;
  productsTitle2?: string | null;
  productCards?: {
    tag?: string | null;
    title?: string | null;
    description?: string | null;
    featured?: boolean | null;
    specs?: { key?: string | null; value?: string | null }[] | null;
    cta?: Cta;
  }[] | null;
  sectorsTag?: string | null;
  sectorsTitle1?: string | null;
  sectorsTitle2?: string | null;
  sectorsCta?: Cta;
  qualityBig?: string | null;
  qualityLabel?: string | null;
  qualityItems?: { num?: string | null; title?: string | null; description?: string | null }[] | null;
  contactTag?: string | null;
  contactHeadline1?: string | null;
  contactHeadline2?: string | null;
  contactBody?: string | null;
  contactTeam?: { initials?: string | null; name?: string | null; role?: string | null }[] | null;
  contactSidebarBody?: string | null;
  contactSidebarCta?: Cta;
};

export function HomeTemplate({
  locale,
  data,
  sectors,
}: {
  locale: Locale;
  data: HomeData;
  sectors: SectorCard[];
}) {
  const labels = useUILabels();
  const contactHref = buildLocalizedPath(locale, [{ type: "key", key: "contact" }]);
  const sectorsBase = buildLocalizedPath(locale, [{ type: "key", key: "sectors" }]);

  const aboutImg =
    data.aboutImage?.image != null
      ? urlFor(data.aboutImage.image).width(800).quality(80).url()
      : "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=800&q=80&auto=format&fit=crop";

  return (
    <>
      <section className="hero" id="home">
        <div className="hero-dots" aria-hidden="true" />
        <div className="hero-glow" id="heroGlow" aria-hidden="true" />
        <div className="hero-glow-orange" aria-hidden="true" />

        <div className="hero-l">
          <div className="hero-eyebrow">
            <div className="hero-eyebrow-line" />
            <span className="hero-eyebrow-txt">{data.heroEyebrow}</span>
          </div>
          <h1 className="hero-h1">
            {data.heroH1Line1}
            <br />
            <span className="accent">{data.heroH1Accent}</span>
            <br />
            <span className="soft">{data.heroH1Soft}</span>
          </h1>
          {data.heroSub ? (
            <p className="hero-sub" dangerouslySetInnerHTML={{ __html: data.heroSub }} />
          ) : null}
          <div className="hero-btns">
            <Link href={data.heroPrimaryCta?.href ?? contactHref} className="btn-primary">
              <span>{data.heroPrimaryCta?.label}</span>
              <ArrowBtnIcon />
            </Link>
            <Link href={data.heroSecondaryCta?.href ?? "#sectoren"} className="btn-secondary">
              <span>{data.heroSecondaryCta?.label}</span>
              <ArrowBtnIcon size={14} />
            </Link>
          </div>
          <div className="hero-brc">
            <div className="hero-brc-badge">
              <span className="hero-brc-badge-big">AA</span>
              <span className="hero-brc-badge-sm">BRC</span>
            </div>
            <div className="hero-brc-info">
              <span className="hero-brc-title">{data.brcTitle}</span>
              <span className="hero-brc-sub">{data.brcSub}</span>
            </div>
          </div>
        </div>

        <div className="s-hero-r">
          <div className="s-hero-r-main">
            <video
              autoPlay
              muted
              loop
              playsInline
              poster="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=1200&q=80&auto=format&fit=crop"
            >
              <source src="/assets/video/Hobon-intro-web.mp4" type="video/mp4" />
            </video>
          </div>
          <div className="s-hero-r-overlay" />
        </div>

        <div className="hero-scroll" aria-hidden="true">
          <span className="hero-scroll-txt">{labels.homeScroll}</span>
          <div className="scroll-bar">
            <div className="scroll-fill" />
          </div>
        </div>
      </section>

      <div className="tape" aria-hidden="true">
        <div className="tape-track">
          {(data.tapeItems ?? []).map((item) => (
            <span key={item} className="tape-item">
              {item}
              <span className="tape-dot" />
            </span>
          ))}
        </div>
      </div>

      <div className="numbers">
        {(data.stats ?? []).map((s, i) => (
          <div key={`${s.label}-${i}`} className={`num rv${i ? ` d${i}` : ""}`}>
            <div className="num-val">
              {s.kind === "number" ? (
                <>
                  <span className="count" data-target={String(s.value).replace("+", "")}>
                    0
                  </span>
                  {i === 0 ? <sup>+</sup> : null}
                </>
              ) : (
                <span className={s.value === "BRC AA" ? "num-val--sm" : "num-val--md"}>{s.value}</span>
              )}
            </div>
            <div className="num-lbl">{s.label}</div>
          </div>
        ))}
      </div>

      <section className="pos" id="over">
        <div>
          <div className="sec-tag rv">
            <div className="sec-tag-line" />
            <span className="sec-tag-txt">{data.aboutTag}</span>
          </div>
          <h2 className="rv d1">
            <span className="pos-h2" dangerouslySetInnerHTML={{ __html: data.aboutHeadline1 ?? "" }} />
            <span className="pos-h2-sub">{data.aboutHeadlineSub}</span>
          </h2>
          {data.aboutBody ? (
            <p className="pos-body rv d2" dangerouslySetInnerHTML={{ __html: data.aboutBody }} />
          ) : null}
          <div className="usps">
            {(data.usps ?? []).map((u, idx) => (
              <div key={u.title} className={`usp rv d${idx + 2}`}>
                <span className="usp-n">0{idx + 1}</span>
                <div>
                  <div className="usp-title">{u.title}</div>
                  <p className="usp-desc">{u.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="about-photo-wrap rvr d2">
          <div className="about-photo">
            <img src={aboutImg} alt={data.aboutImage?.alt ?? ""} />
            <div className="about-photo-overlay" />
            <div className="about-photo-caption">
              <span className="about-photo-tag">{data.aboutPhotoTag}</span>
              <p className="about-photo-txt">{data.aboutPhotoCaption}</p>
            </div>
          </div>
          <div className="pos-float">
            <div className="pos-float-num">{data.aboutFloatNum}</div>
            <div
              className="pos-float-lbl"
              dangerouslySetInnerHTML={{
                __html: `<strong>${data.aboutFloatTitle ?? ""}</strong>${data.aboutFloatSub ?? ""}`,
              }}
            />
          </div>
        </div>
      </section>

      <section className="process" id="werkwijze">
        <div className="process-hdr">
          <div>
            <div className="sec-tag rv">
              <div className="sec-tag-line" />
              <span className="sec-tag-txt">{data.processTag}</span>
            </div>
            <h2 className="process-h2 rv d1">
              {data.processTitle1}
              <span>{data.processTitle2}</span>
            </h2>
          </div>
          <Link href={data.processCta?.href ?? contactHref} className="btn-secondary btn-secondary--navy rv d2">
            <span>{data.processCta?.label}</span>
            <ArrowBtnIcon size={14} />
          </Link>
        </div>
        <div className="process-grid">
          {(data.processSteps ?? []).map((ps, i) => (
            <div key={ps.title} className={`ps rv ${i ? `d${i}` : ""}`}>
              <div className="ps-accent" />
              <div className="ps-n">0{i + 1}</div>
              <span className="ps-step">{ps.step}</span>
              <h3 className="ps-title">{ps.title}</h3>
              <p className="ps-desc">{ps.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="products" id="producten">
        <div className="products-hdr">
          <div>
            <div className="sec-tag rv">
              <div className="sec-tag-line" />
              <span className="sec-tag-txt">{data.productsTag}</span>
            </div>
            <h2 className="products-h2 rv d1">
              {data.productsTitle1}
              <span>{data.productsTitle2}</span>
            </h2>
          </div>
        </div>
        <div className="prod-grid" data-pc-count={(data.productCards ?? []).length}>
          {(data.productCards ?? []).map((pc) => (
            <div key={pc.title} className={`pc rv ${pc.featured ? "featured" : "d1"}`}>
              {pc.tag ? <span className="pc-tag">{pc.tag}</span> : null}
              <h3 className="pc-title">{pc.title}</h3>
              {pc.description?.trim() ? <p className="pc-desc">{pc.description}</p> : null}
              {pc.specs?.length ? (
                <div className="pc-specs">
                  {pc.specs.map((sp) => (
                    <div key={sp.key} className="pc-spec">
                      <span className="pc-spec-k">{sp.key}</span>
                      <span className="pc-spec-v">{sp.value}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              {pc.cta?.href ? (
                <Link href={pc.cta.href} className="pc-cta">
                  {pc.cta.label}
                  <ArrowBtnIcon size={11} />
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section className="sectors" id="sectoren">
        <div className="sectors-hdr">
          <div>
            <div className="sec-tag rv">
              <div className="sec-tag-line" />
              <span className="sec-tag-txt">{data.sectorsTag}</span>
            </div>
            <h2 className="sectors-h2 rv d1">
              {data.sectorsTitle1}
              <span>{data.sectorsTitle2}</span>
            </h2>
          </div>
          <Link href={data.sectorsCta?.href ?? sectorsBase} className="sectors-cta rv d2">
            <span>{data.sectorsCta?.label}</span>
            <ArrowBtnIcon size={13} />
          </Link>
        </div>
        <div className="s-scroll">
          <div className="s-rail" id="sRail">
            {sectors.map((sc, idx) => {
              const href =
                sc.slug != null
                  ? buildLocalizedPath(locale, [
                      { type: "key", key: "sectors" },
                      { type: "slug", value: sc.slug },
                    ])
                  : sectorsBase;
              const img =
                sc.listingImageUrl ??
                "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=70&auto=format&fit=crop";
              const n = String(sc.sortOrder ?? idx + 1).padStart(2, "0");
              return (
                <Link key={sc._id} href={href} className="sc">
                  <div className="sc-img">
                    <img src={img} alt={sc.title} />
                    <div className="sc-img-overlay" />
                  </div>
                  <div className="sc-body">
                    <div className="sc-bg-n">{n}</div>
                    <span className="sc-tag">{sc.listingEyebrow ?? labels.homeSectorFallback}</span>
                    <h3 className="sc-title">{sc.title}</h3>
                    <p className="sc-desc">{sc.listingDescription}</p>
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
            })}
          </div>
        </div>
        <div className="s-hint">
          <div className="s-hint-icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M8 12h8M4 8l-2 4 2 4M20 8l2 4-2 4"
                stroke="rgba(255,255,255,.25)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <span>{labels.homeDragSectors}</span>
        </div>
      </section>

      <div className="quality">
        <div className="quality-l rvl">
          <div className="quality-big" dangerouslySetInnerHTML={{ __html: data.qualityBig ?? "" }} />
          <div className="quality-lbl" dangerouslySetInnerHTML={{ __html: data.qualityLabel ?? "" }} />
        </div>
        <div className="quality-r rvr">
          <div className="quality-items">
            {(data.qualityItems ?? []).map((q) => (
              <div key={q.title} className="qi">
                <span className="qi-n">{q.num}</span>
                <div>
                  <div className="qi-title">{q.title}</div>
                  <p className="qi-desc">{q.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="contact" id="contact">
        <div className="contact-grid">
          <div>
            <div className="sec-tag rv">
              <div className="sec-tag-line" />
              <span className="sec-tag-txt">{data.contactTag}</span>
            </div>
            <h2 className="contact-h2 rv d1">
              {data.contactHeadline1}
              <span>{data.contactHeadline2}</span>
            </h2>
            {data.contactBody ? (
              <p className="contact-body rv d2" dangerouslySetInnerHTML={{ __html: data.contactBody }} />
            ) : null}
            <div className="contact-team rv d3">
              {(data.contactTeam ?? []).map((m) => (
                <div key={m.name} className="ct">
                  <div className="ct-av">{m.initials}</div>
                  <div>
                    <div className="ct-name">{m.name}</div>
                    <div className="ct-role">{m.role}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rv d2 cf-cta">
            <p className="contact-body">{data.contactSidebarBody}</p>
            <Link href={data.contactSidebarCta?.href ?? contactHref} className="btn-primary">
              <span>{data.contactSidebarCta?.label}</span>
              <ArrowBtnIcon />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
