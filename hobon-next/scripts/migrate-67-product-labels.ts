/**
 * HOB-67 — product-UI sectiekoppen + lightbox-aria (NL/FR/EN).
 *
 * Dry-run: npm run migrate:67-product-labels
 * Write:    npm run migrate:67-product-labels -- --write
 *
 * 5 lege product-* keys + 3 nieuwe uiAria* keys. Aparte patch per taal.
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

const LABEL_KEYS = [
  "productGalleryTag",
  "productGalleryTitle",
  "productSolutionsTag",
  "productSolutionsTitle",
  "productFaqTitle",
  "uiAriaClose",
  "uiAriaPrev",
  "uiAriaNext",
] as const;

type LabelKey = (typeof LABEL_KEYS)[number];

const PATCHES: Record<"nl" | "fr" | "en", Record<LabelKey, string>> = {
  nl: {
    productGalleryTag: "Beelden",
    productGalleryTitle: "In de praktijk",
    productSolutionsTag: "Varianten",
    productSolutionsTitle: "Folie op maat",
    productFaqTitle: "Veelgestelde vragen",
    uiAriaClose: "Sluiten",
    uiAriaPrev: "Vorige",
    uiAriaNext: "Volgende",
  },
  fr: {
    productGalleryTag: "Images",
    productGalleryTitle: "En pratique",
    productSolutionsTag: "Variantes",
    productSolutionsTitle: "Film sur mesure",
    productFaqTitle: "Questions fréquentes",
    uiAriaClose: "Fermer",
    uiAriaPrev: "Précédent",
    uiAriaNext: "Suivant",
  },
  en: {
    productGalleryTag: "Images",
    productGalleryTitle: "In practice",
    productSolutionsTag: "Variants",
    productSolutionsTitle: "Custom film",
    productFaqTitle: "Frequently asked questions",
    uiAriaClose: "Close",
    uiAriaPrev: "Previous",
    uiAriaNext: "Next",
  },
};

function parseArgs() {
  return { write: process.argv.includes("--write") };
}

async function main() {
  const { write } = parseArgs();
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

  console.log(`HOB-67 — product + lightbox uiLabels (${write ? "WRITE" : "DRY-RUN"}) — ${dataset}\n`);

  let patchCount = 0;

  for (const locale of ["nl", "fr", "en"] as const) {
    const id = `uiLabels-${locale}`;
    const projection = LABEL_KEYS.join(", ");
    const doc = await client.fetch<(Partial<Record<LabelKey, string>> & { _id: string }) | null>(
      `*[_id == $id][0]{ _id, ${projection} }`,
      { id },
    );

    console.log(`=== ${id} ===`);
    if (!doc) {
      console.log("  document niet gevonden — skip\n");
      continue;
    }

    const setPayload: Record<string, string> = {};

    for (const key of LABEL_KEYS) {
      const was = doc[key]?.trim() ?? "";
      const next = PATCHES[locale][key];
      const unchanged = was === next;
      console.log(`  ${key}`);
      console.log(`    was:   ${was || "(leeg)"}`);
      console.log(`    wordt: ${next} ${unchanged ? "[unchanged]" : "[PATCH]"}`);
      if (!unchanged) setPayload[key] = next;
    }

    console.log("");

    if (Object.keys(setPayload).length === 0) {
      console.log(`  Geen patches nodig voor ${id}\n`);
      continue;
    }

    patchCount += Object.keys(setPayload).length;
    if (write) {
      await client.patch(id).set(setPayload).commit();
      console.log(`  patched ${Object.keys(setPayload).length} fields\n`);
    } else {
      console.log(`  (dry-run) would patch ${Object.keys(setPayload).length} fields\n`);
    }
  }

  console.log(`--- Summary: ${patchCount} field-patches ${write ? "applied" : "pending"} ---`);
  if (!write) console.log("Re-run with --write to apply.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
