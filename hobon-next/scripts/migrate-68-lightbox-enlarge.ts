/**
 * HOB-68 — gallery lightbox enlarge aria (NL/FR/EN).
 *
 * Dry-run: npm run migrate:68-lightbox-enlarge
 * Write:    npm run migrate:68-lightbox-enlarge -- --write
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

const PATCHES: Record<"nl" | "fr" | "en", { uiLightboxEnlarge: string }> = {
  nl: { uiLightboxEnlarge: "Vergroot" },
  fr: { uiLightboxEnlarge: "Agrandir" },
  en: { uiLightboxEnlarge: "Enlarge" },
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

  console.log(`HOB-68 — uiLightboxEnlarge (${write ? "WRITE" : "DRY-RUN"}) — ${dataset}\n`);

  let patchCount = 0;

  for (const locale of ["nl", "fr", "en"] as const) {
    const id = `uiLabels-${locale}`;
    const doc = await client.fetch<{ _id: string; uiLightboxEnlarge?: string } | null>(
      `*[_id == $id][0]{ _id, uiLightboxEnlarge }`,
      { id },
    );

    const next = PATCHES[locale].uiLightboxEnlarge;
    const was = doc?.uiLightboxEnlarge?.trim() ?? "";
    const unchanged = was === next;

    console.log(`=== ${id} ===`);
    if (!doc) {
      console.log("  document niet gevonden — skip\n");
      continue;
    }
    console.log(`  uiLightboxEnlarge`);
    console.log(`    was:   ${was || "(leeg)"}`);
    console.log(`    wordt: ${next} ${unchanged ? "[unchanged]" : "[PATCH]"}`);
    console.log("");

    if (unchanged) continue;

    patchCount += 1;
    if (write) {
      await client.patch(id).set({ uiLightboxEnlarge: next }).commit();
      console.log("  patched 1 field\n");
    } else {
      console.log("  (dry-run) would patch 1 field\n");
    }
  }

  console.log(`--- Summary: ${patchCount} field-patches ${write ? "applied" : "pending"} ---`);
  if (!write) console.log("Re-run with --write to apply.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
