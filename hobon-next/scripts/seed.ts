/**
 * Seed Sanity dataset for Hobon POC.
 * Requires SANITY_API_WRITE_TOKEN in .env.local
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

function block(text: string) {
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

async function main() {
  if (!token) {
    console.error("Missing SANITY_API_WRITE_TOKEN in environment.");
    process.exit(1);
  }

  const tx = client.transaction();

  tx.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    phone: "+32 9 377 45 16",
    email: "info@hobon.be",
    hobonAddress: "Arisdonk 139\nB-9950 Lievegem",
    vhpAddress: "Oostnieuwkerkesteenweg 207\nB-8800 Roeselare",
    vhpPhone: "+32 51 22 95 95",
  });

  const homeNl = {
    _id: "homePage-nl",
    _type: "homePage",
    language: "nl",
    seo: {
      metaTitle: "Hobon — Verpakkingsfolie op maat — De juiste folie voorkomt problemen | BE & NL",
      metaDescription:
        "PE-verpakkingsfolie voor industrie, voeding en logistiek. Technisch advies op maat van uw machine en lijn. BRC Packaging Level AA gecertificeerd.",
      noindex: false,
    },
    heroEyebrow: "Belgische producent · BE & NL",
    heroH1Line1: "De juiste",
    heroH1Accent: "folie",
    heroH1Soft: "voorkomt problemen",
    heroSub:
      "Hobon helpt u <strong>de juiste verpakkingsfolie kiezen</strong> voor uw machine, uw lijn en uw duurzaamheidsdoelstellingen — vóór u bestelt. Geen catalogusproduct. <strong>Technisch advies op maat</strong>, van extrusie tot bedrukking in 6&nbsp;kleuren.",
    heroPrimaryCta: { label: "Bespreek uw verpakkingsvraag", href: "/nl/contact" },
    heroSecondaryCta: { label: "Onze sectoren", href: "#sectoren" },
    brcTitle: "BRC Packaging Level AA",
    brcSub: "Gecertificeerde kwaliteit voor voeding & industrie",
    tapeItems: [
      "PE Folies",
      "Automatenfolie",
      "Dolafzakken",
      "BRC Packaging AA",
      "Krimphoezen",
      "Technisch advies",
      "Lievegem · België",
      "Bedrukking 6 kleuren",
      "Virgin & Recyclaat",
      "FFS Folie",
      "Patijnrollen",
      "Stretchfolie",
    ],
    stats: [
      { kind: "number", value: "40", label: "Jaar expertise in PE-verpakkingen" },
      { kind: "number", value: "6", label: "Kleurendruk in eigen flexodrukkerij" },
      { kind: "text", value: "BRC AA", label: "Hoogste certificeringsniveau" },
      { kind: "text", value: "BE+NL", label: "Actief in België en Nederland" },
    ],
    aboutTag: "Onze aanpak",
    aboutHeadline1: "Waar andere leveranciers<br>een catalogus sturen,",
    aboutHeadlineSub: "stelt Hobon vragen",
    aboutBody:
      "Uw verpakkingsvraag is geen cataloguskeuze. De juiste folie hangt af van uw machine, uw lijnsnelheid, uw product en uw compliance-vereisten. <strong>Verkeerde keuzes kosten u meer dan u denkt</strong> — breuk op de lijn, auditproblemen, stilstand.",
    aboutPhotoTag: "Productie in eigen beheer",
    aboutPhotoCaption: "Van extrusie tot bedrukking in 6 kleuren — alles inhouse in Lievegem.",
    aboutFloatNum: "AA",
    aboutFloatTitle: "BRC Packaging Level AA",
    aboutFloatSub: "Gecertificeerd voor food & industrie",
    usps: [
      {
        title: "Advies vóór aankoop",
        body: "Wij helpen u de juiste specificaties bepalen vóór u bestelt — recyclaat of virgin, dunner of verstevigd, voeding of industrie.",
      },
      {
        title: "Minder faalkosten",
        body: "Samen de risico's in kaart brengen: breuk, stilstand en auditproblemen door verkeerde materiaalkeuze voorkomen.",
      },
      {
        title: "Duurzaamheid in de praktijk",
        body: "Recyclaat-oplossingen technisch en economisch haalbaar maken — zonder concessies aan lijnsnelheid of voedselveiligheid.",
      },
    ],
    processTag: "Werkwijze",
    processTitle1: "Van vraag naar",
    processTitle2: "de juiste keuze",
    processCta: { label: "Start het gesprek", href: "/nl/contact" },
    processSteps: [
      {
        step: "Intake",
        title: "Toepassingsanalyse",
        description:
          "Machine, lijnsnelheid, producteigenschappen, retailvereisten, audits. Wij stellen de juiste vragen zodat er geen verrassingen zijn bij de eerste productierun.",
      },
      {
        step: "Advies",
        title: "Materiaaladvies op maat",
        description:
          "Virgin of recyclaat, welke PE-samenstelling, welke dikte — afgestemd op uw lijneisen én uw duurzaamheidsdoelstellingen. Technisch onderbouwd.",
      },
      {
        step: "Productie",
        title: "Productie in eigen beheer",
        description:
          "Extrusie, voorbehandeling, inkleuren, lamineren en flexodruk tot 6 kleuren — alles inhouse in Lievegem. Kwaliteitscontrole in elk stadium.",
      },
      {
        step: "Resultaat",
        title: "Minder faalkosten",
        description:
          "Geen breuk op de lijn, geen stilstand, geen auditproblemen door verkeerde materiaalkeuze. De juiste keuze vooraf bespaart meer dan u denkt.",
      },
    ],
    productsTag: "Speciaalproducten",
    productsTitle1: "Niche-expertise,",
    productsTitle2: "eigen productie",
    productCards: [
      {
        tag: "Niche · hoge expertise vereist",
        title: "Dolafzakken op maat",
        description:
          "Één van de weinige Belgische producenten met diepgaande expertise in dolafzakken. Stuifbestendigheid, lassterkte en weerstand tegen mechanische belasting bepalen de materiaalkeuze — een verkeerde samenstelling leidt tot breuk of productverlies op de lijn.",
        featured: true,
        specs: [
          { key: "Materiaal", value: "LDPE / HDPE" },
          { key: "Sluitingen", value: "Hoeklas · Bloklas · Band" },
          { key: "Bedrukking", value: "Tot 6 kleuren" },
          { key: "Levering", value: "Los of afscheurbaar van rol" },
        ],
        cta: { label: "Bespreek uw toepassing", href: "/nl/contact" },
      },
      {
        tag: "Geautomatiseerde lijnen",
        title: "Automatenfolie & FFS-folie",
        description:
          "Vlakke of geplooide PE-folies voor volledig geautomatiseerde verpakkingslijnen. Constante kwaliteit op hoge lijnsnelheid.",
      },
      {
        tag: "Nieuw in assortiment",
        title: "Patijnrollen & patijnbuis",
        description:
          "Recentelijk toegevoegd aan het Hobon-assortiment. Geschikt voor voedings- en industriële toepassingen op geautomatiseerde lijnen.",
      },
      {
        tag: "Palletverpakking",
        title: "Krimphoezen (LDPE)",
        description:
          "Bescherm uw pallets met krimphoezen voor optimale stabiliteit en vochtbestendigheid. Los of afscheurbaar van de rol.",
      },
      {
        tag: "Groeiproduct",
        title: "Stretchfolie & stretchgoederen",
        description:
          "Hobon bouwt het stretchfolieaanbod verder uit — van machinale stretchfolie tot handwikkelfolie, in diverse samenstellingen.",
      },
    ],
    sectorsTag: "Sectoren",
    sectorsTitle1: "Uw sector,",
    sectorsTitle2: "onze expertise",
    sectorsCta: { label: "Alle sectoren", href: "/nl/sectoren" },
    qualityBig: "BRC<span>&nbsp;AA</span>",
    qualityLabel:
      "<strong>Hoogste certificeringsniveau</strong>BRC Packaging Level AA — geverifieerd in elk productiestadium. Virgin materialen voor food-verpakkingen.",
    qualityItems: [
      {
        num: "01",
        title: "Kwaliteitscontrole in elk stadium",
        description:
          "Van extrusie over voorbehandeling tot bedrukking — inhouse in Lievegem, niet uitbesteed.",
      },
      {
        num: "02",
        title: "Virgin materialen voor voedingsgeschiktheid",
        description:
          "Verpakkingen voor levensmiddelen vervaardigd uit virgin materialen die voldoen aan de strengste hygiënische voorschriften.",
      },
      {
        num: "03",
        title: "Auditklaar bij elke levering",
        description:
          "Geen auditproblemen door verkeerde materiaalkeuze. Onze documentatie en certificering zorgen voor compliance op elk moment.",
      },
    ],
    contactTag: "Contact",
    contactHeadline1: "Bespreek uw",
    contactHeadline2: "verpakkingsvraag",
    contactBody:
      "Heeft u een specifieke toepassing, machine of uitdaging? <strong>Leg het ons voor.</strong> Wij analyseren uw situatie en geven technisch advies — zonder verplichtingen. Gemiddelde reactietijd: 1 werkdag.",
    contactTeam: [
      { initials: "PV", name: "Philip Van den Eynde", role: "Sales Manager Food · +32 9 377 45 16" },
      { initials: "BV", name: "Bruno Van Beveren", role: "Sales Manager Non-Food · +32 9 377 45 16" },
      { initials: "DO", name: "Dorine Van Moorhem", role: "Interne Sales · +32 9 376 27 65" },
    ],
    contactSidebarBody:
      "Vul het volledige contactformulier in op onze contactpagina voor een snelle reactie. Gemiddelde reactietijd: 1 werkdag.",
    contactSidebarCta: { label: "Naar contactformulier", href: "/nl/contact" },
    footerTagline: "De juiste folie voorkomt problemen. Verkeerde keuzes kosten u meer dan u denkt.",
  };

  tx.createOrReplace(homeNl);

  tx.createOrReplace({
    _id: "homePage-fr",
    _type: "homePage",
    language: "fr",
    seo: { metaTitle: "[FR: vertaling nodig]", metaDescription: "[FR: vertaling nodig]" },
    heroEyebrow: "[FR: vertaling nodig]",
    heroH1Line1: "[FR: vertaling nodig]",
    heroH1Accent: "[FR: vertaling nodig]",
    heroH1Soft: "[FR: vertaling nodig]",
    heroSub: "[FR: vertaling nodig]",
    heroPrimaryCta: { label: "[FR]", href: "/fr/contact" },
    heroSecondaryCta: { label: "[FR]", href: "#sectoren" },
    brcTitle: "[FR]",
    brcSub: "[FR]",
    tapeItems: [],
    stats: [],
    usps: [],
    processSteps: [],
    productCards: [],
    qualityItems: [],
    contactTeam: [],
  });

  tx.createOrReplace({
    _id: "homePage-en",
    _type: "homePage",
    language: "en",
    seo: { metaTitle: "[EN: translation needed]", metaDescription: "[EN: translation needed]" },
    heroEyebrow: "[EN: translation needed]",
    heroH1Line1: "[EN: translation needed]",
    heroH1Accent: "[EN: translation needed]",
    heroH1Soft: "[EN: translation needed]",
    heroSub: "[EN: translation needed]",
    heroPrimaryCta: { label: "[EN]", href: "/en/contact" },
    heroSecondaryCta: { label: "[EN]", href: "#sectoren" },
    brcTitle: "[EN]",
    brcSub: "[EN]",
    tapeItems: [],
    stats: [],
    usps: [],
    processSteps: [],
    productCards: [],
    qualityItems: [],
    contactTeam: [],
  });

  tx.createOrReplace({
    _id: "aboutPage-nl",
    _type: "aboutPage",
    language: "nl",
    title: "Over Hobon",
    seo: { metaTitle: "Over Hobon | Hobon", metaDescription: "[TODO: copy invullen]" },
    body: block(
      "[TODO: Over-pagina — Copy Brief + [TODO: Frederik review]. Placeholder tot finale copy beschikbaar is.]",
    ),
  });

  tx.createOrReplace({
    _id: "aboutPage-fr",
    _type: "aboutPage",
    language: "fr",
    title: "[FR: vertaling nodig]",
    seo: { metaTitle: "[FR: vertaling nodig]" },
    body: block("[FR: vertaling nodig]"),
  });

  tx.createOrReplace({
    _id: "aboutPage-en",
    _type: "aboutPage",
    language: "en",
    title: "[EN: translation needed]",
    seo: { metaTitle: "[EN: translation needed]" },
    body: block("[EN: translation needed]"),
  });

  tx.createOrReplace({
    _id: "sustainabilityPage-nl",
    _type: "sustainabilityPage",
    language: "nl",
    title: "Duurzaamheid",
    seo: { metaTitle: "Duurzaamheid | Hobon", metaDescription: "[TODO: Copy Brief sectie 08]" },
    intro: "[TODO: Copy Brief sectie 08 — duurzaamheid intro]",
    body: block("[TODO: Copy Brief sectie 08 — volledige body nog aan te vullen door copywriter]"),
  });

  tx.createOrReplace({
    _id: "sustainabilityPage-fr",
    _type: "sustainabilityPage",
    language: "fr",
    title: "[FR: vertaling nodig]",
    seo: { metaTitle: "[FR]" },
    intro: "[FR: vertaling nodig]",
    body: block("[FR: vertaling nodig]"),
  });

  tx.createOrReplace({
    _id: "sustainabilityPage-en",
    _type: "sustainabilityPage",
    language: "en",
    title: "[EN: translation needed]",
    seo: { metaTitle: "[EN]" },
    intro: "[EN: translation needed]",
    body: block("[EN: translation needed]"),
  });

  tx.createOrReplace({
    _id: "contactPage-nl",
    _type: "contactPage",
    language: "nl",
    title: "Contact",
    seo: { metaTitle: "Contact | Hobon", metaDescription: "[TODO: Copy Brief sectie 09]" },
    intro:
      "[TODO: Copy Brief sectie 09 — contactintro] Telefonisch bereikbaar op +32 9 377 45 16 (Hobon) en VHP +32 51 22 95 95.",
    body: block("[TODO: Copy Brief sectie 09 — formulierintro & openingsuren indien van toepassing]"),
  });

  tx.createOrReplace({
    _id: "contactPage-fr",
    _type: "contactPage",
    language: "fr",
    title: "[FR: vertaling nodig]",
    seo: { metaTitle: "[FR]" },
    intro: "[FR: vertaling nodig]",
    body: block("[FR: vertaling nodig]"),
  });

  tx.createOrReplace({
    _id: "contactPage-en",
    _type: "contactPage",
    language: "en",
    title: "[EN: translation needed]",
    seo: { metaTitle: "[EN]" },
    intro: "[EN: translation needed]",
    body: block("[EN: translation needed]"),
  });

  tx.createOrReplace({
    _id: "productOverviewPage-nl",
    _type: "productOverviewPage",
    language: "nl",
    title: "Producten",
    seo: { metaTitle: "Producten | Hobon", metaDescription: "[TODO: copy invullen]" },
    intro: "[TODO: Copy Brief sectie 06 — productoverzicht intro]",
  });

  tx.createOrReplace({
    _id: "productOverviewPage-fr",
    _type: "productOverviewPage",
    language: "fr",
    title: "[FR: vertaling nodig]",
    seo: { metaTitle: "[FR]" },
    intro: "[FR: vertaling nodig]",
  });

  tx.createOrReplace({
    _id: "productOverviewPage-en",
    _type: "productOverviewPage",
    language: "en",
    title: "[EN: translation needed]",
    seo: { metaTitle: "[EN]" },
    intro: "[EN: translation needed]",
  });

  tx.createOrReplace({
    _id: "sectorOverviewPage-nl",
    _type: "sectorOverviewPage",
    language: "nl",
    title: "Sectoren",
    seo: { metaTitle: "Sectoren | Hobon", metaDescription: "[TODO: copy invullen]" },
    intro: "[TODO: Copy Brief sectie 07 — sectorenoverzicht intro]",
  });

  tx.createOrReplace({
    _id: "sectorOverviewPage-fr",
    _type: "sectorOverviewPage",
    language: "fr",
    title: "[FR: vertaling nodig]",
    seo: { metaTitle: "[FR]" },
    intro: "[FR: vertaling nodig]",
  });

  tx.createOrReplace({
    _id: "sectorOverviewPage-en",
    _type: "sectorOverviewPage",
    language: "en",
    title: "[EN: translation needed]",
    seo: { metaTitle: "[EN]" },
    intro: "[EN: translation needed]",
  });

  tx.createOrReplace({
    _id: "insightsOverviewPage-nl",
    _type: "insightsOverviewPage",
    language: "nl",
    title: "Insights / Kennisbank",
    seo: { metaTitle: "Insights | Hobon", metaDescription: "[TODO: meta beschrijving insights-overzicht]" },
    intro: "[TODO: insights-overzicht intro — placeholder tot copy beschikbaar is]",
  });

  tx.createOrReplace({
    _id: "insightsOverviewPage-fr",
    _type: "insightsOverviewPage",
    language: "fr",
    title: "[FR: vertaling nodig]",
    seo: { metaTitle: "[FR]" },
    intro: "[FR: vertaling nodig]",
  });

  tx.createOrReplace({
    _id: "insightsOverviewPage-en",
    _type: "insightsOverviewPage",
    language: "en",
    title: "[EN: translation needed]",
    seo: { metaTitle: "[EN]" },
    intro: "[EN: translation needed]",
  });

  const sectorsNl = [
    {
      _id: "sector-nl-voeding",
      sortOrder: 1,
      navLabel: "Voeding",
      slug: { _type: "slug", current: "voeding" },
      title: "Voeding & levensmiddelen",
      listingEyebrow: "Sector 01",
      listingDescription:
        "PE-folies met volledige voedingsgeschiktheid. BRC AA gecertificeerd, HACCP-conform, vervaardigd uit virgin materialen voor de strengste food-omgevingen.",
      listingImageUrl:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=70&auto=format&fit=crop",
      listingPills: ["Automatenfolie", "FFS folie", "PE zakken"],
      heroEyebrow: "Sector · Voeding & levensmiddelen",
      heroHeadline: ["Folie die voldoet", "aan de strengste", "food-eisen"],
      heroIntro:
        "In de voedingsindustrie is er geen ruimte voor foutieve materiaalkeuze. <strong>BRC AA gecertificeerd</strong>, volledig voedselveilig, afgestemd op uw machine en lijnsnelheid. Wij stellen eerst de juiste vragen — dan pas de juiste folie.",
      heroPrimaryCta: { label: "Bespreek uw food-uitdaging", href: "/nl/contact" },
      heroSecondaryCta: { label: "Bekijk oplossingen", href: "#oplossingen" },
      heroMainImageUrl:
        "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&q=80&auto=format&fit=crop",
      heroThumbs: [
        {
          imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&q=70&auto=format&fit=crop",
          label: "Automatenfolie",
        },
        {
          imageUrl: "https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=300&q=70&auto=format&fit=crop",
          label: "PE Zakken",
        },
        {
          imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&q=70&auto=format&fit=crop",
          label: "Vellen & Topsheets",
        },
      ],
      tapeItems: [
        "BRC Packaging Level AA",
        "Voedingsgeschiktheid gegarandeerd",
        "Virgin PE materialen",
        "Automatenfolie & FFS",
        "Paperlike zakken",
        "Bag-in-box liners",
        "HACCP-conform",
        "Bedrukking 6 kleuren",
      ],
      problemBand: [
        {
          variant: "problem",
          label: "Typisch probleem",
          title: "Folie die niet voldoet aan food-audit vereisten",
          description:
            "Een verkeerde materiaalkeuze leidt tot auditproblemen, stilstand op de lijn en productieverlies. In food is de marge nul.",
        },
        {
          variant: "problem",
          label: "Typisch probleem",
          title: "Breuk op de lijn door verkeerde dikte of samenstelling",
          description:
            "Folie die de lijnsnelheid niet aankan kost productietijd, grondstof en frustratie. Een goede spec vermijdt dit volledig.",
        },
        {
          variant: "approach",
          label: "De Hobon-aanpak",
          title: "Technisch advies vóór aankoop — geen catalogusvraag",
          description:
            "Wij analyseren uw machine, lijnsnelheid en compliancevereisten. Dan pas selecteren we de juiste food-grade folie.",
        },
      ],
      solutionsTag: "Onze oplossingen",
      solutionsTitle1: "Folies voor",
      solutionsTitle2: "elke food-toepassing",
      solutionsCta: { label: "Specifieke vraag?", href: "/nl/contact" },
      solutionCards: [
        {
          imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&q=75&auto=format&fit=crop",
          num: "01",
          title: "Automatenfolie & FFS-folie",
          description:
            "Vlakke of geplooide PE-folies voor volledig geautomatiseerde verpakkingslijnen. Constante kwaliteit op hoge lijnsnelheid, food-grade gecertificeerd.",
          tags: ["Food-grade", "FFS / VFFS", "Hoge lijnsnelheid", "Multi-layer"],
          cta: { label: "Meer info", href: "/nl/contact" },
        },
        {
          imageUrl: "https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=600&q=75&auto=format&fit=crop",
          num: "02",
          title: "PE zakken voor voeding",
          description:
            "Zakken met hoeklas, bloklas of easy opening voor droge voedingsproducten, vlees, vis en AGF.",
          tags: ["Virgin PE", "Easy opening", "Bedrukking 6k"],
          cta: { label: "Meer info", href: "/nl/contact" },
        },
        {
          imageUrl: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&q=75&auto=format&fit=crop",
          num: "03",
          title: "Vellen & topsheets (vlees/vis)",
          description:
            "PE-vellen voor vlees, vis en diepvriesproducten. Paperlookvellen voor boter en vetproducten.",
          tags: ["Vlees & vis", "Diepvries", "Paperlook"],
          cta: { label: "Meer info", href: "/nl/contact" },
        },
        {
          imageUrl: "https://images.unsplash.com/photo-1559827291-72ee739d0d9a?w=800&q=80&auto=format&fit=crop",
          num: "04",
          title: "Bag-in-box liners",
          description:
            "Buisfolie met zijvouwen in diverse PE-samenstellingen voor bag-in-box toepassingen in de voedings- en drankenindustrie.",
          tags: ["Voeding & dranken", "Buisfolie", "Maatwerk"],
          cta: { label: "Meer info", href: "/nl/contact" },
        },
        {
          imageUrl: "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&q=75&auto=format&fit=crop",
          num: "05",
          title: "Paperlike zakken & hulzen",
          description:
            "Paperlook PE-zakken en automatenfolie voor premiumverpakkingen in de voedingsindustrie.",
          tags: ["Paperlook PE", "Premium", "Retail"],
          cta: { label: "Meer info", href: "/nl/contact" },
        },
        {
          imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=75&auto=format&fit=crop",
          num: "06",
          title: "Recyclaat-oplossingen voor food",
          description:
            "Recyclaat-PE dat voldoet aan food-normen, zonder concessies aan lijnsnelheid.",
          tags: ["Recyclaat PE", "Food-compliant", "Duurzaam"],
          cta: { label: "Meer info", href: "/nl/contact" },
        },
      ],
      uspStrip: [
        {
          num: "01",
          title: "BRC Packaging Level AA",
          description:
            "Hoogste food-certificering. Verifieerbaar in elk productiestadium. Geen risico bij audit.",
        },
        {
          num: "02",
          title: "Virgin materialen voor food",
          description:
            "Alle folies voor voedingstoepassingen vervaardigd uit virgin PE met voedingsgeschiktheid.",
        },
        {
          num: "03",
          title: "Productie 100% inhouse",
          description:
            "Van extrusie tot bedrukking in Lievegem. Kwaliteitscontrole in elk stadium, geen uitbesteding.",
        },
        {
          num: "04",
          title: "Technisch advies op maat",
          description:
            "Wij stellen de juiste vragen over uw machine, lijnsnelheid en audits. Geen cataloguskeuze.",
        },
      ],
      deepTag: "Waarom food anders is",
      deepTitle1: "De folie-keuze bepaalt uw compliance",
      deepTitle2: "niet uw leverancier",
      deepBody:
        "In food kan een verkeerde materiaalkeuze leiden tot <strong>auditproblemen, productterugroeping of lijnstilstand</strong>. De juiste folie hangt af van meerdere factoren die alleen u kent: uw machine, uw product, uw snelheid, uw retailer-eisen.<br><br>Hobon helpt u die factoren in kaart brengen <strong>vóór er folie besteld wordt</strong>.",
      deepPhotoUrl: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=700&q=80&auto=format&fit=crop",
      deepPhotoCaptionTag: "Productie in eigen beheer",
      deepPhotoCaption: "Kwaliteitscontrole in elk stadium — inhouse in Lievegem",
      deepPrimaryCta: { label: "Start het gesprek", href: "/nl/contact" },
      deepFaqs: [
        {
          num: "01",
          title: "Mijn folie voldoet niet aan de retailer-audit",
          body: "Retailer-audits (BRC, IFS, SQF) vereisen traceerbare, gecertificeerde verpakkingsmaterialen. Hobon levert BRC AA gecertificeerde folies met volledige documentatie voor uw leveranciersaudit.",
          tags: ["BRC AA", "Traceerbaarheid", "Auditdocumentatie"],
        },
        {
          num: "02",
          title: "Breuk op mijn FFS-lijn bij hogere snelheid",
          body: "Breuk is bijna altijd een materiaalkwestie: verkeerde dikte, verkeerde PE-samenstelling of verkeerde additivering voor uw machine.",
          tags: ["FFS-analyse", "Lijnsnelheid", "Breukpreventie"],
        },
        {
          num: "03",
          title: "Ik wil recyclaat maar mijn retailer staat het niet toe",
          body: "Recyclaat voor food is een genuanceerd verhaal. Wij helpen u de juiste keuze maken én onderbouwen.",
          tags: ["Recyclaat food-grade", "Retailer-communicatie", "Duurzaamheid"],
        },
        {
          num: "04",
          title: "Mijn leverancier levert niet langer — dringend alternatief",
          body: "Productie volledig inhouse in Lievegem. Geen afhankelijkheid van externe producenten.",
          tags: ["Snelle levering", "Spec-equivalent", "Belgische productie"],
        },
        {
          num: "05",
          title: "Ik zoek een paperlook oplossing voor premiumverpakking",
          body: "Paperlike PE-folie combineert de voedselveiligheid van PE met een premium paperlook voor uw product.",
          tags: ["Paperlook PE", "Premium", "Bedrukking 6k"],
        },
      ],
      complianceBig: "BRC<span>&nbsp;AA</span>",
      complianceIntro:
        "<strong>Hoogste food-certificeringsniveau</strong>BRC Packaging Level AA — geverifieerd in elk productiestadium.",
      complianceItems: [
        {
          num: "01",
          title: "BRC Packaging Level AA — hoogste niveau",
          description:
            "Gecertificeerd voor verpakkingen in contact met levensmiddelen. Jaarlijkse externe audit.",
        },
        {
          num: "02",
          title: "Virgin materialen met voedingsgeschiktheid",
          description:
            "Folies voor directe foodcontact vervaardigd uit virgin PE conform EU-migratierichtlijnen.",
        },
        {
          num: "03",
          title: "HACCP-conforme productieomgeving",
          description: "Hygiënische productie in Lievegem. Volledige traceerbaarheid van grondstof tot eindproduct.",
        },
        {
          num: "04",
          title: "Auditdocumentatie direct beschikbaar",
          description:
            "Certificaten, materialenverklaringen en conformiteitsdocumenten voor uw inkoopaudit.",
        },
      ],
      caseStudies: [
        {
          featured: true,
          imageUrl: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=700&q=70&auto=format&fit=crop",
          sectorLabel: "Vlees & gevogelte",
          title: "FFS-lijn 65 meter/minuut — breuk na overschakeling leverancier",
          description:
            "Na wisseling van leverancier trad breuk op bij hogere lijnsnelheid. Hobon analyseerde de machinespec en leverde een aangepaste samenstelling.",
          resultValue: "0%",
          resultLabel: "breuk na overschakeling<br>op Hobon-spec",
          quote:
            '"We hadden twee weken verlies door die wissel. Hobon had de juiste spec binnen 3 dagen op onze lijn."',
          quoteAttr: "— Productiemanager, vleesverwerkend bedrijf, Gent",
        },
        {
          featured: false,
          imageUrl: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=500&q=65&auto=format&fit=crop",
          sectorLabel: "Droge voeding",
          title: "BRC-audit gefaald door non-food-grade verpakkingsmateriaal",
          description:
            "Leverancier leverde folie zonder food-grade certificering. Hobon leverde directe vervanging met volledige documentatie.",
          resultValue: "48u",
          resultLabel: "van non-conformance<br>naar gecertificeerde vervanging",
        },
        {
          featured: false,
          imageUrl: "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=500&q=65&auto=format&fit=crop",
          sectorLabel: "Groenten & fruit",
          title: "Duurzaamheidsdoelstelling: 30% recyclaat zonder lijnproblemen",
          description:
            "Klant moest recyclaat-percentage verhogen voor retailereis maar ervoer machinefouten.",
          resultValue: "30%",
          resultLabel: "recyclaat-content bereikt<br>zonder lijnstilstand",
        },
      ],
      ctaBandTag: "Contact",
      ctaBandTitle1: "Bespreek uw",
      ctaBandTitle2: "food-verpakkingsvraag",
      ctaBandBody:
        "Heeft u een FFS-lijn, een audit-uitdaging of zoekt u een BRC-gecertificeerd alternatief? <strong>Leg het ons voor.</strong> Gemiddelde reactietijd: 1&nbsp;werkdag.",
      ctaBandTeam: [
        { initials: "PV", name: "Philip Van den Eynde", role: "Sales Manager Food · +32 9 377 45 16" },
        { initials: "BV", name: "Bruno Van Beveren", role: "Sales Manager Non-Food · +32 9 377 45 16" },
      ],
      seo: {
        metaTitle: "Verpakkingsfolie voor Voeding & Levensmiddelen | Hobon",
        metaDescription:
          "PE-verpakkingsfolie voor de voedingsindustrie. BRC Packaging Level AA gecertificeerd.",
      },
    },
    {
      _id: "sector-nl-logistiek",
      _type: "sector",
      language: "nl",
      sortOrder: 2,
      navLabel: "Logistiek",
      slug: { _type: "slug", current: "logistiek" },
      title: "Logistiek & palletverpakking",
      listingEyebrow: "Sector",
      listingDescription:
        "[TODO: Copy Brief sectie 07 — logistiek sector samenvatting voor homepage-kaart]",
      listingImageUrl:
        "https://images.unsplash.com/photo-1553413077-190dd305871c?w=500&q=70&auto=format&fit=crop",
      listingPills: ["Krimphoezen", "Topsheets", "Stretchfolie"],
      heroEyebrow: "Sector · Logistiek",
      heroHeadline: ["Placeholder", "sectorpagina", "logistiek"],
      heroIntro:
        "[TODO: Copy Brief sectie 07 — volledige sectorcopy voor logistiek. Template volgt voeding-structuur.]",
      heroPrimaryCta: { label: "Contact", href: "/nl/contact" },
      heroSecondaryCta: { label: "Oplossingen", href: "#oplossingen" },
      heroMainImageUrl:
        "https://images.unsplash.com/photo-1553413077-190dd305871c?w=1000&q=80&auto=format&fit=crop",
      heroThumbs: [],
      tapeItems: ["Placeholder tape"],
      problemBand: [
        { variant: "problem", label: "Typisch probleem", title: "[TODO]", description: "[TODO]" },
        { variant: "problem", label: "Typisch probleem", title: "[TODO]", description: "[TODO]" },
        { variant: "approach", label: "De Hobon-aanpak", title: "[TODO]", description: "[TODO]" },
      ],
      solutionsTag: "Oplossingen",
      solutionsTitle1: "Logistiek",
      solutionsTitle2: "op maat",
      solutionsCta: { label: "Contact", href: "/nl/contact" },
      solutionCards: [],
      uspStrip: [],
      deepTag: "Dieper",
      deepTitle1: "[TODO]",
      deepTitle2: "[TODO]",
      deepBody: "[TODO]",
      deepPhotoUrl:
        "https://images.unsplash.com/photo-1553413077-190dd305871c?w=700&q=80&auto=format&fit=crop",
      deepPhotoCaptionTag: "[TODO]",
      deepPhotoCaption: "[TODO]",
      deepPrimaryCta: { label: "Contact", href: "/nl/contact" },
      deepFaqs: [],
      complianceBig: "BRC<span>&nbsp;AA</span>",
      complianceIntro: "[TODO]",
      complianceItems: [],
      caseStudies: [],
      ctaBandTag: "Contact",
      ctaBandTitle1: "[TODO]",
      ctaBandTitle2: "[TODO]",
      ctaBandBody: "[TODO]",
      ctaBandTeam: [],
      seo: { metaTitle: "Logistiek | Hobon", metaDescription: "[TODO]" },
    },
    {
      _id: "sector-nl-chemie",
      _type: "sector",
      language: "nl",
      sortOrder: 3,
      navLabel: "Chemie",
      slug: { _type: "slug", current: "chemie-industrie" },
      title: "Chemie-industrie",
      listingEyebrow: "Sector",
      listingDescription: "[TODO: Copy Brief sectie 07 — chemie-industrie]",
      listingImageUrl:
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=70&auto=format&fit=crop",
      listingPills: ["Buisfolie", "Krimpfolie", "Hulzen"],
      heroEyebrow: "Sector · Chemie-industrie",
      heroHeadline: ["Placeholder", "chemie", "industrie"],
      heroIntro: "[TODO: sectorcopy chemie-industrie]",
      heroPrimaryCta: { label: "Contact", href: "/nl/contact" },
      heroSecondaryCta: { label: "Oplossingen", href: "#oplossingen" },
      heroMainImageUrl:
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1000&q=80&auto=format&fit=crop",
      heroThumbs: [],
      tapeItems: ["Placeholder"],
      problemBand: [
        { variant: "problem", label: "Typisch probleem", title: "[TODO]", description: "[TODO]" },
        { variant: "problem", label: "Typisch probleem", title: "[TODO]", description: "[TODO]" },
        { variant: "approach", label: "De Hobon-aanpak", title: "[TODO]", description: "[TODO]" },
      ],
      solutionsTag: "Oplossingen",
      solutionsTitle1: "Chemie",
      solutionsTitle2: "industrie",
      solutionsCta: { label: "Contact", href: "/nl/contact" },
      solutionCards: [],
      uspStrip: [],
      deepTag: "[TODO]",
      deepTitle1: "[TODO]",
      deepTitle2: "[TODO]",
      deepBody: "[TODO]",
      deepPhotoUrl:
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=700&q=80&auto=format&fit=crop",
      deepPhotoCaptionTag: "[TODO]",
      deepPhotoCaption: "[TODO]",
      deepPrimaryCta: { label: "Contact", href: "/nl/contact" },
      deepFaqs: [],
      complianceBig: "BRC<span>&nbsp;AA</span>",
      complianceIntro: "[TODO]",
      complianceItems: [],
      caseStudies: [],
      ctaBandTag: "Contact",
      ctaBandTitle1: "[TODO]",
      ctaBandTitle2: "[TODO]",
      ctaBandBody: "[TODO]",
      ctaBandTeam: [],
      seo: { metaTitle: "Chemie-industrie | Hobon", metaDescription: "[TODO]" },
    },
    {
      _id: "sector-nl-agro",
      _type: "sector",
      language: "nl",
      sortOrder: 4,
      navLabel: "Agro",
      slug: { _type: "slug", current: "agro-industrie" },
      title: "Agro-industrie",
      listingEyebrow: "Sector",
      listingDescription: "[TODO: Copy Brief sectie 07 — agro-industrie]",
      listingImageUrl:
        "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=500&q=70&auto=format&fit=crop",
      listingPills: ["Dolafzakken", "PE zakken", "Buisfolie"],
      heroEyebrow: "Sector · Agro-industrie",
      heroHeadline: ["Placeholder", "agro", "industrie"],
      heroIntro: "[TODO: sectorcopy agro-industrie]",
      heroPrimaryCta: { label: "Contact", href: "/nl/contact" },
      heroSecondaryCta: { label: "Oplossingen", href: "#oplossingen" },
      heroMainImageUrl:
        "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=1000&q=80&auto=format&fit=crop",
      heroThumbs: [],
      tapeItems: ["Placeholder"],
      problemBand: [
        { variant: "problem", label: "Typisch probleem", title: "[TODO]", description: "[TODO]" },
        { variant: "problem", label: "Typisch probleem", title: "[TODO]", description: "[TODO]" },
        { variant: "approach", label: "De Hobon-aanpak", title: "[TODO]", description: "[TODO]" },
      ],
      solutionsTag: "Oplossingen",
      solutionsTitle1: "Agro",
      solutionsTitle2: "industrie",
      solutionsCta: { label: "Contact", href: "/nl/contact" },
      solutionCards: [],
      uspStrip: [],
      deepTag: "[TODO]",
      deepTitle1: "[TODO]",
      deepTitle2: "[TODO]",
      deepBody: "[TODO]",
      deepPhotoUrl:
        "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=700&q=80&auto=format&fit=crop",
      deepPhotoCaptionTag: "[TODO]",
      deepPhotoCaption: "[TODO]",
      deepPrimaryCta: { label: "Contact", href: "/nl/contact" },
      deepFaqs: [],
      complianceBig: "BRC<span>&nbsp;AA</span>",
      complianceIntro: "[TODO]",
      complianceItems: [],
      caseStudies: [],
      ctaBandTag: "Contact",
      ctaBandTitle1: "[TODO]",
      ctaBandTitle2: "[TODO]",
      ctaBandBody: "[TODO]",
      ctaBandTeam: [],
      seo: { metaTitle: "Agro-industrie | Hobon", metaDescription: "[TODO]" },
    },
  ];

  for (const s of sectorsNl) {
    tx.createOrReplace({ ...s, _type: "sector", language: "nl" });
  }

  const productsNl = [
    { slug: "blaasfolies", title: "Blaasfolies", lead: "[TODO: Copy Brief sectie 06 — producttemplate]" },
    { slug: "zakken", title: "Zakken", lead: "[TODO: Copy Brief sectie 06 — producttemplate]" },
    { slug: "vellen", title: "Vellen", lead: "[TODO: Copy Brief sectie 06 — producttemplate]" },
    { slug: "stretch-hood", title: "Stretch-hood", lead: "[TODO: Copy Brief sectie 06 — producttemplate]" },
    { slug: "pattyn", title: "Pattyn", lead: "[TODO: Copy Brief sectie 06 — producttemplate]" },
    { slug: "dolav-zakken", title: "Dolav-zakken", lead: "[TODO: Copy Brief sectie 06 — producttemplate]" },
    { slug: "boterfolie", title: "Boterfolie", lead: "[TODO: Copy Brief sectie 06 — producttemplate]" },
    { slug: "kratzakken", title: "Kratzakken", lead: "[TODO: Copy Brief sectie 06 — producttemplate]" },
  ];

  for (const p of productsNl) {
    tx.createOrReplace({
      _id: `product-nl-${p.slug}`,
      _type: "product",
      language: "nl",
      title: p.title,
      slug: { _type: "slug", current: p.slug },
      lead: p.lead,
      body: block("[TODO: productdetail body — Copy Brief sectie 06]"),
      seo: { metaTitle: `${p.title} | Hobon`, metaDescription: "[TODO]" },
    });
  }

  const insightsNl = [
    {
      slug: "audit-klaar-met-de-juiste-folie",
      title: "Audit-klaar met de juiste foliekeuze",
      lead: "Waarom materiaalspecificatie en documentatie samenhangen met uw BRC/IFS-realiteit.",
      body: block("[TODO: volledig artikel — placeholder voor kennisbank]"),
    },
    {
      slug: "recyclaat-op-de-lijn",
      title: "Recyclaat op de lijn zonder stilstand",
      lead: "Korte intro over haalbare recyclaat blends voor food — [TODO: uitwerken].",
      body: block("[TODO: volledig artikel — placeholder]"),
    },
    {
      slug: "ffs-lijn-65-meter",
      title: "FFS op hoge snelheid: specs die tellen",
      lead: "Praktische checklist voor lijnbaanbreuk en materiaalanalyse — [TODO: uitwerken].",
      body: block("[TODO: volledig artikel — placeholder]"),
    },
  ];

  for (const a of insightsNl) {
    tx.createOrReplace({
      _id: `insight-nl-${a.slug}`,
      _type: "insightArticle",
      language: "nl",
      title: a.title,
      slug: { _type: "slug", current: a.slug },
      publishedAt: new Date().toISOString(),
      lead: a.lead,
      body: a.body,
      seo: { metaTitle: `${a.title} | Hobon Insights`, metaDescription: "[TODO]" },
    });
  }

  await tx.commit();
  console.log(`Seeded ${dataset} on ${projectId}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
