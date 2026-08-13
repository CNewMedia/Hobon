"use client";

import { useEffect, useRef } from "react";
import { cookiebotCulture } from "@/lib/cookiebot";

/**
 * Injects Cookiebot Cookie Declaration (cd.js) into the page body.
 * Script must live inside the container so Cookiebot can replace/fill it.
 */
export function CookieDeclaration({
  cbid,
  locale,
}: {
  cbid: string;
  locale: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.replaceChildren();

    const script = document.createElement("script");
    script.id = "CookieDeclaration";
    script.src = `https://consent.cookiebot.com/${cbid}/cd.js`;
    script.type = "text/javascript";
    script.async = true;
    script.setAttribute("data-culture", cookiebotCulture(locale));
    el.appendChild(script);

    return () => {
      el.replaceChildren();
    };
  }, [cbid, locale]);

  return <div ref={containerRef} className="cookiebot-declaration mt-10" />;
}
