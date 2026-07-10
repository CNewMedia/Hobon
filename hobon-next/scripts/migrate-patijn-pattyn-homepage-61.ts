/**
 * HOB-61 — Patijn → PATTYN op homepage (NL/FR/EN), patch-only.
 *
 * Dry-run: npm run migrate:patijn-pattyn-homepage-61
 * Write:    npm run migrate:patijn-pattyn-homepage-61 -- --write
 */
import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";
import {
  clip,
  getValueAtPath,
  valueToComparableString,
} from "./lib/import-red-nl-translations";
import { portableTextToPlain } from "./lib/export-translations";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN?.trim();

const INSIGHT_ID = "568ba116-f398-4f92-9a2c-4ada05247a87";
const SEED_PATH = path.join(process.cwd(), "scripts", "seed.ts");

type PatchPlan = {
  docId: string;
  fieldPath: string;
  referentie: string;
  transform: (current: string) => string;
  mustContain: RegExp;
};

const PATCHES: PatchPlan[] = [
  {
    docId: "homePage-nl",
    fieldPath: "productCards[1].title",
    referentie: "homePage-nl·productCards[1].title",
    mustContain: /patijn/i,
    transform: () => "PATTYN rollen",
  },
  {
    docId: "homePage-nl",
    fieldPath: "productCards[1].description",
    referentie: "homePage-nl·productCards[1].description",
    mustContain: /patijnbuis/i,
    transform: (s) => s.replace(/Patijnbuis/gi, "PATTYN buis"),
  },
  {
    docId: "homePage-nl",
    fieldPath: "tapeItems[10]",
    referentie: "homePage-nl·tapeItems[10]",
    mustContain: /patijn/i,
    transform: () => "PATTYN rollen",
  },
  {
    docId: "homePage-en",
    fieldPath: "productCards[1].title",
    referentie: "homePage-en·productCards[1].title",
    mustContain: /patijn/i,
    transform: () => "PATTYN rolls",
  },
  {
    docId: "homePage-en",
    fieldPath: "productCards[1].description",
    referentie: "homePage-en·productCards[1].description",
    mustContain: /patijn tube/i,
    transform: (s) => s.replace(/Patijn tube/gi, "PATTYN tube"),
  },
  {
    docId: "homePage-en",
    fieldPath: "tapeItems[10]",
    referentie: "homePage-en·tapeItems[10]",
    mustContain: /patijn/i,
    transform: () => "PATTYN rolls",
  },
  {
    docId: "homePage-fr",
    fieldPath: "productCards[1].title",
    referentie: "homePage-fr·productCards[1].title",
    mustContain: /patijn/i,
    transform: () => "Rouleaux PATTYN",
  },
  {
    docId: "homePage-fr",
    fieldPath: "productCards[1].description",
    referentie: "homePage-fr·productCards[1].description",
    mustContain: /patijn/i,
    transform: (s) => s.replace(/de patijn/gi, "PATTYN"),
  },
  {
    docId: "homePage-fr",
    fieldPath: "tapeItems[10]",
    referentie: "homePage-fr·tapeItems[10]",
    mustContain: /patijn/i,
    transform: () => "Rouleaux PATTYN",
  },
];

function parseArgs() {
  return { write: process.argv.includes("--write") };
}

function updateSeed(wasByReferentie: Map<string, string>, wordtByReferentie: Map<string, string>) {
  let content = fs.readFileSync(SEED_PATH, "utf8");
  const updated: string[] = [];
  const skipped: string[] = [];

  for (const patch of PATCHES) {
  if (patch.docId !== "homePage-nl") continue;

    const was = wasByReferentie.get(patch.referentie);
    const wordt = wordtByReferentie.get(patch.referentie);
    if (!was || !wordt || was === wordt) {
      skipped.push(`${patch.referentie} (geen seed-wijziging)`);
      continue;
    }

    if (!content.includes(was)) {
      skipped.push(`${patch.referentie} (was niet in seed.ts)`);
      continue;
    }

    content = content.replace(was, wordt);
    updated.push(patch.referentie);
  }

  fs.writeFileSync(SEED_PATH, content, "utf8");
  return { updated, skipped };
}

