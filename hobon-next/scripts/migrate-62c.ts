/**
 * HOB-62c — FR-insights via translation.metadata + Alta Verba xlsx + relatedArticles.
 *
 * Stap 1: resolve FR UUID via translation.metadata (geen ID-migratie).
 * Stap 2: patch title, lead, body, featuredImage.alt uit kolom FR (nieuw).
 * Stap 3: relatedArticles NL → FR via translation.metadata (+ fallback getLocalizedRef).
 *
 * Dry-run: npm run migrate:62c
 * Write:    npm run migrate:62c -- --write
 *
 * NOOIT createOrReplace. NOOIT docs verwijderen.
 */
import path from "node:path";
import { createClient, type SanityClient } from "@sanity/client";
import { getLocalizedRef } from "../lib/sanity/locale-mapping";
import {
  buildFrPatchValue,
  getValueAtPath,
  normalizeForCompare,
  parseReferentie,
  pathExists,
  readFrNieuwFromXlsx,
  valueToComparableString,
  verifyFrPatchTargetHtmlAware,
  needsHtmlPreserve,
  buildHtmlPreservePreview,
  type FrPatchPlan,
  type FrXlsxRow,
} from "./lib/import-fr-translations-62a";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const DEFAULT_XLSX = path.join(process.cwd(), "exports", "Hobon-website-teksten-NL-FR-EN.xlsx");

const NL_DOC_IDS = [
  "insight-nl-audit-klaar-met-de-juiste-folie",
  "insight-nl-ffs-lijn-65-meter",
  "insight-nl-recyclaat-op-de-lijn",
] as const;

const FIELD_PATHS = ["title", "lead", "body", "featuredImage.alt"] as const;

type TranslationMeta = {
  _id: string;
  translations: { _key: string; ref: string | null }[];
};

type RelatedMapping = {
  nlRef: string;
  nlTitle: string;
  frRef: string | null;
  frTitle: string | null;
  via: "translation.metadata" | "getLocalizedRef" | "missing";
};

function parseArgs() {
  const write = process.argv.includes("--write");
  const xlsxFlagIndex = process.argv.indexOf("--xlsx");
  const xlsxPath =
    xlsxFlagIndex !== -1 && process.argv[xlsxFlagIndex + 1]
      ? path.resolve(process.argv[xlsxFlagIndex + 1]!)
      : DEFAULT_XLSX;
  return { write, xlsxPath };
}

function clip(text: string, max = 90): string {
  const one = text.replace(/\s+/g, " ").trim();
  if (one.length <= max) return one;
  return `${one.slice(0, max - 3)}...`;
}

async function fetchBaselineFrByReferentie(): Promise<Map<string, string>> {
  const exportMod = await import("./lib/export-translations");
  const { buildTranslationRows, EXPORT_DOC_TYPES } =
    (exportMod as { default?: typeof exportMod }).default ?? exportMod;

  const token =
    process.env.SANITY_API_READ_TOKEN?.trim() || process.env.SANITY_API_WRITE_TOKEN?.trim();
  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token: token || undefined,
    useCdn: false,
  });

  const types = EXPORT_DOC_TYPES.map((t: string) => `"${t}"`).join(", ");
  const docs = await client.fetch<Record<string, unknown>[]>(`*[_type in [${types}]]`);
  return new Map(buildTranslationRows(docs).map((row) => [row.referentie, row.fr]));
}

async function fetchTranslationMeta(client: SanityClient): Promise<TranslationMeta[]> {
  return client.fetch<TranslationMeta[]>(`
    *[_type == "translation.metadata"]{
      _id,
      translations[]{
        _key,
        "ref": value._ref
      }
    }
  `);
}

function buildLocaleRefMap(metaDocs: TranslationMeta[]): Map<string, Map<string, string>> {
  /** docRef → (locale → docRef) */
  const byDoc = new Map<string, Map<string, string>>();

  for (const meta of metaDocs) {
    const localeToRef = new Map<string, string>();
    for (const t of meta.translations ?? []) {
      if (t._key && t.ref) localeToRef.set(t._key, t.ref);
    }
    for (const ref of localeToRef.values()) {
      byDoc.set(ref, localeToRef);
    }
  }

  return byDoc;
}

function resolveFrDocId(
  nlDocId: string,
  localeMaps: Map<string, Map<string, string>>,
): string | null {
  return localeMaps.get(nlDocId)?.get("fr") ?? null;
}

