"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/paths";
import {
  productPlaceholderPool,
  resolveImageSrc,
  resolveImageWithPool,
  sectorCardImageSrc,
  type ImageWithAlt,
} from "@/lib/sanity/resolveImageSrc";
import { ArrowBtnIcon } from "@/components/layout/icons";
import { SectorCtaForm } from "@/components/sector/SectorCtaForm";
import { SimpleRichText } from "@/components/portable/SimpleRichText";
import { useUILabels } from "@/components/providers/UILabelsProvider";
import { ProductFaqs } from "./ProductFaqs";
import { ProductGallery } from "./ProductGallery";
import type { GallerySlide } from "./ProductGalleryLightbox";

export type RelatedSector = {
  _id?: string;
  title?: string | null;
  slug?: string | null;
  navLabel?: string | null;
  listingDescription?: string | null;
  listingImage?: ImageWithAlt;
  listingImageUrl?: string | null;
  heroMainImage?: ImageWithAlt;
  heroMainImageUrl?: string | null;
};

type HeroThumb = {
  _key?: string;
  image?: ImageWithAlt;
  label?: string | null;
};

type SolutionCard = {
  _key?: string;
  image?: ImageWithAlt;
  title?: string | null;
  description?: string | null;
  num?: string | null;
  tags?: string[] | null;
  cta?: { label?: string | null; href?: string | null } | null;
};

