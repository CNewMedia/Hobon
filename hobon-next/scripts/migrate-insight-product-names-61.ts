/**
 * HOB-61 deel 2 — insight-body productnamen corrigeren (portable-text patch).
 *
 * Dry-run: npm run migrate:insight-product-names-61
 * Write:    npm run migrate:insight-product-names-61 -- --write
 */
import { createClient } from "@sanity/client";
import { clip, replaceInPortableText } from "./lib/import-red-nl-translations";
import { portableTextToPlain } from "./lib/export-translations";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN?.trim();

const INSIGHT_ID = "568ba116-f398-4f92-9a2c-4ada05247a87";
const FIELD_PATH = "body";

const REPLACEMENTS: { find: string; replace: string }[] = [
  { find: "dolafzakken", replace: "DOLAV zakken" },
  { find: "patijnrollen", replace: "PATTYN rollen" },
];

function parseArgs() {
  return { write: process.argv.includes("--write") };
}

function extractProductSentence(plain: string, after = false): string | null {
  if (after) {
    const match = plain.match(/[^.]*DOLAV zakken[^.]*PATTYN rollen[^.]*\./i);
    if (match) return match[0].trim();
  } else {
    const match = plain.match(/[^.]*dolafzakken[^.]*patijnrollen[^.]*\./i);
    if (match) return match[0].trim();
  }

  const anchor = after ? "DOLAV zakken" : "dolafzakken";
  const idx = plain.indexOf(anchor);
  if (idx === -1) return null;

  const start = plain.lastIndexOf(".", idx) + 1;
  const end = plain.indexOf(".", idx);
  if (end === -1) return plain.slice(start).trim();
  return plain.slice(start, end + 1).trim();
}

function countOccurrences(text: string, word: string): number {
  let count = 0;
  let pos = 0;
  while (true) {
    const idx = text.indexOf(word, pos);
    if (idx === -1) break;
    count++;
    pos = idx + word.length;
  }
  return count;
}

async function main() {
  const { write } = parseArgs();
  if (write && !token) throw new Error("SANITY_API_WRITE_TOKEN required for --write");

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token: write ? token : token || undefined,
    useCdn: false,
  });

  const doc = await client.fetch<{ body?: Record<string, unknown>[] }>(
    `*[_id == $id][0]{ body }`,
    { id: INSIGHT_ID },
  );

  if (!doc?.body || !Array.isArray(doc.body)) {
    throw new Error(`Document ${INSIGHT_ID} heeft geen body-veld`);
  }

  const wasPlain = portableTextToPlain(
    doc.body as Parameters<typeof portableTextToPlain>[0],
  );

  console.log(
    `HOB-61 deel 2 — insight productnamen (${write ? "WRITE" : "DRY-RUN"}) — ${dataset}\n`,
  );
  console.log(`Referentie: ${INSIGHT_ID}·${FIELD_PATH}`);
  console.log(`Titel: Is Hobon zelf producent van PE-folie?\n`);

  const checks: { word: string; count: number; ok: boolean }[] = [];
  let fail = 0;

  for (const { find } of REPLACEMENTS) {
    const count = countOccurrences(wasPlain, find);
    const ok = count >= 1;
    checks.push({ word: find, count, ok });
    if (!ok) fail++;
    console.log(
      `Check "${find}": ${count} voorkomen(s) — ${ok ? "✅ PASS" : "🛑 FAIL — niet gevonden"}`,
    );
  }

  if (fail > 0) {
    console.error("\n🛑 STOP — verificatie gefaald, geen patch uitgevoerd.");
    process.exit(1);
  }

  let patchedBody = doc.body;
  for (const { find, replace } of REPLACEMENTS) {
    patchedBody = replaceInPortableText(patchedBody, find, replace);
  }

  const wordtPlain = portableTextToPlain(
    patchedBody as Parameters<typeof portableTextToPlain>[0],
  );

  const wasSentence = extractProductSentence(wasPlain, false);
  const wordtSentence = extractProductSentence(wordtPlain, true);

  console.log("\n=== Zin vóór → na ===\n");
  console.log(`Vóór:  ${wasSentence ?? clip(wasPlain, 300)}`);
  console.log(`Na:    ${wordtSentence ?? clip(wordtPlain, 300)}`);

  if (wasPlain === wordtPlain) {
    console.error("\n🛑 FAIL — patch leverde geen wijziging op.");
    process.exit(1);
  }

  if (!write) {
    console.log(
      "\n🛑 STOP — dry-run afgerond. Schrijven: npm run migrate:insight-product-names-61 -- --write",
    );
    return;
  }

  await client.patch(INSIGHT_ID).set({ [FIELD_PATH]: patchedBody }).commit();
  console.log(`\nPATCH OK ${INSIGHT_ID} → ${FIELD_PATH}`);
  console.log("Klaar — alleen dolafzakken en patijnrollen vervangen in portable text.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
