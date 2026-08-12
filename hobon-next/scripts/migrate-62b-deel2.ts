/**
 * HOB-62b DEEL 2 — ATEX-content verwijderen (sector-chemie, NL/FR/EN).
 *
 * Dry-run: npm run migrate:62b-deel2
 * Write:    npm run migrate:62b-deel2 -- --write
 */
import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const SEED_SECTORS_PATH = path.join(process.cwd(), "scripts", "seed-sectors-content.ts");

const PROBLEM_BAND_KEYS: Record<string, string> = {
  nl: "3y6xr1u2ubNaGUAb3Z59ly",
  fr: "p3bjx2F4QcENfZgwcGnCLH",
  en: "AfHw7cNo6fvLW2zKrp2zcS",
};
const DEEP_FAQ_KEY = "gnzfk6fxel";
const TAPE_ATEX_RE = /atex/i;

type ProblemBandItem = { _key: string; title?: string; description?: string };
type DeepFaqItem = { _key: string; title?: string; body?: string };

function parseArgs() {
  return { write: process.argv.includes("--write") };
}

function containsAtex(text: string): boolean {
  return TAPE_ATEX_RE.test(text);
}

function updateSeedSectorsContent(): string[] {
  const updated: string[] = [];
  let content = fs.readFileSync(SEED_SECTORS_PATH, "utf8");

  const before = content;
  content = content.replace(/^\s*"ATEX-advies",\n/m, "");
  if (content !== before) updated.push("tapeItems: ATEX-advies verwijderd");

  const probBlock =
    /    prob\(\n      "problem",\n      "Typisch probleem",\n      "Statische ontlading risico",\n      "Bij gevoelige chemische producten of in ATEX-zones is anti-statische folie geen luxe — het is veiligheid\.",\n    \),\n/;
  const before2 = content;
  content = content.replace(probBlock, "");
  if (content !== before2) updated.push("problemBand: ATEX-item verwijderd");

  const faqBlock =
    /    faq\(\n      "02",\n      "Kunnen jullie folie maken voor ATEX-zones\?",\n      "Ja — anti-statische PE-folie met de juiste oppervlakteweerstand\. Specs op aanvraag\.",\n    \),\n/;
  const before3 = content;
  content = content.replace(faqBlock, "");
  if (content !== before3) updated.push("deepFaqs: ATEX-FAQ verwijderd");

  if (updated.length) fs.writeFileSync(SEED_SECTORS_PATH, content, "utf8");
  return updated;
}

