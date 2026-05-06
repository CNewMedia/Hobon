import { createClient } from "@sanity/client";
import { HOBON_GLOSSARY, translatePayload } from "./lib/translate-with-claude";
import type { UILabels } from "../types/uiLabels";

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

const CONTEXT =
  "Korte UI labels en formulierteksten voor Hobon website. Houd labels compact, professioneel en consistent (B2B).";

async function translateUILabels(toLocale: "fr" | "en") {
  const nl = await client.fetch<(Partial<UILabels> & { _id: string; _type: string }) | null>(
    `*[_id == "uiLabels-nl"][0]`,
  );
  if (!nl) throw new Error("Missing uiLabels-nl");

  const {
    _id: _discardId,
    _type: _discardType,
    language: _discardLang,
    _createdAt: _discardCreated,
    _updatedAt: _discardUpdated,
    _rev: _discardRev,
    ...payload
  } = nl as Record<string, unknown>;

  const translated = await translatePayload({
    payload,
    toLocale,
    context: CONTEXT,
    glossary: HOBON_GLOSSARY,
  });

  await client.createOrReplace({
    _id: `uiLabels-${toLocale}`,
    _type: "uiLabels",
    language: toLocale,
    ...(translated as Record<string, unknown>),
  });

  console.log(`Translated uiLabels to ${toLocale.toUpperCase()}`);
}

async function main() {
  if (!token) throw new Error("Missing SANITY_API_WRITE_TOKEN");
  await translateUILabels("fr");
  await translateUILabels("en");
  console.log("Translated uiLabels docs: uiLabels-fr, uiLabels-en");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