function resolveFrRef(
  nlRef: string,
  localeMaps: Map<string, Map<string, string>>,
  frDocExists: Set<string>,
): { frRef: string | null; via: RelatedMapping["via"] } {
  const fromMeta = localeMaps.get(nlRef)?.get("fr");
  if (fromMeta && frDocExists.has(fromMeta)) {
    return { frRef: fromMeta, via: "translation.metadata" };
  }

  const fallback = getLocalizedRef(nlRef, "fr");
  if (fallback !== nlRef && frDocExists.has(fallback)) {
    return { frRef: fallback, via: "getLocalizedRef" };
  }

  return { frRef: null, via: "missing" };
}

function build62cPatchPlans(
  rows: FrXlsxRow[],
  frDocIdByNl: Map<string, string>,
  frDocs: Map<string, Record<string, unknown>>,
  baselineFrByReferentie: Map<string, string>,
): {
  toPatch: FrPatchPlan[];
  skipped: { referentie: string; reason: string; detail?: string }[];
} {
  const toPatch: FrPatchPlan[] = [];
  const skipped: { referentie: string; reason: string; detail?: string }[] = [];

  for (const row of rows) {
    if (!row.wordt || row.struck) continue;

    const { docId: nlDocId, fieldPath } = parseReferentie(row.referentie);
    if (!NL_DOC_IDS.includes(nlDocId as (typeof NL_DOC_IDS)[number])) continue;
    if (!FIELD_PATHS.includes(fieldPath as (typeof FIELD_PATHS)[number])) continue;

    const frDocId = frDocIdByNl.get(nlDocId);
    if (!frDocId) {
      skipped.push({
        referentie: row.referentie,
        reason: "missing_fr_doc",
        detail: `Geen FR-ref in translation.metadata voor ${nlDocId}`,
      });
      continue;
    }

    const doc = frDocs.get(frDocId);
    if (!doc) {
      skipped.push({
        referentie: row.referentie,
        reason: "missing_fr_doc",
        detail: `FR-document niet opgehaald: ${frDocId}`,
      });
      continue;
    }

    if (!pathExists(doc, fieldPath)) {
      skipped.push({
        referentie: row.referentie,
        reason: "missing_path",
        detail: `${frDocId}·${fieldPath}`,
      });
      continue;
    }

    const sanityFrNow = valueToComparableString(getValueAtPath(doc, fieldPath));
    const exportFrWas = baselineFrByReferentie.get(row.referentie) ?? "";

    if (normalizeForCompare(row.wordt) === normalizeForCompare(sanityFrNow)) {
      skipped.push({ referentie: row.referentie, reason: "unchanged" });
      continue;
    }

    // 62c: export-baseline is leeg (FR-docs ontbraken bij export via insight-fr-*).
    // Alleen 62a safety-check toepassen als er een niet-lege export-baseline is.
    if (exportFrWas.trim()) {
      const verification = verifyFrPatchTargetHtmlAware(exportFrWas, sanityFrNow, fieldPath);
      if (!verification.ok) {
        skipped.push({
          referentie: row.referentie,
          reason: "safety_mismatch",
          detail: verification.reason,
        });
        continue;
      }
    }

    const htmlPreserve = needsHtmlPreserve(sanityFrNow, row.opmaakNl);
    const patchPreview = htmlPreserve
      ? buildHtmlPreservePreview(sanityFrNow, row.opmaakNl, row.wordt)
      : row.wordt;

    toPatch.push({
      referentie: row.referentie,
      frDocId,
      fieldPath,
      wordt: row.wordt,
      opmaakNl: row.opmaakNl,
      sanityFrNow,
      exportFrWas,
      htmlPreserve,
      patchPreview,
    });
  }

  return { toPatch, skipped };
}

