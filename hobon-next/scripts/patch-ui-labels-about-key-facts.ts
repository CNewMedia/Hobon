/**
 * One-off: add aboutKeyFactsTitle to uiLabels FR/EN via patch only.
 * Does not touch other fields (safe vs Matthieu / existing translations).
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

const client = createClient({
  projectId,
  dataset,
  apiVersion: "2024-01-01",
  token,
  useCdn: false,
});

const PATCHES: Record<"nl" | "fr" | "en", string> = {
  nl: "Kerncijfers",
  fr: "Chiffres clés",
  en: "Key figures",
};

async function main() {
  if (!token) throw new Error("Missing SANITY_API_WRITE_TOKEN");

  for (const locale of ["nl", "fr", "en"] as const) {
    const id = `uiLabels-${locale}`;
    const doc = await client.fetch<{ _id: string; aboutKeyFactsTitle?: string } | null>(
      `*[_id == $id][0]{ _id, aboutKeyFactsTitle }`,
      { id },
    );
    if (!doc) {
      console.warn(`Skip ${id}: document not found`);
      continue;
    }
    if (doc.aboutKeyFactsTitle?.trim()) {
      console.log(`Skip ${id}: aboutKeyFactsTitle already set (${doc.aboutKeyFactsTitle})`);
      continue;
    }
    await client.patch(id).set({ aboutKeyFactsTitle: PATCHES[locale] }).commit();
    console.log(`Patched ${id}: aboutKeyFactsTitle = "${PATCHES[locale]}"`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
