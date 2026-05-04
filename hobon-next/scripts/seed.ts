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

function pt(style: "normal" | "h2" | "h3" | "blockquote", text: string) {
  return {
    _type: "block",
    _key: k(),
    style,
    markDefs: [],
    children: [{ _type: "span", _key: k(), marks: [], text }],
  };
}

function daysAgoIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function r(id: string) {
  return { _type: "reference", _ref: id, _key: k() };
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
    companyName: "Hobon",
    formRecipientEmail: "info@cnip.be",
    primaryPhone: "+32 9 377 45 16",
    primaryEmail: "info@hobon.be",
    locations: [
      {
        _type: "location",
        _key: k(),
        name: "Hobon - Lievegem",
        streetAddress: "Arisdonk 139",
        postalCode: "B-9950",
        city: "Lievegem",
        country: "BE",
        phone: "+32 9 377 45 16",
        email: "info@hobon.be",
        latitude: 51.0856,
        longitude: 3.5972,
        openingHours: ["Mo-Fr 08:00-17:00"],
      },
      {
        _type: "location",
        _key: k(),
        name: "Van Hollebeke Plastics (VHP) - Roeselare",
        streetAddress: "Oostnieuwkerkesteenweg 207",
        postalCode: "B-8800",
        city: "Roeselare",
        country: "BE",
        phone: "+32 51 22 95 95",
        email: "info@hobon.be",
        latitude: 50.9492,
        longitude: 3.1056,
        openingHours: ["Mo-Fr 08:00-17:00"],
      },
    ],
  });

  const ref = (id: string) => ({ _type: "reference", _ref: id });

  const menuItem = (
    label: string,
    linkType: "internal" | "external" | "dropdown",
    opts: { refId?: string; url?: string; sub?: ReturnType<typeof menuBlock> },
  ) => {
    const base: Record<string, unknown> = {
      _type: "menuItem",
      _key: k(),
      label,
      linkType,
    };
    if (linkType === "internal" && opts.refId) base.internalLink = ref(opts.refId);
    if (linkType === "external" && opts.url) base.externalUrl = opts.url;
    if (linkType === "dropdown" && opts.sub) base.subItems = opts.sub;
    return base;
  };

  function menuBlock(items: Record<string, unknown>[]) {
    return items;
  }

  tx.createOrReplace({
    _id: "headerNavigation-nl",
    _type: "headerNavigation",
    language: "nl",
    menuItems: menuBlock([
      menuItem("Home", "internal", { refId: "homePage-nl" }),
      menuItem("Producten", "dropdown", {
        sub: menuBlock([
          menuItem("Blaasfolies", "internal", { refId: "product-nl-blaasfolies" }),
          menuItem("Zakken", "internal", { refId: "product-nl-zakken" }),
          menuItem("Vellen", "internal", { refId: "product-nl-vellen" }),
          menuItem("Stretch-hood", "internal", { refId: "product-nl-stretch-hood" }),
          menuItem("Pattyn", "internal", { refId: "product-nl-pattyn" }),
        ]),
      }),
      menuItem("Sectoren", "dropdown", {
        sub: menuBlock([
          menuItem("Voeding", "internal", { refId: "sector-nl-voeding" }),
          menuItem("Logistiek", "internal", { refId: "sector-nl-logistiek" }),
          menuItem("Chemie-industrie", "internal", { refId: "sector-nl-chemie" }),
          menuItem("Agro-industrie", "internal", { refId: "sector-nl-agro" }),
        ]),
      }),
      menuItem("Over Hobon", "internal", { refId: "aboutPage-nl" }),
      menuItem("Duurzaamheid", "internal", { refId: "sustainabilityPage-nl" }),
      menuItem("Insights", "internal", { refId: "insightsOverviewPage-nl" }),
      menuItem("Contact", "internal", { refId: "contactPage-nl" }),
    ]),
    ctaButton: {
      label: "Bespreek uw vraag",
      url: "/nl/contact",
      style: "primary",
    },
  });

  tx.createOrReplace({
    _id: "headerNavigation-fr",
    _type: "headerNavigation",
    language: "fr",
    menuItems: menuBlock([
      menuItem("[FR: Accueil]", "internal", { refId: "homePage-fr" }),
      menuItem("[FR: Produits]", "dropdown", {
        sub: menuBlock([
          menuItem("[FR: Aperçu des produits (NL détail — contenu FR à venir)]", "internal", {
            refId: "productOverviewPage-fr",
          }),
        ]),
      }),
      menuItem("[FR: Secteurs]", "dropdown", {
        sub: menuBlock([
          menuItem("[FR: Aperçu des secteurs (NL détail — contenu FR à venir)]", "internal", {
            refId: "sectorOverviewPage-fr",
          }),
        ]),
      }),
      menuItem("[FR: À propos]", "internal", { refId: "aboutPage-fr" }),
      menuItem("[FR: Durabilité]", "internal", { refId: "sustainabilityPage-fr" }),
      menuItem("[FR: Insights]", "internal", { refId: "insightsOverviewPage-fr" }),
      menuItem("[FR: Contact]", "internal", { refId: "contactPage-fr" }),
    ]),
    ctaButton: {
      label: "[FR: Discuter de votre besoin]",
      url: "/fr/contact",
      style: "primary",
    },
  });

  tx.createOrReplace({
    _id: "headerNavigation-en",
    _type: "headerNavigation",
    language: "en",
    menuItems: menuBlock([
      menuItem("[EN: Home]", "internal", { refId: "homePage-en" }),
      menuItem("[EN: Products]", "dropdown", {
        sub: menuBlock([
          menuItem("[EN: Products overview (NL detail — EN content TODO)]", "internal", {
            refId: "productOverviewPage-en",
          }),
        ]),
      }),
      menuItem("[EN: Sectors]", "dropdown", {
        sub: menuBlock([
          menuItem("[EN: Sectors overview (NL detail — EN content TODO)]", "internal", {
            refId: "sectorOverviewPage-en",
          }),
        ]),
      }),
      menuItem("[EN: About Hobon]", "internal", { refId: "aboutPage-en" }),
      menuItem("[EN: Sustainability]", "internal", { refId: "sustainabilityPage-en" }),
      menuItem("[EN: Insights]", "internal", { refId: "insightsOverviewPage-en" }),
      menuItem("[EN: Contact]", "internal", { refId: "contactPage-en" }),
    ]),
    ctaButton: {
      label: "[EN: Discuss your enquiry]",
      url: "/en/contact",
      style: "primary",
    },
  });

  const footerLink = (
    label: string,
    linkType: "internal" | "external",
    opts: { refId?: string; url?: string },
  ) => {
    const o: Record<string, unknown> = {
      _type: "footerLink",
      _key: k(),
      label,
      linkType,
    };
    if (linkType === "internal" && opts.refId) o.internalLink = ref(opts.refId);
    if (linkType === "external" && opts.url) o.externalUrl = opts.url;
    return o;
  };

  const footerColumn = (title: string, links: Record<string, unknown>[]) => ({
    _type: "footerColumn",
    _key: k(),
    title,
    links,
  });

  tx.createOrReplace({
    _id: "footerNavigation-nl",
    _type: "footerNavigation",
    language: "nl",
    slogan: "Hobon - uw technische partner voor verpakkingsfolie op maat.",
    columns: [
      footerColumn("Producten", [
        footerLink("Productoverzicht", "internal", { refId: "productOverviewPage-nl" }),
        footerLink("Blaasfolies", "internal", { refId: "product-nl-blaasfolies" }),
        footerLink("Zakken", "internal", { refId: "product-nl-zakken" }),
        footerLink("Vellen", "internal", { refId: "product-nl-vellen" }),
      ]),
      footerColumn("Sectoren", [
        footerLink("Alle sectoren", "internal", { refId: "sectorOverviewPage-nl" }),
        footerLink("Voeding", "internal", { refId: "sector-nl-voeding" }),
        footerLink("Logistiek", "internal", { refId: "sector-nl-logistiek" }),
      ]),
      footerColumn("Bedrijf", [
        footerLink("Over Hobon", "internal", { refId: "aboutPage-nl" }),
        footerLink("Duurzaamheid", "internal", { refId: "sustainabilityPage-nl" }),
        footerLink("Contact", "internal", { refId: "contactPage-nl" }),
      ]),
    ],
    bottomLinks: [
      footerLink("Privacy Policy", "external", { url: "https://www.hobon.be/privacy-policy" }),
      footerLink("Cookiebeleid", "external", { url: "https://www.hobon.be/cookies" }),
      footerLink("BRC-certificaat", "external", {
        url: "https://www.brcgs.com/",
      }),
    ],
    copyright: "© 2026 Hobon. Alle rechten voorbehouden.",
    showBrcBadge: true,
  });

  tx.createOrReplace({
    _id: "footerNavigation-fr",
    _type: "footerNavigation",
    language: "fr",
    slogan: "[FR: Hobon — votre partenaire technique pour films d'emballage sur mesure.]",
    columns: [
      footerColumn("[FR: Produits]", [
        footerLink("[FR: Aperçu]", "internal", { refId: "productOverviewPage-fr" }),
      ]),
      footerColumn("[FR: Secteurs]", [
        footerLink("[FR: Tous les secteurs]", "internal", { refId: "sectorOverviewPage-fr" }),
      ]),
      footerColumn("[FR: Entreprise]", [
        footerLink("[FR: À propos]", "internal", { refId: "aboutPage-fr" }),
        footerLink("[FR: Durabilité]", "internal", { refId: "sustainabilityPage-fr" }),
        footerLink("[FR: Contact]", "internal", { refId: "contactPage-fr" }),
      ]),
    ],
    bottomLinks: [
      footerLink("[FR: Politique de confidentialité]", "external", { url: "https://www.hobon.be/privacy-policy" }),
      footerLink("[FR: Cookies]", "external", { url: "https://www.hobon.be/cookies" }),
      footerLink("[FR: Certificat BRC]", "external", { url: "https://www.brcgs.com/" }),
    ],
    copyright: "© 2026 Hobon. [FR: Tous droits réservés.]",
    showBrcBadge: true,
  });

  tx.createOrReplace({
    _id: "footerNavigation-en",
    _type: "footerNavigation",
    language: "en",
    slogan: "[TODO: EN tagline for Hobon packaging films.]",
    columns: [
      footerColumn("[EN: Products]", [
        footerLink("[EN: Overview]", "internal", { refId: "productOverviewPage-en" }),
      ]),
      footerColumn("[EN: Sectors]", [
        footerLink("[EN: All sectors]", "internal", { refId: "sectorOverviewPage-en" }),
      ]),
      footerColumn("[EN: Company]", [
        footerLink("[EN: About]", "internal", { refId: "aboutPage-en" }),
        footerLink("[EN: Sustainability]", "internal", { refId: "sustainabilityPage-en" }),
        footerLink("[EN: Contact]", "internal", { refId: "contactPage-en" }),
      ]),
    ],
    bottomLinks: [
      footerLink("[EN: Privacy Policy]", "external", { url: "https://www.hobon.be/privacy-policy" }),
      footerLink("[EN: Cookie policy]", "external", { url: "https://www.hobon.be/cookies" }),
      footerLink("[EN: BRC certificate]", "external", { url: "https://www.brcgs.com/" }),
    ],
    copyright: "© 2026 Hobon. [EN: All rights reserved.]",
    showBrcBadge: true,
  });

  tx.createOrReplace({
    _id: "analyticsAndTracking",
    _type: "analyticsAndTracking",
    googleAnalyticsId: "",
    googleTagManagerId: "",
    customHeadScripts: "",
    customBodyEndScripts: "",
    pageOverrides: [],
  });

  tx.createOrReplace({
    _id: "cookieConsent",
    _type: "cookieConsent",
    provider: "cookiebot",
    cookiebotCbid: "[YOUR_COOKIEBOT_CBID]",
    cookiebotEnabled: false,
  });

  tx.createOrReplace({
    _id: "seoDefaults-nl",
    _type: "seoDefaults",
    language: "nl",
    defaultMetaTitle: "Hobon — Verpakkingsfolie op maat",
    defaultMetaTitleSuffix: " | Hobon",
    defaultMetaDescription:
      "Hobon is uw technische partner voor PE-verpakkingsfolie. Advies voor aankoop, minder faalkosten. Actief in BE, NL en FR.",
    twitterHandle: "",
    organizationSchema: {
      legalName: "Hobon NV",
      foundingDate: "1985-01-01",
      vatNumber: "[TODO: BE VAT]",
      socialLinks: [],
    },
  });

  tx.createOrReplace({
    _id: "seoDefaults-fr",
    _type: "seoDefaults",
    language: "fr",
    defaultMetaTitle: "[TODO: FR default title]",
    defaultMetaTitleSuffix: " | Hobon",
    defaultMetaDescription: "[TODO: FR meta description]",
    twitterHandle: "",
    organizationSchema: {
      legalName: "[TODO: FR legal name]",
      vatNumber: "[TODO: FR VAT]",
      socialLinks: [],
    },
  });

  tx.createOrReplace({
    _id: "seoDefaults-en",
    _type: "seoDefaults",
    language: "en",
    defaultMetaTitle: "[TODO: EN default title]",
    defaultMetaTitleSuffix: " | Hobon",
    defaultMetaDescription: "[TODO: EN meta description]",
    twitterHandle: "",
    organizationSchema: {
      legalName: "[TODO: EN legal name]",
      vatNumber: "[TODO: EN VAT]",
      socialLinks: [],
    },
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
    seo: { metaTitle: "Over Hobon | Hobon", metaDescription: "Hobon — uw technische partner voor verpakkingsfolie op maat." },
    hero: {
      headline: "Over Hobon",
      subline: "Uw technische partner voor verpakkingsfolie op maat",
    },
    storyBlocks: [
      {
        _type: "headlineBodyBlock",
        _key: k(),
        headline: "Een familiebedrijf met technische DNA",
        body: block(
          "Hobon groeide uit een familiale onderneming met focus op productie én technische ondersteuning. [TODO: Frederik review — exact oprichtingsverhaal en cultuur aanvullen.]",
        ),
      },
      {
        _type: "headlineBodyBlock",
        _key: k(),
        headline: "Onze missie: advies voor product",
        body: block(
          "Wij geloven dat de juiste foliekeuze begint vóór de bestelling: machine, lijn, product en compliance samen bekijken — geen catalogusantwoord.",
        ),
      },
      {
        _type: "headlineBodyBlock",
        _key: k(),
        headline: "Hobon en Van Hollebeke Plastics: één keten",
        body: block(
          "Met productie in Lievegem en Roeselare (VHP) combineren we schaal en specialisatie voor PE-verpakkingen op maat.",
        ),
      },
      {
        _type: "headlineBodyBlock",
        _key: k(),
        headline: "Waarom dit partnerschap uniek is",
        body: block(
          "Advies, extrusie, bedrukking en kwaliteitscontrole onder één dak — minder interfaces, meer grip op uw lijnresultaat.",
        ),
      },
    ],
    keyFacts: [
      {
        _type: "aboutKeyFact",
        _key: k(),
        number: "BRC AA",
        label: "Packaging-certificering",
        description: "Voor levensmiddelenverpakkingen",
      },
      {
        _type: "aboutKeyFact",
        _key: k(),
        number: "100%",
        label: "Inhouse productie",
        description: "Van extruderen tot bedrukken",
      },
      {
        _type: "aboutKeyFact",
        _key: k(),
        number: "6",
        label: "Kleuren bedrukking",
        description: "Flexodruk voor zakken en FFS-folies",
      },
      {
        _type: "aboutKeyFact",
        _key: k(),
        number: "BE/NL/FR",
        label: "Actieve markten",
        description: "Met kennis van lokale vereisten",
      },
    ],
    approach: {
      headline: "Hoe wij werken: advies eerst, dan product",
      body: [
        pt(
          "normal",
          "We starten met uw toepassing: lijnsnelheid, sealzone, retail-eisen en audits. Pas daarna vertalen we dat naar een concreet materiaalvoorstel.",
        ),
        pt(
          "normal",
          "Ons team combineert sales engineers met productie-expertise — u spreekt met mensen die uw folie ook daadwerkelijk produceren. [TODO: Frederik review — teamcopy verfijnen.]",
        ),
      ],
    },
    cta: {
      title: "Benieuwd wat wij voor uw verpakkingslijn kunnen betekenen?",
      buttonLabel: "Bespreek uw vraag",
      buttonLink: { _type: "reference", _ref: "contactPage-nl" },
    },
  });

  tx.createOrReplace({
    _id: "aboutPage-fr",
    _type: "aboutPage",
    language: "fr",
    seo: { metaTitle: "[FR: vertaling nodig]", metaDescription: "[FR: vertaling nodig]" },
    hero: { headline: "[FR: vertaling nodig]", subline: "[FR: vertaling nodig]" },
    storyBlocks: [],
    keyFacts: [],
    approach: { headline: "[FR]", body: block("[FR: vertaling nodig]") },
    cta: {
      title: "[FR]",
      buttonLabel: "[FR]",
      buttonLink: { _type: "reference", _ref: "contactPage-fr" },
    },
  });

  tx.createOrReplace({
    _id: "aboutPage-en",
    _type: "aboutPage",
    language: "en",
    seo: { metaTitle: "[EN: translation needed]", metaDescription: "[EN: translation needed]" },
    hero: { headline: "[EN: translation needed]", subline: "[EN: translation needed]" },
    storyBlocks: [],
    keyFacts: [],
    approach: { headline: "[EN]", body: block("[EN: translation needed]") },
    cta: {
      title: "[EN]",
      buttonLabel: "[EN]",
      buttonLink: { _type: "reference", _ref: "contactPage-en" },
    },
  });

  tx.createOrReplace({
    _id: "sustainabilityPage-nl",
    _type: "sustainabilityPage",
    language: "nl",
    seo: {
      metaTitle: "Duurzaamheid | Hobon",
      metaDescription: "Duurzaamheid zonder concessies aan uw productielijn — recyclaat, virgin en materiaalreductie.",
    },
    hero: {
      headline: "Duurzaamheid zonder concessies aan uw lijn",
      subline: "Uw ESG-doelen vertaald naar concrete materiaalkeuzes",
    },
    standpoint: {
      headline: "Onze visie op duurzaamheid",
      body: [
        pt(
          "normal",
          "Voor Hobon is duurzaamheid geen slogan maar een technische oefening: recyclaat waar het kan, virgin waar het moet, en dunner waar de lijn het toelaat.",
        ),
        pt(
          "normal",
          "We helpen klanten ESG-doelen te vertalen naar haalbare PE-specs — zonder stilstand of kwaliteitsverlies op de lijn.",
        ),
      ],
    },
    practicePoints: [
      {
        _type: "titleBodyBlock",
        _key: k(),
        title: "Recyclaat of virgin",
        body: block(
          "Advies op maat per toepassing en sector — geen dogma's, wel technische realiteit.",
        ),
      },
      {
        _type: "titleBodyBlock",
        _key: k(),
        title: "Dunner = minder materiaal",
        body: block(
          "Materiaalreductie zonder kwaliteitsverlies, dankzij multi-layer technologie.",
        ),
      },
      {
        _type: "titleBodyBlock",
        _key: k(),
        title: "Inhouse kwaliteitscontrole",
        body: block(
          "Consistente kwaliteit, ook bij duurzamere materialen.",
        ),
      },
    ],
    cta: {
      title: "Wil u uw duurzaamheidsdoelstellingen vertalen naar verpakkingskeuzes?",
      buttonLabel: "Bespreek uw vraag met ons",
      buttonLink: { _type: "reference", _ref: "contactPage-nl" },
    },
  });

  tx.createOrReplace({
    _id: "sustainabilityPage-fr",
    _type: "sustainabilityPage",
    language: "fr",
    seo: { metaTitle: "[FR]", metaDescription: "[FR]" },
    hero: { headline: "[FR: vertaling nodig]", subline: "[FR: vertaling nodig]" },
    standpoint: { headline: "[FR]", body: block("[FR: vertaling nodig]") },
    practicePoints: [],
    cta: {
      title: "[FR]",
      buttonLabel: "[FR]",
      buttonLink: { _type: "reference", _ref: "contactPage-fr" },
    },
  });

  tx.createOrReplace({
    _id: "sustainabilityPage-en",
    _type: "sustainabilityPage",
    language: "en",
    seo: { metaTitle: "[EN]", metaDescription: "[EN]" },
    hero: { headline: "[EN: translation needed]", subline: "[EN: translation needed]" },
    standpoint: { headline: "[EN]", body: block("[EN: translation needed]") },
    practicePoints: [],
    cta: {
      title: "[EN]",
      buttonLabel: "[EN]",
      buttonLink: { _type: "reference", _ref: "contactPage-en" },
    },
  });

  tx.createOrReplace({
    _id: "contactPage-nl",
    _type: "contactPage",
    language: "nl",
    seo: { metaTitle: "Contact | Hobon", metaDescription: "Bespreek uw verpakkingsvraag met Hobon." },
    hero: {
      headline: "Bespreek uw verpakkingsvraag",
      subline: "Onze specialisten denken graag met u mee — zonder verplichting",
    },
    intro: "Heeft u een verpakkingsvraag? Vul het formulier in of neem direct contact op.",
    formTitle: "Bespreek uw verpakkingsvraag",
    formSubmitLabel: "Verstuur mijn vraag",
    formThankYouMessage:
      "Bedankt voor uw bericht. Een van onze specialisten neemt binnen 1 werkdag contact met u op.",
    formFields: {
      firstname: "Voornaam",
      lastname: "Naam",
      company: "Bedrijf",
      email: "E-mail",
      phone: "Telefoon",
      sector: "Sector",
      message: "Bericht",
    },
    additionalInfo: block("Liever telefonisch? Bel Hobon of VHP — de nummers vindt u rechts bij de locaties."),
  });

  tx.createOrReplace({
    _id: "contactPage-fr",
    _type: "contactPage",
    language: "fr",
    seo: { metaTitle: "[FR]", metaDescription: "[FR]" },
    hero: { headline: "[FR: vertaling nodig]", subline: "[FR: vertaling nodig]" },
    intro: "[FR: vertaling nodig]",
    formTitle: "[FR]",
    formSubmitLabel: "[FR]",
    formThankYouMessage: "[FR: vertaling nodig]",
    formFields: {
      firstname: "[FR]",
      lastname: "[FR]",
      company: "[FR]",
      email: "[FR]",
      phone: "[FR]",
      sector: "[FR]",
      message: "[FR]",
    },
  });

  tx.createOrReplace({
    _id: "contactPage-en",
    _type: "contactPage",
    language: "en",
    seo: { metaTitle: "[EN]", metaDescription: "[EN]" },
    hero: { headline: "[EN: translation needed]", subline: "[EN: translation needed]" },
    intro: "[EN: translation needed]",
    formTitle: "[EN]",
    formSubmitLabel: "[EN]",
    formThankYouMessage: "[EN: translation needed]",
    formFields: {
      firstname: "[EN]",
      lastname: "[EN]",
      company: "[EN]",
      email: "[EN]",
      phone: "[EN]",
      sector: "[EN]",
      message: "[EN]",
    },
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
    seo: {
      metaTitle: "Insights | Hobon",
      metaDescription: "Praktische artikelen over verpakkingsfolie, kwaliteit en duurzaamheid.",
    },
    hero: {
      headline: "Inzichten & kennisbank",
      subline: "Praktische artikelen over verpakkingsfolie, kwaliteit en duurzaamheid",
    },
    intro: "",
  });

  tx.createOrReplace({
    _id: "insightsOverviewPage-fr",
    _type: "insightsOverviewPage",
    language: "fr",
    seo: { metaTitle: "[FR]", metaDescription: "[FR]" },
    hero: { headline: "[FR: vertaling nodig]", subline: "[FR: vertaling nodig]" },
    intro: "",
  });

  tx.createOrReplace({
    _id: "insightsOverviewPage-en",
    _type: "insightsOverviewPage",
    language: "en",
    seo: { metaTitle: "[EN]", metaDescription: "[EN]" },
    hero: { headline: "[EN: translation needed]", subline: "[EN: translation needed]" },
    intro: "",
  });

  const sectorsNl = [
    {
      _id: "sector-nl-voeding",
      sortOrder: 1,
      navLabel: "Voeding",
      slug: { _type: "slug", current: "voedingsindustrie" },
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

  const insightCatsNl = [
    {
      _id: "insight-cat-nl-kwaliteit",
      title: "Kwaliteit",
      slug: "kwaliteit",
      description: "Audits, certificering, technische standaarden",
      color: "orange",
    },
    {
      _id: "insight-cat-nl-duurzaamheid",
      title: "Duurzaamheid",
      slug: "duurzaamheid",
      description: "Recyclaat, materiaalreductie, ESG-doelen",
      color: "navy",
    },
    {
      _id: "insight-cat-nl-faalkosten",
      title: "Faalkosten",
      slug: "faalkosten",
      description: "Lijnstilstand, breuk, audit-issues",
      color: "orange",
    },
    {
      _id: "insight-cat-nl-innovatie",
      title: "Innovatie",
      slug: "innovatie",
      description: "Nieuwe materialen, technieken, toepassingen",
      color: "navy",
    },
  ];
  for (const c of insightCatsNl) {
    tx.createOrReplace({ ...c, _type: "insightCategory", language: "nl" });
  }

  const insightCatsFr = ["kwaliteit", "duurzaamheid", "faalkosten", "innovatie"];
  for (const slug of insightCatsFr) {
    tx.createOrReplace({
      _id: `insight-cat-fr-${slug}`,
      _type: "insightCategory",
      language: "fr",
      title: `[FR: vertaling nodig] ${slug}`,
      slug: { _type: "slug", current: slug },
      description: "[FR: vertaling nodig]",
    });
  }
  for (const slug of insightCatsFr) {
    tx.createOrReplace({
      _id: `insight-cat-en-${slug}`,
      _type: "insightCategory",
      language: "en",
      title: `[EN: translation needed] ${slug}`,
      slug: { _type: "slug", current: slug },
      description: "[EN: translation needed]",
    });
  }

  const bodyBrc = [
    pt("h2", "Wat AA-niveau is versus andere graden"),
    pt(
      "normal",
      "BRC Packaging Level AA is het hoogste niveau binnen het Global Standard for Packaging Materials. Het betekent dat uw leverancier jaarlijks extern wordt geaudit op voedselveiligheid, traceerbaarheid en procesbeheersing — niet enkel op papier.",
    ),
    pt("h2", "Welke audits en frequentie"),
    pt(
      "normal",
      "U mag een geldig AA-certificaat verwachten met duidelijke scope (welke productielijnen, welke materialen). Audits zijn doorgaans jaarlijks; bij grote wijzigingen in proces of raw materials kan een extra review nodig zijn.",
    ),
    pt("h2", "Technische eisen aan virgin materialen"),
    pt(
      "normal",
      "Voor direct food contact gebruikt Hobon virgin PE-granulaten met volledige migratie- en conformiteitsdocumentatie. Dat is geen marketingkeuze maar een auditbare realiteit op uw BRC-dossier.",
    ),
    pt("h2", "Hoe Hobon u begeleidt"),
    pt(
      "normal",
      "We leveren certificaten, specificatiebladen en batchdocumentatie klaar voor uw QA-team. Vraag ons naar het BRC-packaging dossier vóór uw audit — dan zijn er geen verrassingen op de lijn.",
    ),
    pt("blockquote", "Niet-conformiteit op folie is bijna altijd traceerbaar tot specificatie of batchdocumentatie — wij helpen die keten sluiten."),
  ];

  const bodyRecyclaat = [
    pt("h2", "Verschil in eigenschappen"),
    pt(
      "normal",
      "Recyclaat kan variëren in treksterkte, kleurstabiliteit en geur. Virgin PE is homogener — belangrijk wanneer uw retailer strikte sensorische limieten hanteert.",
    ),
    pt("h2", "EU 10/2011 en food contact"),
    pt(
      "normal",
      "Migratie en overall compliance blijven leidend. Recyclaat voor food vereist aanvullende due diligence op inputstromen en additieven.",
    ),
    pt("h2", "Wanneer recyclaat wél werkt"),
    pt(
      "normal",
      "Industriële zakken, secundaire verpakkingen of niet-hechtend food-contact — daar zien we recyclaat technisch en economisch renderen.",
    ),
    pt("h2", "Hybride oplossingen"),
    pt(
      "normal",
      "Multi-layer met recyclaat-core en virgin functionele lagen kan de sweet spot zijn tussen CO₂-reductie en lijnstabiliteit.",
    ),
  ];

  const bodyFaalkosten = [
    pt("h2", "Voorbeeld: geur-issue door verkeerde folie"),
    pt(
      "normal",
      "Een voedingsproducent schakelde naar goedkopere LDPE — binnen weken meldingen van geur in het eindproduct. Root cause: onvoldoende barrière en batchvariatie.",
    ),
    pt("h2", "Voorbeeld: breuk door te dunne spec"),
    pt(
      "normal",
      "Een logistieke lijn verhoogde snelheid; folie bleef binnen spec op papier maar brak mechanisch door lagere sealsterkte bij hogere cyclus.",
    ),
    pt("h2", "Rekenvoorbeeld"),
    pt(
      "normal",
      "Eén uur stilstand kost vaak meer dan de jaarlijkse meerprijs van een beter materiaal. Hobon rekent dat vooraf mee in het advies.",
    ),
    pt("h2", "Hoe wij faalrisico's vroeg zien"),
    pt(
      "normal",
      "Machineaudit, trek- en sealcurves, en batch-koppeling — we koppelen uw lijnparameters aan de folie-spec vóór productie.",
    ),
  ];

  const bodyDunner = [
    pt("h2", 'Mythe: "dunner = zwakker"'),
    pt(
      "normal",
      "Dikte alleen zegt weinig zonder te weten welke co-extrusie, additieven en oriëntatie u gebruikt.",
    ),
    pt("h2", "Technologie die dunner mogelijk maakt"),
    pt(
      "normal",
      "Multi-layer en additivering kunnen barrière en sterkte leveren bij lagere micron — minder PE per pallet.",
    ),
    pt("h2", "CO₂ per ton minder PE"),
    pt(
      "normal",
      "Minder materiaal betekent minder extrusie-energie en transportgewicht — concrete CO₂-winst als de lijn het aankan.",
    ),
    pt("h2", "Cases"),
    pt(
      "normal",
      "Klanten die van 80µm naar 50µm gingen zonder kwaliteitsverlies — na grondige lijntest en gecontroleerde trial-run.",
    ),
  ];

  tx.createOrReplace({
    _id: "insight-nl-brc-aa-in-de-praktijk",
    _type: "insightArticle",
    language: "nl",
    title: "BRC Packaging Level AA: wat betekent dit concreet?",
    slug: { _type: "slug", current: "brc-aa-in-de-praktijk" },
    lead: "BRC-certificering is meer dan een sticker. Wat betekent het voor uw audit-traject, materiaalkeuzes en lijnsnelheid?",
    publishedAt: daysAgoIso(14),
    category: { _type: "reference", _ref: "insight-cat-nl-kwaliteit" },
    body: bodyBrc,
    relatedArticles: [r("insight-nl-faalkosten-verkeerde-foliekeuze"), r("insight-nl-recyclaat-of-virgin-de-juiste-keuze")],
    seo: {
      metaTitle: "BRC AA in de praktijk | Hobon Insights",
      metaDescription: "Wat BRC Packaging Level AA concreet betekent voor audits en folie.",
    },
  });

  tx.createOrReplace({
    _id: "insight-nl-recyclaat-of-virgin-de-juiste-keuze",
    _type: "insightArticle",
    language: "nl",
    title: "Recyclaat of virgin: wanneer kiest u wat?",
    slug: { _type: "slug", current: "recyclaat-of-virgin-de-juiste-keuze" },
    lead: "Duurzaamheid is geen one-size-fits-all. Voor voedingsverpakkingen gelden andere regels dan voor industriële zakken.",
    publishedAt: daysAgoIso(35),
    category: { _type: "reference", _ref: "insight-cat-nl-duurzaamheid" },
    body: bodyRecyclaat,
    relatedArticles: [r("insight-nl-dunner-folie-zelfde-kwaliteit"), r("insight-nl-brc-aa-in-de-praktijk")],
    seo: {
      metaTitle: "Recyclaat of virgin | Hobon Insights",
      metaDescription: "Wanneer recyclaat technisch en regelgevend haalbaar is.",
    },
  });

  tx.createOrReplace({
    _id: "insight-nl-faalkosten-verkeerde-foliekeuze",
    _type: "insightArticle",
    language: "nl",
    title: "Wat kost een verkeerde foliekeuze écht?",
    slug: { _type: "slug", current: "faalkosten-verkeerde-foliekeuze" },
    lead: "Lijnstilstand, breuk, audit-issues. De rekening van een goedkope folie loopt sneller op dan u denkt.",
    publishedAt: daysAgoIso(56),
    category: { _type: "reference", _ref: "insight-cat-nl-faalkosten" },
    body: bodyFaalkosten,
    relatedArticles: [r("insight-nl-brc-aa-in-de-praktijk"), r("insight-nl-dunner-folie-zelfde-kwaliteit")],
    seo: {
      metaTitle: "Faalkosten verkeerde folie | Hobon Insights",
      metaDescription: "Lijnstilstand en audit-risico door verkeerde materiaalkeuze.",
    },
  });

  tx.createOrReplace({
    _id: "insight-nl-dunner-folie-zelfde-kwaliteit",
    _type: "insightArticle",
    language: "nl",
    title: "Dunner folie, zelfde kwaliteit: waarom advies geld bespaart",
    slug: { _type: "slug", current: "dunner-folie-zelfde-kwaliteit" },
    lead: "Materiaalreductie is de meest onderschatte duurzaamheidswinst — als u de technische specs goed afstemt.",
    publishedAt: daysAgoIso(21),
    category: { _type: "reference", _ref: "insight-cat-nl-duurzaamheid" },
    body: bodyDunner,
    relatedArticles: [r("insight-nl-recyclaat-of-virgin-de-juiste-keuze")],
    seo: {
      metaTitle: "Dunner folie, zelfde kwaliteit | Hobon Insights",
      metaDescription: "Materiaalreductie zonder kwaliteitsverlies op de lijn.",
    },
  });

  const stubSlugs = [
    "brc-aa-in-de-praktijk",
    "recyclaat-of-virgin-de-juiste-keuze",
    "faalkosten-verkeerde-foliekeuze",
    "dunner-folie-zelfde-kwaliteit",
  ];
  const stubSlugToCat: Record<string, string> = {
    "brc-aa-in-de-praktijk": "kwaliteit",
    "recyclaat-of-virgin-de-juiste-keuze": "duurzaamheid",
    "faalkosten-verkeerde-foliekeuze": "faalkosten",
    "dunner-folie-zelfde-kwaliteit": "duurzaamheid",
  };
  for (const slug of stubSlugs) {
    const cat = stubSlugToCat[slug] ?? "kwaliteit";
    tx.createOrReplace({
      _id: `insight-fr-${slug}`,
      _type: "insightArticle",
      language: "fr",
      title: "[FR: vertaling nodig]",
      slug: { _type: "slug", current: slug },
      lead: "[FR: vertaling nodig]",
      publishedAt: daysAgoIso(60),
      category: { _type: "reference", _ref: `insight-cat-fr-${cat}` },
      body: [],
      seo: { metaTitle: "[FR]", metaDescription: "[FR]" },
    });
  }
  for (const slug of stubSlugs) {
    const cat = stubSlugToCat[slug] ?? "kwaliteit";
    tx.createOrReplace({
      _id: `insight-en-${slug}`,
      _type: "insightArticle",
      language: "en",
      title: "[EN: translation needed]",
      slug: { _type: "slug", current: slug },
      lead: "[EN: translation needed]",
      publishedAt: daysAgoIso(60),
      category: { _type: "reference", _ref: `insight-cat-en-${cat}` },
      body: [],
      seo: { metaTitle: "[EN]", metaDescription: "[EN]" },
    });
  }

  await tx.commit();
  console.log(`Seeded ${dataset} on ${projectId}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
