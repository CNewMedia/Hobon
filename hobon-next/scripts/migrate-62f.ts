/**
 * HOB-62f — Herimport FR insight bodies: NL-structuur + xlsx FR-tekst.
 *
 * Dry-run: npm run migrate:62f
 * Write:    npm run migrate:62f -- --write
 */
import path from "node:path";
import { createClient } from "@sanity/client";
import {
  bodyStyleSignature,
  countNlNonEmptyTextBlocks,
  getBlockSpanText,
  isNlTextBlock,
  mapFrBodyFromNlStructure,
  readFrNieuwFromXlsx,
  splitFrParagraphs,
} from "./lib/import-fr-translations-62a";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const DEFAULT_XLSX = path.join(process.cwd(), "exports", "Hobon-website-teksten-NL-FR-EN.xlsx");

const ARTICLES = [
  { key: "film-plus-fin", nl: "insight-nl-dunner-folie-zelfde-kwaliteit", fr: "insight-fr-dunner-folie-zelfde-kwaliteit" },
  { key: "audit-klaar", nl: "insight-nl-audit-klaar-met-de-juiste-folie", fr: "9d83f7de-2109-4a0c-b12f-0cc6fa3edb07" },
  { key: "ffs-lijn", nl: "insight-nl-ffs-lijn-65-meter", fr: "8c316fb7-3998-4034-a98f-508fc4e9b017" },
  { key: "recyclaat", nl: "insight-nl-recyclaat-op-de-lijn", fr: "2cdeb230-166a-498d-970d-2da5e4a8752f" },
  { key: "brc-aa", nl: "insight-nl-brc-aa-in-de-praktijk", fr: "insight-fr-brc-aa-in-de-praktijk" },
  { key: "recyclaat-of-virgin", nl: "insight-nl-recyclaat-of-virgin-de-juiste-keuze", fr: "insight-fr-recyclaat-of-virgin-de-juiste-keuze" },
  { key: "faalkosten", nl: "insight-nl-faalkosten-verkeerde-foliekeuze", fr: "insight-fr-faalkosten-verkeerde-foliekeuze" },
  { key: "hobon-producent", nl: "568ba116-f398-4f92-9a2c-4ada05247a87", fr: "2aee894a-edf2-40de-bc82-facb9b6e58bb" },
] as const;

function parseArgs() {
  const write = process.argv.includes("--write");
  const xlsxFlagIndex = process.argv.indexOf("--xlsx");
  const xlsxPath =
    xlsxFlagIndex !== -1 && process.argv[xlsxFlagIndex + 1]
      ? path.resolve(process.argv[xlsxFlagIndex + 1]!)
      : DEFAULT_XLSX;
  return { write, xlsxPath };
}

function clip(text: string, max = 65): string {
  const one = text.replace(/\s+/g, " ").trim();
  if (one.length <= max) return one;
  return `${one.slice(0, max - 3)}...`;
}

function countStyleMismatches(
  nlBody: Record<string, unknown>[],
  frBody: Record<string, unknown>[],
): number {
  let mismatches = 0;
  for (let i = 0; i < Math.min(nlBody.length, frBody.length); i++) {
    const nl = nlBody[i]!;
    const fr = frBody[i]!;
    if (!isNlTextBlock(nl) || !getBlockSpanText(nl)) continue;
    const nlStyle = String(nl.style ?? "normal");
    const frStyle = String(fr.style ?? "normal");
    if (nlStyle !== frStyle) mismatches++;
  }
  return mismatches;
}

function lastNonEmptyText(blocks: Record<string, unknown>[]): string {
  for (let i = blocks.length - 1; i >= 0; i--) {
    const b = blocks[i]!;
    if (isNlTextBlock(b)) {
      const t = getBlockSpanText(b);
      if (t) return t;
    }
  }
  return "";
}

