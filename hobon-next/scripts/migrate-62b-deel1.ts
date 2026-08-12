/**
 * HOB-62b DEEL 1 — tekstwijzigingen (A + B + D), patch-only.
 *
 * Dry-run: npm run migrate:62b-deel1
 * Write:    npm run migrate:62b-deel1 -- --write
 */
import { createClient } from "@sanity/client";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? "14bi8ppf";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";

type PatchDef = {
  id: string;
  referentie: string;
  label: string;
  /** Sanity .set() path → value, or async builder from doc */
  build: (doc: Record<string, unknown>) => { path: string; value: unknown; was: string; wordt: string };
  verify: (was: string) => boolean;
};

const CURLY_APOS = "\u2019";

function parseArgs() {
  return { write: process.argv.includes("--write") };
}

function clip(s: string, max = 120): string {
  const one = s.replace(/\s+/g, " ").trim();
  return one.length <= max ? one : `${one.slice(0, max - 3)}...`;
}

const PATCHES: PatchDef[] = [
  // DEEL A — agro FR
  {
    id: "sector-fr-agro",
    referentie: "sector-nl-agro·solutionCards[3].title",
    label: "A1 solutionCards[3].title (FR)",
    build: (doc) => {
      const cards = doc.solutionCards as { _key: string; title?: string }[];
      const card = cards.find((c) => c._key === "1sko6l5tfq");
      const was = card?.title ?? "";
      return {
        path: 'solutionCards[_key=="1sko6l5tfq"].title',
        value: "Sacs prédécoupés, faciles à détacher",
        was,
        wordt: "Sacs prédécoupés, faciles à détacher",
      };
    },
    verify: (was) => was === "Soudure en bande et soudure économique",
  },
  {
    id: "sector-fr-agro",
    referentie: "sector-nl-agro·solutionCards[0].tags[1]",
    label: "A2 solutionCards[0].tags[1] (FR)",
    build: (doc) => {
      const cards = doc.solutionCards as { _key: string; tags?: string[] }[];
      const card = cards.find((c) => c._key === "ney4xs30ez");
      const tags = [...(card?.tags ?? [])];
      const was = tags[1] ?? "";
      tags[1] = "À coins soudés";
      return {
        path: 'solutionCards[_key=="ney4xs30ez"].tags',
        value: tags,
        was,
        wordt: "À coins soudés",
      };
    },
    verify: (was) => was === "Fond plat",
  },
  {
    id: "sector-fr-agro",
    referentie: "sector-nl-agro·tapeItems[0]",
    label: "A3 tapeItems[0] (FR)",
    build: (doc) => {
      const items = [...((doc.tapeItems as string[]) ?? [])];
      const was = items[0] ?? "";
      items[0] = "Sacs à coins soudés";
      return {
        path: "tapeItems",
        value: items,
        wordt: "Sacs à coins soudés",
        was,
      };
    },
    verify: (was) => was === "Sacs à coins soudés & sacs à fond plat",
  },
  // DEEL B — stuifbestendigheid FR
  {
    id: "homePage-fr",
    referentie: "homePage-nl·productCards[0].description",
    label: "B1 productCards[0].description (FR)",
    build: (doc) => {
      const cards = doc.productCards as { _key: string; description?: string }[];
      const card = cards.find((c) => c._key === "9c4189d0e022");
      const was = card?.description ?? "";
      const wordt = was.replace(
        new RegExp(`L${CURLY_APOS}étanchéité à la poussière`),
        "La conception anti-poudroiement",
      );
      return {
        path: 'productCards[_key=="9c4189d0e022"].description',
        value: wordt,
        was,
        wordt,
      };
    },
    verify: (was) => was.includes(`L${CURLY_APOS}étanchéité à la poussière`),
  },
  {
    id: "product-fr-dolav-zakken",
    referentie: "product-nl-dolav-zakken·listingDescription",
    label: "B2 listingDescription (FR)",
    build: (doc) => {
      const was = String(doc.listingDescription ?? "");
      const wordt = was.replace(
        "offrant étanchéité à la poussière",
        "offrant une conception anti-poudroiement",
      );
      return { path: "listingDescription", value: wordt, was, wordt };
    },
    verify: (was) => was.includes("offrant étanchéité à la poussière"),
  },
  // DEEL D — Frankrijk alle talen
  {
    id: "homePage-nl",
    referentie: "homePage-nl·heroEyebrow",
    label: "D1 heroEyebrow (NL)",
    build: (doc) => ({
      path: "heroEyebrow",
      value: "Belgische producent · BE, NL & FR",
      was: String(doc.heroEyebrow ?? ""),
      wordt: "Belgische producent · BE, NL & FR",
    }),
    verify: (was) => was === "Belgische producent · BE & NL",
  },
  {
    id: "homePage-en",
    referentie: "homePage-nl·heroEyebrow",
    label: "D1 heroEyebrow (EN)",
    build: (doc) => ({
      path: "heroEyebrow",
      value: "Belgian manufacturer · BE, NL & FR",
      was: String(doc.heroEyebrow ?? ""),
      wordt: "Belgian manufacturer · BE, NL & FR",
    }),
    verify: (was) => was === "Belgian manufacturer · BE & NL",
  },
  {
    id: "homePage-nl",
    referentie: "homePage-nl·stats[3].label",
    label: "D2 stats[3].label (NL)",
    build: (doc) => {
      const stats = doc.stats as { _key: string; label?: string }[];
      const s = stats.find((x) => x._key === "tSPisjy2yHY5QX8S75B5lS");
      const was = s?.label ?? "";
      return {
        path: 'stats[_key=="tSPisjy2yHY5QX8S75B5lS"].label',
        value: "Actief in België, Nederland en Frankrijk",
        was,
        wordt: "Actief in België, Nederland en Frankrijk",
      };
    },
    verify: (was) => was === "Actief in België en Nederland",
  },
  {
    id: "homePage-en",
    referentie: "homePage-nl·stats[3].label",
    label: "D2 stats[3].label (EN)",
    build: (doc) => {
      const stats = doc.stats as { _key: string; label?: string }[];
      const s = stats.find((x) => x._key === "c2a08e93b14a");
      const was = s?.label ?? "";
      return {
        path: 'stats[_key=="c2a08e93b14a"].label',
        value: "Active in Belgium, the Netherlands and France",
        was,
        wordt: "Active in Belgium, the Netherlands and France",
      };
    },
    verify: (was) => was === "Active in Belgium and the Netherlands",
  },
  {
    id: "homePage-nl",
    referentie: "homePage-nl·stats[3].value",
    label: "D3 stats[3].value (NL)",
    build: (doc) => {
      const stats = doc.stats as { _key: string; value?: string }[];
      const s = stats.find((x) => x._key === "tSPisjy2yHY5QX8S75B5lS");
      const was = s?.value ?? "";
      return {
        path: 'stats[_key=="tSPisjy2yHY5QX8S75B5lS"].value',
        value: "BE+NL+FR",
        was,
        wordt: "BE+NL+FR",
      };
    },
    verify: (was) => was === "BE+NL",
  },
  {
    id: "homePage-en",
    referentie: "homePage-nl·stats[3].value",
    label: "D3 stats[3].value (EN)",
    build: (doc) => {
      const stats = doc.stats as { _key: string; value?: string }[];
      const s = stats.find((x) => x._key === "c2a08e93b14a");
      const was = s?.value ?? "";
      return {
        path: 'stats[_key=="c2a08e93b14a"].value',
        value: "BE+NL+FR",
        was,
        wordt: "BE+NL+FR",
      };
    },
    verify: (was) => was === "BE+NL",
  },
];

