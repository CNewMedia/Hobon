"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/paths";
import { urlFor } from "@/lib/sanity/image";
import { ArrowBtnIcon } from "@/components/layout/icons";
import { SectorCtaForm } from "@/components/sector/SectorCtaForm";
import { SimpleRichText } from "@/components/portable/SimpleRichText";
import { useUILabels } from "@/components/providers/UILabelsProvider";

export type RelatedSector = {
  _id?: string;
  title?: string | null;
  slug?: string | null;
  navLabel?: string | null;
  listingDescription?: string | null;
  listingImageUrl?: string | null;
};

export type ProductDoc = {
  title?: string | null;
  slug?: { current?: string | null } | null;
  heroEyebrow?: string | null;
  heroHeadline?: string | null;
  heroIntro?: string | null;
  heroPrimaryCta?: { label?: string | null; href?: string | null } | null;
  heroSecondaryCta?: { label?: string | null; href?: string | null } | null;
  heroImage?: { image?: unknown; alt?: string | null } | null;
  specifications?: { title?: string | null; body?: string | null; icon?: string | null }[] | null;
  applications?: string[] | null;
  whyHobonTitle?: string | null;
  whyHobonBody?: string | null;
  relatedSectors?: RelatedSector[] | null;
  ctaBandTitle1?: string | null;
  ctaBandBody?: string | null;
  ctaBandPrimary?: { label?: string | null; href?: string | null } | null;
  additionalNotes?: unknown;
  /** Legacy veld tot datasets opgeschoond zijn */
  body?: unknown;
  lead?: string | null;
};

function hasRichLayout(p: ProductDoc) {
  return Boolean(p.heroHeadline?.trim() || p.heroEyebrow?.trim());
}

