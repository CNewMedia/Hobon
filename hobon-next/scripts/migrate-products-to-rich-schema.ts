/**
 * Migreert 5 NL-productdocumenten naar het uitgebreide product-schema.
 * Zet gestructureerde velden, relatedSectors-refs, seo; verwijdert legacy `body` en `lead`.
 *
 * npm run migrate:products
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
const sectorRef = (id: string) => ({ _type: "reference", _ref: id, _key: k() });

type Spec = { title: string; body: string; icon?: string };

type ProductPatch = {
  _id: string;
  title: string;
  heroEyebrow: string;
  heroHeadline: string;
  heroIntro: string;
  heroPrimaryCta: { label: string; href: string };
  heroSecondaryCta: { label: string; href: string };
  specifications: Spec[];
  applications: string[];
  whyHobonTitle: string;
  whyHobonBody: string;
  relatedSectorIds: string[];
  ctaBandTitle1: string;
  ctaBandBody: string;
  ctaBandPrimary: { label: string; href: string };
  metaTitle: string;
  metaDescription: string;
};

const patches: ProductPatch[] = [
  {
    _id: "product-nl-blaasfolies",
    title: "Blaasfolies (HDPE/LDPE)",
    heroEyebrow: "Product · Blaasfolies",
    heroHeadline: "Blaasfolies op maat voor uw lijn",
    heroIntro:
      "Krimpfolie, automatenfolie en buisfolie in HDPE en LDPE — voor geautomatiseerde verpakkingslijnen, mono, 3-laags of 5-laags.",
    heroPrimaryCta: { label: "Vraag een offerte aan", href: "/nl/contact" },
    heroSecondaryCta: { label: "Bekijk specificaties", href: "#specs" },
    specifications: [
      {
        title: "Varianten",
        body: "Krimpfolie (mono- of bi-axiaal, vlak of geplooid), Automatenfolie (vlakke of geplooide PE-samenstellingen), Buisfolie (met of zonder zijvouwen voor krimphoesinstallaties)",
      },
      { title: "Afmetingen", body: "HD 200-3600mm, LD 200-3600mm" },
      { title: "Toevoegingen", body: "Microperforatie, anti-UV, anti-statisch, corona" },
      { title: "Layers", body: "Monolayer, 3-laags, 5-laags" },
    ],
    applications: [
      "FFS-folie",
      "Matrasfolie",
      "Mailingfolie",
      "Bundelfolie",
      "Afzakkingsfolie",
      "Topsheets",
      "Routagefolie",
      "Textiel-verpakking",
      "Diepvriesfolie",
    ],
    whyHobonTitle: "Waarom Hobon",
    whyHobonBody:
      "Het volledige productieproces vindt inhouse plaats — van extruderen over voorbehandelen tot inkleuren. Een ultramodern machinepark en kwaliteitscontrole in elk stadium garanderen consistente kwaliteit, ook voor kritische toepassingen.",
    relatedSectorIds: ["sector-nl-voeding", "sector-nl-logistiek", "sector-nl-agro"],
    ctaBandTitle1: "Specifieke vraag over blaasfolies?",
    ctaBandBody:
      "Onze specialisten denken mee over PE-samenstellingen, layer-opbouw en bedrukking voor uw exacte lijn.",
    ctaBandPrimary: { label: "Vraag een offerte aan", href: "/nl/contact" },
    metaTitle: "Blaasfolies op maat | Hobon",
    metaDescription:
      "PE-blaasfolies in HDPE en LDPE: krimpfolie, automatenfolie, buisfolie. Mono, 3-laags of 5-laags. Op maat van uw lijn.",
  },
  {
    _id: "product-nl-zakken",
    title: "Zakken (LDPE/HDPE)",
    heroEyebrow: "Product · Zakken",
    heroHeadline: "Zakken op maat — voor elke afvulinstallatie",
    heroIntro:
      "PE-zakken met of zonder zijvouw, hoeklas, bloklas of paperlike — voor veevoeder, meststoffen, poeders, granen en meer.",
    heroPrimaryCta: { label: "Bespreek uw verpakkingsvraag", href: "/nl/contact" },
    heroSecondaryCta: { label: "Bekijk toepassingen", href: "#applications" },
    specifications: [
      {
        title: "Varianten",
        body: "Met of zonder zijvouw, afscheurbaar van de rol, hoeklas (los of afscheurbaar), bloklas, paperlike zakken, kratzakken",
      },
      { title: "Sluitingstechnieken", body: "Bandverblokking, spaarverblokking" },
      { title: "Bedrukking", body: "Flexodruk tot 6 kleuren" },
      { title: "Layers", body: "Mono, 3-laags of 5-laags PE" },
      { title: "Materialen", body: "LDPE, HDPE, virgin of recyclaat" },
    ],
    applications: ["Veevoeders", "Meststoffen", "Poeders", "Zand", "Granen", "Stofafzuiging", "Industriële bulk"],
    whyHobonTitle: "Waarom Hobon",
    whyHobonBody:
      "Hobon verwerkt PE-folies inhouse tot zakken in elk gewenst formaat en zaktype. Flexodrukafdeling tot 6 kleuren voor productidentificatie of branding. Kwaliteitscontrole BRC AA-niveau in elk stadium.",
    relatedSectorIds: ["sector-nl-agro", "sector-nl-chemie", "sector-nl-logistiek"],
    ctaBandTitle1: "Welk zaktype past bij uw afvulinstallatie?",
    ctaBandBody:
      "Wij analyseren uw afvullijn en stellen het juiste zaktype, de sluiting en de bedrukking voor — afgestemd op uw machine en product.",
    ctaBandPrimary: { label: "Bespreek uw vraag", href: "/nl/contact" },
    metaTitle: "PE-zakken op maat | Hobon",
    metaDescription:
      "Zakken in LDPE en HDPE voor veevoeder, meststoffen, poeders en granen. Hoeklas, bloklas, kratzakken. Bedrukt tot 6 kleuren.",
  },
  {
    _id: "product-nl-vellen",
    title: "Vellen (LDPE/HDPE)",
    heroEyebrow: "Product · Vellen",
    heroHeadline: "PE-vellen voor bescherming op maat",
    heroIntro: "Afdekvellen, topsheets en paperlookvellen — bescherming voor uw product en proces, in elk gewenst formaat.",
    heroPrimaryCta: { label: "Vraag een offerte aan", href: "/nl/contact" },
    heroSecondaryCta: { label: "Bekijk specificaties", href: "#specs" },
    specifications: [
      { title: "Varianten", body: "Afdekvellen, topsheets, paperlookvellen" },
      { title: "Afmetingen", body: "Op maat van uw pallets en producten" },
      { title: "Toevoegingen", body: "Anti-UV, anti-statisch, microperforatie" },
      { title: "Materialen", body: "LDPE, HDPE, virgin of recyclaat" },
    ],
    applications: [
      "Palletbescherming",
      "Vochtbescherming tijdens transport",
      "Stofbescherming productie",
      "Tussenlagen op pallets",
      "Topsheets onder krimphoezen",
    ],
    whyHobonTitle: "Waarom Hobon",
    whyHobonBody:
      "PE-vellen worden inhouse gemaakt op maat van uw pallets en producten. Anti-UV en anti-statische uitvoeringen mogelijk. Kwaliteitscontrole in elk productiestadium.",
    relatedSectorIds: ["sector-nl-logistiek", "sector-nl-voeding"],
    ctaBandTitle1: "Welke vellen voor uw toepassing?",
    ctaBandBody: "We vertalen uw palletflow en product naar de juiste vellen, dikte en additieven.",
    ctaBandPrimary: { label: "Vraag een offerte aan", href: "/nl/contact" },
    metaTitle: "PE-vellen op maat | Topsheets en afdekvellen | Hobon",
    metaDescription:
      "PE-afdekvellen, topsheets en paperlookvellen op maat. Voor palletbescherming, vochtbescherming en industriële bescherming.",
  },
  {
    _id: "product-nl-stretch-hood",
    title: "Stretch hood",
    heroEyebrow: "Product · Stretch hood",
    heroHeadline: "Stretch hood — optimale palletbescherming",
    heroIntro:
      "PE-krimphoezen op maat van uw palletformaat — los of afscheurbaar van de rol, voor stabiel en vochtbestendig transport.",
    heroPrimaryCta: { label: "Bespreek uw vraag", href: "/nl/contact" },
    heroSecondaryCta: { label: "Bekijk specificaties", href: "#specs" },
    specifications: [
      { title: "Varianten", body: "Los of afscheurbaar van de rol" },
      { title: "Afmetingen", body: "Op maat van uw palletformaten" },
      { title: "Toevoegingen", body: "Anti-UV, anti-statisch mogelijk" },
      { title: "Bedrukking", body: "Flexodruk tot 6 kleuren voor branding of identificatie" },
      { title: "Materialen", body: "LDPE, virgin of recyclaat" },
    ],
    applications: [
      "Palletstabilisatie",
      "Vochtbescherming opslag/transport",
      "Bescherming tegen stof",
      "Geautomatiseerde palletinpakking",
    ],
    whyHobonTitle: "Waarom Hobon",
    whyHobonBody:
      "Stretch hoezen worden inhouse geproduceerd op de exacte afmetingen van uw pallets. Bedrukking tot 6 kleuren voor branding. Anti-UV opties voor langere buitenopslag.",
    relatedSectorIds: ["sector-nl-logistiek", "sector-nl-agro"],
    ctaBandTitle1: "Welke stretch hood past bij uw palletformaat?",
    ctaBandBody: "We meten uw palletstroom en transportmodus en stellen de passende hoogte, dikte en rek voor.",
    ctaBandPrimary: { label: "Bespreek uw vraag", href: "/nl/contact" },
    metaTitle: "Stretch hood op maat | Palletbescherming | Hobon",
    metaDescription:
      "PE-stretch hoezen voor palletbescherming. Los of afscheurbaar van de rol. Op maat van uw palletformaten. Bedrukt tot 6 kleuren.",
  },
  {
    _id: "product-nl-pattyn",
    title: "PATTYN",
    heroEyebrow: "Product · PATTYN",
    heroHeadline: "PATTYN — buisfolie voor geautomatiseerde inpaklijnen",
    heroIntro:
      "PE-buisfolie met zijvouwen voor PATTYN-installaties en vergelijkbare bag-in-box-systemen — in meerdere PE-samenstellingen en afmetingen.",
    heroPrimaryCta: { label: "Vraag een offerte aan", href: "/nl/contact" },
    heroSecondaryCta: { label: "Bekijk specificaties", href: "#specs" },
    specifications: [
      { title: "Varianten", body: "Buisfolie met zijvouwen, opengevouwen tot 7,2m" },
      { title: "Afmetingen", body: "HD 200-3600mm, LD 200-3600mm" },
      { title: "Toevoegingen", body: "Microperforatie, anti-UV, anti-statisch" },
      { title: "Layers", body: "Mono, 3-laags of 5-laags PE" },
      { title: "Materialen", body: "LDPE, HDPE" },
    ],
    applications: [
      "PATTYN-inpaklijnen",
      "Bag-in-box-systemen",
      "Geautomatiseerde zakgoed-inpaklijnen",
      "Volautomatisch of semi-automatisch afvullen",
      "Hulzen voor stortbare producten",
    ],
    whyHobonTitle: "Waarom Hobon",
    whyHobonBody:
      "Buisfolie met zijvouwen, geproduceerd inhouse in de exacte afmetingen van uw inpakinstallatie. Verschillende PE-samenstellingen mogelijk per toepassing. Kwaliteitscontrole in elk stadium.",
    relatedSectorIds: ["sector-nl-voeding", "sector-nl-agro"],
    ctaBandTitle1: "Buisfolie nodig voor uw PATTYN-installatie?",
    ctaBandBody: "We stemmen buisbreedte, zijvouw en samenstelling af op uw lijn en uw product.",
    ctaBandPrimary: { label: "Vraag een offerte aan", href: "/nl/contact" },
    metaTitle: "PATTYN buisfolie | Hobon",
    metaDescription:
      "PE-buisfolie met zijvouwen voor PATTYN-inpaklijnen en bag-in-box-systemen. Op maat in mono, 3-laags of 5-laags.",
  },
];

async function main() {
  if (!token) {
    console.error("Missing SANITY_API_WRITE_TOKEN");
    process.exit(1);
  }

  for (const p of patches) {
    const specs = p.specifications.map((s) => ({
      _key: k(),
      title: s.title,
      body: s.body,
      ...(s.icon ? { icon: s.icon } : {}),
    }));

    const relatedSectors = p.relatedSectorIds.map(sectorRef);

    await client
      .patch(p._id)
      .set({
        title: p.title,
        heroEyebrow: p.heroEyebrow,
        heroHeadline: p.heroHeadline,
        heroIntro: p.heroIntro,
        heroPrimaryCta: p.heroPrimaryCta,
        heroSecondaryCta: p.heroSecondaryCta,
        specifications: specs,
        applications: p.applications,
        whyHobonTitle: p.whyHobonTitle,
        whyHobonBody: p.whyHobonBody,
        relatedSectors,
        ctaBandTitle1: p.ctaBandTitle1,
        ctaBandBody: p.ctaBandBody,
        ctaBandPrimary: p.ctaBandPrimary,
        "seo.metaTitle": p.metaTitle,
        "seo.metaDescription": p.metaDescription,
        additionalNotes: [],
      })
      .unset(["body", "lead"])
      .commit({ visibility: "async" });

    console.log("Migrated", p._id);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
