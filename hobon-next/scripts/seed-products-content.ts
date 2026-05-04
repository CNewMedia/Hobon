/**
 * Patch 5 NL product documents (blaasfolies, zakken, vellen, stretch-hood, pattyn).
 * FR/EN ongemoeid. Gebruikt bestaand product-schema: title, lead, body (richText), seo.
 *
 * npm run seed:products
 * npm run seed:products -- --inspect   # fetch eerste product voor veldnamen
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

const k = () => Math.random().toString(36).slice(2, 12);

function span(text: string, marks: string[] = []) {
  return { _type: "span", _key: k(), marks, text };
}

function h2(text: string) {
  return { _type: "block", _key: k(), style: "h2", markDefs: [], children: [span(text)] };
}

function h3(text: string) {
  return { _type: "block", _key: k(), style: "h3", markDefs: [], children: [span(text)] };
}

function para(text: string) {
  return { _type: "block", _key: k(), style: "normal", markDefs: [], children: [span(text)] };
}

function bullets(lines: string[]) {
  return lines.map((text) => ({
    _type: "block",
    _key: k(),
    style: "normal",
    listItem: "bullet",
    level: 1,
    markDefs: [],
    children: [span(text)],
  }));
}

function linkLine(label: string, href: string) {
  const linkKey = k();
  return {
    _type: "block",
    _key: k(),
    style: "normal",
    markDefs: [{ _key: linkKey, _type: "link", href }],
    children: [span(label, [linkKey])],
  };
}

function specBlock(label: string, value: string) {
  return [h3(label), para(value)];
}

function ctaBlocks(title: string, buttonLabel: string, href: string) {
  return [h2(title), linkLine(buttonLabel, href)];
}

const contact = "/nl/contact";

const blaasfoliesBody = [
  h2("Specificaties"),
  ...specBlock(
    "Varianten",
    "Krimpfolie (mono- of bi-axiaal, vlak of geplooid), automatenfolie (vlakke of geplooide PE-samenstellingen), buisfolie (met of zonder zijvouwen voor krimphoesinstallaties).",
  ),
  ...specBlock("Afmetingen", "HD 200-3600mm, LD 200-3600mm"),
  ...specBlock("Toevoegingen", "Microperforatie, anti-UV, anti-statisch, corona"),
  ...specBlock("Layers", "Monolayer, 3-laags, 5-laags"),
  h2("Toepassingen"),
  ...bullets([
    "FFS-folie (form, fill and seal)",
    "Matrasfolie",
    "Mailingfolie",
    "Bundelfolie",
    "Afzakkingsfolie",
    "Topsheets",
    "Routagefolie",
    "Textiel-verpakking",
    "Diepvriesfolie",
  ]),
  h2("Waarom Hobon"),
  para(
    "Het volledige productieproces vindt inhouse plaats — van extruderen over voorbehandelen tot inkleuren. Een ultramodern machinepark en kwaliteitscontrole in elk stadium garanderen consistente kwaliteit, ook voor kritische toepassingen.",
  ),
  ...ctaBlocks("Specifieke vraag over blaasfolies?", "Vraag een offerte aan", contact),
];

const zakkenBody = [
  h2("Specificaties"),
  ...specBlock(
    "Varianten",
    "Met of zonder zijvouw, afscheurbaar van de rol, hoeklas (los of afscheurbaar), bloklas, paperlike zakken, kratzakken.",
  ),
  ...specBlock("Sluitingstechnieken", "Bandverblokking, spaarverblokking"),
  ...specBlock("Bedrukking", "Flexodruk tot 6 kleuren"),
  ...specBlock("Layers", "Mono, 3-laags of 5-laags PE"),
  ...specBlock("Materialen", "LDPE, HDPE, virgin of recyclaat"),
  h2("Toepassingen"),
  ...bullets([
    "Veevoeders",
    "Meststoffen",
    "Poeders",
    "Zand",
    "Granen",
    "Stofafzuiging",
    "Industriële bulk",
  ]),
  h2("Waarom Hobon"),
  para(
    "Hobon verwerkt PE-folies inhouse tot zakken in elk gewenst formaat en zaktype. Flexodrukafdeling tot 6 kleuren voor productidentificatie of branding. Kwaliteitscontrole BRC AA-niveau in elk stadium.",
  ),
  ...ctaBlocks("Welk zaktype past bij uw afvulinstallatie?", "Bespreek uw verpakkingsvraag", contact),
];

const vellenBody = [
  h2("Specificaties"),
  ...specBlock("Varianten", "Afdekvellen, topsheets, paperlookvellen"),
  ...specBlock("Afmetingen", "Op maat van uw pallets en producten"),
  ...specBlock("Toevoegingen", "Anti-UV, anti-statisch, microperforatie"),
  ...specBlock("Materialen", "LDPE, HDPE, virgin of recyclaat"),
  h2("Toepassingen"),
  ...bullets([
    "Palletbescherming",
    "Vochtbescherming tijdens transport en opslag",
    "Stofbescherming in productieomgeving",
    "Tussenlagen op pallets",
    "Topsheets onder krimphoezen",
  ]),
  h2("Waarom Hobon"),
  para(
    "PE-vellen worden inhouse gemaakt op maat van uw pallets en producten. Anti-UV en anti-statische uitvoeringen mogelijk. Kwaliteitscontrole in elk productiestadium.",
  ),
  ...ctaBlocks("Welke vellen voor uw toepassing?", "Vraag een offerte aan", contact),
];

const stretchHoodBody = [
  h2("Specificaties"),
  ...specBlock("Varianten", "Los of afscheurbaar van de rol"),
  ...specBlock("Afmetingen", "Op maat van uw palletformaten"),
  ...specBlock("Toevoegingen", "Anti-UV, anti-statisch mogelijk"),
  ...specBlock("Bedrukking", "Flexodruk tot 6 kleuren voor branding of identificatie"),
  ...specBlock("Materialen", "LDPE, virgin of recyclaat"),
  h2("Toepassingen"),
  ...bullets([
    "Palletstabilisatie",
    "Vochtbescherming tijdens opslag en transport",
    "Bescherming tegen stof en beschadiging",
    "Geautomatiseerde palletinpakking",
  ]),
  h2("Waarom Hobon"),
  para(
    "Stretch hoezen worden inhouse geproduceerd op de exacte afmetingen van uw pallets. Bedrukking tot 6 kleuren voor branding. Anti-UV opties voor langere buitenopslag.",
  ),
  ...ctaBlocks("Welke stretch hood past bij uw palletformaat?", "Bespreek uw verpakkingsvraag", contact),
];

const pattynBody = [
  h2("Specificaties"),
  ...specBlock("Varianten", "Buisfolie met zijvouwen, opengevouwen tot 7,2m"),
  ...specBlock("Afmetingen", "HD 200-3600mm, LD 200-3600mm"),
  ...specBlock("Toevoegingen", "Microperforatie, anti-UV, anti-statisch"),
  ...specBlock("Layers", "Mono, 3-laags of 5-laags PE"),
  ...specBlock("Materialen", "LDPE, HDPE"),
  h2("Toepassingen"),
  ...bullets([
    "PATTYN-inpaklijnen",
    "Bag-in-box-systemen",
    "Geautomatiseerde zakgoed-inpaklijnen",
    "Volautomatisch of semi-automatisch afvullen",
    "Hulzen voor stortbare producten",
  ]),
  h2("Waarom Hobon"),
  para(
    "Buisfolie met zijvouwen, geproduceerd inhouse in de exacte afmetingen van uw inpakinstallatie. Verschillende PE-samenstellingen mogelijk per toepassing. Kwaliteitscontrole in elk stadium.",
  ),
  ...ctaBlocks("Buisfolie nodig voor uw PATTYN-installatie?", "Vraag een offerte aan", contact),
];

const products: {
  id: string;
  title: string;
  lead: string;
  body: unknown[];
  metaTitle: string;
  metaDescription: string;
}[] = [
  {
    id: "product-nl-blaasfolies",
    title: "Blaasfolies (HDPE/LDPE)",
    lead: "Blaasfolies op maat voor uw lijn\n\nKrimpfolie, automatenfolie en buisfolie in HDPE en LDPE — voor geautomatiseerde verpakkingslijnen, mono, 3-laags of 5-laags.",
    body: blaasfoliesBody,
    metaTitle: "Blaasfolies op maat | Hobon",
    metaDescription:
      "PE-blaasfolies in HDPE en LDPE: krimpfolie, automatenfolie, buisfolie. Mono, 3-laags of 5-laags. Op maat van uw lijn.",
  },
  {
    id: "product-nl-zakken",
    title: "Zakken (LDPE/HDPE)",
    lead: "Zakken op maat — voor elke afvulinstallatie\n\nPE-zakken met of zonder zijvouw, hoeklas, bloklas of paperlike — voor veevoeder, meststoffen, poeders, granen en meer.",
    body: zakkenBody,
    metaTitle: "PE-zakken op maat | Hobon",
    metaDescription:
      "Zakken in LDPE en HDPE voor veevoeder, meststoffen, poeders en granen. Hoeklas, bloklas, kratzakken. Bedrukt tot 6 kleuren.",
  },
  {
    id: "product-nl-vellen",
    title: "Vellen (LDPE/HDPE)",
    lead: "PE-vellen voor bescherming op maat\n\nAfdekvellen, topsheets en paperlookvellen — bescherming voor uw product en proces, in elk gewenst formaat.",
    body: vellenBody,
    metaTitle: "PE-vellen op maat | Topsheets en afdekvellen | Hobon",
    metaDescription:
      "PE-afdekvellen, topsheets en paperlookvellen op maat. Voor palletbescherming, vochtbescherming en industriële bescherming.",
  },
  {
    id: "product-nl-stretch-hood",
    title: "Stretch hood",
    lead: "Stretch hood — optimale palletbescherming\n\nPE-krimphoezen op maat van uw palletformaat — los of afscheurbaar van de rol, voor stabiel en vochtbestendig transport.",
    body: stretchHoodBody,
    metaTitle: "Stretch hood op maat | Palletbescherming | Hobon",
    metaDescription:
      "PE-stretch hoezen voor palletbescherming. Los of afscheurbaar van de rol. Op maat van uw palletformaten. Bedrukt tot 6 kleuren.",
  },
  {
    id: "product-nl-pattyn",
    title: "PATTYN",
    lead: "PATTYN — buisfolie voor geautomatiseerde inpaklijnen\n\nPE-buisfolie met zijvouwen voor PATTYN-installaties en vergelijkbare bag-in-box-systemen — in meerdere PE-samenstellingen en afmetingen.",
    body: pattynBody,
    metaTitle: "PATTYN buisfolie | Hobon",
    metaDescription:
      "PE-buisfolie met zijvouwen voor PATTYN-inpaklijnen en bag-in-box-systemen. Op maat in mono, 3-laags of 5-laags.",
  },
];

async function main() {
  if (process.argv.includes("--inspect")) {
    const doc = await client.fetch(`*[_type == "product" && language == "nl" && slug.current == "blaasfolies"][0]`);
    console.log(JSON.stringify(doc, null, 2));
    return;
  }
  if (!token) {
    console.error("Missing SANITY_API_WRITE_TOKEN");
    process.exit(1);
  }

  for (const p of products) {
    await client
      .patch(p.id)
      .set({
        title: p.title,
        lead: p.lead,
        body: p.body,
        "seo.metaTitle": p.metaTitle,
        "seo.metaDescription": p.metaDescription,
      })
      .commit({ visibility: "async" });
    console.log("Patched", p.id);
  }

  const check = await client.fetch<
    { _id: string; title: string; lead: string }[]
  >(`*[_type == "product" && _id in $ids]{_id, title, lead}`, {
    ids: products.map((x) => x.id),
  });
  console.log(
    "Verify TODO-free:",
    check.map((c) => ({ _id: c._id, ok: !c.lead.includes("[TODO]") })),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
