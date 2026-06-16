/**
 * HOB-38b — Sector URL-beelden → Sanity imageWithAlt uploads.
 *
 * Dry-run (default):
 *   npm run migrate:sector-images -- --batch=top-level
 *   npm run migrate:sector-images -- --batch=nested-hero-thumbs
 *   npm run migrate:sector-images -- --batch=nested-solution-cards
 *   npm run migrate:sector-images -- --batch=nested-case-studies
 *
 * Write (alleen na goedgekeurde dry-run per batch):
 *   npm run migrate:sector-images -- --batch=top-level --write
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

type ImageWithAlt = {
  _type?: string;
  alt?: string;
  image?: { _type?: string; asset?: { _type?: string; _ref?: string } };
};

type SectorDoc = {
  _id: string;
  title?: string;
  language?: string;
  slug?: { current?: string };
  listingImage?: ImageWithAlt | null;
  listingImageUrl?: string | null;
  heroMainImage?: ImageWithAlt | null;
  heroMainImageUrl?: string | null;
  deepPhoto?: ImageWithAlt | null;
  deepPhotoUrl?: string | null;
  deepPhotoCaption?: string | null;
  heroThumbs?: { image?: ImageWithAlt | null; imageUrl?: string | null; label?: string | null }[] | null;
  solutionCards?: {
    image?: ImageWithAlt | null;
    imageUrl?: string | null;
    title?: string | null;
  }[] | null;
  caseStudies?: {
    image?: ImageWithAlt | null;
    imageUrl?: string | null;
    title?: string | null;
    sectorLabel?: string | null;
  }[] | null;
};

type PlannedAction = {
  docId: string;
  path: string;
  sourceUrl: string;
  alt: string;
  action: "zou uploaden" | "skip";
  skipReason?: string;
};

const BATCHES = [
  "top-level",
  "nested-hero-thumbs",
  "nested-solution-cards",
  "nested-case-studies",
] as const;

type Batch = (typeof BATCHES)[number];

function parseArgs() {
  const args = process.argv.slice(2);
  const batchArg = args.find((a) => a.startsWith("--batch="));
  const batch = batchArg?.split("=")[1] as Batch | undefined;
  const write = args.includes("--write");
  const dryRun = !write;
  return { batch, dryRun, write };
}

function hasAsset(field?: ImageWithAlt | null): boolean {
  return Boolean(field?.image?.asset?._ref);
}

function dedupeKey(url: string): string {
  return url.trim();
}

function deriveAlt(sector: SectorDoc, hint?: string | null): string {
  const h = hint?.trim();
  if (h) return h;
  const t = sector.title?.trim();
  if (t) return t;
  return "Hobon";
}

async function fetchSectors(client: ReturnType<typeof createClient>): Promise<SectorDoc[]> {
  return client.fetch<SectorDoc[]>(
    `*[_type == "sector"] | order(language asc, title asc) {
      _id,
      title,
      language,
      slug,
      listingImage,
      listingImageUrl,
      heroMainImage,
      heroMainImageUrl,
      deepPhoto,
      deepPhotoUrl,
      deepPhotoCaption,
      heroThumbs[]{ image, imageUrl, label },
      solutionCards[]{ image, imageUrl, title },
      caseStudies[]{ image, imageUrl, title, sectorLabel }
    }`,
  );
}

function planTopLevel(sectors: SectorDoc[]): PlannedAction[] {
  const actions: PlannedAction[] = [];

  for (const sector of sectors) {
    const pairs: {
      path: string;
      target?: ImageWithAlt | null;
      sourceUrl?: string | null;
      altHint?: string | null;
    }[] = [
      {
        path: "listingImage",
        target: sector.listingImage,
        sourceUrl: sector.listingImageUrl,
        altHint: sector.title,
      },
      {
        path: "deepPhoto",
        target: sector.deepPhoto,
        sourceUrl: sector.deepPhotoUrl,
        altHint: sector.deepPhotoCaption ?? sector.title,
      },
      {
        path: "heroMainImage",
        target: sector.heroMainImage,
        sourceUrl: sector.heroMainImageUrl,
        altHint: sector.title,
      },
    ];

    for (const { path, target, sourceUrl, altHint } of pairs) {
      if (hasAsset(target)) {
        actions.push({
          docId: sector._id,
          path,
          sourceUrl: sourceUrl?.trim() ?? "",
          alt: deriveAlt(sector, altHint),
          action: "skip",
          skipReason: "skip-if-filled: upload-veld heeft al asset",
        });
        continue;
      }

      const url = sourceUrl?.trim();
      if (!url) {
        actions.push({
          docId: sector._id,
          path,
          sourceUrl: "",
          alt: deriveAlt(sector, altHint),
          action: "skip",
          skipReason: "geen bron-URL",
        });
        continue;
      }

      actions.push({
        docId: sector._id,
        path,
        sourceUrl: url,
        alt: deriveAlt(sector, altHint),
        action: "zou uploaden",
      });
    }
  }

  return actions;
}

function planNestedArray(
  sectors: SectorDoc[],
  arrayName: "heroThumbs" | "solutionCards" | "caseStudies",
  altFromItem: (sector: SectorDoc, item: NonNullable<SectorDoc[typeof arrayName]>[number]) => string,
): PlannedAction[] {
  const actions: PlannedAction[] = [];

  for (const sector of sectors) {
    const items = sector[arrayName] ?? [];
    if (items.length === 0) continue;

    items.forEach((item, index) => {
      const path = `${arrayName}[${index}].image`;

      if (hasAsset(item.image)) {
        actions.push({
          docId: sector._id,
          path,
          sourceUrl: item.imageUrl?.trim() ?? "",
          alt: altFromItem(sector, item),
          action: "skip",
          skipReason: "skip-if-filled: upload-veld heeft al asset",
        });
        return;
      }

      const url = item.imageUrl?.trim();
      if (!url) {
        actions.push({
          docId: sector._id,
          path,
          sourceUrl: "",
          alt: altFromItem(sector, item),
          action: "skip",
          skipReason: `geen imageUrl op ${arrayName}[${index}]`,
        });
        return;
      }

      actions.push({
        docId: sector._id,
        path,
        sourceUrl: url,
        alt: altFromItem(sector, item),
        action: "zou uploaden",
      });
    });
  }

  return actions;
}

function printDedupMap(actions: PlannedAction[]) {
  const uploadActions = actions.filter((a) => a.action === "zou uploaden");
  const map = new Map<string, { count: number; paths: string[] }>();

  for (const a of uploadActions) {
    const key = dedupeKey(a.sourceUrl);
    const entry = map.get(key) ?? { count: 0, paths: [] };
    entry.count += 1;
    entry.paths.push(`${a.docId} → ${a.path}`);
    map.set(key, entry);
  }

  console.log("\n--- Dedup-map (unieke bron-URL → aantal patches / 1 asset) ---");
  if (map.size === 0) {
    console.log("(geen uploads gepland)");
    return;
  }
  let assetCount = 0;
  for (const [url, { count, paths }] of [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
    assetCount += 1;
    console.log(`\n${url}`);
    console.log(`  → 1 asset, ${count} patch(es)`);
    for (const p of paths) console.log(`    · ${p}`);
  }
  console.log(`\nTotaal unieke assets: ${assetCount}`);
  console.log(`Totaal patches: ${uploadActions.length}`);
}

function printActions(batch: Batch, actions: PlannedAction[], dryRun: boolean) {
  console.log(`\n${"=".repeat(72)}`);
  console.log(`BATCH: ${batch}`);
  console.log(`MODE: ${dryRun ? "DRY-RUN (geen writes)" : "WRITE"}`);
  console.log(`${"=".repeat(72)}\n`);

  const upload = actions.filter((a) => a.action === "zou uploaden");
  const skipped = actions.filter((a) => a.action === "skip");

  for (const a of actions) {
    if (a.action === "zou uploaden") {
      console.log(
        `${a.docId} → ${a.path} → ${a.sourceUrl} → alt: "${a.alt}" → zou uploaden`,
      );
    } else {
      console.log(
        `${a.docId} → ${a.path} → ${a.sourceUrl || "(leeg)"} → alt: "${a.alt}" → SKIP (${a.skipReason})`,
      );
    }
  }

  console.log(`\n--- Samenvatting ---`);
  console.log(`Zou uploaden: ${upload.length}`);
  console.log(`Overgeslagen: ${skipped.length}`);
  console.log(
    `  davon skip-if-filled: ${skipped.filter((s) => s.skipReason?.includes("skip-if-filled")).length}`,
  );
  console.log(
    `  davon geen bron-URL: ${skipped.filter((s) => s.skipReason?.includes("geen")).length}`,
  );

  printDedupMap(actions);
}

function buildImageWithAlt(assetRef: string, alt: string): ImageWithAlt {
  return {
    _type: "imageWithAlt",
    alt,
    image: {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: assetRef,
      },
    },
  };
}

function filenameFromUrl(url: string): string {
  try {
    const u = new URL(url);
    const id = u.pathname.split("/").pop() ?? "image";
    const q = u.search ? u.search.replace(/[^a-zA-Z0-9]+/g, "-").slice(0, 40) : "";
    return `${id}${q}.jpg`.replace(/-+\.jpg$/, ".jpg");
  } catch {
    return "migrated-image.jpg";
  }
}

async function uploadAssetForUrl(
  client: ReturnType<typeof createClient>,
  url: string,
  cache: Map<string, string>,
): Promise<string> {
  const key = dedupeKey(url);
  const cached = cache.get(key);
  if (cached) return cached;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Download mislukt ${res.status} voor ${url}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const asset = await client.assets.upload("image", buffer, {
    filename: filenameFromUrl(url),
    contentType,
  });
  cache.set(key, asset._id);
  return asset._id;
}

async function executeWrite(
  client: ReturnType<typeof createClient>,
  actions: PlannedAction[],
): Promise<{ assetsUploaded: number; patchesApplied: number; skipped: number }> {
  const toApply = actions.filter((a) => a.action === "zou uploaden");
  const assetCache = new Map<string, string>();
  let patchesApplied = 0;

  for (const action of toApply) {
    const assetRef = await uploadAssetForUrl(client, action.sourceUrl, assetCache);
    const value = buildImageWithAlt(assetRef, action.alt);
    await client.patch(action.docId).set({ [action.path]: value }).commit({ visibility: "async" });
    patchesApplied += 1;
    console.log(`PATCH OK ${action.docId} → ${action.path} (asset ${assetRef})`);
  }

  return {
    assetsUploaded: assetCache.size,
    patchesApplied,
    skipped: actions.filter((a) => a.action === "skip").length,
  };
}

async function verifyTopLevelWrite(client: ReturnType<typeof createClient>) {
  const chemieIds = ["sector-nl-chemie", "sector-fr-chemie", "sector-en-chemie"] as const;
  const voedingId = "sector-nl-voeding";
  const chemieBaselineRef = "image-9d645b4f496578c23195286a562e8ec9f488b961-1536x1024-jpg";

  const docs = await client.fetch<
    {
      _id: string;
      heroMainImage?: ImageWithAlt | null;
      heroMainImageUrl?: string | null;
      listingImageUrl?: string | null;
      deepPhotoUrl?: string | null;
      listingImage?: ImageWithAlt | null;
      deepPhoto?: ImageWithAlt | null;
    }[]
  >(
    `*[_id in $ids]{
      _id,
      heroMainImage,
      heroMainImageUrl,
      listingImageUrl,
      deepPhotoUrl,
      listingImage,
      deepPhoto
    }`,
    { ids: [...chemieIds, voedingId] },
  );

  console.log("\n--- Post-write verificatie ---");

  for (const id of chemieIds) {
    const doc = docs.find((d) => d._id === id);
    const ref = doc?.heroMainImage?.image?.asset?._ref;
    const unchanged =
      id === "sector-nl-chemie" ? ref === chemieBaselineRef : Boolean(ref);
    console.log(`${id} heroMainImage asset: ${ref ?? "(geen)"} — ongemoeid: ${unchanged}`);
    console.log(`  heroMainImageUrl ongewijzigd aanwezig: ${Boolean(doc?.heroMainImageUrl?.trim())}`);
  }

  const voeding = docs.find((d) => d._id === voedingId);
  if (voeding) {
    console.log(`\n${voedingId}:`);
    console.log(`  listingImage asset: ${voeding.listingImage?.image?.asset?._ref ?? "(geen)"}`);
    console.log(`  deepPhoto asset: ${voeding.deepPhoto?.image?.asset?._ref ?? "(geen)"}`);
    console.log(`  heroMainImage asset: ${voeding.heroMainImage?.image?.asset?._ref ?? "(geen)"}`);
    console.log(`  listingImageUrl: ${voeding.listingImageUrl ?? "(leeg)"}`);
    console.log(`  deepPhotoUrl: ${voeding.deepPhotoUrl ?? "(leeg)"}`);
    console.log(`  heroMainImageUrl: ${voeding.heroMainImageUrl ?? "(leeg)"}`);
  }
}

function getActionsForBatch(batch: Batch, sectors: SectorDoc[]): PlannedAction[] {
  switch (batch) {
    case "top-level":
      return planTopLevel(sectors);
    case "nested-hero-thumbs":
      return planNestedArray(sectors, "heroThumbs", (sector, item) =>
        deriveAlt(sector, (item as { label?: string | null }).label),
      );
    case "nested-solution-cards":
      return planNestedArray(sectors, "solutionCards", (sector, item) =>
        deriveAlt(sector, (item as { title?: string | null }).title),
      );
    case "nested-case-studies":
      return planNestedArray(sectors, "caseStudies", (sector, item) =>
        deriveAlt(
          sector,
          (item as { title?: string | null; sectorLabel?: string | null }).title ??
            (item as { sectorLabel?: string | null }).sectorLabel,
        ),
      );
    default:
      return [];
  }
}

async function main() {
  const { batch, dryRun, write } = parseArgs();

  if (!token) {
    console.error("SANITY_API_WRITE_TOKEN ontbreekt (.env.local)");
    process.exit(1);
  }

  if (!batch || !BATCHES.includes(batch)) {
    console.error(`Geef --batch= aan. Keuze: ${BATCHES.join(", ")}`);
    process.exit(1);
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token,
    useCdn: false,
  });

  const sectors = await fetchSectors(client);
  const actions = getActionsForBatch(batch, sectors);

  printActions(batch, actions, dryRun);

  if (write) {
    console.log("\n--- WRITE gestart (patch-only) ---\n");
    const result = await executeWrite(client, actions);
    console.log("\n--- WRITE resultaat ---");
    console.log(`Assets geüpload (uniek): ${result.assetsUploaded}`);
    console.log(`Patches gezet: ${result.patchesApplied}`);
    console.log(`Overgeslagen: ${result.skipped}`);
    await verifyTopLevelWrite(client);
    console.log("\n🛑 WRITE batch afgerond.");
    return;
  }

  console.log("\n🛑 DRY-RUN afgerond — geen writes uitgevoerd.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
