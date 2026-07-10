/**
 * HOB-56b — contactPage additionalInfo: geen VHP, enkelvoud locatie.
 *
 * Dry-run: npm run migrate:contact-additional-info-56b
 * Write:    npm run migrate:contact-additional-info-56b -- --write
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const token = process.env.SANITY_API_WRITE_TOKEN;

const COPY: Record<string, string> = {
  nl: "Liever telefonisch? Bel Hobon, het nummer vindt u rechts.",
  fr: "Vous préférez appeler ? Contactez Hobon, le numéro se trouve à droite.",
  en: "Prefer to call? Phone Hobon, the number is on the right.",
};

function block(text: string) {
  const k = () => Math.random().toString(36).slice(2, 12);
  return [
    {
      _type: "block",
      _key: k(),
      style: "normal",
      markDefs: [],
      children: [{ _type: "span", _key: k(), marks: [], text }],
    },
  ];
}

function extractText(value: unknown): string {
  if (!Array.isArray(value)) return "";
  return value
    .flatMap((b) => (b && typeof b === "object" && "children" in b ? (b as { children?: { text?: string }[] }).children ?? [] : []))
    .map((c) => c?.text ?? "")
    .join("")
    .trim();
}

async function main() {
  const write = process.argv.includes("--write");
  if (write && !token) throw new Error("SANITY_API_WRITE_TOKEN required for --write");

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    useCdn: false,
    token: write ? token : undefined,
  });

  const docs = await client.fetch<
    { _id: string; language: string; additionalInfo?: unknown }[]
  >(`*[_type == "contactPage" && language in ["nl","fr","en"]]{ _id, language, additionalInfo }`);

  console.log(`HOB-56b contactPage additionalInfo (${write ? "WRITE" : "DRY-RUN"}) — ${dataset}\n`);

  for (const doc of docs.sort((a, b) => a.language.localeCompare(b.language))) {
    const before = extractText(doc.additionalInfo) || "(leeg)";
    const afterText = COPY[doc.language];
    if (!afterText) continue;

    console.log(`### ${doc._id} [${doc.language}]`);
    console.log(`Was:  ${before}`);
    console.log(`Wordt: ${afterText}\n`);

    if (write) {
      await client.patch(doc._id).set({ additionalInfo: block(afterText) }).commit();
      console.log(`PATCH OK ${doc._id}\n`);
    }
  }

  if (!write) {
    console.log("🛑 STOP — dry-run afgerond. Schrijven: npm run migrate:contact-additional-info-56b -- --write");
  } else {
    console.log("Klaar — contactPage additionalInfo bijgewerkt (nl/fr/en).");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
