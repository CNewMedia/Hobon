/** Rough reading time from Portable Text blocks (words / 200 wpm, min 1). */
export function estimateReadingMinutesFromPortableText(body: unknown): number {
  if (!Array.isArray(body)) return 1;
  let words = 0;
  for (const node of body) {
    if (node && typeof node === "object" && (node as { _type?: string })._type === "block") {
      const children = (node as { children?: { text?: string }[] }).children;
      if (Array.isArray(children)) {
        for (const ch of children) {
          const t = ch?.text ?? "";
          words += t.split(/\s+/).filter(Boolean).length;
        }
      }
    }
  }
  return Math.max(1, Math.round(words / 200));
}
