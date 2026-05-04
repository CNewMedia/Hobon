/**
 * Patch NL sector documents (logistiek, chemie-industrie, agro-industrie) with PM copy.
 * Does not touch sector-nl-voeding or FR/EN sector documents.
 *
 * Usage:
 *   npm run seed:sectors
 *   npm run seed:sectors -- --inspect   # only print voeding sector shape (field names)
 *
 * Requires SANITY_API_WRITE_TOKEN and NEXT_PUBLIC_SANITY_* in .env.local
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

const contact = "/nl/contact";
/** Sector template uses `id="oplossingen"` on the solutions block (not #solutions). */
const solutionsAnchor = "#oplossingen";

type Cta = { label: string; href: string };

type ProblemCol = {
  variant: "problem" | "approach";
  label: string;
  title: string;
  description: string;
};

type SolCard = {
  _key: string;
  imageUrl: string;
  num: string;
  title: string;
  description: string;
  tags: string[];
  cta: Cta;
};

type FaqItem = {
  _key: string;
  num: string;
  title: string;
  body: string;
  tags: string[];
};

type CompItem = { _key: string; num: string; title: string; description: string };

function solCard(
  partial: Omit<SolCard, "_key" | "tags" | "cta"> & { tags?: string[]; cta?: Cta },
): SolCard {
  return {
    _key: k(),
    ...partial,
    tags: partial.tags ?? [],
    cta: partial.cta ?? { label: "Meer info", href: contact },
  };
}

function faq(num: string, title: string, body: string): FaqItem {
  return { _key: k(), num, title, body, tags: [] };
}

function prob(variant: "problem" | "approach", label: string, title: string, description: string): ProblemCol {
  return { variant, label, title, description };
}

const logistiekImg = "https://images.unsplash.com/photo-1553413077-190dd305871c";
const chemieImg = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23";
const agroImg = "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad";

