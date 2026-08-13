"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import { useUILabels } from "@/components/providers/UILabelsProvider";

export type GallerySlide = {
  src: string;
  alt: string;
  largeSrc?: string;
};

type ProductGalleryLightboxProps = {
  slides: GallerySlide[];
  index: number | null;
  onClose: () => void;
  onNavigate: (nextIndex: number) => void;
};

export function ProductGalleryLightbox({
  slides,
  index,
  onClose,
  onNavigate,
}: ProductGalleryLightboxProps) {
  const labels = useUILabels();
  const open = index !== null && slides.length > 0;
  const current = open ? slides[index] : null;

  const goPrev = useCallback(() => {
    if (index === null || slides.length === 0) return;
    onNavigate((index - 1 + slides.length) % slides.length);
  }, [index, onNavigate, slides.length]);

  const goNext = useCallback(() => {
    if (index === null || slides.length === 0) return;
    onNavigate((index + 1) % slides.length);
  }, [index, onNavigate, slides.length]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, goPrev, goNext]);

  if (!open || !current || typeof document === "undefined") return null;

  return createPortal(
    <div
      className={`lb open show`}
      role="dialog"
      aria-modal="true"
      aria-label={current.alt}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <button type="button" className="lb-x" aria-label={labels.uiAriaClose} onClick={onClose}>
        &times;
      </button>
      {slides.length > 1 ? (
        <>
          <button type="button" className="lb-nav lb-prev" aria-label={labels.uiAriaPrev} onClick={goPrev}>
            &#8249;
          </button>
          <button type="button" className="lb-nav lb-next" aria-label={labels.uiAriaNext} onClick={goNext}>
            &#8250;
          </button>
        </>
      ) : null}
      <div className="lb-stage">
        <div className="lb-frame">
          <img src={current.largeSrc ?? current.src} alt={current.alt} />
        </div>
        <div className="lb-cap">{current.alt}</div>
      </div>
    </div>,
    document.body,
  );
}
