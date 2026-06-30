/**
 * HOB-47-A — Site-wide em/en-dash cleanup (spaced dashes only).
 *
 * Dry-run (default):
 *   npm run migrate:dashes
 *
 * Write to Sanity:
 *   npm run migrate:dashes -- --write
 *
 * Include seed.ts preview / write:
 *   npm run migrate:dashes -- --seed
 *   npm run migrate:dashes -- --write --seed
 */
import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";
import {
  classifyFieldPath,
  containsReplaceableDash,
  countSpacedDashes,
  inferSeedFieldKind,
  replaceDashes,
  shouldSkipKey,
  type FieldKind,
} from "./lib/replace-dashes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

type FieldChange = {
  path: string;
  before: string;
  after: string;
  fieldKind: FieldKind;
  docId: string;
  docType: string;
  language?: string;
};

type DocPlan = {
  docId: string;
  docType: string;
  language?: string;
  changes: FieldChange[];
  setPayload: Record<string, unknown>;
};

function parseArgs() {
  const write = process.argv.includes("--write");
  const seed = process.argv.includes("--seed");
  return { dryRun: !write, write, seed };
}

function transformValue(
  value: unknown,
  fieldPath: string,
  changes: FieldChange[],
  docMeta: Pick<FieldChange, "docId" | "docType" | "language">,
  skipSubtree = false,
): unknown {
  if (skipSubtree) return value;

  if (typeof value === "string") {
    if (!containsReplaceableDash(value)) return value;
    const fieldKind = classifyFieldPath(fieldPath);
    const after = replaceDashes(value, fieldPath, fieldKind);
    if (after === value) return value;
    changes.push({
      path: fieldPath,
      before: value,
      after,
      fieldKind,
      ...docMeta,
    });
    return after;
  }

  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((item, index) => {
      const transformed = transformValue(item, `${fieldPath}[${index}]`, changes, docMeta);
      if (transformed !== item) changed = true;
      return transformed;
    });
    return changed ? next : value;
  }

  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    let changed = false;
    const out: Record<string, unknown> = {};

    for (const [key, child] of Object.entries(obj)) {
      if (shouldSkipKey(key, fieldPath.split(".").pop())) {
        out[key] = child;
        continue;
      }
      const childPath = fieldPath ? `${fieldPath}.${key}` : key;
      const transformed = transformValue(child, childPath, changes, docMeta);
      out[key] = transformed;
      if (transformed !== child) changed = true;
    }

    return changed ? out : value;
  }

  return value;
}

function buildDocPlan(doc: Record<string, unknown>): DocPlan | null {
  const changes: FieldChange[] = [];
  const setPayload: Record<string, unknown> = {};
  const docMeta = {
    docId: String(doc._id),
    docType: String(doc._type ?? "unknown"),
    language: typeof doc.language === "string" ? doc.language : undefined,
  };

  for (const [key, value] of Object.entries(doc)) {
    if (key.startsWith("_")) continue;
    const transformed = transformValue(value, key, changes, docMeta);
    if (transformed !== value) {
      setPayload[key] = transformed;
    }
  }

  if (changes.length === 0) return null;

  return {
    docId: docMeta.docId,
    docType: docMeta.docType,
    language: docMeta.language,
    changes,
    setPayload,
  };
}

function printChange(change: FieldChange) {
  const trim = (s: string, max = 220) => (s.length > max ? `${s.slice(0, max)}…` : s);
  const lang = change.language ? ` [${change.language}]` : "";
  console.log(`    • [${change.fieldKind}] ${change.docId} (${change.docType}${lang}) → ${change.path}`);
  console.log(`      − ${trim(change.before)}`);
  console.log(`      + ${trim(change.after)}`);
}

function formatChangeReport(change: FieldChange): string[] {
  const lang = change.language ? ` [${change.language}]` : "";
  return [
    `### [${change.fieldKind}] \`${change.path}\` — ${change.docId} (${change.docType}${lang})`,
    "",
    "**Was:**",
    "```",
    change.before,
    "```",
    "",
    "**Wordt:**",
    "```",
    change.after,
    "```",
    "",
  ];
}