async function main() {
  const { write } = parseArgs();
  const token = process.env.SANITY_API_WRITE_TOKEN?.trim();
  if (write && !token) throw new Error("SANITY_API_WRITE_TOKEN required for --write");

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2024-01-01",
    token: write ? token : token || process.env.SANITY_API_READ_TOKEN?.trim(),
    useCdn: false,
  });

  const docIds = [...new Set(PATCHES.map((p) => p.id))];
  const docs = await client.fetch<Record<string, unknown>[]>(`*[_id in $ids]{...}`, { ids: docIds });
  const byId = new Map(docs.map((d) => [String(d._id), d]));

  console.log(`HOB-62b DEEL 1 (${write ? "WRITE" : "DRY-RUN"}) — ${dataset}\n`);

  type Planned = {
    id: string;
    referentie: string;
    label: string;
    path: string;
    was: string;
    wordt: string;
    value: unknown;
    ok: boolean;
    reason: string;
  };

  const planned: Planned[] = [];

  for (const patch of PATCHES) {
    const doc = byId.get(patch.id);
    if (!doc) {
      planned.push({
        id: patch.id,
        referentie: patch.referentie,
        label: patch.label,
        path: "",
        was: "",
        wordt: "",
        value: null,
        ok: false,
        reason: "document niet gevonden",
      });
      continue;
    }

    const { path, value, was, wordt } = patch.build(doc);
    const ok = patch.verify(was);
    planned.push({
      id: patch.id,
      referentie: patch.referentie,
      label: patch.label,
      path,
      was,
      wordt,
      value,
      ok,
      reason: ok ? "PASS" : `MISMATCH — verwacht andere huidige waarde, gevonden: "${clip(was)}"`,
    });
  }

  let pass = 0;
  let fail = 0;

  for (const [i, p] of planned.entries()) {
    console.log(`${i + 1}. ${p.label} (${p.id})`);
    console.log(`   Referentie: ${p.referentie}`);
    console.log(`   Was:    ${clip(p.was, 200)}`);
    console.log(`   Wordt:  ${clip(p.wordt, 200)}`);
    if (p.label.startsWith("B1") || p.label.startsWith("B2")) {
      console.log(`   Volledige zin vóór: ${p.was}`);
      console.log(`   Volledige zin na:   ${p.wordt}`);
    }
    console.log(`   Check:  ${p.ok ? "✅ PASS" : "🛑 FAIL"} — ${p.reason}`);
    console.log("");
    if (p.ok) pass++;
    else fail++;
  }

  console.log(`Verificatie: ${pass} PASS, ${fail} FAIL`);

  if (fail > 0) {
    console.error("\n🛑 STOP — verificatie gefaald, geen patches uitgevoerd.");
    process.exit(1);
  }

  if (!write) {
    console.log("\n🛑 STOP — dry-run afgerond. Schrijven: npm run migrate:62b-deel1 -- --write");
    return;
  }

  // Groepeer per document
  const byDoc = new Map<string, Planned[]>();
  for (const p of planned) {
    const list = byDoc.get(p.id) ?? [];
    list.push(p);
    byDoc.set(p.id, list);
  }

  console.log("\nSanity patches...");
  for (const [docId, patches] of byDoc) {
    const setPayload: Record<string, unknown> = {};
    for (const p of patches) setPayload[p.path] = p.value;
    await client.patch(docId).set(setPayload).commit();
    console.log(`PATCH OK ${docId} → ${patches.length} veld(en)`);
  }

  console.log(`\nKlaar — ${planned.length} velden bijgewerkt (A+B+D).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
