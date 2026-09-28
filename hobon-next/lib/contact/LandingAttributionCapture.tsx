"use client";

import { useEffect } from "react";
import {
  ATTRIBUTION_STORAGE_KEY,
  parseAttributionFromSearch,
  sanitizeAttribution,
  type AttributionFields,
} from "./attribution";

/** Mount once in the site shell so first-touch UTM/gclid survive navigation to forms. */
export function LandingAttributionCapture() {
  useEffect(() => {
    try {
      let stored: AttributionFields = {};
      const raw = sessionStorage.getItem(ATTRIBUTION_STORAGE_KEY);
      if (raw) {
        stored = sanitizeAttribution(JSON.parse(raw) as Record<string, unknown>);
      }
      if (Object.keys(stored).length > 0) return;

      const fromUrl = parseAttributionFromSearch(window.location.search);
      if (Object.keys(fromUrl).length === 0) return;

      sessionStorage.setItem(ATTRIBUTION_STORAGE_KEY, JSON.stringify(fromUrl));
    } catch {
      /* ignore quota / private mode */
    }
  }, []);

  return null;
}