function scanSeedTs(): FieldChange[] {
  const seedPath = path.join(process.cwd(), "scripts", "seed.ts");
  const content = fs.readFileSync(seedPath, "utf8");
  const changes: FieldChange[] = [];

  const stringRe = /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g;
  let match: RegExpExecArray | null;
  while ((match = stringRe.exec(content)) !== null) {
    const raw = match[2];
    const unescaped = raw
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"');
    if (!containsReplaceableDash(unescaped)) continue;

    const lineNo = content.slice(0, match.index).split("\n").length;
    const context = content.slice(Math.max(0, match.index - 120), match.index + 40);
    const fieldKind = inferSeedFieldKind(context);
    const fieldPath = `seed.ts ~L${lineNo}`;
    const after = replaceDashes(unescaped, fieldPath, fieldKind);
    if (after === unescaped) continue;

    changes.push({
      path: fieldPath,
      before: unescaped,
      after,
      fieldKind,
      docId: "seed.ts",
      docType: "seed",
    });
  }

  return changes;
}

function applySeedTs(changes: FieldChange[]) {
  const seedPath = path.join(process.cwd(), "scripts", "seed.ts");
  let content = fs.readFileSync(seedPath, "utf8");

  for (const change of changes) {
    if (!content.includes(change.before)) {
      console.warn(`⚠️  seed.ts: kon string niet vinden voor ${change.path}`);
      continue;
    }
    content = content.replace(change.before, change.after);
  }

  fs.writeFileSync(seedPath, content, "utf8");
}

function groupChanges(changes: FieldChange[]) {
  const meta = changes.filter((c) => c.fieldKind === "meta");
  const text = changes.filter((c) => c.fieldKind === "text");
  return { meta, text };
}

type MultiDashEntry = {
  path: string;
  docId: string;
  docType: string;
  language?: string;
  dashCount: number;
  before: string;
  after: string;
  ok: boolean;
  issue?: string;
};

function verifyMultiDashReplacement(before: string, after: string): { ok: boolean; issue?: string } {
  if (countSpacedDashes(after) > 0) {
    return { ok: false, issue: `nog ${countSpacedDashes(after)} spaced dash(es) in resultaat` };
  }
  if (/[\u2013\u2014]/.test(after)) {
    return { ok: false, issue: "nog unicode-dash in resultaat" };
  }
  // Duplication heuristic: wordt significantly longer than expected
  const expectedMax = before.length + 8;
  if (after.length > expectedMax) {
    return { ok: false, issue: `verdachte lengte (${after.length} vs was ${before.length})` };
  }
  return { ok: true };
}

function collectMultiDashFromValue(
  value: unknown,
  fieldPath: string,
  docMeta: Pick<FieldChange, "docId" | "docType" | "language">,
  out: MultiDashEntry[],
): void {
  if (typeof value === "string") {
    if (countSpacedDashes(value) < 2) return;
    const fieldKind = classifyFieldPath(fieldPath);
    const after = replaceDashes(value, fieldPath, fieldKind);
    const check = verifyMultiDashReplacement(value, after);
    out.push({
      path: fieldPath,
      dashCount: countSpacedDashes(value),
      before: value,
      after,
      ...docMeta,
      ...check,
    });
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) =>
      collectMultiDashFromValue(item, `${fieldPath}[${index}]`, docMeta, out),
    );
    return;
  }

  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    for (const [key, child] of Object.entries(obj)) {
      if (shouldSkipKey(key, fieldPath.split(".").pop())) continue;
      const childPath = fieldPath ? `${fieldPath}.${key}` : key;
      collectMultiDashFromValue(child, childPath, docMeta, out);
    }
  }
}

