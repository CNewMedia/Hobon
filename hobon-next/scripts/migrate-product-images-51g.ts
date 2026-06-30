/**
 * HOB-51g — Echte foto's Zakken / Vellen / DOLAV-zakken / Boterfolie → Sanity.
 *
 * Dry-run (default):
 *   npm run migrate:product-images-51g
 *
 * Write (na goedgekeurde dry-run + mapping):
 *   npm run migrate:product-images-51g -- --write
 *
 * Alleen client.patch().set() — geen createOrReplace. Alleen NL product-docs.
 */
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

const PUBLIC_IMAGE_ROOTS = [
  join(process.cwd(), "public", "images"),
  join(process.cwd(), "public", "assets", "images"),
];

/** Mappen die al in 51c geüpload zijn — overslaan bij auto-detect. */
const SKIP_FOLDERS = new Set(["PATTYN", "Stretchhood", "Krimphoezen", "Krat zakken"]);

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp"]);

type ImageWithAlt = {
  _type: "imageWithAlt";
  alt: string;
  image: { _type: "image"; asset: { _type: "reference"; _ref: string } };
};

type ProductTarget = {
  docId: string;
  label: string;
  /** Mogelijke mapnamen (exact of case-insensitive match). */
  folderNames: string[];
};

/** Expliciete map → product (bevestig in dry-run). */
const PRODUCT_TARGETS: ProductTarget[] = [
  {
    docId: "product-nl-zakken",
    label: "Zakken",
    folderNames: ["Zakken", "PE zakken", "zakken"],
  },
  {
    docId: "product-nl-vellen",
    label: "Vellen",
    folderNames: ["Vellen", "vellen"],
  },
  {
    docId: "product-nl-dolav-zakken",
    label: "DOLAV-zakken",
    folderNames: ["DOLAV zakken", "DOLAV-zakken", "Dolav zakken", "dolav zakken", "DOLAV"],
  },
  {
    docId: "product-nl-boterfolie",
    label: "Boterfolie",
    folderNames: ["Boterfolie", "boterfolie"],
  },
];

type PatchPlan = {
  docId: string;
  label: string;
  folder: string;
  root: string;
  set: Record<string, unknown>;
  uploads: { file: string; hash: string }[];
  currentHeroRef: string | null;
  folieFallback: boolean;
};

function parseArgs() {
  const write = process.argv.includes("--write");
  return { dryRun: !write, write };
}

function normalizeFolderName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function hashBuffer(buf: Buffer): string {
  return createHash("sha256").update(buf).digest("hex").slice(0, 16);
}

function buildImageWithAlt(assetRef: string, alt: string): ImageWithAlt {
  return {
    _type: "imageWithAlt",
    alt,
    image: {
      _type: "image",
      asset: { _type: "reference", _ref: assetRef },
    },
  };
}

async function uploadFile(
  client: ReturnType<typeof createClient>,
  filePath: string,
  cache: Map<string, string>,
): Promise<string> {
  const h = hashBuffer(readFileSync(filePath));
  const cached = cache.get(`file:${h}`);
  if (cached) return cached;

  const buffer = readFileSync(filePath);
  const ext = basename(filePath).split(".").pop()?.toLowerCase();
  const contentType = ext === "png" ? "image/png" : ext === "webp" ? "image/webp" : "image/jpeg";
  const asset = await client.assets.upload("image", buffer, {
    filename: basename(filePath),
    contentType,
  });
  cache.set(`file:${h}`, asset._id);
  return asset._id;
}

function listImageFiles(dir: string): string[] {
  return readdirSync(dir)
    .filter((f) => IMAGE_EXT.has(`.${f.split(".").pop()?.toLowerCase() ?? ""}`))
    .sort((a, b) => a.localeCompare(b, "nl"))
    .map((f) => join(dir, f));
}

function detectFolders(): { folder: string; root: string }[] {
  const found: { folder: string; root: string }[] = [];
  const seen = new Set<string>();

  for (const root of PUBLIC_IMAGE_ROOTS) {
    if (!existsSync(root)) continue;
    for (const entry of readdirSync(root)) {
      const full = join(root, entry);
      if (!statSync(full).isDirectory() || SKIP_FOLDERS.has(entry)) continue;
      const key = normalizeFolderName(entry);
      if (seen.has(key)) continue;
      seen.add(key);
      found.push({ folder: entry, root });
    }
  }

  return found.sort((a, b) => a.folder.localeCompare(b.folder, "nl"));
}