const logistiekPatch = {
  heroEyebrow: "Sector · Logistiek & distributie",
  heroHeadline: ["Folie voor logistiek —", "stabiel, snel,", "betrouwbaar op lijn"],
  heroIntro:
    "Geautomatiseerde verpakkingslijnen vragen folie die niet faalt. Krimphoezen, automatenfolie, topsheets en bundelfolie die uw lijn draaiende houden.",
  heroPrimaryCta: { label: "Vraag een offerte aan", href: contact } satisfies Cta,
  heroSecondaryCta: { label: "Bekijk oplossingen", href: solutionsAnchor } satisfies Cta,
  listingDescription:
    "Krimphoezen, automatenfolie, topsheets en bundelfolie voor logistiek — PE-folie die uw geautomatiseerde lijn draaiende houdt.",
  tapeItems: [
    "Krimphoezen op maat",
    "Stretch hood",
    "Automatenfolie",
    "Topsheets",
    "Bundelfolie",
    "Palletstabiliteit",
    "PE op lijnsnelheid",
    "Snelle levering",
  ],
  problemBand: [
    prob(
      "problem",
      "Typisch probleem",
      "Folie scheurt op de lijn",
      "Verkeerde dikte of slechte recyclaat-mix veroorzaakt breuk. Lijnstilstand, herverpakking, verloren productie.",
    ),
    prob(
      "problem",
      "Typisch probleem",
      "Pallets komen niet stabiel aan",
      "Te dunne krimphoezen of slechte rek geven schade tijdens transport. Klachten, kredietnotas, reputatieschade.",
    ),
    prob(
      "problem",
      "Typisch probleem",
      "Voorraad-mismatch",
      "Verschillende lijnen, verschillende formaten — beheer van folie-voorraad wordt complex en duur.",
    ),
  ],
  solutionsTag: "Oplossingen",
  solutionsTitle1: "Logistiek",
  solutionsTitle2: "op maat",
  solutionsCta: { label: "Specifieke vraag?", href: contact } satisfies Cta,
  solutionCards: [
    solCard({
      imageUrl: `${logistiekImg}?w=600&q=75&auto=format&fit=crop`,
      num: "01",
      title: "Krimphoezen op maat per palletformaat",
      description:
        "Stretch hood folie afgestemd op uw exacte palletmaten. Los of afscheurbaar van de rol.",
      tags: ["Stretch hood", "Palletmaat", "Maatwerk"],
    }),
    solCard({
      imageUrl: `${logistiekImg}?w=600&q=75&auto=format&fit=crop&sat=-10`,
      num: "02",
      title: "Automatenfolie voor hoge lijnsnelheden",
      description: "Vlakke of geplooide folies in PE-samenstellingen die houden bij volautomatische inpaklijnen.",
      tags: ["FFS / VFFS", "Hoge snelheid", "PE"],
    }),
    solCard({
      imageUrl: `${logistiekImg}?w=600&q=75&auto=format&fit=crop&brightness=-5`,
      num: "03",
      title: "Topsheets voor regenbescherming",
      description: "PE-vellen die uw pallets droog houden tijdens opslag en transport.",
      tags: ["Topsheets", "Buitenopslag", "PE-vellen"],
    }),
    solCard({
      imageUrl: `${logistiekImg}?w=600&q=75&auto=format&fit=crop&contrast=5`,
      num: "04",
      title: "Bundelfolie voor groepering",
      description: "Folie die meerdere units samen verpakt — efficiënt voor distributie.",
      tags: ["Bundelen", "Distributie", "Groepering"],
    }),
  ],
  deepTag: "Lijn & pallet",
  deepTitle1: "Folie die",
  deepTitle2: "uw operatie draaiende houdt",
  deepBody:
    "Van krimphoezen tot topsheets: Hobon levert PE-folie afgestemd op uw palletformaten, lijnsnelheid en transport — met technisch advies vóór bestelling.",
  deepPhotoCaptionTag: "Advisering",
  deepPhotoCaption: "Specificaties op maat van uw lijn en palletflow.",
  deepPrimaryCta: { label: "Start het gesprek", href: contact } satisfies Cta,
  deepFaqs: [
    faq("01", "Welke folie-dikte voor stretch hood?", "Hangt af van palletgewicht, transport-modus en stapel-stabiliteit. Wij rekenen het samen met u door op basis van uw specifieke situatie."),
    faq(
      "02",
      "Kunnen we onze automatenfolie standaardiseren over meerdere lijnen?",
      "Ja — vaak besparen klanten tot 15% op voorraad door folie-rationalisatie. Wij analyseren uw bestaande lijnen en stellen standaardisatie voor waar zinvol.",
    ),
    faq("03", "Hoe snel kunnen jullie leveren?", "Standaard-formaten: 5-10 werkdagen. Maatwerk: 3-4 weken. Bij urgentie schakelen we waar mogelijk."),
    faq("04", "Bedrukken jullie krimphoezen?", "Ja — flexodruk tot 6 kleuren, voor branding of identificatie."),
  ],
  complianceIntro:
    "<strong>PE-folie voor logistiek</strong> — vanaf advies tot levering, met focus op lijncompatibiliteit en transportstabiliteit.",
  complianceItems: [
    { _key: k(), num: "01", title: "Technische doorrekening", description: "Palletgewicht, rek en transport: wij vertalen uw parameters naar een haalbare folie-spec." },
    { _key: k(), num: "02", title: "Levering op afspraak", description: "Standaard- en maatwerk-levertijden in functie van uw planning." },
    { _key: k(), num: "03", title: "Bedrukking optioneel", description: "Flexodruk tot 6 kleuren op krimphoezen waar nodig." },
  ] satisfies CompItem[],
  ctaBandTag: "Contact",
  ctaBandTitle1: "Lijnstilstand voorkomen?",
  ctaBandTitle2: "",
  ctaBandBody:
    "Bespreek uw verpakkingslijn met onze specialisten. Wij brengen de risico's in kaart voor ze geld kosten.",
};

