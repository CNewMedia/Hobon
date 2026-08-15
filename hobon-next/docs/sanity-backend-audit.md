# Sanity backend audit — Hobon (`14bi8ppf` / `production`)

**Datum:** 2026-08-14  
**Scope:** read-only (geen schema-, Sanity- of git-writes)  
**Live:** [https://hobon-next.vercel.app](https://hobon-next.vercel.app)

Status: **✅** OK / **🟡** let op / **🔴** blokker

Paden in dit document: schemas staan in `hobon-next/sanity/schemas/` (niet `lib/sanity/schemas/`). Queries staan in één file `lib/sanity/queries.ts` (geen map `lib/sanity/queries/`).

Geen token-waarden in dit document.

---

## 6. Samenvatting

| Categorie | Check | Status | Opmerking |
|-----------|-------|--------|-----------|
| Schema-cleanness | Deprecated fields | ✅ | 0 in schemas |
| Schema-cleanness | Redundant fields | 🟡 | Geen dubbele body/title; wel image+URL en overview `title`/`intro` vs hero |
| Schema-cleanness | Broken refs | 🟡 | 0 product/insight-orphans; 2 dangling metadata-refs |
| Publish-flow | Draft Mode actief | 🟡 | `/api/draft` + Presentation; geen `vercel.json`; lokaal geen `SANITY_API_READ_TOKEN` |
| Publish-flow | Webhooks | 🟡 | API 401; aantal onbekend; geen revalidate-route |
| Publish-flow | Instant live | 🟡 | Niet gemeten via write; HTML `no-store`; Sanity CDN |
| Slug-routing | Uniqueness per taal | ✅ | 0 live duplicaten; schema zonder `isUnique` |
| Slug-routing | translation.metadata | 🟡 | Niet op product-doc; producten via `_id`; 6 metadata-docs (insights) |
| Slug-routing | Fallback-logica | ✅ | Geen NL-copy-fallback; intentioneel |
| Legacy | Old schema-velden | 🟡 | URL-legacy + 8× `body`/`lead` in data |
| Legacy | Seed-scripts overlap | 🟡 | 7 seeds mei 2026; `seed.ts` overlapt latere patches |
| API | Queries efficient | 🟡 | 1 fragment; 4 unused; dubbel-fetch metadata+page |
| API | Image-transforms | 🟡 | Sanity transforms; raw `<img>` op product |
| API | CDN-caching | ✅ | HTML `no-store` / MISS; sitemap `s-maxage=3600` |

---

## 1. Schema-cleanness

### A. Ongebruikte / deprecated velden

Grep op `@deprecated`, `TODO.*field` en `unused` in `sanity/schemas/**/*.ts`: **0 hits**. Geen velden gemarkeerd als deprecated.

Enige `@deprecated` in de Sanity-laag: `insightsForLocaleQuery` in `lib/sanity/queries.ts` (alias van `insightsListQuery`, nog in gebruik op de insights-overzichtspagina).

### B. Redundante velden (data 2×)

| Document | Dubbel in schema? | Wat wel |
|----------|-------------------|---------|
| **product** | Nee — geen `productTitle`, geen tweede `body` | `title` (Studio) vs `heroHeadline` (H1) zijn bewust gescheiden. Data: 8 docs hebben nog `body`+`lead` (niet in schema). |
| **sector** | Nee — geen dubbele description-fieldnaam | `listingDescription` / `heroIntro` / `deepBody` zijn verschillende slots. Dual image: upload + URL-legacy (alle 12 sectoren hebben beide listing/hero URL én upload). |
| **insightArticle** | Nee — één `body` (`richText`) | `lead` + `body` + `seo`. Geen tweede body-veld. |
| **productOverviewPage / sectorOverviewPage** | Ja, groep Legacy | `heroTitle`/`heroIntro` plus `title`/`intro` als fallback in `ListingTemplate`. |

### C. Broken references

GROQ op published docs (`!(_id in path("drafts.**"))`). Studio Search/Debug niet geopend.

| Check | Aantal |
|-------|--------|
| Product → niet-bestaande sector (`relatedSectors`) | **0** |
| Insight → deleted category | **0** |
| Insight → deleted `relatedArticles` | **0** |
| Header/footer `internalLink` dangling | **0** |
| `translation.metadata` dangling refs | **2** |

Dangling metadata:

- `199edf78-…` wijst naar `a9bfb69a-c451-4323-aae7-2b253d9a588c` (oude FR `headerNavigation`; live is `headerNavigation-fr`; draft van die UUID bestaat nog).
- `daed35c9-…` wijst naar `c799056b-eaea-4bb9-bada-4b839a468c31` (oude FR faalkosten; live FR is patterned `insight-fr-faalkosten-verkeerde-foliekeuze`).

5 draft-docs in de dataset (o.a. `sanity.previewUrlSecret`, stale header/footer drafts) — geen content-orphans van producten/insights.

---

## 2. Publish-flow & preview

### A. Draft Mode

| Item | Bevinding |
|------|-----------|
| `vercel.json` | Ontbreekt (repo-root en `hobon-next/`) |
| Draft-route | `app/api/draft/route.ts` via `defineEnableDraftMode` + `SANITY_API_READ_TOKEN` |
| Disable | `app/api/draft/disable/route.ts` |
| Presentation | `sanity.config.ts` → `previewMode.enable: "/api/draft"` |
| Open preview | Studio-actie `sanity/actions/openPreview.ts` |
| `NEXT_PUBLIC_PREVIEW_SECRET` | Bestaat **niet** |
| `SANITY_PREVIEW_SECRET` | Staat op Vercel (51d); nergens meer in code (`previewToken.ts` is weg) |
| Lokaal `.env.local` | Geen `SANITY_API_READ_TOKEN` → draft preview zou throwen |
| Studio-klik getest | Nee (geen Studio-sessie) |

`previewUrlSecret`-drafts van 26 juni 2026 tonen dat Presentation ooit gebruikt is.

### B. Sanity webhooks

Management API `GET …/hooks/projects/14bi8ppf`: **401** — Editor-token mist grant `sanity.project.webhooks/read` (geen admin). Aantal/doel webhooks niet uitleesbaar.

App heeft geen `/api/revalidate` en geen `revalidateTag`.

### C. Direct live publish

**Niet gemeten via write** (geen veldwijziging, conform read-only scope).

Afgeleid uit headers + client:

- HEAD `https://hobon-next.vercel.app/nl/producten/folies`: `cache-control: private, no-store, max-age=0, must-revalidate`, `x-vercel-cache: MISS`
- Zelfde voor `/nl/producten` en een EN-insight
- Productie-client: `useCdn: true` (`lib/sanity/client.ts`)
- `fetchSanity` roept altijd `draftMode()` aan → routes zijn dynamic (geen ISR-HTML-cache)

Verwacht: geen deploy nodig voor published content; Sanity API-CDN kan alsnog ~10–60s vertragen. Niet instant.

---

## 3. Slug-routing & i18n

### A. Slug uniqueness

Slug-fields hebben **geen** `isUnique`-optie — Studio kan in theorie twee producten dezelfde slug per taal geven.

Live: **0 duplicaten** voor product (24), sector (12), insight (24). 4 NL insight-categorieën hebben een **lege** slug (geen echte dup): Duurzaamheid, Faalkosten, Innovatie, Kwaliteit.

Folies (niet `product-nl-folies`; EN is niet `blown-films`):

| Taal | URL | Document `_id` |
|------|-----|----------------|
| nl | `/nl/producten/folies` | `product-nl-blaasfolies` |
| fr | `/fr/produits/films-hdpe-ldpe` | `product-fr-blaasfolies` |
| en | `/en/products/films` | `product-en-blaasfolies` |

### B. translation.metadata resolutie

Geen `translation.metadata`-**veld** op het productdocument. Het plugin `@sanity/document-internationalization` maakt aparte metadata-docs.

Koppeling in code (`lib/sanity/locale-mapping.ts`):

1. `*[_type == "translation.metadata" && references($id)]` → sibling-refs
2. Fallback: patterned `_id` `{prefix}-{locale}-{key}` (`product-` / `sector-` / `insight-`)
3. Ontbrekende sibling → overzichtspad (`/producten`, `/sectoren`, `/insights`), niet NL-slug

| Type | Koppeling | Aantal |
|------|-----------|--------|
| product (8×3) | patterned `_id`, 0 metadata | 24 docs |
| sector (4×3) | patterned `_id` | 12 |
| insight (8×3) | mix UUID + patterned + 4 complete metadata-groepen | 24; 9 UUID |
| headerNavigation | 1 metadata-doc met dangling FR-UUID | 1 broken |
| faalkosten FR | metadata wijst naar deleted UUID; live FR bestaat patterned | 1 stale ref |

Totaal `translation.metadata` docs: **6**. Alle 24 producten hebben `count(metadata referencing this id) == 0`.

### C. Fallback-logica

Alle page-queries in `lib/sanity/queries.ts` gebruiken `language == $locale`. Geen `coalesce` naar NL-copy. Lege FR/EN-velden blijven leeg; ontbrekend locale-doc → missing page / seed-warning (homepage).

**Intentioneel** — geen NL-content-bleed.

Wat wél fallbackt, binnen dezelfde locale-doc:

- Overview: `heroTitle ?? title`, `heroIntro ?? intro` (`ListingTemplate`)
- Sector-beelden: upload → URL-legacy (`resolveImageWithLegacyUrl` / `sectorCardImageSrc`)
- Language-switcher zonder sibling → overzichtspad

Uitzondering: `app/llms.txt` hardcode’t NL `seoDefaults` + NL insights — geen paginarender.

---

## 4. Legacy-opruiming

### A. Old schema-patterns

Geen `_oldTitle` / `deprecated_*`.

Nog gemarkeerd als legacy in schema:

- **sector:** `listingImageUrl`, `deepPhotoUrl`, `heroMainImageUrl`, `caseStudies[].imageUrl`
- **heroThumb / solutionCard:** `imageUrl`
- **productOverviewPage / sectorOverviewPage:** `title`, `intro` (groep Legacy)
- **insightsOverviewPage:** `intro` (“optional legacy”)

Live data:

- Alle 12 sectoren: `listingImageUrl` én `deepPhotoUrl` én `heroMainImageUrl` nog gevuld naast uploads
- 3 sectoren met caseStudy `imageUrl`
- 8 product-docs met `body` + `lead` in de dataset (niet in schema): boterfolie, dolav-zakken, kratzakken × NL/FR + boterfolie/dolav EN
- `ProductTemplate` heeft `p-legacy-fallback` als `heroHeadline` ontbreekt

### B. Seed-scripts status

7 bestanden, eerste commit mei 2026 (geen pre-2025). Geen HOB-62+ seeds — die era is `migrate-62*.ts`.

| Script | Eerste commit | npm |
|--------|---------------|-----|
| `scripts/seed.ts` | 2026-05-03 | `npm run seed` |
| `seed-sectors-content.ts` | 2026-05-04 | `seed:sectors` |
| `seed-header-navigation-nl.ts` | 2026-05-04 | `seed:header-nl` |
| `seed-footer-navigation-nl.ts` | 2026-05-04 | `seed:footer-nl` |
| `seed-home-niches-nl.ts` | 2026-05-04 | `seed:home-nl` |
| `seed-overview-singletons.ts` | 2026-05-04 | `seed:overview-singletons` |
| `seed-ui-labels.ts` | 2026-05-06 | `seed:ui-labels` |

Overlap: `seed.ts` zaait nav/sectoren/producten; daarna patchen de specialized seeds dezelfde singletons. Dubbele seed-run = overwrite-risico, geen tweede documentset.

### C. Commented-out code in schemas

`rg '//.*field|/\* field' sanity/schemas`: **0**.

---

## 5. API-optimization

### A. Query-efficiency

Geen map `lib/sanity/queries/` — één file `queries.ts`.

- ~24 geëxporteerde query-constanten
- **1** herbruikbaar fragment: `heroMediaProjection` (`lib/sanity/heroMediaProjection.ts`)
- Unused: `productOverviewPageQuery`, `sectorOverviewPageQuery`, `productsForLocaleQuery`, `cookieConsentQuery`, `insightSlugsForLocaleQuery`
- Overlap: `sectorsForLocaleQuery` / `sectorsListingQuery` / `sectorNavQuery`
- Bijna elke pagina fetcht dezelfde GROQ in `generateMetadata` én de page (Sanity `client.fetch`, geen Next fetch-dedup)
- Locale layout: 6 parallelle fetches (settings, header, footer, seoDefaults, tracking, uiLabels)

### B. Image-transforms

Productpagina (`/nl/producten/folies`): hero, thumbs, gallery, related-sector cards via `urlFor().width().quality()` → `cdn.sanity.io` (getransformeerd), daarna raw `<img>` (`eslint-disable @next/next/no-img-element`). Geen `next/image`, geen srcset, geen `loading="lazy"` op product. `next/image` alleen header/footer-logo.

`next.config.ts` `images.remotePatterns`: `cdn.sanity.io`, `images.unsplash.com`.

### C. CDN-headers

Vercel project “Settings → CDN” niet uitleesbaar via CLI.

Gemeten response-headers:

| Content | Cache-Control |
|---------|---------------|
| HTML-pagina’s (product, overview, insight) | `private, no-store, max-age=0, must-revalidate` (`x-vercel-cache: MISS`) |
| `sitemap*.xml` | `public, s-maxage=3600, stale-while-revalidate=86400` |
| `llms.txt` | `public, s-maxage=600, stale-while-revalidate=86400` |

Geen `vercel.json` cache-config. Dynamic HTML komt doordat `fetchSanity` altijd `draftMode()` aanroept.

Vercel env (namen only): `SANITY_API_READ_TOKEN`, `SANITY_PREVIEW_SECRET`, `hobon_viewer_preview` (vermoedelijk restant naast READ_TOKEN). Lokaal ontbreekt READ_TOKEN.

---

## Bronnen

- `hobon-next/sanity/schemas/**`, `lib/sanity/*`, `app/api/draft/*`, `sanity.config.ts`, `sanity/presentation/resolve.ts`
- Live GROQ op dataset `production` (product/sector/insight IDs, slugs, refs, metadata)
- HEAD `hobon-next.vercel.app` (cache-headers)
- `vercel env ls` (var-namen, geen waarden)
- Sanity Management API (webhooks 401)
- Git log op `scripts/seed*.ts`
