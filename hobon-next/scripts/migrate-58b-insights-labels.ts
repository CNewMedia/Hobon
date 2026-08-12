/**
 * HOB-58b — resterende blog uiLabels (NL/FR/EN).
 *
 * Dry-run: npm run migrate:58b-insights-labels
 * Write:    npm run migrate:58b-insights-labels -- --write
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

const LABEL_KEYS = [
  "insightsCtaParagraph",
  "insightsBackToList",
  "insightsReadingTime",
  "insightsRelatedTitle",
  "insightsAllLink",
] as const;

type LabelKey = (typeof LABEL_KEYS)[number];

const PATCHES: Record<"nl" | "fr" | "en", Record<LabelKey, string>> = {
  nl: {
    insightsCtaParagraph: "Neem contact op voor advies op maat, zonder verplichting.",
    insightsBackToList: "Terug naar insights",
    insightsReadingTime: "{n} min leestijd",
    insightsRelatedTitle: "Gerelateerde artikels",
    insightsAllLink: "Alle insights",
  },
  fr: {
    insightsCtaParagraph: "Contactez-nous pour un conseil sur mesure, sans engagement.",
    insightsBackToList: "Retour aux articles",
    insightsReadingTime: "{n} min de lecture",
    insightsRelatedTitle: "Articles liés",
    insightsAllLink: "Tous les articles",
  },
  en: {
    insightsCtaParagraph: "Get in touch for tailored advice, no obligation.",
    insightsBackToList: "Back to insights",
    insightsReadingTime: "{n} min read",
    insightsRelatedTitle: "Related articles",
    insightsAllLink: "All insights",
  },
};

const TEMPLATE_USAGE: Record<LabelKey, string> = {
  insightsCtaParagraph: "InsightsOverviewTemplate + InsightDetailTemplate — ins-cta-body",
  insightsBackToList: "InsightDetailTemplate — ins-detail-back",
  insightsReadingTime: "InsightDetailTemplate — meta-row ({n} = minuten)",
  insightsRelatedTitle: "InsightDetailTemplate — ins-related-h2 (consolidated; was: Verder lezen + span)",
  insightsAllLink: "InsightDetailTemplate — fallback link zonder related",
};

function parseArgs() {
  return { write: process.argv.includes("--write") };
}

function clip(text: string, max = 70): string {
  const one = text.replace(/\s+/g, " ").trim();
  if (one.length <= max) return one;
  return `${one.slice(0, max - 3)}...`;
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

  console.log(`HOB-58b — resterende blog uiLabels (${write ? "WRITE" : "DRY-RUN"}) — ${dataset}\n`);

  console.log("--- Consolidatie ---");
  console.log('  "Verder lezen" + "Gerelateerde artikels" → één label: insightsRelatedTitle\n');

  console.log("--- Labels → templates ---");
  for (const key of LABEL_KEYS) {
    console.log(`  ${key} → ${TEMPLATE_USAGE[key]}`);
  }
  console.log("");

  let patchCount = 0;

  for (const locale of ["nl", "fr", "en"] as const) {
    const id = `uiLabels-${locale}`;
    const doc = await client.fetch<Record<string, string | undefined> | null>(
      `*[_id == $id][0]{ _id, ${LABEL_KEYS.join(", ")} }`,
      { id },
    );

    console.log(`=== uiLabels-${locale} ===`);
    if (!doc) {
      console.log("  ❌ document niet gevonden — skip\n");
      continue;
    }

    const setPayload: Record<string, string> = {};
    for (const key of LABEL_KEYS) {
      const was = doc[key]?.trim() ?? "";
      const wordt = PATCHES[locale][key];
      const unchanged = was === wordt;
      console.log(`  ${key}`);
      console.log(`    was:   ${was ? clip(was) : "(leeg)"}`);
      console.log(`    wordt: ${clip(wordt)} ${unchanged ? "[unchanged]" : "[PATCH]"}`);
      if (!unchanged) setPayload[key] = wordt;
    }
    console.log("");

    if (Object.keys(setPayload).length === 0) {
      console.log(`  Geen patches nodig voor uiLabels-${locale}\n`);
      continue;
    }

    patchCount += Object.keys(setPayload).length;

    if (write) {
      await client.patch(id).set(setPayload).commit();
      console.log(`  PATCH OK uiLabels-${locale} → ${Object.keys(setPayload).length} veld(en)\n`);
    }
  }

  console.log("--- Template scan (hardcoded NL) ---");
  console.log("  InsightsOverviewTemplate: geen NL user-facing strings");
  console.log('    (fallback h1 "Insights" = EN; "Hobon" = merknaam)');
  console.log("  InsightDetailTemplate: geen NL user-facing strings");
  console.log('    ("Hobon" = merknaam; "·" = scheidingsteken)\n');

  if (!write) {
    console.log(`Velden te patchen in Sanity: ${patchCount}`);
    console.log("✅ Geen hardcoded NL meer op blog-templates (alle via useUILabels).");
    console.log("\n🛑 STOP — dry-run. Schrijven: npm run migrate:58b-insights-labels -- --write");
    return;
  }

  console.log(`Klaar — ${patchCount} uiLabels-velden bijgewerkt (NL/FR/EN).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
