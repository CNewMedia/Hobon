/**
 * HOB-61 — Sync NL → FR/EN image asset-refs (locale-empty gaps uit HOB-60).
 *
 * Dry-run (default):
 *   npm run sync:locale-images-61
 *
 * Write:
 *   npm run sync:locale-images-61 -- --write
 *
 * Alleen bestaande asset-refs kopiëren — geen uploads, geen NL-patches.
 * Overschrijft nooit een reeds gevuld veld met andere ref.
 */
import { createClient, type SanityClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

type ImageWithAlt = {
  _type: "imageWithAlt";
  alt: string;
  image: { _type: "image"; asset: { _type: "reference"; _ref: string } };
};

type SyncTask = {
  targetId: string;
  sourceId: string;
  field: "heroImage" | "aboutImage";
  label: string;
};

/** Product-slugs uit HOB-60 locale-empty (boterfolie al gevuld — niet in lijst). */
const PRODUCT_SLUGS = [
  "blaasfolies",
  "dolav-zakken",
  "kratzakken",
  "pattyn",
  "stretch-hood",
  "vellen",
  "zakken",
] as const;

const TARGET_LOCALES = ["fr", "en"] as const;

function parseArgs() {
  return { dryRun: !process.argv.includes("--write") };
}

function assetRef(field: ImageWithAlt | null | undefined): string | null {
  return field?.image?.asset?._ref ?? null;
}

function cloneImageRef(source: ImageWithAlt, alt: string): ImageWithAlt {
  const ref = assetRef(source);
  if (!ref) throw new Error("Bron mist asset-ref");
  return {
    _type: "imageWithAlt",
    alt: alt || source.alt || "",
    image: { _type: "image", asset: { _type: "reference", _ref: ref } },
  };
}

function buildTasks(): SyncTask[] {
  const tasks: SyncTask[] = [];

  for (const slug of PRODUCT_SLUGS) {
    const sourceId = `product-nl-${slug}`;
    for (const locale of TARGET_LOCALES) {
      tasks.push({
        targetId: `product-${locale}-${slug}`,
        sourceId,
        field: "heroImage",
        label: `product ${locale}/${slug} ← NL heroImage`,
      });
    }
  }

  for (const locale of TARGET_LOCALES) {
    tasks.push({
      targetId: `homePage-${locale}`,
      sourceId: "homePage-nl",
      field: "aboutImage",
      label: `homePage ${locale} ← NL aboutImage`,
    });
  }

  return tasks;
}

type PlannedAction = SyncTask & {
  action: "patch" | "skip";
  skipReason?: string;
  sourceFilename?: string | null;
  targetFilename?: string | null;
};

async function assetFilename(client: SanityClient, ref: string | null): Promise<string | null> {
  if (!ref) return null;
  const row = await client.fetch<{ originalFilename?: string }>(
    `*[_id == $id][0]{ originalFilename }`,
    { id: ref },
  );
  return row?.originalFilename ?? null;
}

async function planTask(client: SanityClient, task: SyncTask): Promise<PlannedAction> {
  const source = await client.fetch<{ heroImage?: ImageWithAlt; aboutImage?: ImageWithAlt; title?: string }>(
    `*[_id == $id][0]{ title, heroImage, aboutImage }`,
    { id: task.sourceId },
  );
  const target = await client.fetch<{ heroImage?: ImageWithAlt; aboutImage?: ImageWithAlt; title?: string }>(
    `*[_id == $id][0]{ title, heroImage, aboutImage }`,
    { id: task.targetId },
  );

  if (!source) {
    return { ...task, action: "skip", skipReason: `bron ${task.sourceId} niet gevonden` };
  }
  if (!target) {
    return { ...task, action: "skip", skipReason: `doel ${task.targetId} niet gevonden` };
  }

  const sourceField = task.field === "heroImage" ? source.heroImage : source.aboutImage;
  const targetField = task.field === "heroImage" ? target.heroImage : target.aboutImage;
  const sourceRef = assetRef(sourceField);
  const targetRef = assetRef(targetField);

  const [sourceFilename, targetFilename] = await Promise.all([
    assetFilename(client, sourceRef),
    assetFilename(client, targetRef),
  ]);

  if (!sourceRef) {
    return {
      ...task,
      action: "skip",
      skipReason: `NL ${task.field} leeg op ${task.sourceId}`,
      sourceFilename,
      targetFilename,
    };
  }

  if (targetRef === sourceRef) {
    return {
      ...task,
      action: "skip",
      skipReason: "al gesynchroniseerd (zelfde asset-ref)",
      sourceFilename,
      targetFilename,
    };
  }

  if (targetRef) {
    return {
      ...task,
      action: "skip",
      skipReason: "doel heeft al andere asset — niet overschrijven",
      sourceFilename,
      targetFilename,
    };
  }

  return { ...task, action: "patch", sourceFilename, targetFilename };
}

async function main() {
  const { dryRun } = parseArgs();
  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token: dryRun ? undefined : token,
    useCdn: false,
  });

  if (!dryRun && !token) {
    console.error("SANITY_API_WRITE_TOKEN ontbreekt in .env.local");
    process.exit(1);
  }

  const tasks = buildTasks();
  const plans: PlannedAction[] = [];
  for (const task of tasks) {
    plans.push(await planTask(client, task));
  }

  console.log(`\n${"=".repeat(72)}`);
  console.log(`HOB-61 — NL → FR/EN image sync (${dryRun ? "DRY-RUN" : "WRITE"})`);
  console.log(`${"=".repeat(72)}\n`);

  for (const p of plans) {
    const icon = p.action === "patch" ? "PATCH" : "SKIP";
    console.log(`[${icon}] ${p.label}`);
    console.log(`  ${p.targetId}.${p.field} ← ${p.sourceId}.${p.field}`);
    if (p.sourceFilename) console.log(`  NL asset: ${p.sourceFilename}`);
    if (p.targetFilename) console.log(`  huidig doel: ${p.targetFilename}`);
    if (p.skipReason) console.log(`  ${p.skipReason}`);
    console.log("");
  }

  const patches = plans.filter((p) => p.action === "patch");
  const skips = plans.filter((p) => p.action === "skip");
  console.log("--- Samenvatting ---");
  console.log(`Patches: ${patches.length}`);
  console.log(`Skips: ${skips.length}`);

  if (dryRun) return;

  for (const p of patches) {
    const source = await client.fetch<{ heroImage?: ImageWithAlt; aboutImage?: ImageWithAlt; title?: string }>(
      `*[_id == $id][0]{ title, heroImage, aboutImage }`,
      { id: p.sourceId },
    );
    const target = await client.fetch<{ title?: string; heroImage?: ImageWithAlt; aboutImage?: ImageWithAlt }>(
      `*[_id == $id][0]{ title, heroImage, aboutImage }`,
      { id: p.targetId },
    );
    const sourceField = p.field === "heroImage" ? source?.heroImage : source?.aboutImage;
    if (!sourceField) continue;

    const existingAlt =
      (p.field === "heroImage" ? target?.heroImage?.alt : target?.aboutImage?.alt)?.trim() ||
      target?.title?.trim() ||
      sourceField.alt?.trim() ||
      "";

    const value = cloneImageRef(sourceField, existingAlt);
    await client.patch(p.targetId).set({ [p.field]: value }).commit({ visibility: "async" });
    console.log(`OK ${p.targetId}.${p.field} ← ${p.sourceFilename ?? assetRef(sourceField)}`);
  }

  console.log("\nKlaar.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