const chemiePatch = {
  heroEyebrow: "Sector · Chemie & industrie",
  heroHeadline: ["Technische verpakkings-", "oplossingen voor", "chemie en industrie"],
  heroIntro:
    "Anti-statisch, UV-bestendig, op maat bedrukt — PE-folie die voldoet aan de meest specifieke industriële vereisten.",
  heroPrimaryCta: { label: "Bespreek uw technische vraag", href: contact } satisfies Cta,
  heroSecondaryCta: { label: "Bekijk oplossingen", href: solutionsAnchor } satisfies Cta,
  listingDescription:
    "Anti-statische en UV-bestendige PE-folie, flexodruk en maatwerk-samenstellingen voor chemische en industriële toepassingen.",
  tapeItems: [
    "Anti-statisch PE",
    "UV-bestendig",
    "Flexodruk 6 kleuren",
    "REACH-conform",
    "Maatwerk PE",
    "Mono / multi-layer",
    "ATEX-advies",
    "Industriële specs",
  ],
  problemBand: [
    prob(
      "problem",
      "Typisch probleem",
      "Statische ontlading risico",
      "Bij gevoelige chemische producten of in ATEX-zones is anti-statische folie geen luxe — het is veiligheid.",
    ),
    prob(
      "problem",
      "Typisch probleem",
      "UV-degradatie tijdens opslag",
      "Folie die buiten staat verbrokkelt zonder UV-additieven. Productverlies en herverpakking.",
    ),
    prob(
      "problem",
      "Typisch probleem",
      "Geen identificatie zonder bedrukking",
      "Bulk-producten zonder duidelijke bedrukking veroorzaken verwarring in productie en distributie.",
    ),
  ],
  solutionsTag: "Oplossingen",
  solutionsTitle1: "Industriële",
  solutionsTitle2: "maatwerk",
  solutionsCta: { label: "Specifieke vraag?", href: contact } satisfies Cta,
  solutionCards: [
    solCard({
      imageUrl: `${chemieImg}?w=600&q=75&auto=format&fit=crop`,
      num: "01",
      title: "Anti-statische folie",
      description: "PE-samenstelling met anti-statische additieven voor ESD-gevoelige producten.",
      tags: ["ESD", "Anti-statisch", "PE"],
    }),
    solCard({
      imageUrl: `${chemieImg}?w=600&q=75&auto=format&fit=crop&sat=-15`,
      num: "02",
      title: "UV-bestendige folie",
      description: "Anti-UV behandelingen voor langere buitenopslag zonder degradatie.",
      tags: ["UV", "Buitenopslag", "Additieven"],
    }),
    solCard({
      imageUrl: `${chemieImg}?w=600&q=75&auto=format&fit=crop&brightness=-8`,
      num: "03",
      title: "Flexodruk tot 6 kleuren",
      description: "Productinformatie, lotnummers, branding — direct op de folie of zak.",
      tags: ["Flexodruk", "Traceerbaarheid", "Branding"],
    }),
    solCard({
      imageUrl: `${chemieImg}?w=600&q=75&auto=format&fit=crop&contrast=8`,
      num: "04",
      title: "Maatwerk PE-samenstellingen",
      description: "Mono, 3-laags of 5-laags folies voor specifieke barrièrevereisten.",
      tags: ["Barrière", "Co-extrusie", "Advies"],
    }),
  ],
  deepTag: "Technische folie",
  deepTitle1: "Specs die",
  deepTitle2: "uw proces volgen",
  deepBody:
    "Chemie en industrie vragen folie die veiligheid (ESD), levensduur (UV) en traceerbaarheid (druk) combineert. Hobon denkt mee over samenstelling en additieven.",
  deepPhotoCaptionTag: "REACH & specs",
  deepPhotoCaption: "Documentatie en conformiteit op aanvraag per product.",
  deepPrimaryCta: { label: "Bespreek uw spec", href: contact } satisfies Cta,
  deepFaqs: [
    faq(
      "01",
      "Voldoet jullie folie aan REACH?",
      "Onze materialen zijn REACH-conform. Specifieke certificaten leveren we op aanvraag per product.",
    ),
    faq(
      "02",
      "Kunnen jullie folie maken voor ATEX-zones?",
      "Ja — anti-statische PE-folie met de juiste oppervlakteweerstand. Specs op aanvraag.",
    ),
    faq(
      "03",
      "Welke layer-opbouw voor chemische barrière?",
      "Hangt af van het product en de bewaartijd. Wij adviseren mono, 3-laags of 5-laags op basis van uw specificaties.",
    ),
    faq(
      "04",
      "Lever je in kleine series?",
      "Minimum batches in functie van het product. Voor maatwerk werken we vanaf 1 ton — bel ons als u kleinere hoeveelheden zoekt.",
    ),
  ],
  complianceIntro:
    "<strong>Industriële PE-folie</strong> — REACH-conforme materialen en technische ondersteuning voor chemie- en machinepark-specs.",
  complianceItems: [
    { _key: k(), num: "01", title: "REACH-conform", description: "Materialen conform EU-registratie; certificaten op aanvraag." },
    { _key: k(), num: "02", title: "Anti-statisch & UV", description: "Additieven voor ESD en buitenopslag, afgestemd op uw toepassing." },
    { _key: k(), num: "03", title: "Flexodruk", description: "Tot 6 kleuren voor identificatie en branding op folie of zak." },
  ] satisfies CompItem[],
  ctaBandTag: "Contact",
  ctaBandTitle1: "Specifieke technische vereisten?",
  ctaBandTitle2: "",
  ctaBandBody:
    "Onze specialisten denken mee over PE-samenstellingen, additieven en bedrukking voor uw exacte toepassing.",
};