export type ProductDoc = {
  title?: string | null;
  slug?: { current?: string | null } | null;
  heroEyebrow?: string | null;
  heroHeadline?: string | null;
  heroIntro?: string | null;
  heroPrimaryCta?: { label?: string | null; href?: string | null } | null;
  heroSecondaryCta?: { label?: string | null; href?: string | null } | null;
  heroImage?: ImageWithAlt;
  heroThumbs?: HeroThumb[] | null;
  specifications?: { title?: string | null; body?: string | null; icon?: string | null }[] | null;
  applications?: string[] | null;
  solutionsTitle?: string | null;
  solutionCards?: SolutionCard[] | null;
  galleryTitle?: string | null;
  productGallery?: ImageWithAlt[] | null;
  faqs?: { _key?: string; question?: string | null; answer?: string | null }[] | null;
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

function hasSpecs(p: ProductDoc) {
  return (p.specifications ?? []).some((row) => row.title?.trim());
}

function hasApplications(p: ProductDoc) {
  return (p.applications ?? []).some((tag) => tag?.trim());
}

function hasSolutionCards(p: ProductDoc) {
  return (p.solutionCards ?? []).some((card) => card.title?.trim());
}

function hasFaqs(p: ProductDoc) {
  return (p.faqs ?? []).some((item) => item.question?.trim() && item.answer?.trim());
}

function hasGallery(p: ProductDoc) {
  return (p.productGallery ?? []).length > 0;
}

function hasWhyHobon(p: ProductDoc) {
  return Boolean(p.whyHobonBody?.trim() || p.whyHobonTitle?.trim());
}

function buildGallerySlides(items: ImageWithAlt[], slug: string | null): GallerySlide[] {
  const slides: GallerySlide[] = [];
  items.forEach((item, i) => {
    const thumb = resolveImageWithPool(item, slug, i, 720);
    const large = resolveImageWithPool(item, slug, i, 1400);
    if (!thumb.src) return;
    slides.push({ src: thumb.src, alt: thumb.alt, largeSrc: large.src ?? thumb.src });
  });
  return slides;
}

function HeroPlaceholder() {
  return (
    <div className="p-hero-placeholder" aria-hidden="true">
      <div className="p-hero-placeholder-grid" />
      <span className="p-hero-placeholder-label">Hobon</span>
    </div>
  );
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
  const slug = product.slug?.current ?? null;
  const placeholders = productPlaceholderPool(slug);
  const [heroThumbIndex, setHeroThumbIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const heroResolved = resolveImageSrc(product.heroImage, {
    width: 1000,
    quality: 80,
    placeholder: placeholders[0] ?? null,
  });

  const heroThumbs = (product.heroThumbs ?? []).filter((t) => t.label?.trim() || t.image?.image);
  const gallerySlides = useMemo(
    () => buildGallerySlides(product.productGallery ?? [], slug),
    [product.productGallery, slug],
  );

  const activeHeroImg = useMemo(() => {
    if (heroThumbs.length > 0) {
      const idx = Math.min(heroThumbIndex, heroThumbs.length - 1);
      return resolveImageWithPool(heroThumbs[idx].image, slug, idx + 1, 1000);
    }
    return heroResolved;
  }, [heroThumbs, heroThumbIndex, slug, heroResolved]);
  const solutionCards = (product.solutionCards ?? []).filter((c) => c.title?.trim());
  const faqItems = (product.faqs ?? []).filter((f) => f.question?.trim() && f.answer?.trim());
  const relatedSectors = (product.relatedSectors ?? []).filter((s) => s.slug);

  const solutionsHeading = product.solutionsTitle?.trim() || labels.productSolutionsTitle;
  const galleryHeading = product.galleryTitle?.trim() || labels.productGalleryTitle;

  if (!hasRichLayout(product)) {
    return (
      <section className="p-legacy-fallback">
        <div className="p-legacy-fallback-inner">
          <h1 className="p-legacy-fallback-h1">{product.title ?? "Product"}</h1>
          {product.lead ? <p className="p-legacy-fallback-lead">{product.lead}</p> : null}
          <div className="p-legacy-fallback-body">
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

        <div className={`s-hero-r ${heroThumbs.length > 0 ? "p-hero-interactive" : ""}`}>
          <div
            className={`s-hero-r-main ${gallerySlides.length > 0 ? "s-hero-r-main--lb" : ""}`}
            role={gallerySlides.length > 0 ? "button" : undefined}
            tabIndex={gallerySlides.length > 0 ? 0 : undefined}
            onClick={() => {
              if (gallerySlides.length > 0) {
                setLightboxIndex(Math.min(heroThumbIndex, gallerySlides.length - 1));
              }
            }}
            onKeyDown={(e) => {
              if (!gallerySlides.length) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setLightboxIndex(Math.min(heroThumbIndex, gallerySlides.length - 1));
              }
            }}
          >
            {activeHeroImg.src ? (
              <img src={activeHeroImg.src} alt={activeHeroImg.alt || product.title || ""} />
            ) : (
              <HeroPlaceholder />
            )}
          </div>
          <div className="s-hero-r-overlay" aria-hidden="true" />
          {heroThumbs.length > 0 ? (
            <div className="s-hero-thumbs" id="heroThumbs">
              {heroThumbs.map((thumb, i) => {
                const thumbImg = resolveImageWithPool(thumb.image, slug, i + 1, 260);
                return (
                  <button
                    key={thumb._key ?? thumb.label ?? i}
                    type="button"
                    className={`s-hero-thumb ${heroThumbIndex === i ? "active" : ""}`}
                    data-i={i}
                    aria-label={thumb.label ?? `Foto ${i + 1}`}
                    onClick={() => setHeroThumbIndex(i)}
                  >
                    {thumbImg.src ? (
                      <img src={thumbImg.src} alt={thumbImg.alt || thumb.label || ""} />
                    ) : (
                      <HeroPlaceholder />
                    )}
                    {thumb.label ? <span className="s-hero-thumb-lbl">{thumb.label}</span> : null}
                  </button>
                );
              })}
            </div>
          ) : null}
        </div>
      </section>

      {hasSpecs(product) ? (
        <section className="p-specs" id="specs">
          <div className="p-specs-inner">
            <div className="sec-tag rv">
              <div className="sec-tag-line" />
              <span className="sec-tag-txt">{labels.productTechnical}</span>
            </div>
            <h2 className="p-specs-h2 rv d1">{labels.productSpecifications}</h2>
            <div className="p-spec-grid">
              {(product.specifications ?? []).map((row, i) => {
                if (!row.title?.trim()) return null;
                return (
                  <div key={row.title ?? i} className={`p-spec-card rv ${i ? `d${i % 4}` : ""}`}>
                    {row.icon ? <span className="p-spec-icon">{row.icon}</span> : null}
                    <h3 className="p-spec-title">{row.title}</h3>
                    {row.body ? <p className="p-spec-body">{row.body}</p> : null}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {hasApplications(product) ? (
        <section className="p-apps" id="applications">
          <div className="p-apps-inner">
            <div className="sec-tag rv">
              <div className="sec-tag-line" />
              <span className="sec-tag-txt">{labels.productApplications}</span>
            </div>
            <h2 className="p-apps-h2 rv d1">{labels.productApplicationsQuestion}</h2>
            <div className="p-app-tags rv d2">
              {(product.applications ?? []).map((tag) =>
                tag?.trim() ? (
                  <span key={tag} className="p-app-tag">
                    {tag}
                  </span>
                ) : null,
              )}
            </div>
          </div>
        </section>
      ) : null}

      {hasSolutionCards(product) ? (
        <section className="solutions p-solutions" id="varianten">
          <div className="solutions-hdr p-solutions-hdr">
            <div>
              <div className="sec-tag rv">
                <div className="sec-tag-line" />
                <span className="sec-tag-txt">{labels.productSolutionsTag}</span>
              </div>
              <h2 className="solutions-h2 p-solutions-h2 rv d1">{solutionsHeading}</h2>
            </div>
          </div>
          <div className="sol-grid" data-sol-count={solutionCards.length}>
            {solutionCards.map((sol, i) => {
              const cardImg = resolveImageWithPool(sol.image, slug, i, 800);
              return (
                <div key={sol._key ?? sol.title ?? i} className={`sol rv ${i ? `d${i % 4}` : ""}`}>
                  <div className="sol-photo">
                    {cardImg.src ? (
                      <img
                        src={cardImg.src}
                        alt={cardImg.alt || sol.title || ""}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <HeroPlaceholder />
                    )}
                  </div>
                  {sol.num ? <span className="sol-n">{sol.num}</span> : null}
                  <h3 className="sol-title">{sol.title}</h3>
                  {sol.description ? <p className="sol-desc">{sol.description}</p> : null}
                  {(sol.tags ?? []).length > 0 ? (
                    <div className="sol-specs">
                      {(sol.tags ?? []).map((tag) => (
                        <span key={tag} className="sol-spec">
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {sol.cta?.href ? (
                    <Link href={sol.cta.href} className="sol-cta">
                      {sol.cta.label ?? labels.listingReadMore}
                      <ArrowBtnIcon size={11} />
                    </Link>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {hasFaqs(product) ? (
        <section className="p-faq" id="faq">
          <div className="p-faq-inner">
            <div className="sec-tag rv">
              <div className="sec-tag-line" />
              <span className="sec-tag-txt">{labels.sectorCommonChallenges}</span>
            </div>
            <h2 className="p-faq-h2 rv d1">{labels.productFaqTitle}</h2>
            <div className="rv d2">
              <ProductFaqs items={faqItems} />
            </div>
          </div>
        </section>
      ) : null}

      {hasGallery(product) ? (
        <ProductGallery
          title={galleryHeading}
          tagLabel={labels.productGalleryTag}
          slides={gallerySlides}
          lightboxIndex={lightboxIndex}
          onLightboxOpen={setLightboxIndex}
          onLightboxClose={() => setLightboxIndex(null)}
          onLightboxNavigate={setLightboxIndex}
        />
      ) : null}

      {hasWhyHobon(product) ? (
        <section className="p-why">
          <div className="p-why-inner">
            <div className="sec-tag rv p-why-tag">
              <div className="sec-tag-line" />
              <span className="sec-tag-txt">{labels.productExpertise}</span>
            </div>
            <h2 className="p-why-h2 rv d1">{product.whyHobonTitle ?? labels.productExpertise}</h2>
            {product.whyHobonBody ? (
              <p className="p-why-body rv d2 whitespace-pre-line">{product.whyHobonBody}</p>
            ) : null}
          </div>
        </section>
      ) : null}

      {relatedSectors.length > 0 ? (
        <section className="other-sectors p-related">
          <div className="sec-tag rv">
            <div className="sec-tag-line" />
            <span className="sec-tag-txt">{labels.productSectors}</span>
          </div>
          <h2 className="os-h2 rv d1">{labels.productCommonlyUsedIn}</h2>
          <div className="os-grid p-related-grid rv d2">
            {relatedSectors.map((s) => {
              if (!s.slug) return null;
              const href = buildLocalizedPath(locale, [
                { type: "key", key: "sectors" },
                { type: "slug", value: s.slug },
              ]);
              const img =
                sectorCardImageSrc(s.listingImage, s.listingImageUrl, s.heroMainImage, s.heroMainImageUrl) ??
                placeholders[0] ??
                null;
              return (
                <Link key={s._id ?? s.slug} href={href} className="os-item">
                  <div className="os-item-photo">
                    {img ? <img src={img} alt="" /> : <HeroPlaceholder />}
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
            <div className="sec-tag rv p-cta-tag">
              <div className="sec-tag-line" />
              <span className="sec-tag-txt">{labels.productContact}</span>
            </div>
            <h2 className="cta-h2 rv d1">{product.ctaBandTitle1}</h2>
            {product.ctaBandBody ? <p className="cta-body rv d2 whitespace-pre-line">{product.ctaBandBody}</p> : null}
            {product.ctaBandPrimary?.href ? (
              <div className="p-cta-primary rv d3">
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
        <section className="p-notes">
          <div className="p-notes-inner">
            <div className="sec-tag">
              <div className="sec-tag-line" />
              <span className="sec-tag-txt">{labels.productExtra}</span>
            </div>
            <h2 className="p-notes-h2">{labels.productNotes}</h2>
            <div className="p-notes-body">
              <SimpleRichText value={product.additionalNotes} />
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}