async function main() {
  const { write, xlsxPath } = parseArgs();
  const readToken =
    process.env.SANITY_API_READ_TOKEN?.trim() || process.env.SANITY_API_WRITE_TOKEN?.trim();
  if (write && !process.env.SANITY_API_WRITE_TOKEN?.trim()) {
    throw new Error("SANITY_API_WRITE_TOKEN required for --write");
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token: write ? process.env.SANITY_API_WRITE_TOKEN!.trim() : readToken || undefined,
    useCdn: false,
  });

  console.log(`HOB-62c — FR-insights metadata + Alta Verba (${write ? "WRITE" : "DRY-RUN"}) — ${dataset}`);
  console.log(`Bron: ${xlsxPath}`);
  console.log(`Patch-only (.set()) — geen createOrReplace, geen doc-delete, geen ID-migratie\n`);

  // --- Stap 1: resolve FR UUID via translation.metadata ---
  const metaDocs = await fetchTranslationMeta(client);
  const localeMaps = buildLocaleRefMap(metaDocs);

  console.log("=== Stap 1 — FR-doc resolve via translation.metadata ===\n");
  const frDocIdByNl = new Map<string, string>();
  for (const nlId of NL_DOC_IDS) {
    const frId = resolveFrDocId(nlId, localeMaps);
    frDocIdByNl.set(nlId, frId ?? "");
    const metaId =
      metaDocs.find((m) => m.translations?.some((t) => t.ref === nlId))?._id ?? "—";
    console.log(`${nlId}`);
    console.log(`  translation.metadata: ${metaId}`);
    console.log(`  FR UUID: ${frId ?? "❌ NIET GEVONDEN"}\n`);
    if (!frId) throw new Error(`Geen FR-ref voor ${nlId}`);
  }

  const frDocIds = [...new Set(frDocIdByNl.values())];
  const frDocsList = await client.fetch<Record<string, unknown>[]>(`*[_id in $ids]{...}`, {
    ids: frDocIds,
  });
  const frDocs = new Map(frDocsList.map((d) => [String(d._id), d]));

  // --- Stap 2: patch-plannen uit xlsx ---
  const xlsxRows = await readFrNieuwFromXlsx(xlsxPath);
  const scopedRows = xlsxRows.filter((r) =>
    NL_DOC_IDS.some((id) => r.referentie.startsWith(`${id}·`)),
  );
  const baselineFrByReferentie = await fetchBaselineFrByReferentie();
  const { toPatch, skipped } = build62cPatchPlans(
    scopedRows,
    frDocIdByNl,
    frDocs,
    baselineFrByReferentie,
  );

  console.log("=== Stap 2 — FR-tekst patches (12 velden) ===\n");
  const byFrDoc = new Map<string, FrPatchPlan[]>();
  for (const plan of toPatch) {
    const list = byFrDoc.get(plan.frDocId) ?? [];
    list.push(plan);
    byFrDoc.set(plan.frDocId, list);
  }

  for (const nlId of NL_DOC_IDS) {
    const frId = frDocIdByNl.get(nlId)!;
    const plans = byFrDoc.get(frId) ?? [];
    console.log(`--- ${nlId} → ${frId} ---`);
    if (plans.length === 0) {
      console.log("  (geen patches — unchanged of skipped)\n");
      continue;
    }
    for (const p of plans) {
      const preview = p.fieldPath === "body" ? clip(p.sanityFrNow, 70) : clip(p.sanityFrNow);
      const next = p.fieldPath === "body" ? clip(p.wordt, 70) : clip(p.wordt);
      console.log(`  ${p.fieldPath}`);
      console.log(`    was:   ${preview}`);
      console.log(`    wordt: ${next}`);
    }
    console.log("");
  }

  const skippedSafety = skipped.filter((s) => s.reason === "safety_mismatch");
  const skippedPath = skipped.filter((s) => s.reason === "missing_path");
  const skippedUnchanged = skipped.filter((s) => s.reason === "unchanged");

  if (skippedSafety.length || skippedPath.length) {
    console.log("--- Skipped (veiligheid / ontbrekend veld) ---");
    for (const s of [...skippedSafety, ...skippedPath]) {
      console.log(`  ${s.referentie} — ${s.reason}: ${s.detail ?? ""}`);
    }
    console.log("");
  }

  console.log(
    `Velden te patchen: ${toPatch.length}/12 | unchanged: ${skippedUnchanged.length} | skipped: ${skippedSafety.length + skippedPath.length}\n`,
  );

  if (skippedSafety.length) {
    console.error("🛑 STOP — safety mismatch, geen patches.");
    process.exit(1);
  }

  // --- Stap 3: relatedArticles mapping ---
  console.log("=== Stap 3 — relatedArticles NL → FR ===\n");

  const nlDocs = await client.fetch<
    { _id: string; title: string; relatedArticles: { _ref: string }[] | null }[]
  >(
    `*[_id in $ids]{ _id, title, relatedArticles[]->{ _id } }`,
    { ids: [...NL_DOC_IDS] },
  );

  const allInsightIds = await client.fetch<string[]>(
    `*[_type == "insightArticle"]._id`,
  );
  const frDocExists = new Set(allInsightIds);

  const refTitles = new Map(
    (
      await client.fetch<{ _id: string; title: string }[]>(
        `*[_type == "insightArticle"]{ _id, title }`,
      )
    ).map((d) => [d._id, d.title]),
  );

  type RelatedPlan = {
    nlDocId: string;
    frDocId: string;
    mappings: RelatedMapping[];
    frRefs: string[];
    skipReason?: string;
  };

  const relatedPlans: RelatedPlan[] = [];

  for (const nlDoc of nlDocs) {
    const frDocId = frDocIdByNl.get(nlDoc._id)!;
    const nlRefs = (nlDoc.relatedArticles ?? []).map((r) => r._id).filter(Boolean);
    const mappings: RelatedMapping[] = [];

    for (const nlRef of nlRefs) {
      const { frRef, via } = resolveFrRef(nlRef, localeMaps, frDocExists);
      mappings.push({
        nlRef,
        nlTitle: refTitles.get(nlRef) ?? "—",
        frRef,
        frTitle: frRef ? (refTitles.get(frRef) ?? "—") : null,
        via,
      });
    }

    const missing = mappings.filter((m) => !m.frRef);
    const frRefs = mappings.map((m) => m.frRef).filter(Boolean) as string[];

    relatedPlans.push({
      nlDocId: nlDoc._id,
      frDocId,
      mappings,
      frRefs,
      skipReason: missing.length
        ? `Kan ${missing.length} NL-ref(s) niet mappen naar FR`
        : undefined,
    });

    console.log(`--- ${nlDoc._id} → ${frDocId} ---`);
    for (const m of mappings) {
      const status = m.frRef ? "✅" : "❌";
      console.log(
        `  ${status} ${m.nlRef} (${clip(m.nlTitle, 50)})`,
      );
      console.log(
        `       → ${m.frRef ?? "MISSING"} (${m.frTitle ? clip(m.frTitle, 50) : "—"}) [${m.via}]`,
      );
    }
    console.log(
      `  relatedArticles patch: [${frRefs.map((r) => `"${r}"`).join(", ")}]`,
    );
    if (missing.length) console.log(`  ⚠️ SKIP relatedArticles — ontbrekende FR-ref`);
    console.log("");
  }

  const relatedBlocked = relatedPlans.some((p) => p.skipReason);
  if (relatedBlocked) {
    console.error("🛑 STOP — relatedArticles mapping incompleet.");
    process.exit(1);
  }

  // --- Write (only with --write) ---
  if (!write) {
    console.log("✅ Bevestiging dry-run:");
    console.log("   • Geen nieuwe documents aangemaakt");
    console.log("   • Geen createOrReplace gebruikt");
    console.log("   • Geen UUID-doc verwijderd");
    console.log("   • Geen ID-migratie (stap 5 overgeslagen)");
    console.log("   • Geen taalswitcher-wijzigingen (stap 6 overgeslagen)");
    console.log("\n🛑 STOP — dry-run afgerond. Schrijven: npm run migrate:62c -- --write");
    return;
  }

  console.log("Sanity patches (patch-only .set())...\n");

  for (const [frDocId, plans] of byFrDoc) {
    const doc = frDocs.get(frDocId);
    if (!doc) throw new Error(`Document niet gevonden: ${frDocId}`);

    const setPayload: Record<string, unknown> = {};
    for (const plan of plans) {
      const currentValue = getValueAtPath(doc, plan.fieldPath);
      setPayload[plan.fieldPath] = buildFrPatchValue(plan, currentValue);
    }

    if (Object.keys(setPayload).length) {
      await client.patch(frDocId).set(setPayload).commit();
      console.log(`PATCH OK ${frDocId} → ${plans.length} veld(en)`);
    }
  }

  for (const rp of relatedPlans) {
    const frRelated = rp.frRefs.map((ref) => ({ _type: "reference" as const, _ref: ref }));
    await client.patch(rp.frDocId).set({ relatedArticles: frRelated }).commit();
    console.log(`PATCH OK ${rp.frDocId} → relatedArticles (${frRelated.length})`);
  }

  console.log("\nKlaar — HOB-62c patches toegepast (geen createOrReplace, geen deletes).");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
