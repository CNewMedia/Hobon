"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { ProductGalleryLightbox, type GallerySlide } from "./ProductGalleryLightbox";

type ProductGalleryProps = {
  title: string;
  tagLabel: string;
  slides: GallerySlide[];
  lightboxIndex?: number | null;
  onLightboxOpen?: (index: number) => void;
  onLightboxClose?: () => void;
  onLightboxNavigate?: (index: number) => void;
};

function ZoomIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function ProductGallery({
  title,
  tagLabel,
  slides,
  lightboxIndex: controlledIndex,
  onLightboxOpen,
  onLightboxClose,
  onLightboxNavigate,
}: ProductGalleryProps) {
  const [internalIndex, setInternalIndex] = useState<number | null>(null);
  const isControlled = controlledIndex !== undefined;
  const lightboxIndex = isControlled ? controlledIndex : internalIndex;

  const openAt = (i: number) => {
    if (onLightboxOpen) onLightboxOpen(i);
    else setInternalIndex(i);
  };

  const close = () => {
    if (onLightboxClose) onLightboxClose();
    else setInternalIndex(null);
  };

  const navigate = (i: number) => {
    if (onLightboxNavigate) onLightboxNavigate(i);
    else setInternalIndex(i);
  };

  if (slides.length === 0) return null;

  return (
    <>
      <section className="p-gallery gal" id="galerij">
        <div className="p-gallery-inner gal-hdr">
          <div className="sec-tag rv">
            <div className="sec-tag-line" />
            <span className="sec-tag-txt">{tagLabel}</span>
          </div>
          <h2 className="p-gallery-h2 gal-h2 rv d1">{title}</h2>
          <div className="gal-grid rv d2">
            {slides.map((slide, i) => (
              <button
                key={`${slide.src}-${i}`}
                type="button"
                className="gal-item"
                onClick={() => openAt(i)}
                aria-label={`Vergroot: ${slide.alt}`}
              >
                <img src={slide.src} alt={slide.alt} />
                <span className="gal-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="gal-zoom">
                  <ZoomIcon />
                </span>
                <div className="gal-item-ov" aria-hidden />
                <div className="gal-cap">
                  <span className="gal-cap-txt">{slide.alt}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <ProductGalleryLightbox
        slides={slides}
        index={lightboxIndex ?? null}
        onClose={close}
        onNavigate={navigate}
      />
    </>
  );
}
