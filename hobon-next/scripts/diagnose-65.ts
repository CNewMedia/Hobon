/**
 * HOB-65 — Read-only diagnose EN insight bodies vs NL-structuur.
 *
 *   npm run diagnose:65
 *
 * Geen Sanity-writes.
 */
import { createClient } from "@sanity/client";
import {
  bodyStyleSignature,
  countNlNonEmptyTextBlocks,
  getBlockSpanText,
  isNlTextBlock,
} from "./lib/import-fr-translations-62a";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

const ARTICLES = [
  {
    key: "film-plus-fin",
    nl: "insight-nl-dunner-folie-zelfde-kwaliteit",
    en: "insight-en-dunner-folie-zelfde-kwaliteit",
  },
  {
    key: "audit-klaar",
    nl: "insight-nl-audit-klaar-met-de-juiste-folie",
    en: "822ba01f-be4e-466b-90e0-40534aad627b",
  },
  {
    key: "ffs-lijn",
    nl: "insight-nl-ffs-lijn-65-meter",
    en: "99992a49-5c23-4d88-bebd-0625f3253cdb",
  },
  {
    key: "recyclaat",
    nl: "insight-nl-recyclaat-op-de-lijn",
    en: "09ecbf50-3213-4bf3-9c6f-aecf8b7ad051",
  },
  {
    key: "brc-aa",
    nl: "insight-nl-brc-aa-in-de-praktijk",
    en: "insight-en-brc-aa-in-de-praktijk",
  },
  {
    key: "recyclaat-of-virgin",
    nl: "insight-nl-recyclaat-of-virgin-de-juiste-keuze",
    en: "insight-en-recyclaat-of-virgin-de-juiste-keuze",
  },
  {
    key: "faalkosten",
    nl: "insight-nl-faalkosten-verkeerde-foliekeuze",
    en: "insight-en-faalkosten-verkeerde-foliekeuze",
  },
  {
    key: "hobon-producent",
    nl: "568ba116-f398-4f92-9a2c-4ada05247a87",
    en: "94e6427f-6888-459a-8b28-e882230091b0",
  },
] as const;

type SanityBlock = Record<string, unknown>;

type DocRow = {
  _id: string;
  title?: string | null;
  slug?: string | null;
  body?: SanityBlock[] | null;
};

function clip(text: string, max = 55): string {
  const one = text.replace(/\s+/g, " ").trim();
  if (one.length <= max) return one;
  return `${one.slice(0, max - 3)}...`;
}

function blockKind(block: SanityBlock): string {
  if (block._type !== "block") return String(block._type ?? "?");
  const listItem = block.listItem ? String(block.listItem) : "";
  const style = String(block.style ?? "normal");
  if (listItem) return `list:${listItem}`;
  if (style === "h2" || style === "h3" || style === "h4") return style;
  if (style === "blockquote") return "quote";
  return "paragraph";
}

function countKinds(body: SanityBlock[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const b of body) {
    const k = blockKind(b);
    out[k] = (out[k] ?? 0) + 1;
  }
  return out;
}

function formatKinds(counts: Record<string, number>): string {
  const order = ["h2", "h3", "h4", "paragraph", "list:bullet", "list:number", "quote"];
  const keys = [...order.filter((k) => counts[k]), ...Object.keys(counts).filter((k) => !order.includes(k))];
  return keys.map((k) => `${k}×${counts[k]}`).join(", ") || "—";
}

function countStyleMismatches(nlBody: SanityBlock[], enBody: SanityBlock[]): { n: number; examples: string[] } {
  const examples: string[] = [];
  let n = 0;
  const len = Math.min(nlBody.length, enBody.length);
  for (let i = 0; i < len; i++) {
    const nl = nlBody[i]!;
    const en = enBody[i]!;
    if (!isNlTextBlock(nl) && nl._type !== "block") continue;
    const nlKind = blockKind(nl);
    const enKind = blockKind(en);
    const nlText = getBlockSpanText(nl);
    const enText = getBlockSpanText(en);
    if (!nlText && !enText && nlKind === enKind) continue;
    if (nlKind !== enKind) {
      n++;
      if (examples.length < 3) {
        examples.push(`[${i}] NL ${nlKind} vs EN ${enKind} | ${clip(nlText, 36)} → ${clip(enText, 36)}`);
      }
    }
  }
  return { n, examples };
}

function lastNonEmpty(body: SanityBlock[]): string {
  for (let i = body.length - 1; i >= 0; i--) {
    const t = getBlockSpanText(body[i]!);
    if (t) return t;
  }
  return "";
}

function headingPreview(body: SanityBlock[], limit = 6): string {
  const lines: string[] = [];
  for (const b of body) {
    if (b._type !== "block") continue;
    const style = String(b.style ?? "normal");
    if (style !== "h2" && style !== "h3") continue;
    const t = getBlockSpanText(b);
    if (!t) continue;
    lines.push(`${style}:${clip(t, 42)}`);
    if (lines.length >= limit) break;
  }
  return lines.join(" · ") || "—";
}