const agroPatch = {
  heroEyebrow: "Sector · Agro-industrie",
  heroHeadline: ["Verpakkingsfolie voor", "agro-industrie", "en veevoeder"],
  heroIntro:
    "Robuuste zakken en folies voor veevoeder, meststoffen, poeders en granen — op maat van uw afvulinstallatie.",
  heroPrimaryCta: { label: "Vraag een offerte aan", href: contact } satisfies Cta,
  heroSecondaryCta: { label: "Bekijk oplossingen", href: solutionsAnchor } satisfies Cta,
  listingDescription:
    "Zakken en folie voor veevoeder, meststoffen en bulk — hoeklas, bloklas, kratzakken en UV-bestendige uitvoeringen.",
  tapeItems: [
    "Hoeklas & bloklas",
    "Kratzakken",
    "Veevoederzakken",
    "UV-bestendig",
    "Paperlike",
    "Microperforatie",
    "Afvullijn-advies",
    "Flexodruk",
  ],
  problemBand: [
    prob(
      "problem",
      "Typisch probleem",
      "Zakken scheuren bij vullen",
      "Onvoldoende sterkte bij hoge afvulsnelheid leidt tot productverlies en lijnstilstand.",
    ),
    prob(
      "problem",
      "Typisch probleem",
      "Onvoldoende UV-bescherming voor opslag",
      "Veevoeder en meststoffen die buiten staan vragen folie die niet degradeert in zonlicht.",
    ),
    prob(
      "problem",
      "Typisch probleem",
      "Verkeerde zaktypes voor afvulinstallatie",
      "Hoeklas, bloklas, paperlike — elke installatie vraagt zijn eigen zaktype. Verkeerde keuze = lijn niet draaiend.",
    ),
  ],
  solutionsTag: "Oplossingen",
  solutionsTitle1: "Agro-industriële",
  solutionsTitle2: "verpakking",
  solutionsCta: { label: "Specifieke vraag?", href: contact } satisfies Cta,
  solutionCards: [
    solCard({
      imageUrl: `${agroImg}?w=600&q=75&auto=format&fit=crop`,
      num: "01",
      title: "Zakken voor elke afvulinstallatie",
      description: "Hoeklas, bloklas, paperlike of kratzakken — afgestemd op uw bestaande lijn.",
      tags: ["Hoeklas", "Bloklas", "Paperlike"],
    }),
    solCard({
      imageUrl: `${agroImg}?w=600&q=75&auto=format&fit=crop&sat=-12`,
      num: "02",
      title: "UV-bestendige uitvoering",
      description: "Anti-UV additieven voor langere buitenopslag zonder kwaliteitsverlies.",
      tags: ["UV", "Buiten", "Additieven"],
    }),
    solCard({
      imageUrl: `${agroImg}?w=600&q=75&auto=format&fit=crop&brightness=-6`,
      num: "03",
      title: "Bedrukking voor productidentificatie",
      description: "Productnaam, samenstelling en logo direct op de zak — flexodruk tot 6 kleuren.",
      tags: ["Identificatie", "Flexodruk", "Branding"],
    }),
    solCard({
      imageUrl: `${agroImg}?w=600&q=75&auto=format&fit=crop&contrast=6`,
      num: "04",
      title: "Bandverblokking en spaarverblokking",
      description: "Verschillende sluitingstechnieken voor verschillende soorten producten en machines.",
      tags: ["Sluitingen", "Machines", "Maatwerk"],
    }),
  ],
  deepTag: "Afvul & zakken",
  deepTitle1: "Het juiste",
  deepTitle2: "zaktype op uw lijn",
  deepBody:
    "Agro en veevoeder vragen robuuste zakken en de juiste sluiting voor uw afvulmachine. Hobon koppelt machine-specs aan zakconstructie en folie-opbouw.",
  deepPhotoCaptionTag: "Machine-advies",
  deepPhotoCaption: "Hoeklas, bloklas of kratzakken — afgestemd op uw installatie.",
  deepPrimaryCta: { label: "Start het gesprek", href: contact } satisfies Cta,
  deepFaqs: [
    faq(
      "01",
      "Welk zaktype voor mijn veevoeder-lijn?",
      "Hangt af van uw afvulinstallatie en het product. Wij komen langs of bekijken uw machine-specificaties om het juiste type voor te stellen.",
    ),
    faq(
      "02",
      "Kunnen jullie zakken voor zware producten leveren?",
      "Ja — verstevigde PE in 3-laags of 5-laags voor producten tot 50kg. Op aanvraag groter.",
    ),
    faq("03", "Levert u kratzakken?", "Ja — kratzakken zijn een specifiek niche-product van Hobon."),
    faq(
      "04",
      "Hoe zit het met perforaties voor ademende verpakking?",
      "Microperforatie is mogelijk voor producten die moeten kunnen ademen. Specs op aanvraag.",
    ),
  ],
  complianceIntro:
    "<strong>Robuuste agro-verpakkingen</strong> — zakken en folies ontworpen rond uw product, opslag en afvulsnelheid.",
  complianceItems: [
    { _key: k(), num: "01", title: "Zakken op maat", description: "Hoeklas, bloklas, paperlike en kratzakken — matching met uw lijn." },
    { _key: k(), num: "02", title: "UV & sterkte", description: "Additieven en laagopbouw voor buitenopslag en zware vullingen." },
    { _key: k(), num: "03", title: "Perforatie", description: "Microperforatie op aanvraag voor ademende verpakkingen." },
  ] satisfies CompItem[],
  ctaBandTag: "Contact",
  ctaBandTitle1: "Klaar voor het juiste zaktype?",
  ctaBandTitle2: "",
  ctaBandBody:
    "Onze specialisten kennen agro-industriële afvullijnen. Wij stellen het juiste zaktype voor op basis van uw machine en uw product.",
};