function matchFolderToTarget(folderName: string): ProductTarget | null {
  const norm = normalizeFolderName(folderName);
  for (const target of PRODUCT_TARGETS) {
    if (target.folderNames.some((n) => normalizeFolderName(n) === norm)) {
      return target;
    }
  }
  return null;
}

function buildFolderMapping(detected: { folder: string; root: string }[]): {
  mapped: { folder: string; root: string; target: ProductTarget }[];
  unmapped: { folder: string; root: string }[];
  missing: ProductTarget[];
} {
  const mapped: { folder: string; root: string; target: ProductTarget }[] = [];
  const unmapped: { folder: string; root: string }[] = [];
  const usedTargets = new Set<string>();

  for (const item of detected) {
    const target = matchFolderToTarget(item.folder);
    if (target) {
      mapped.push({ ...item, target });
      usedTargets.add(target.docId);
    } else {
      unmapped.push(item);
    }
  }

  const missing = PRODUCT_TARGETS.filter((t) => !usedTargets.has(t.docId));
  return { mapped, unmapped, missing };
}

function galleryAlt(label: string, index: number, total: number): string {
  if (index === 0) return `${label} in productie`;
  if (total === 1) return label;
  return `${label} — foto ${index + 1}`;
}

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

async function planPatches(
  mapped: { folder: string; root: string; target: ProductTarget }[],
  dryRun: boolean,
  folieHeroRef: string | null,
): Promise<PatchPlan[]> {
  const assetCache = new Map<string, string>();
  const plans: PatchPlan[] = [];

  for (const { folder, root, target } of mapped) {
    const dir = join(root, folder);
    const files = listImageFiles(dir);
    if (files.length === 0) {
      console.warn(`⚠️  Map "${folder}" heeft geen afbeeldingen — overgeslagen.`);
      continue;
    }

    const doc = await client.fetch<{ title?: string; heroImage?: ImageWithAlt }>(
      `*[_id == $id][0]{ title, heroImage }`,
      { id: target.docId },
    );
    const title = doc?.title ?? target.label;
    const currentHeroRef = doc?.heroImage?.image?.asset?._ref ?? null;
    const folieFallback = Boolean(folieHeroRef && currentHeroRef === folieHeroRef);

    const uploads: { file: string; hash: string }[] = [];
    const gallery: ImageWithAlt[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const alt = galleryAlt(target.label, i, files.length);
      uploads.push({ file: basename(file), hash: hashBuffer(readFileSync(file)) });

      if (dryRun) {
        gallery.push(buildImageWithAlt(`dry-run-${hashBuffer(readFileSync(file))}`, alt));
      } else {
        const ref = await uploadFile(client, file, assetCache);
        gallery.push(buildImageWithAlt(ref, alt));
      }
    }

    plans.push({
      docId: target.docId,
      label: target.label,
      folder,
      root,
      set: {
        heroImage: gallery[0],
        productGallery: gallery,
      },
      uploads,
      currentHeroRef,
      folieFallback,
    });
  }

  return plans;
}

function printMappingTable() {
  console.log("\n--- Verwachte map → product mapping (bevestig vóór --write) ---\n");
  console.log("| Map (public/images/ of public/assets/images/) | Sanity doc | Product |");
  console.log("|------------------------------------------------|------------|---------|");
  for (const t of PRODUCT_TARGETS) {
    const names = t.folderNames.join(" / ");
    console.log(`| ${names} | ${t.docId} | ${t.label} |`);
  }
}