function scanSeedMultiDash(): MultiDashEntry[] {
  const seedPath = path.join(process.cwd(), "scripts", "seed.ts");
  const content = fs.readFileSync(seedPath, "utf8");
  const out: MultiDashEntry[] = [];
  const stringRe = /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g;
  let match: RegExpExecArray | null;
  while ((match = stringRe.exec(content)) !== null) {
    const raw = match[2];
    const unescaped = raw
      .replace(/\\n/g, "\n")
      .replace(/\\t/g, "\t")
      .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
      .replace(/\\'/g, "'")
      .replace(/\\"/g, '"');
    if (countSpacedDashes(unescaped) < 2) continue;
    const lineNo = content.slice(0, match.index).split("\n").length;
    const context = content.slice(Math.max(0, match.index - 120), match.index + 40);
    const fieldKind = inferSeedFieldKind(context);
    const fieldPath = `seed.ts ~L${lineNo}`;
    const after = replaceDashes(unescaped, fieldPath, fieldKind);
    const check = verifyMultiDashReplacement(unescaped, after);
    out.push({
      path: fieldPath,
      dashCount: countSpacedDashes(unescaped),
      before: unescaped,
      after,
      docId: "seed.ts",
      docType: "seed",
      ...check,
    });
  }
  return out;
}

function formatMultiDashReport(entries: MultiDashEntry[]): string[] {
  if (entries.length === 0) {
    return ["## Multi-dash strings (2+ ` — ` per veld)", "", "_Geen gevonden._", ""];
  }
  const lines = [
    `## Multi-dash strings (${entries.length} velden met 2+ spaced dash)`,
    "",
    entries.every((e) => e.ok)
      ? "✅ Alle multi-dash strings correct verwerkt."
      : "⚠️ Controleer de gemarkeerde entries.",
    "",
  ];
  for (const e of entries) {
    const lang = e.language ? ` [${e.language}]` : "";
    const status = e.ok ? "✅" : `❌ ${e.issue}`;
    lines.push(
      `### ${status} \`${e.path}\` — ${e.docId} (${e.docType}${lang}) · ${e.dashCount} dashes`,
      "",
      "**Was:**",
      "```",
      e.before,
      "```",
      "",
      "**Wordt:**",
      "```",
      e.after,
      "```",
      "",
    );
  }
  return lines;
}

async function main() {
  const { dryRun, write, seed } = parseArgs();

  if (write && !token) {
    throw new Error("SANITY_API_WRITE_TOKEN is required for --write");
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    useCdn: false,
    token: write ? token : undefined,
  });

  const reportLines: string[] = [
    "# Dash migration dry-run (HOB-47-A)",
    "",
    `Dataset: \`${dataset}\``,
    `Mode: ${dryRun ? "DRY-RUN" : "WRITE"}`,
    "",
    "**Regels:**",
    "- Alleen losse em-dash met spaties (` — `); koppeltekens in woorden (Pinch-bottom) blijven intact.",
    "- **meta**-velden + **quoteAttr**: `—` → `-`",
    "- **text**-velden: `—` → `,` of `.` (nieuwe hoofdzin: onderwerp + persoonsvorm → punt + hoofdletter)",
    "- `[AI-translated]`-marker blijft staan; alleen de dash erin wordt vervangen.",
    "- Bereiken `200–3600` → `200-3600`",
    "",
  ];

  console.log(`Dash migration HOB-47-A (${dryRun ? "DRY-RUN" : "WRITE"}) — dataset ${dataset}\n`);

  const docs = await client.fetch<Record<string, unknown>[]>(
    `*[!(_id in path("_.**")) && !(_id in path("drafts.**"))]`,
  );

  const plans = docs
    .map((doc) => buildDocPlan(doc))
    .filter((plan): plan is DocPlan => plan !== null);

  const allSanityChanges = plans.flatMap((p) => p.changes);
  const seedChanges = seed || dryRun ? scanSeedTs() : [];
  const allChanges = [...allSanityChanges, ...seedChanges];
  const { meta, text } = groupChanges(allChanges);

  const multiDashEntries: MultiDashEntry[] = [];
  for (const doc of docs) {
    const docMeta = {
      docId: String(doc._id),
      docType: String(doc._type ?? "unknown"),
      language: typeof doc.language === "string" ? doc.language : undefined,
    };
    for (const [key, value] of Object.entries(doc)) {
      if (key.startsWith("_")) continue;
      collectMultiDashFromValue(value, key, docMeta, multiDashEntries);
    }
  }
  if (seed || dryRun) {
    multiDashEntries.push(...scanSeedMultiDash());
  }
  // Deduplicate seed entries that also appear in changes scan
  const multiDashKey = (e: MultiDashEntry) => `${e.docId}|${e.path}|${e.before}`;
  const seenMulti = new Set<string>();
  const uniqueMultiDash = multiDashEntries.filter((e) => {
    const k = multiDashKey(e);
    if (seenMulti.has(k)) return false;
    seenMulti.add(k);
    return true;
  });

  console.log(`=== MULTI-DASH (${uniqueMultiDash.length} strings met 2+ spaced dash) ===\n`);
  for (const e of uniqueMultiDash) {
    const status = e.ok ? "✅" : `❌ ${e.issue}`;
    console.log(`  ${status} ${e.docId} → ${e.path} (${e.dashCount} dashes)`);
    if (!e.ok) {
      console.log(`      − ${e.before.slice(0, 120)}…`);
      console.log(`      + ${e.after.slice(0, 120)}…`);
    }
  }
  console.log();

  const multiDashReport = formatMultiDashReport(uniqueMultiDash);

  console.log(`=== META-VELDEN (${meta.length}) — em-dash → streepje (-) ===\n`);
  reportLines.push(`## META-VELDEN (${meta.length}) — em-dash → streepje (-)`, "");
  for (const change of meta) {
    printChange(change);
    reportLines.push(...formatChangeReport(change));
  }

  console.log(`\n=== LOPENDE TEKST (${text.length}) — em-dash → komma/punt ===\n`);
  reportLines.push(`## LOPENDE TEKST (${text.length}) — em-dash → komma/punt`, "");
  for (const change of text) {
    printChange(change);
    reportLines.push(...formatChangeReport(change));
  }

  console.log(
    `\nSanity: ${plans.length} document(en), ${allSanityChanges.length} veld(en).` +
      (seedChanges.length ? ` seed.ts: ${seedChanges.length} string(s).` : ""),
  );
  reportLines.push(
    "---",
    "",
    `**Sanity totaal:** ${plans.length} documenten, ${allSanityChanges.length} velden.`,
    `**seed.ts:** ${seedChanges.length} strings.`,
    `**META:** ${meta.length} · **TEXT:** ${text.length}`,
    "",
    ...multiDashReport,
  );

  if (write && seed && seedChanges.length > 0) {
    applySeedTs(seedChanges);
    console.log(`seed.ts bijgewerkt (${seedChanges.length} string(s)).\n`);
  }

  if (dryRun) {
    const reportPath = path.join(process.cwd(), "docs", "dash-migration-dry-run.md");
    fs.mkdirSync(path.dirname(reportPath), { recursive: true });
    fs.writeFileSync(reportPath, reportLines.join("\n"), "utf8");
    console.log(`\nRapport: ${reportPath}`);
    console.log("🛑 STOP — dry-run afgerond. Review META vs TEXT secties in het rapport.");
    console.log("   Sanity schrijven: npm run migrate:dashes -- --write");
    console.log("   + seed.ts:        npm run migrate:dashes -- --write --seed");
    return;
  }

  for (const plan of plans) {
    await client.patch(plan.docId).set(plan.setPayload).commit();
    console.log(`PATCH OK ${plan.docId} (${Object.keys(plan.setPayload).length} top-level veld(en))`);
  }

  console.log(`\nKlaar — ${plans.length} document(en) gepatcht.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
