"use client";

import { useState } from "react";

export type ProductFaqItem = {
  question?: string | null;
  answer?: string | null;
};

export function ProductFaqs({ items }: { items: ProductFaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="deep-items p-faq-items">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={`${item.question ?? "faq"}-${i}`} className={`di p-faq-item ${isOpen ? "open" : ""}`}>
            <button
              type="button"
              className="di-hd p-faq-hd"
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span className="di-title">{item.question}</span>
              <div className="di-ico">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path
                    d="M8 3v10M3 8h10"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </button>
            <div className="di-body">
              <div className="di-inner p-faq-inner">
                <p className="di-desc">{item.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
