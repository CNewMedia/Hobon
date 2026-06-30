/**
 * HOB-48 — Remove [AI-translated] marker from Sanity content + seed.ts.
 *
 * Dry-run (default):
 *   npm run migrate:strip-ai-marker
 *
 * Write to Sanity + seed.ts:
 *   npm run migrate:strip-ai-marker -- --write --seed
 */
import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";
import { containsAIMarker, stripAIMarker } from "../lib/text/strip-ai-marker";
import { shouldSkipKey } from "./lib/replace-dashes";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

const BACKUP_PATH = path.join(process.cwd(), "docs", "ai-translated-backup.md");

type FieldChange = {
  path: string;
  before: string;
  after: string;
  docId: string;
  docType: string;
  language?: string;
  warning?: string;
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
): unknown {
  if (typeof value === "string") {
    if (!containsAIMarker(value)) return value;
    const after = stripAIMarker(value);
    const warning =
      after === value
        ? "marker aanwezig maar niet als prefix — handmatig controleren"
        : undefined;
    if (after === value && !warning) return value;
    changes.push({
      path: fieldPath,
      before: value,
      after,
      warning,
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

function unescapeSeedString(raw: string): string {
  return raw
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "\t")
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\\'/g, "'")
    .replace(/\\"/g, '"');
}

function scanSeedTs(): FieldChange[] {
  const seedPath = path.join(process.cwd(), "scripts", "seed.ts");
  const content = fs.readFileSync(seedPath, "utf8");
  const changes: FieldChange[] = [];
  const stringRe = /(["'`])((?:\\.|(?!\1)[^\\])*?)\1/g;
  let match: RegExpExecArray | null;

  while ((match = stringRe.exec(content)) !== null) {
    const unescaped = unescapeSeedString(match[2]);
    if (!containsAIMarker(unescaped)) continue;

    const lineNo = content.slice(0, match.index).split("\n").length;
    const after = stripAIMarker(unescaped);
    const warning =
      after === unescaped
        ? "marker aanwezig maar niet als prefix — handmatig controleren"
        : undefined;
    if (after === unescaped) continue;

    changes.push({
      path: `seed.ts ~L${lineNo}`,
      before: unescaped,
      after,
      docId: "seed.ts",
      docType: "seed",
      warning,
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

function printChange(change: FieldChange) {
  const trim = (s: string, max = 220) => (s.length > max ? `${s.slice(0, max)}…` : s);
  const lang = change.language ? ` [${change.language}]` : "";
  const warn = change.warning ? ` ⚠️ ${change.warning}` : "";
  console.log(`    • ${change.docId} (${change.docType}${lang}) → ${change.path}${warn}`);
  console.log(`      − ${trim(change.before)}`);
  console.log(`      + ${trim(change.after)}`);
}

function formatBackupReport(
  changes: FieldChange[],
  mode: "DRY-RUN" | "WRITE",
): string {
  const warnings = changes.filter((c) => c.warning);
  const lines = [
    "# [AI-translated] backup / review (HOB-48)",
    "",
    `Dataset: \`${dataset}\``,
    `Mode: ${mode}`,
    `Gegenereerd: ${new Date().toISOString()}`,
    "",
    "**Doel:** review-overzicht voor Frederik — alleen de `[AI-translated]` prefix wordt verwijderd.",
    "",
    `**Totaal:** ${changes.length} veld(en) in ${new Set(changes.map((c) => c.docId)).size} document(en)`,
    warnings.length ? `**Waarschuwingen:** ${warnings.length} veld(en) met marker niet als prefix` : "",
    "",
    "## Index",
    "",
    "| Doc ID | Type | Taal | Veld |",
    "|--------|------|------|------|",
  ];

  for (const c of changes) {
    lines.push(`| \`${c.docId}\` | ${c.docType} | ${c.language ?? "—"} | \`${c.path}\` |`);
  }

  lines.push("", "## Detail per veld", "");

  for (const c of changes) {
    const lang = c.language ? ` [${c.language}]` : "";
    const warn = c.warning ? ` ⚠️ ${c.warning}` : "";
    lines.push(
      `### \`${c.path}\` — ${c.docId} (${c.docType}${lang})${warn}`,
      "",
      "**Was:**",
      "```",
      c.before,
      "```",
      "",
      "**Wordt:**",
      "```",
      c.after,
      "```",
      "",
    );
  }

  return lines.join("\n");
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

  console.log(
    `Strip [AI-translated] HOB-48 (${dryRun ? "DRY-RUN" : "WRITE"}) — dataset ${dataset}\n`,
  );

  const docs = await client.fetch<Record<string, unknown>[]>(
    `*[!(_id in path("_.**")) && !(_id in path("drafts.**"))]`,
  );

  const plans = docs
    .map((doc) => buildDocPlan(doc))
    .filter((plan): plan is DocPlan => plan !== null);

  const sanityChanges = plans.flatMap((p) => p.changes);
  const seedChanges = seed || dryRun ? scanSeedTs() : [];
  const allChanges = [...sanityChanges, ...seedChanges];

  console.log(`=== VELDEN MET [AI-translated] (${allChanges.length}) ===\n`);
  for (const change of allChanges) {
    printChange(change);
  }

  console.log(
    `\nSanity: ${plans.length} document(en), ${sanityChanges.length} veld(en).` +
      (seedChanges.length ? ` seed.ts: ${seedChanges.length} string(s).` : ""),
  );

  const backupContent = formatBackupReport(allChanges, dryRun ? "DRY-RUN" : "WRITE");
  if (allChanges.length > 0) {
    fs.mkdirSync(path.dirname(BACKUP_PATH), { recursive: true });
    fs.writeFileSync(BACKUP_PATH, backupContent, "utf8");
    console.log(`\nBackup/review: ${BACKUP_PATH}`);
  } else if (dryRun) {
    console.log("\nGeen [AI-translated] markers gevonden — backup ongewijzigd.");
  }

  if (dryRun) {
    console.log("\n🛑 STOP — dry-run afgerond. Review docs/ai-translated-backup.md.");
    console.log("   Sanity + seed schrijven: npm run migrate:strip-ai-marker -- --write --seed");
    return;
  }

  if (seed && seedChanges.length > 0) {
    applySeedTs(seedChanges);
    console.log(`seed.ts bijgewerkt (${seedChanges.length} string(s)).`);
  }

  for (const plan of plans) {
    await client.patch(plan.docId).set(plan.setPayload).commit();
    console.log(`PATCH OK ${plan.docId} (${Object.keys(plan.setPayload).length} top-level veld(en))`);
  }

  console.log(`\nKlaar — ${plans.length} Sanity-document(en) gepatcht.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