function printDryRun(
  detected: { folder: string; root: string }[],
  mapped: { folder: string; root: string; target: ProductTarget }[],
  unmapped: { folder: string; root: string }[],
  missing: ProductTarget[],
  plans: PatchPlan[],
  folieHeroRef: string | null,
) {
  console.log(`\n${"=".repeat(72)}`);
  console.log("HOB-51g — product images (DRY-RUN)");
  console.log(`${"=".repeat(72)}`);
  console.log(`Bronnen: ${PUBLIC_IMAGE_ROOTS.join(", ")}`);
  console.log(`Overgeslagen (51c): ${[...SKIP_FOLDERS].join(", ")}`);

  printMappingTable();

  console.log(`\n--- Gedetecteerde mappen (excl. 51c) ---`);
  if (detected.length === 0) {
    console.log("  (geen)");
  } else {
    for (const { folder, root } of detected) {
      const rel = root.replace(process.cwd(), "").replace(/^\//, "");
      console.log(`  · ${folder}  (${rel})`);
    }
  }

  console.log(`\n--- Resolutie ---`);
  for (const { folder, root, target } of mapped) {
    const files = listImageFiles(join(root, folder));
    const rel = root.replace(process.cwd(), "").replace(/^\//, "");
    console.log(`  ✅ "${folder}" (${rel}) → ${target.docId} (${target.label}) — ${files.length} bestand(en)`);
    for (const file of files) {
      const buf = readFileSync(file);
      console.log(`       · ${basename(file)}  sha256:${hashBuffer(buf)}`);
    }
  }

  if (unmapped.length) {
    console.log(`\n--- Ongekoppelde mappen (geen match) ---`);
    for (const { folder, root } of unmapped) {
      const rel = root.replace(process.cwd(), "").replace(/^\//, "");
      console.log(`  ⚠️  "${folder}" (${rel}) — geen product-target; niet gepatcht`);
    }
  }

  if (missing.length) {
    console.log(`\n--- Ontbrekende mappen (geen foto's gevonden) ---`);
    for (const t of missing) {
      console.log(`  🛑 ${t.label} (${t.docId}) — verwacht map: ${t.folderNames.join(" of ")}`);
    }
  }

  console.log(`\n--- Folie-fallback referentie ---`);
  console.log(`  product-nl-blaasfolies hero asset: ${folieHeroRef ?? "(niet gevonden)"}`);

  console.log(`\n--- Patch-plannen ---`);
  if (plans.length === 0) {
    console.log("  (geen — voeg eerst de ontbrekende mappen toe)");
  }
  for (const plan of plans) {
    const rel = plan.root.replace(process.cwd(), "").replace(/^\//, "");
    console.log(`\n  ${plan.docId} (${plan.label})`);
    console.log(`    map: ${plan.folder} (${rel})`);
    console.log(`    set: heroImage, productGallery (${plan.uploads.length} items)`);
    console.log(`    huidige hero asset: ${plan.currentHeroRef ?? "(leeg)"}`);
    console.log(
      `    folie-fallback: ${plan.folieFallback ? "JA — wordt vervangen" : plan.currentHeroRef ? "nee (eigen of ander asset)" : "n.v.t."}`,
    );
    for (const u of plan.uploads) {
      console.log(`    upload: ${u.file}  dedup:${u.hash}`);
    }
    const gallery = plan.set.productGallery as ImageWithAlt[];
    for (let i = 0; i < gallery.length; i++) {
      console.log(`    gallery[${i}] alt: "${gallery[i].alt}"`);
    }
  }

  console.log(`\n${"=".repeat(72)}`);
  if (missing.length || plans.length === 0) {
    console.log("🛑 STOP — dry-run afgerond. Voeg ontbrekende mappen toe en bevestig mapping vóór --write.");
  } else if (unmapped.length) {
    console.log("🛑 STOP — dry-run afgerond. Los ongekoppelde mappen op of bevestig dat ze genegeerd mogen worden.");
  } else {
    console.log("🛑 STOP — dry-run afgerond. Bevestig mapping; voer daarna --write uit.");
  }
  console.log(`${"=".repeat(72)}\n`);
}

async function applyPatches(plans: PatchPlan[]) {
  for (const plan of plans) {
    await client.patch(plan.docId).set(plan.set).commit({ visibility: "async" });
    console.log(`PATCH OK ${plan.docId} (heroImage, productGallery — ${plan.uploads.length} assets)`);
  }
}

async function main() {
  if (!token) {
    console.error("SANITY_API_WRITE_TOKEN ontbreekt in .env.local");
    process.exit(1);
  }

  const { dryRun, write } = parseArgs();
  if (write) console.log("HOB-51g — WRITE mode\n");

  const folieDoc = await client.fetch<{ heroImage?: ImageWithAlt }>(
    `*[_id == "product-nl-blaasfolies"][0]{ heroImage }`,
  );
  const folieHeroRef = folieDoc?.heroImage?.image?.asset?._ref ?? null;

  const detected = detectFolders();
  const { mapped, unmapped, missing } = buildFolderMapping(detected);
  const plans = await planPatches(mapped, dryRun, folieHeroRef);

  if (dryRun) {
    printDryRun(detected, mapped, unmapped, missing, plans, folieHeroRef);
    return;
  }

  if (missing.length) {
    console.error(`Write geblokkeerd: ${missing.length} product(en) zonder map.`);
    process.exit(1);
  }
  if (plans.length === 0) {
    console.error("Write geblokkeerd: geen patch-plannen.");
    process.exit(1);
  }

  printDryRun(detected, mapped, unmapped, missing, plans, folieHeroRef);
  await applyPatches(plans);
  console.log("\n--- Write afgerond. Folie-fallback vervalt automatisch (eigen Sanity-assets). ---\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