export function ProductTemplate({
  locale,
  product,
}: {
  locale: Locale;
  product: ProductDoc;
}) {
  const labels = useUILabels();
  const contactHref = buildLocalizedPath(locale, [{ type: "key", key: "contact" }]);
  const productsHref = buildLocalizedPath(locale, [{ type: "key", key: "products" }]);

  const heroImg =
    product.heroImage?.image != null
      ? urlFor(product.heroImage.image as Parameters<typeof urlFor>[0]).width(1000).quality(80).url()
      : null;

  if (!hasRichLayout(product)) {
    return (
      <section className="bg-[var(--chalk)] px-6 py-20 md:px-[52px] md:py-28">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-[family-name:var(--f-head)] text-[clamp(32px,4vw,48px)] font-bold leading-[0.98] tracking-[-0.02em] text-[var(--navy)]">
            {product.title ?? "Product"}
          </h1>
          {product.lead ? (
            <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-[#5a5f72]">{product.lead}</p>
          ) : null}
          <div className="mt-8">
            <SimpleRichText value={product.additionalNotes ?? product.body} />
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="s-hero">
        <div className="s-hero-dots" aria-hidden="true" />
        <div className="s-hero-glow" aria-hidden="true" />

        <div className="s-hero-l">
          <div className="p-hero-breadcrumb">
            <Link href={productsHref} className="p-hero-back">
              {labels.productAllProducts}
            </Link>
          </div>

          <div className="s-hero-eyebrow">
            <div className="s-hero-eyebrow-line" />
            <span className="s-hero-eyebrow-txt">{product.heroEyebrow}</span>
          </div>

          <h1 className="s-hero-h1 p-hero-h1">
            <span className="whitespace-pre-line">{product.heroHeadline}</span>
          </h1>

          {product.heroIntro ? <p className="s-hero-intro whitespace-pre-line">{product.heroIntro}</p> : null}

          <div className="s-hero-btns">
            <Link href={product.heroPrimaryCta?.href ?? contactHref} className="btn-primary">
              <span>{product.heroPrimaryCta?.label}</span>
              <ArrowBtnIcon size={14} />
            </Link>
            <Link href={product.heroSecondaryCta?.href ?? "#specs"} className="btn-ghost">
              <span>{product.heroSecondaryCta?.label}</span>
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
                <span className="cert-badge-sub">{labels.productHighestCertLevel}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="s-hero-r">
          <div className="s-hero-r-main">
            {heroImg ? (
              <img src={heroImg} alt={product.heroImage?.alt ?? product.title ?? ""} />
            ) : (
              <div className="p-hero-placeholder" aria-hidden="true">
                <div className="p-hero-placeholder-grid" />
                <span className="p-hero-placeholder-label">Hobon</span>
              </div>
            )}
          </div>
          <div
            className="s-hero-r-overlay"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.2) 60%, rgba(0,0,0,0.0) 100%)",
            }}
          />
        </div>
      </section>

      <section className="p-specs" id="specs">
        <div className="p-specs-inner">
          <div className="sec-tag rv">
            <div className="sec-tag-line" />
            <span className="sec-tag-txt">{labels.productTechnical}</span>
          </div>
          <h2 className="p-specs-h2 rv d1">{labels.productSpecifications}</h2>
          <div className="p-spec-grid">
            {(product.specifications ?? []).map((row, i) => (
              <div key={row.title ?? i} className={`p-spec-card rv ${i ? `d${i % 4}` : ""}`}>
                {row.icon ? <span className="p-spec-icon">{row.icon}</span> : null}
                <h3 className="p-spec-title">{row.title}</h3>
                {row.body ? <p className="p-spec-body">{row.body}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="p-apps" id="applications">
        <div className="p-apps-inner">
          <div className="sec-tag rv">
            <div className="sec-tag-line" />
            <span className="sec-tag-txt">{labels.productApplications}</span>
          </div>
          <h2 className="p-apps-h2 rv d1">{labels.productApplicationsQuestion}</h2>
          <div className="p-app-tags rv d2">
            {(product.applications ?? []).map((tag) => (
              <span key={tag} className="p-app-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="p-why">
        <div className="p-why-inner">
          <div className="sec-tag rv" style={{ marginBottom: 18 }}>
            <div className="sec-tag-line" />
            <span className="sec-tag-txt" style={{ color: "rgba(245,163,0,.85)" }}>
              {labels.productExpertise}
            </span>
          </div>
          <h2 className="p-why-h2 rv d1">{product.whyHobonTitle ?? labels.productExpertise}</h2>
          {product.whyHobonBody ? (
            <p className="p-why-body rv d2 whitespace-pre-line">{product.whyHobonBody}</p>
          ) : null}
        </div>
      </section>

      {(product.relatedSectors ?? []).length > 0 ? (
        <section className="other-sectors p-related">
          <div className="sec-tag rv">
            <div className="sec-tag-line" />
            <span className="sec-tag-txt">{labels.productSectors}</span>
          </div>
          <h2 className="os-h2 rv d1">{labels.productCommonlyUsedIn}</h2>
          <div className="os-grid p-related-grid rv d2">
            {(product.relatedSectors ?? []).map((s) => {
              if (!s.slug) return null;
              const href = buildLocalizedPath(locale, [
                { type: "key", key: "sectors" },
                { type: "slug", value: s.slug },
              ]);
              const img =
                s.listingImageUrl ??
                "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=65&auto=format&fit=crop";
              return (
                <Link key={s._id ?? s.slug} href={href} className="os-item">
                  <div className="os-item-photo">
                    <img src={img} alt="" />
                    <div className="os-item-photo-overlay" />
                  </div>
                  <div className="os-item-body">
                    <div className="os-item-title">{s.title}</div>
                    <div className="os-item-sub">
                      {(s.listingDescription ?? "").replace(/<[^>]+>/g, "").slice(0, 90)}
                      {(s.listingDescription?.length ?? 0) > 90 ? "…" : ""}
                    </div>
                  </div>
                  <div className="os-item-arrow">
                    <ArrowBtnIcon size={10} />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="cta-band" id="contact">
        <div className="cta-inner">
          <div>
            <div className="sec-tag rv" style={{ marginBottom: 18 }}>
              <div className="sec-tag-line" />
              <span className="sec-tag-txt" style={{ color: "rgba(245,163,0,.7)" }}>
                {labels.productContact}
              </span>
            </div>
            <h2 className="cta-h2 rv d1">{product.ctaBandTitle1}</h2>
            {product.ctaBandBody ? <p className="cta-body rv d2 whitespace-pre-line">{product.ctaBandBody}</p> : null}
            {product.ctaBandPrimary?.href ? (
              <div className="rv d3" style={{ marginTop: 24 }}>
                <Link href={product.ctaBandPrimary.href} className="btn-primary">
                  <span>{product.ctaBandPrimary.label}</span>
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

      {product.additionalNotes && Array.isArray(product.additionalNotes) && product.additionalNotes.length > 0 ? (
        <section className="bg-[var(--chalk)] px-6 py-16 md:px-[52px]">
          <div className="mx-auto max-w-3xl">
            <div className="sec-tag">
              <div className="sec-tag-line" />
              <span className="sec-tag-txt">{labels.productExtra}</span>
            </div>
            <h2 className="mt-4 font-[family-name:var(--f-head)] text-xl font-semibold text-[var(--navy)]">
              {labels.productNotes}
            </h2>
            <div className="mt-4">
              <SimpleRichText value={product.additionalNotes} />
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
