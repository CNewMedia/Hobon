# Hobon — Next.js + Sanity POC

Statische HTML-mockup (goedgekeurd design) wordt in deze POC overgezet naar **Next.js 15 (App Router)**, **Tailwind CSS v4**, en **Sanity v3** met ingesloten Studio op `/studio`, driedelige vertaling (NL default, FR/EN klaar voor copy), en vertaalbare URL-segmenten per taal.

## Vereisten

- Node.js 20+
- npm
- Toegang tot Sanity-project `14bi8ppf`, dataset `production`, met een **API write token** (niet committen)

## Setup

```bash
cd hobon-next
npm install
cp .env.local.example .env.local
```

Vul in `.env.local` minstens:

- `NEXT_PUBLIC_SANITY_PROJECT_ID` — bijv. `14bi8ppf`
- `NEXT_PUBLIC_SANITY_DATASET` — bijv. `production`
- `SANITY_API_WRITE_TOKEN` — schrijftoken voor seed en mutaties
- `NEXT_PUBLIC_SITE_URL` — basis-URL voor canonicals/sitemap (lokaal: `http://localhost:3000`)

Start de dev-server:

```bash
npm run dev
```

- Site: [http://localhost:3000/nl/](http://localhost:3000/nl/) (root `/` redirect naar `/nl/`)
- Studio: [http://localhost:3000/studio](http://localhost:3000/studio)

## Seed

Vul `SANITY_API_WRITE_TOKEN` in `.env.local`, daarna:

```bash
npm run seed
```

Dit schrijft NL-content (o.a. homepage, sectoren waaronder `voedingsindustrie` (NL food-sector), producten, insights) en placeholder-documenten voor FR/EN. Bestaande documenten met dezelfde `_id` worden overschreven.

## Talen

- **NL** is default; alle publieke routes gebruiken het prefix `/nl/`, `/fr/`, `/en/`.
- FR/EN hebben vertaalbare padsegmenten (bijv. `/fr/secteurs/...`, `/en/sectors/...`) via **Next.js rewrites** naar de interne route-segmenten (`sectoren`, `over`, enz.).
- Studio gebruikt `@sanity/document-internationalization` voor document-niveau i18n (veld `language`).

## Deploy (Vercel)

**TODO:** productie-deploy op Vercel door gebruiker; environment variables daar hetzelfde als `.env.local.example`, plus `NEXT_PUBLIC_SITE_URL` op het productiedomein.

## Scripts

| Commando      | Betekenis              |
| ------------- | ---------------------- |
| `npm run dev` | Ontwikkelserver        |
| `npm run build` | Productiebuild       |
| `npm run seed` | Sanity dataset vullen |