async function showInsightFragment(client: ReturnType<typeof createClient>) {
  const doc = await client.fetch<{ body?: unknown }>(
    `*[_id == $id][0]{ body }`,
    { id: INSIGHT_ID },
  );

  const plain = portableTextToPlain((doc?.body ?? []) as Parameters<typeof portableTextToPlain>[0]);
  const match = plain.match(/(.{0,180})patijn(.{0,180})/i);

  console.log("\n=== Deel 2 — insight-body fragment (NIET gepatcht) ===\n");
  console.log(`Referentie: ${INSIGHT_ID}·body`);
  console.log(`Titel: Is Hobon zelf producent van PE-folie?\n`);

  if (!match) {
    console.log('Geen "patijn" gevonden in body.');
    return;
  }

  console.log(`…${match[1]}patijn${match[2]}…`);
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

  const docIds = [...new Set(PATCHES.map((p) => p.docId))];
  const docs = await client.fetch<Record<string, unknown>[]>(`*[_id in $ids]{...}`, { ids: docIds });
  const byId = new Map(docs.map((d) => [String(d._id), d]));

  console.log(`HOB-61 — Patijn → PATTYN homepage (${write ? "WRITE" : "DRY-RUN"}) — ${dataset}\n`);
  console.log(`=== Deel 1 — ${PATCHES.length} homepage-velden ===\n`);

  let pass = 0;
  let fail = 0;
  const wasByReferentie = new Map<string, string>();
  const wordtByReferentie = new Map<string, string>();
  const setPayloads: { docId: string; fieldPath: string; value: string }[] = [];

  for (const [index, patch] of PATCHES.entries()) {
    const doc = byId.get(patch.docId);
    const raw = doc ? getValueAtPath(doc, patch.fieldPath) : undefined;
    const was = valueToComparableString(raw);

    let status: string;
    let wordt = "";

    if (!doc) {
      status = "🛑 FAIL — document niet gevonden";
      fail++;
    } else if (!was) {
      status = "🛑 FAIL — veld leeg of ontbreekt";
      fail++;
    } else if (!patch.mustContain.test(was)) {
      status = `🛑 FAIL — verwacht Patijn/patijn in huidige waarde, gevonden: "${clip(was, 80)}"`;
      fail++;
    } else {
      wordt = patch.transform(was);
      if (wordt === was) {
        status = "🛑 FAIL — transform leverde geen wijziging op";
        fail++;
      } else {
        status = "✅ PASS — klaar om te patchen";
        pass++;
        setPayloads.push({ docId: patch.docId, fieldPath: patch.fieldPath, value: wordt });
      }
    }

    wasByReferentie.set(patch.referentie, was);
    wordtByReferentie.set(patch.referentie, wordt);

    console.log(`${index + 1}. ${patch.referentie}`);
    console.log(`   Was:    ${clip(was, 120)}`);
    console.log(`   Wordt:  ${clip(wordt || "(geen)", 120)}`);
    console.log(`   Check:  ${status}`);
    console.log("");
  }

  console.log(`Verificatie: ${pass} PASS, ${fail} FAIL`);

  await showInsightFragment(client);

  if (fail > 0) {
    console.error("\n🛑 STOP — verificatie gefaald, geen patches uitgevoerd.");
    process.exit(1);
  }

  if (!write) {
    console.log("\n🛑 STOP — dry-run afgerond. Schrijven: npm run migrate:patijn-pattyn-homepage-61 -- --write");
    return;
  }

  console.log("\nSanity patches...");
  for (const { docId, fieldPath, value } of setPayloads) {
    await client.patch(docId).set({ [fieldPath]: value }).commit();
    console.log(`PATCH OK ${docId} → ${fieldPath}`);
  }

  console.log("\nseed.ts bijwerken (homePage-nl)...");
  const { updated, skipped } = updateSeed(wasByReferentie, wordtByReferentie);
  for (const ref of updated) console.log(`  seed OK  ${ref}`);
  for (const ref of skipped) console.log(`  seed SKIP ${ref}`);

  console.log("\nKlaar — 9 homepage-velden bijgewerkt (insight-body niet aangeraakt).");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
