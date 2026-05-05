import Anthropic from "@anthropic-ai/sdk";

export const AI_PREFIX = "[AI-translated] ";
export const REVIEW_MARKER = "[Frederik nalezen aparte file]";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type Locale = "nl" | "fr" | "en";

export const HOBON_GLOSSARY: Record<string, { fr: string; en: string }> = {
  "BRC AA": { fr: "BRC AA", en: "BRC AA" },
  "BRC Packaging Level AA": { fr: "BRC Packaging Level AA", en: "BRC Packaging Level AA" },
  FFS: { fr: "FFS", en: "FFS" },
  "PE-folie": { fr: "film PE", en: "PE film" },
  LDPE: { fr: "LDPE", en: "LDPE" },
  HDPE: { fr: "HDPE", en: "HDPE" },
  krimphoes: { fr: "housse rétractable", en: "shrink hood" },
  krimphoezen: { fr: "housses rétractables", en: "shrink hoods" },
  "stretch hood": { fr: "stretch hood", en: "stretch hood" },
  dolafzakken: { fr: "sacs DOLAV", en: "DOLAV bags" },
  DOLAV: { fr: "DOLAV", en: "DOLAV" },
  "bag-in-box": { fr: "bag-in-box", en: "bag-in-box" },
};

export function shouldPreserveText(text: string) {
  const v = text.trim();
  if (!v) return true;
  if (v.includes(REVIEW_MARKER)) return true;
  if (v.startsWith(AI_PREFIX)) return true;
  return false;
}

function isMissingApiKeyError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  return msg.toLowerCase().includes("api key");
}

export async function translateText({
  text,
  fromLocale,
  toLocale,
  context,
  glossary,
}: {
  text: string;
  fromLocale: "nl";
  toLocale: "fr" | "en";
  context: string;
  glossary: Record<string, { fr: string; en: string }>;
}): Promise<string> {
  if (!text.trim()) return text;
  if (shouldPreserveText(text)) return text;

  const localeName = toLocale === "fr" ? "French (France)" : "English";
  const glossaryLines = Object.entries(glossary)
    .map(([src, targets]) => `- "${src}" => "${targets[toLocale]}"`)
    .join("\n");

  const prompt = [
    `Translate from ${fromLocale} to ${localeName}.`,
    `Context: ${context}`,
    "Rules:",
    "- Keep any HTML tags exactly as-is (<strong>, <br>, etc.).",
    "- Keep numeric values, units, ranges and punctuation style stable.",
    "- Do not add commentary, only return the translated text.",
    "- Preserve brand/product names where appropriate.",
    "- Respect glossary replacements strictly.",
    "",
    "Glossary:",
    glossaryLines || "- (none)",
    "",
    "Input text:",
    text,
  ].join("\n");

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 1200,
      temperature: 0,
      messages: [{ role: "user", content: prompt }],
    });

    const translated = response.content
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("\n")
      .trim();

    if (!translated) return `${AI_PREFIX}${text}`;
    return `${AI_PREFIX}${translated}`;
  } catch (e) {
    if (isMissingApiKeyError(e)) {
      throw new Error("Missing ANTHROPIC_API_KEY");
    }
    throw e;
  }
}

function prefixAllTranslatedStrings(value: unknown): unknown {
  if (typeof value === "string") {
    if (!value.trim()) return value;
    if (shouldPreserveText(value)) return value;
    return `${AI_PREFIX}${value}`;
  }
  if (Array.isArray(value)) return value.map(prefixAllTranslatedStrings);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, prefixAllTranslatedStrings(v)]),
    );
  }
  return value;
}

export async function translatePayload<T>({
  payload,
  toLocale,
  context,
  glossary,
}: {
  payload: T;
  toLocale: "fr" | "en";
  context: string;
  glossary: Record<string, { fr: string; en: string }>;
}): Promise<T> {
  const localeName = toLocale === "fr" ? "French (France)" : "English";
  const glossaryLines = Object.entries(glossary)
    .map(([src, targets]) => `- "${src}" => "${targets[toLocale]}"`)
    .join("\n");

  const prompt = [
    `Translate JSON string values from Dutch to ${localeName}.`,
    `Context: ${context}`,
    "Rules:",
    "- Return valid JSON only (no markdown, no explanation).",
    "- Keep all keys and structure exactly unchanged.",
    "- Keep empty strings empty.",
    `- Keep "${REVIEW_MARKER}" exactly unchanged.`,
    "- Keep HTML tags and entities exactly as-is in translated strings.",
    "- Keep numbers/acronyms/units stable unless natural language requires adaptation.",
    "",
    "Glossary:",
    glossaryLines || "- (none)",
    "",
    "JSON input:",
    JSON.stringify(payload),
  ].join("\n");

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 4096,
    temperature: 0,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.content
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join("\n")
    .trim();
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
  const parsed = JSON.parse(cleaned) as T;
  return prefixAllTranslatedStrings(parsed) as T;
}

export async function suggestSlug({
  sourceText,
  targetLocale,
  context,
}: {
  sourceText: string;
  targetLocale: "fr" | "en";
  context: string;
}) {
  if (!sourceText.trim()) return "";

  const localeName = targetLocale === "fr" ? "French" : "English";
  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 80,
    temperature: 0,
    messages: [
      {
        role: "user",
        content: [
          `Create one concise SEO slug in ${localeName} from Dutch input.`,
          `Context: ${context}`,
          "Return slug only, lowercase words separated by hyphens, no punctuation.",
          "",
          `Input: ${sourceText}`,
        ].join("\n"),
      },
    ],
  });

  const raw = response.content
    .filter((c) => c.type === "text")
    .map((c) => c.text)
    .join(" ")
    .trim();
  const firstLine = raw.split("\n")[0]?.trim() ?? "";
  const fencedStripped = firstLine.replace(/[`"'“”‘’]/g, " ").trim();
  let candidate = normalizeSlug(fencedStripped);

  if (!candidate || candidate.length > 80) {
    const shortToken = fencedStripped.split(/\s+/).find((w) => /^[a-z0-9-]+$/i.test(w));
    candidate = normalizeSlug(shortToken ?? "");
  }
  if (!candidate || candidate.length > 80) {
    candidate = normalizeSlug(sourceText);
  }
  return candidate.slice(0, 80).replace(/-+$/g, "");
}

export function normalizeSlug(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function mapLocaleHref(href: string, toLocale: "fr" | "en") {
  if (!href.startsWith("/")) return href;
  if (href.startsWith("/nl/")) return `/${toLocale}/${href.slice(4)}`;
  if (href === "/nl") return `/${toLocale}`;
  return href;
}
