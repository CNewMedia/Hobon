# Seed Strategy

Hobon Sanity dataset (`14bi8ppf` / `production`). Zeven seed-scripts; latere scripts **patchen** docs die `seed.ts` al heeft aangemaakt. Dubbele of parallelle runs kunnen content overschrijven.

## Volgorde (safe)

1. `npm run seed` — foundation: settings, nav, pages, sectoren, producten, insights, categories  
2. `npm run seed:overview-singletons` — hero/CTA op product- en sector-overzicht (NL/FR/EN)  
3. `npm run seed:sectors` — NL sector-detailcopy (logistiek, chemie, agro)  
4. `npm run seed:header-nl` — NL header-navigatie (overschrijft header uit `seed.ts`)  
5. `npm run seed:footer-nl` — NL footer-navigatie (overschrijft footer uit `seed.ts`)  
6. `npm run seed:home-nl` — NL homepage niches + processSteps  
7. `npm run seed:ui-labels` — `uiLabels-nl` (create of patch van vaste keys)

> Ticket-voorstel zette overview-singletons vóór `seed`. In de praktijk moeten overview-docs eerst bestaan (`seed.ts` doet `createOrReplace` op `*OverviewPage-*`); daarna patcht `seed:overview-singletons` hero/CTA. Volgorde hierboven is de veilige.

## Per script: input / output

### `seed.ts` — `npm run seed`

| | |
|--|--|
| **Input** | Lege of bestaande dataset; `SANITY_API_WRITE_TOKEN` |
| **Modus** | `createOrReplace` (volledige overwrite per `_id`) |
| **Output** | `siteSettings`, `analyticsAndTracking`, `cookieConsent` |
| | `headerNavigation-{nl,fr,en}`, `footerNavigation-{nl,fr,en}` |
| | `seoDefaults-{nl,fr,en}` |
| | `homePage-{nl,fr,en}`, `aboutPage-*`, `sustainabilityPage-*`, `contactPage-*` |
| | `productOverviewPage-*`, `sectorOverviewPage-*`, `insightsOverviewPage-*` |
| | 4× `sector-nl-*` (+ FR/EN placeholders waar geseed) |
| | NL producten (`product-nl-*`) + FR/EN siblings uit seed |
| | Insight categories + insight articles (NL + vertalingen waar aanwezig) |

### `seed-overview-singletons.ts` — `npm run seed:overview-singletons`

| | |
|--|--|
| **Input** | Bestaande `sectorOverviewPage-*` / `productOverviewPage-*` |
| **Modus** | `.patch().set()` — heroEyebrow/Title/Intro + CTA-band |
| **Output** | Updates op 6 overview-singletons (NL/FR/EN × 2 types) |
| **Overlap** | Overschrijft hero/CTA die `seed.ts` al zette |

### `seed-sectors-content.ts` — `npm run seed:sectors`

| | |
|--|--|
| **Input** | NL sector-docs (logistiek, chemie-industrie, agro-industrie) |
| **Modus** | `.patch().set()` — problemBand, solutionCards, deepFaqs, … |
| **Output** | `sector-nl-logistiek`, `sector-nl-chemie`, `sector-nl-agro` |
| **Niet** | `sector-nl-voeding` / FR / EN |

### `seed-header-navigation-nl.ts` — `npm run seed:header-nl`

| | |
|--|--|
| **Input** | `headerNavigation-nl` |
| **Modus** | patch menuItems + CTA |
| **Output** | `headerNavigation-nl` |
| **Overlap** | Kan volledige nav uit `seed.ts` overschrijven als erna gedraaid |

### `seed-footer-navigation-nl.ts` — `npm run seed:footer-nl`

| | |
|--|--|
| **Input** | `footerNavigation-nl` |
| **Modus** | patch columns + bottomLinks + slogan |
| **Output** | `footerNavigation-nl` |
| **Overlap** | Zelfde als header t.o.v. `seed.ts` |

### `seed-home-niches-nl.ts` — `npm run seed:home-nl`

| | |
|--|--|
| **Input** | `homePage-nl` |
| **Modus** | patch `productCards`, slogan, `processSteps` |
| **Output** | `homePage-nl` |
| **Overlap** | Overschrijft niche-blok / process uit `seed.ts` |

### `seed-ui-labels.ts` — `npm run seed:ui-labels`

| | |
|--|--|
| **Input** | optioneel bestaande `uiLabels-nl` |
| **Modus** | createOrReplace als nieuw; anders `.patch().set(PATCH_ON_EXISTING)` (alleen vaste keys) |
| **Output** | `uiLabels-nl` |
| **Niet** | FR/EN labels (aparte migrate-scripts HOB-58/63/67/68) |

## Extra listing-seeds (niet in de 7, wel gerelateerd)

| npm | Script | Doel |
|-----|--------|------|
| `seed:listing-sectors` | `migrate-sector-listing.ts` | listingDescription / listing-velden op sectoren |
| `seed:listing-products` | `migrate-product-listing.ts` | listing-velden op producten |

Draai die **na** `seed` + content-seeds, niet parallel.

## Waarschuwing

- **Niet parallel runnen** — race op dezelfde `_id` → onvoorspelbare eindstaat.  
- **`seed.ts` is destructief** (`createOrReplace`) — productie alleen bewust, na backup.  
- Specialized seeds zijn **additive patches** maar overschrijven wel de velden die ze zetten.  
- FR/EN content komt grotendeels uit **migrate/translate**-scripts (HOB-62+), niet uit deze seeds.

## Snelle checklist (nieuwe omgeving)

```bash
npm run seed
npm run seed:overview-singletons
npm run seed:sectors
npm run seed:header-nl
npm run seed:footer-nl
npm run seed:home-nl
npm run seed:ui-labels
# daarna: translate/migrate voor FR/EN indien nodig
```