async function main() {
  const token = process.env.SANITY_API_READ_TOKEN?.trim() || process.env.SANITY_API_WRITE_TOKEN?.trim();
  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token: token || undefined,
    useCdn: false,
  });

  console.log(`HOB-65 diagnose — EN vs NL insight bodies (READ-ONLY) — ${dataset}\n`);

  const ids = ARTICLES.flatMap((a) => [a.nl, a.en]);
  const docs = await client.fetch<DocRow[]>(
    `*[_id in $ids]{ _id, title, "slug": slug.current, body }`,
    { ids },
  );
  const byId = new Map(docs.map((d) => [d._id, d]));

  type Row = {
    key: string;
    title: string;
    slug: string;
    url: string;
    nlBlocks: number;
    enBlocks: number;
    nlText: number;
    enText: number;
    kindsEn: string;
    kindsNl: string;
    mm: number;
    sigEq: boolean;
    truncated: boolean;
    gaps: boolean;
    verdict: string;
    examples: string[];
    nlLast: string;
    enLast: string;
    enHeadings: string;
  };

  const rows: Row[] = [];

  for (const article of ARTICLES) {
    const nlDoc = byId.get(article.nl);
    const enDoc = byId.get(article.en);
    const nlBody = nlDoc?.body ?? [];
    const enBody = enDoc?.body ?? [];
    const nlSig = bodyStyleSignature(nlBody);
    const enSig = bodyStyleSignature(enBody);
    const mm = countStyleMismatches(nlBody, enBody);
    const truncated = enBody.length < nlBody.length;
    const emptyTail = truncated;
    const swappedHeadings = mm.n > 0;
    const gaps = truncated || swappedHeadings;
    const sigEq = nlSig === enSig && nlBody.length === enBody.length && mm.n === 0;
    const verdict = !enDoc
      ? "❌ EN-doc ontbreekt"
      : sigEq
        ? "✅ zelfde structuur"
        : truncated && swappedHeadings
          ? "❌ afgekapt + heading-swap"
          : truncated
            ? "❌ afgekapt"
            : swappedHeadings
              ? "❌ heading-swap"
              : "⚠️ structuur wijkt af";

    rows.push({
      key: article.key,
      title: enDoc?.title?.trim() || "(geen titel)",
      slug: enDoc?.slug ?? "",
      url: enDoc?.slug ? `/en/insights/${enDoc.slug}` : "—",
      nlBlocks: nlBody.length,
      enBlocks: enBody.length,
      nlText: countNlNonEmptyTextBlocks(nlBody),
      enText: countNlNonEmptyTextBlocks(enBody),
      kindsEn: formatKinds(countKinds(enBody)),
      kindsNl: formatKinds(countKinds(nlBody)),
      mm: mm.n,
      sigEq,
      truncated,
      gaps,
      verdict,
      examples: mm.examples,
      nlLast: clip(lastNonEmpty(nlBody), 70),
      enLast: clip(lastNonEmpty(enBody), 70),
      enHeadings: headingPreview(enBody),
    });
  }

  console.log("## Overzicht\n");
  console.log(
    "| Key | EN-titel | URL | NL/EN blocks | NL/EN tekst | EN block-types | Style-mm | Zelfde structuur? | Gaten/afgekapt? |",
  );
  console.log("|-----|----------|-----|--------------|-------------|----------------|----------|-------------------|-----------------|");
  for (const r of rows) {
    const struct = r.sigEq ? "ja" : "nee";
    const gap = r.gaps ? "ja" : "nee";
    console.log(
      `| ${r.key} | ${r.title.replace(/\|/g, "/")} | ${r.url} | ${r.nlBlocks}/${r.enBlocks} | ${r.nlText}/${r.enText} | ${r.kindsEn} | ${r.mm} | ${struct} | ${gap} |`,
    );
  }

  console.log("\n## Per insight\n");
  for (const r of rows) {
    console.log(`### ${r.key} — ${r.verdict}`);
    console.log(`- Titel: ${r.title}`);
    console.log(`- URL: https://hobon-next.vercel.app${r.url}`);
    console.log(`- EN block-types: ${r.kindsEn}`);
    console.log(`- NL block-types: ${r.kindsNl}`);
    console.log(`- Blocks: NL ${r.nlBlocks} vs EN ${r.enBlocks} (delta ${r.enBlocks - r.nlBlocks})`);
    console.log(`- Niet-lege tekst-blocks: NL ${r.nlText} vs EN ${r.enText}`);
    console.log(`- Style-mismatches op gedeelde index: ${r.mm}`);
    console.log(`- Signature identiek: ${r.sigEq ? "ja" : "nee"}`);
    console.log(`- Afgekapt t.o.v. NL: ${r.truncated ? "ja" : "nee"}`);
    console.log(`- EN headings: ${r.enHeadings}`);
    console.log(`- NL slot: ${r.nlLast || "—"}`);
    console.log(`- EN slot: ${r.enLast || "—"}`);
    if (r.examples.length) {
      console.log("- Voorbeelden heading-swap:");
      for (const ex of r.examples) console.log(`  - ${ex}`);
    }
    console.log("");
  }

  const broken = rows.filter((r) => !r.sigEq);
  console.log("--- Samenvatting ---");
  console.log(`  ${rows.length - broken.length}/${rows.length} identiek aan NL-structuur`);
  console.log(`  ${broken.length} met gaten / heading-swap / afkapping: ${broken.map((r) => r.key).join(", ") || "—"}`);
  console.log("\n🛑 STOP — diagnose only, geen patch.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
