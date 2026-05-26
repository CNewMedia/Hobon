"use client";

import { useState } from "react";

export type FaqItem = {
  num?: string | null;
  title?: string | null;
  body?: string | null;
  tags?: string[] | null;
};

export function SectorFaqs({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="deep-items">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={`${item.num}-${item.title}`} className={`di ${isOpen ? "open" : ""}`}>
            <button
              type="button"
              className="di-hd"
              onClick={() => setOpen(isOpen ? null : i)}
            >
              <span className="di-num">{item.num}</span>
              <span className="di-title">{item.title}</span>
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
              <div className="di-inner">
                <p className="di-desc">{item.body}</p>
                <div className="di-tags">
                  {(item.tags ?? []).map((t) => (
                    <span key={t} className="di-tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