async function main() {
  const { write, xlsxPath } = parseArgs();
  const token = process.env.SANITY_API_WRITE_TOKEN?.trim();
  const readToken = process.env.SANITY_API_READ_TOKEN?.trim() || token;
  if (write && !token) throw new Error("SANITY_API_WRITE_TOKEN required for --write");

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token: write ? token : readToken || undefined,
    useCdn: false,
  });

  console.log(`HOB-62f — FR body herimport NL-structuur (${write ? "WRITE" : "DRY-RUN"}) — ${dataset}`);
  console.log(`Bron xlsx: ${xlsxPath}`);
  console.log("Patch-only (.set({ body })) — geen createOrReplace\n");

  const xlsxRows = await readFrNieuwFromXlsx(xlsxPath);
  const bodyByNl = new Map(
    xlsxRows.filter((r) => r.referentie.endsWith("·body") && r.wordt).map((r) => [r.referentie.split("·")[0]!, r.wordt]),
  );

  let pass = 0;
  let flagged = 0;
  const flaggedKeys: string[] = [];

  for (const article of ARTICLES) {
    console.log(`=== ${article.key} ===`);
    console.log(`  NL: ${article.nl}`);
    console.log(`  FR: ${article.fr}`);

    const frPlain = bodyByNl.get(article.nl) ?? "";
    const frParas = splitFrParagraphs(frPlain);

    const [nlDoc, frDoc] = await Promise.all([
      client.fetch<{ body?: Record<string, unknown>[] }>(`*[_id == $id][0]{ body }`, { id: article.nl }),
      client.fetch<{ body?: Record<string, unknown>[] }>(`*[_id == $id][0]{ body }`, { id: article.fr }),
    ]);

    const nlBody = nlDoc?.body ?? [];
    const currentFrBody = frDoc?.body ?? [];
    const nlTextBlocks = countNlNonEmptyTextBlocks(nlBody);

    console.log(`  Preconditie: NL tekst-blocks=${nlTextBlocks} | FR xlsx-alinea's=${frParas.length}`);

    if (!frPlain.trim()) {
      console.log("  ❌ FLAG — geen FR body-tekst in xlsx (referentie ontbreekt of leeg)");
      flagged++;
      flaggedKeys.push(article.key);
      console.log("");
      continue;
    }

    if (nlTextBlocks !== frParas.length) {
      console.log("  ❌ FLAG — paragraph count mismatch (niet forceren)");
      flagged++;
      flaggedKeys.push(article.key);
      console.log("");
      continue;
    }

    const mapped = mapFrBodyFromNlStructure(nlBody, frPlain);
    if (!mapped.ok) {
      console.log(`  ❌ FLAG — ${mapped.reason}`);
      flagged++;
      flaggedKeys.push(article.key);
      console.log("");
      continue;
    }

    const newFrBody = mapped.body;
    const nlSig = bodyStyleSignature(nlBody);
    const newFrSig = bodyStyleSignature(newFrBody);
    const styleMismatches = countStyleMismatches(nlBody, newFrBody);
    const nlLast = lastNonEmptyText(nlBody);
    const frLast = lastNonEmptyText(newFrBody);
    const xlsxLast = frParas[frParas.length - 1] ?? "";

    console.log(`  Block count: NL=${nlBody.length} → new FR=${newFrBody.length} (was FR=${currentFrBody.length})`);
    console.log(`  Style signature: NL  ${nlSig.slice(0, 120)}${nlSig.length > 120 ? "..." : ""}`);
    console.log(`  Style signature: FR  ${newFrSig.slice(0, 120)}${newFrSig.length > 120 ? "..." : ""}`);
    console.log(`  Signatures identical: ${nlSig === newFrSig ? "✅" : "❌"}`);
    console.log(`  Style mismatches (NL vs new FR): ${styleMismatches}`);
    console.log(`  Slotparagraaf xlsx: ${clip(xlsxLast)}`);
    console.log(`  Slotparagraaf new FR: ${clip(frLast)}`);
    console.log(`  Slotparagraaf match: ${clip(xlsxLast) === clip(frLast) ? "✅" : "❌"}`);

    // Heading preview (first 8 text blocks)
    console.log("  Heading-structuur (NL vs new FR):");
    let shown = 0;
    for (let i = 0; i < nlBody.length && shown < 8; i++) {
      const nl = nlBody[i]!;
      const fr = newFrBody[i]!;
      if (!isNlTextBlock(nl) || !getBlockSpanText(nl)) continue;
      shown++;
      const nlStyle = String(nl.style ?? "normal");
      const frStyle = String(fr.style ?? "normal");
      const match = nlStyle === frStyle ? "✅" : "❌";
      console.log(
        `    [${i}] ${match} ${nlStyle} | NL: ${clip(getBlockSpanText(nl), 40)} | FR: ${clip(getBlockSpanText(fr), 40)}`,
      );
    }

    if (styleMismatches === 0 && nlSig === newFrSig && nlBody.length === newFrBody.length) {
      console.log("  ✅ PASS — 0 style-mismatches, structuur identiek, niet afgekapt");
      pass++;

      if (write) {
        await client.patch(article.fr).set({ body: newFrBody }).commit();
        console.log(`  PATCH OK ${article.fr} → body (${newFrBody.length} blocks)`);
      }
    } else {
      console.log("  ❌ FLAG — onverwachte structuur na mapping");
      flagged++;
      flaggedKeys.push(article.key);
    }

    console.log("");
  }

  console.log("--- Samenvatting ---");
  console.log(`  PASS: ${pass}/${ARTICLES.length}`);
  console.log(`  FLAG: ${flagged} → ${flaggedKeys.join(", ") || "—"}`);

  if (flagged > 0 && !write) {
    console.log("\n🛑 STOP — dry-run: geflagde artikelen worden overgeslagen bij write.");
  } else if (!write) {
    console.log("\n🛑 STOP — dry-run afgerond. Schrijven: npm run migrate:62f -- --write");
  } else if (flagged > 0) {
    console.log("\nKlaar — met geflagde artikelen (niet gepatcht).");
  } else {
    console.log("\nKlaar — alle FR bodies herimporteerd (patch-only).");
  }

  if (flagged > 0 && pass === 0) process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
