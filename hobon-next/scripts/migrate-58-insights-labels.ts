/**
 * HOB-58 — uiLabels insights/blog strings (NL/FR/EN).
 *
 * Dry-run: npm run migrate:58-insights-labels
 * Write:    npm run migrate:58-insights-labels -- --write
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

const INSIGHTS_LABEL_KEYS = [
  "insightsListTitle",
  "insightsListSubtitle",
  "insightsCtaTitle",
  "insightsCtaBody",
  "insightsCtaButton",
  "insightsEmpty",
] as const;

type InsightsLabelKey = (typeof INSIGHTS_LABEL_KEYS)[number];

const PATCHES: Record<"nl" | "fr" | "en", Record<InsightsLabelKey, string>> = {
  nl: {
    insightsListTitle: "Artikels",
    insightsListSubtitle: "Praktische inzichten voor uw verpakkingslijn.",
    insightsCtaTitle: "Vraag over folie of lijn?",
    insightsCtaBody: "We denken technisch mee.",
    insightsCtaButton: "Naar contact",
    insightsEmpty: "Nog geen artikels in deze taal.",
  },
  fr: {
    insightsListTitle: "Articles",
    insightsListSubtitle: "Analyses pratiques pour votre ligne d'emballage.",
    insightsCtaTitle: "Une question sur le film ou votre ligne ?",
    insightsCtaBody: "Nous vous accompagnons sur le plan technique.",
    insightsCtaButton: "Nous contacter",
    insightsEmpty: "Pas encore d'articles dans cette langue.",
  },
  en: {
    insightsListTitle: "Articles",
    insightsListSubtitle: "Practical insights for your packaging line.",
    insightsCtaTitle: "A question about film or your line?",
    insightsCtaBody: "We think along technically.",
    insightsCtaButton: "Get in touch",
    insightsEmpty: "No articles in this language yet.",
  },
};

const TEMPLATE_USAGE: Record<InsightsLabelKey, string> = {
  insightsListTitle: "InsightsOverviewTemplate — ins-list-h2",
  insightsListSubtitle: "InsightsOverviewTemplate — ins-list-sub",
  insightsCtaTitle: "InsightsOverviewTemplate + InsightDetailTemplate — ins-cta-h2",
  insightsCtaBody: "InsightsOverviewTemplate + InsightDetailTemplate — ins-cta-h2 span",
  insightsCtaButton: "InsightsOverviewTemplate + InsightDetailTemplate — btn-primary",
  insightsEmpty: "InsightsOverviewTemplate — lege lijst",
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
  const readToken =
    process.env.SANITY_API_READ_TOKEN?.trim() || token;
  if (write && !token) throw new Error("SANITY_API_WRITE_TOKEN required for --write");

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token: write ? token : readToken || undefined,
    useCdn: false,
  });

  console.log(`HOB-58 — insights uiLabels (${write ? "WRITE" : "DRY-RUN"}) — ${dataset}\n`);

  console.log("--- Labels → templates ---");
  for (const key of INSIGHTS_LABEL_KEYS) {
    console.log(`  ${key} → ${TEMPLATE_USAGE[key]}`);
  }
  console.log("");

  let patchCount = 0;

  for (const locale of ["nl", "fr", "en"] as const) {
    const id = `uiLabels-${locale}`;
    const doc = await client.fetch<Record<string, string | undefined> | null>(
      `*[_id == $id][0]{ _id, ${INSIGHTS_LABEL_KEYS.join(", ")} }`,
      { id },
    );

    console.log(`=== uiLabels-${locale} ===`);
    if (!doc) {
      console.log("  ❌ document niet gevonden — skip\n");
      continue;
    }

    const setPayload: Record<string, string> = {};
    for (const key of INSIGHTS_LABEL_KEYS) {
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

  console.log("--- Nog hardcoded NL (niet in scope HOB-58) ---");
  console.log("  InsightsOverviewTemplate: ins-cta-body paragraph");
  console.log('    "Neem contact op voor advies op maat — zonder verplichting."');
  console.log("  InsightDetailTemplate:");
  console.log('    "Terug naar insights" (ins-detail-back)');
  console.log('    "{n} min leestijd" (meta-row)');
  console.log('    "Verder lezen" / "Gerelateerde artikels" (ins-related-h2)');
  console.log('    "Alle insights" (fallback zonder related)');
  console.log("");

  if (!write) {
    console.log(`Velden te patchen in Sanity: ${patchCount}`);
    console.log("🛑 STOP — dry-run. Schrijven: npm run migrate:58-insights-labels -- --write");
    return;
  }

  console.log(`Klaar — ${patchCount} uiLabels-velden bijgewerkt (NL/FR/EN).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
