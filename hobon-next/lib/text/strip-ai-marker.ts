const MARKER_REGEX = /^\[AI-translated\]\s*/;

export const AI_TRANSLATED_MARKER = "[AI-translated]";

/** True when a string contains the AI translation marker. */
export function containsAIMarker(text: string): boolean {
  return text.includes(AI_TRANSLATED_MARKER);
}

/**
 * Removes the "[AI-translated] " prefix from a string.
 * Safe for null/undefined input.
 */
export function stripAIMarker(text: string | null | undefined): string {
  if (!text) return "";
  return text.replace(MARKER_REGEX, "");
}

/**
 * Recursively strips AI markers from all string values in an object
 * or array. Useful for entire Sanity documents or uiLabels objects.
 */
export function stripAIMarkersDeep<T>(value: T): T {
  if (typeof value === "string") {
    return stripAIMarker(value) as unknown as T;
  }
  if (Array.isArray(value)) {
    return value.map(stripAIMarkersDeep) as unknown as T;
  }
  if (value && typeof value === "object") {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      result[k] = stripAIMarkersDeep(v);
    }
    return result as T;
  }
  return value;
}
