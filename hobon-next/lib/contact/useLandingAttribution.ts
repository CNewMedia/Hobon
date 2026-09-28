"use client";

import { useEffect, useState } from "react";
import {
  ATTRIBUTION_STORAGE_KEY,
  parseAttributionFromSearch,
  sanitizeAttribution,
  type AttributionFields,
} from "./attribution";

/**
 * First-touch landing attribution: capture UTM/gclid from the landing URL
 * into sessionStorage once, then reuse on later pages (e.g. contact form).
 */
export function useLandingAttribution(): AttributionFields {
  const [attr, setAttr] = useState<AttributionFields>({});

  useEffect(() => {
    try {
      let stored: AttributionFields = {};
      const raw = sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
      if (raw) {
        stored = sanitizeAttribution(JSON.parse(raw) as Record<string, unknown>);
      }

      const fromUrl = parseAttributionFromSearch(window.location.search);
      const hasUrl = Object.keys(fromUrl).length > 0;
      const hasStored = Object.keys(stored).length > 0;

      // First touch wins: only write when storage is empty and URL has params.
      if (!hasStored && hasUrl) {
        sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(fromUrl));
        setAttr(fromUrl);
        return;
      }

      setAttr(hasStored ? stored : fromUrl);
    } catch {
      setAttr(parseAttributionFromSearch(window.location.search));
    }
  }, []);

  return attr;
}