async function main() {
  const { write } = parseArgs();
  const token = process.env.SANITY_API_WRITE_TOKEN?.trim();
  if (write && !token) throw new Error("SANITY_API_WRITE_TOKEN required for --write");

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token: write ? token : token || process.env.SANITY_API_READ_TOKEN?.trim(),
    useCdn: false,
  });

  console.log(`HOB-62b DEEL 2 — ATEX verwijderen (${write ? "WRITE" : "DRY-RUN"}) — ${dataset}\n`);

  let pass = 0;
  let fail = 0;

  for (const loc of ["nl", "fr", "en"] as const) {
    const id = `sector-${loc}-chemie`;
    const doc = await client.fetch<{
      problemBand: ProblemBandItem[];
      deepFaqs: DeepFaqItem[];
      tapeItems: string[];
    }>(`*[_id==$id][0]{problemBand,deepFaqs,tapeItems}`, { id });

    if (!doc) {
      console.error(`🛑 FAIL — ${id} niet gevonden`);
      fail++;
      continue;
    }

    const pbKey = PROBLEM_BAND_KEYS[loc]!;
    const pbRemove = doc.problemBand.find((x) => x._key === pbKey);
    const dfRemove = doc.deepFaqs.find((x) => x._key === DEEP_FAQ_KEY);
    const tapeRemove = doc.tapeItems.filter((s) => containsAtex(s));

    console.log(`=== ${id} ===\n`);

    // problemBand
    console.log("problemBand — VERWIJDEREN:");
    if (!pbRemove) {
      console.log(`  🛑 FAIL — _key ${pbKey} niet gevonden`);
      fail++;
    } else {
      const hay = `${pbRemove.title ?? ""} ${pbRemove.description ?? ""}`;
      const ok = containsAtex(hay);
      console.log(`  _key: ${pbRemove._key}`);
      console.log(`  title: ${pbRemove.title}`);
      console.log(`  description: ${pbRemove.description}`);
      console.log(`  ATEX check: ${ok ? "✅" : "🛑 FAIL — geen ATEX"}`);
      if (ok) pass++;
      else fail++;
    }

    const pbAfter = doc.problemBand.filter((x) => x._key !== pbKey);
    console.log("problemBand — RESTEREND:");
    pbAfter.forEach((x, i) => console.log(`  [${i}] _key=${x._key} | ${x.title}`));

    // deepFaqs
    console.log("\ndeepFaqs — VERWIJDEREN:");
    if (!dfRemove) {
      console.log(`  🛑 FAIL — _key ${DEEP_FAQ_KEY} niet gevonden`);
      fail++;
    } else {
      const hay = `${dfRemove.title ?? ""} ${dfRemove.body ?? ""}`;
      const ok = containsAtex(hay);
      console.log(`  _key: ${dfRemove._key}`);
      console.log(`  title: ${dfRemove.title}`);
      console.log(`  ATEX check: ${ok ? "✅" : "🛑 FAIL — geen ATEX"}`);
      if (ok) pass++;
      else fail++;
    }

    const dfAfter = doc.deepFaqs.filter((x) => x._key !== DEEP_FAQ_KEY);
    console.log("deepFaqs — RESTEREND:");
    dfAfter.forEach((x, i) => console.log(`  [${i}] _key=${x._key} | ${x.title}`));

    // tapeItems
    console.log("\ntapeItems — VERWIJDEREN (string-match):");
    if (tapeRemove.length === 0) {
      console.log("  🛑 FAIL — geen ATEX-item");
      fail++;
    } else {
      for (const s of tapeRemove) {
        console.log(`  "${s}" — ATEX check: ✅`);
        pass++;
      }
    }

    const tapeAfter = doc.tapeItems.filter((s) => !containsAtex(s));
    console.log("tapeItems — RESTEREND:");
    tapeAfter.forEach((s, i) => console.log(`  [${i}] ${s}`));

    if (write && pbRemove && dfRemove && tapeRemove.length > 0) {
      const patch = client.patch(id);
      patch.unset([`problemBand[_key=="${pbKey}"]`, `deepFaqs[_key=="${DEEP_FAQ_KEY}"]`]);
      if (tapeAfter.length !== doc.tapeItems.length) {
        patch.set({ tapeItems: tapeAfter });
      }
      await patch.commit();
      console.log(`\nPATCH OK ${id} — unset problemBand+deepFaqs _key, tapeItems gefilterd`);
    }

    console.log("");
  }

  console.log(`Verificatie: ${pass} PASS, ${fail} FAIL`);

  if (fail > 0) {
    console.error("\n🛑 STOP — verificatie gefaald, geen patches uitgevoerd.");
    process.exit(1);
  }

  if (!write) {
    console.log("🛑 STOP — dry-run afgerond. Schrijven: npm run migrate:62b-deel2 -- --write");
    console.log("\nseed-sectors-content.ts (bij write): tapeItems, problemBand, deepFaqs ATEX entries");
    return;
  }

  console.log("\nseed-sectors-content.ts bijwerken...");
  const seedUpdated = updateSeedSectorsContent();
  for (const u of seedUpdated) console.log(`  seed OK  ${u}`);
  if (!seedUpdated.length) console.log("  seed SKIP — geen matching ATEX entries gevonden");

  console.log("\nKlaar — ATEX-content verwijderd uit sector-chemie (NL/FR/EN).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
