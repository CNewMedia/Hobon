/**
 * Patch NL homepage: 5 niche productCards (volgorde PM), slogan,
 * processSteps (lamineren verwijderd — Hobon lamineert niet).
 * npm run seed:home-nl
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

async function main() {
  if (!token) {
    console.error("Missing SANITY_API_WRITE_TOKEN");
    process.exit(1);
  }

  const productCards = [
    {
      _key: k(),
      tag: "Niche · hoge expertise vereist",
      title: "DOLAV-zakken",
      description:
        "Één van de weinige Belgische producenten met diepgaande expertise in DOLAV-zakken. Stuifbestendigheid, lassterkte en weerstand tegen mechanische belasting bepalen de materiaalkeuze — een verkeerde samenstelling leidt tot breuk of productverlies op de lijn.",
      featured: true,
      specs: [
        { _key: k(), key: "Materiaal", value: "LDPE / HDPE" },
        { _key: k(), key: "Sluitingen", value: "Hoeklas · Bloklas · Band" },
        { _key: k(), key: "Bedrukking", value: "Tot 6 kleuren" },
        { _key: k(), key: "Levering", value: "Los of afscheurbaar van rol" },
      ],
      cta: { label: "Bespreek uw toepassing", href: "/nl/contact" },
    },
    {
      _key: k(),
      tag: "Geautomatiseerde lijnen",
      title: "Patijnrollen",
      description:
        "Patijnbuis en rollen voor geautomatiseerde inpaklijnen. Geschikt voor voedings- en industriële toepassingen met aandacht voor consistente kwaliteit op hoge lijnsnelheid.",
      featured: false,
    },
    {
      _key: k(),
      tag: "Palletverpakking",
      title: "Stretchfolie",
      description:
        "Hobon bouwt het stretchfolieaanbod verder uit — van machinale stretchfolie tot handwikkelfolie, in diverse samenstellingen voor palletstabiliteit en bescherming.",
      featured: false,
    },
    {
      _key: k(),
      tag: "Paperlook / food",
      title: "Boterfolie",
      description: "",
      featured: false,
    },
    {
      _key: k(),
      tag: "Niche",
      title: "Kratzakken",
      description: "",
      featured: false,
    },
  ];

  const processSteps = [
    {
      _key: k(),
      step: "Intake",
      title: "Toepassingsanalyse",
      description:
        "Machine, lijnsnelheid, producteigenschappen, retailvereisten, audits. Wij stellen de juiste vragen zodat er geen verrassingen zijn bij de eerste productierun.",
    },
    {
      _key: k(),
      step: "Advies",
      title: "Materiaaladvies op maat",
      description:
        "Virgin of recyclaat, welke PE-samenstelling, welke dikte — afgestemd op uw lijneisen én uw duurzaamheidsdoelstellingen. Technisch onderbouwd.",
    },
    {
      _key: k(),
      step: "Productie",
      title: "Productie in eigen beheer",
      description:
        "Extrusie, voorbehandeling, inkleuren, bedrukken en verwerking tot zakken en vellen — alles inhouse in Lievegem. Kwaliteitscontrole in elk stadium.",
    },
    {
      _key: k(),
      step: "Resultaat",
      title: "Minder faalkosten",
      description:
        "Geen breuk op de lijn, geen stilstand, geen auditproblemen door verkeerde materiaalkeuze. De juiste keuze vooraf bespaart meer dan u denkt.",
    },
  ];

  await client
    .patch("homePage-nl")
    .set({
      productCards,
      processSteps,
    })
    .commit({ visibility: "async" });

  console.log("Patched homePage-nl (productCards + processSteps)");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