async function inspectVoeding() {
  const voeding = await client.fetch(
    `*[_type == "sector" && language == "nl" && slug.current == "voedingsindustrie"][0]`,
  );
  console.log(JSON.stringify(voeding, null, 2));
}

async function main() {
  if (process.argv.includes("--inspect")) {
    await inspectVoeding();
    return;
  }

  if (!token) {
    console.error("Missing SANITY_API_WRITE_TOKEN");
    process.exit(1);
  }

  const patches: { id: string; set: Record<string, unknown> }[] = [
    {
      id: "sector-nl-logistiek",
      set: {
        ...logistiekPatch,
        "seo.metaTitle": "Verpakkingsfolie voor logistiek | Hobon",
        "seo.metaDescription":
          "Krimphoezen, automatenfolie en topsheets voor logistieke operaties. Hobon levert PE-folie die uw lijn draaiende houdt.",
      },
    },
    {
      id: "sector-nl-chemie",
      set: {
        ...chemiePatch,
        "seo.metaTitle": "Verpakkingsfolie chemie & industrie | Hobon",
        "seo.metaDescription":
          "Anti-statische, UV-bestendige PE-folie op maat voor chemische en industriële toepassingen. Bedrukking tot 6 kleuren.",
      },
    },
    {
      id: "sector-nl-agro",
      set: {
        ...agroPatch,
        "seo.metaTitle": "Verpakkingsfolie agro-industrie | Zakken Hobon",
        "seo.metaDescription":
          "Robuuste zakken voor veevoeder, meststoffen, poeders en granen. Op maat van uw afvulinstallatie. Hoeklas, bloklas, kratzakken.",
      },
    },
  ];

  for (const { id, set } of patches) {
    const res = await client.patch(id).set(set).commit({ visibility: "async" });
    console.log("Patched", id, res._id);
  }

  const verify = await client.fetch<
    {
      _id: string;
      slug: string | null;
      heroIntro: string | null;
      problemBand: { title: string }[] | null;
      deepFaqs: unknown[] | null;
      solutionCards: unknown[] | null;
      seo?: { metaTitle?: string | null };
    }[]
  >(
    `*[_type == "sector" && _id in $ids]{_id, "slug": slug.current, heroIntro, problemBand[]{title}, deepFaqs, solutionCards, seo}`,
    { ids: ["sector-nl-logistiek", "sector-nl-chemie", "sector-nl-agro"] },
  );
  const summary = verify.map((d) => ({
    _id: d._id,
    slug: d.slug,
    metaTitle: d.seo?.metaTitle,
    nFaqs: d.deepFaqs?.length ?? 0,
    nSols: d.solutionCards?.length ?? 0,
    heroHasTodo: (d.heroIntro ?? "").includes("[TODO]"),
    problemTitlesHasTodo: (d.problemBand ?? []).some((p) => p.title.includes("[TODO]")),
  }));
  console.log("\nVerify:", JSON.stringify(summary, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
