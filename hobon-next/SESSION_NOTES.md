# SESSION_NOTES — Hobon Next.js + Sanity POC

## Wat is gebouwd

- Next.js **15.2.x** (create-next-app leverde oorspronkelijk v16; gepind op v15 conform briefing), **App Router**, **TypeScript**, **Tailwind v4** (`@tailwindcss/postcss`).
- Design uit `index.html`, `sectoren/voeding.html` en `assets/css/style.css`: kleurpalet uit de briefing in `:root` / `@theme`, fonts **Geist** + **DM Sans** via `next/font/google`; volledige mock-CSS gekopieerd naar `app/hobon-mock.css` (tokens in `:root` afgestemd op briefing-hexcodes) voor **pixel-pariteit** met goedgekeurde mock (geen handmatige herbouw van ~1100 regels naar utility-only Tailwind).
- **Sanity v3**: `sanity.config.ts`, schemas onder `sanity/schemas/`, embedded Studio op **`/studio`**, Vision-plugin, **`@sanity/document-internationalization`** (nl/fr/en).
- Routes onder `app/[locale]/…` met **vertaalbare segmenten** (`lib/i18n/segments.ts`) en **rewrites** in `next.config.ts` (bijv. `/fr/secteurs/*` → intern `/fr/sectoren/*`).
- Middleware: `/` → `/nl/`, header `x-locale` voor `lang` op `<html>`.
- **Home** en **sector-detail**: volledige templates gekoppeld aan Sanity (`HomeTemplate`, `SectorTemplate`). Overige pagina’s: minimale layout (`MinimalPage` + `SimpleRichText`).
- **SEO**: `generateMetadata` via `buildPageMetadata`, `robots.ts`, sitemap-index + per-locale sitemaps (zie Sessie 2).
- **`npm run seed`**: `scripts/seed.ts` vult NL home + sectoren (detail **voeding** inhoudelijk gevuld uit mock; andere sectoren placeholders), producten, insights, siteSettings, singletons; FR/EN placeholder-titels.

## Wat werkt / wat is placeholder

- **Werkt**: build (`npm run build`), routing, locale-switcher (pad + segmenten), Studio mount-point, GROQ-queries, image URL helper, tape/cursor/scroll animaties via `SiteEffects` (port van `main.js`).
- **Placeholder / TODO**: Copy Brief `.docx` niet in repo — sustainability/contact/over/product-overzicht en niet-voeding-sectoren gebruiken `[TODO: …]` waar brief-copy ontbrak. FR/EN alleen strikt gevraagde placeholders (`[FR: vertaling nodig]` / `[EN: translation needed]`).
- **ESLint**: `eslint.ignoreDuringBuilds: true` in `next.config.ts` omdat de ESLint 9 flat-config die bij het template hoort niet stabiel iterabel was met `eslint-config-next`; lint lokaal nog met `npm run lint` na evt. eslint-config fix.

## Beslissingen buiten de prompt (pragmatisch)

1. **Next.js-versie**: create-next-app installeerde Next **16**; teruggezet naar **Next 15.2.4** voor align met briefing (bekende security-melding op 15.2.4 — upgraden naar recente patched 15.x wordt aanbevolen).
2. **Styling-strategie**: volledige `style.css` als `hobon-mock.css` i.p.v. alles handmatig naar Tailwind-classes om deadline en design-pariteit te halen; Tailwind gebruikt voor tokens + minimale pagina’s.
3. **`react-is`**: expliciet geïnstalleerd (peer dependency voor Sanity UI / vision keten).
4. **`next-sanity`**: **v9** gebruikt i.p.v. v12 omdat die Sanity **v3** ondersteunt; Vision blijft op **@sanity/vision@3**.
5. **`@sanity/document-internationalization`**: **v3.3.x** i.p.v. v6 (die Sanity 5 vereist).
6. **Sector-/product-URL’s**: geen vaste “Voeding/Landbouw” in code; slugs komen uit Sanity (`voeding`, `chemie-industrie`, …).
7. **hreflang**: zelfde pad na locale-switch; alternates per taal gebruiken dezelfde slug-segmenten — echte FR/EN slugvertaling vergt aanvullende GROQ/koppel-logica (niet gebouwd in deze POC).
8. **`eslint` tijdens build**: uitgeschakeld om flaky flat-config te omzeilen.

## Aanbevolen vervolgstappen

1. Next.js **15.x** patchen naar een CVE-vrije release; daarna `eslint.ignoreDuringBuilds` terugdraaien en ESLint 9 + `eslint-config-next` correct configureren.
2. `@sanity/image-url`: migratie naar uitsluitend named exports controleren (build waarschuwde op deprecated default export — `createImageUrlBuilder` is al named import in `lib/sanity/image.ts`).
3. Copy Brief integreren waar nu `[TODO]` staat; FR/EN echte vertaling + slug-koppeling in metadata/hreflang.
4. Sectorpagina’s **logistiek / chemie-industrie / agro-industrie**: zelfde rijkdom als voeding zodra copy klaar is.
5. `not-found`: integreren met `[locale]` layout voor consistente header/footer indien gewenst.

## Blokkers / vragen voor Christophe

- **`SANITY_API_WRITE_TOKEN`**: seed en Studio-schrijfacties vereisen dit lokaal/Vercel; niet in git.
- **Sanity quota**: bulk seed overschrijft documenten met vaste `_id`s — bij conflict met handmatige edits in Studio vooraf backup overwegen.
- Bevestiging gewenst of **Tailwind-only** refactoring later nog nodig is, gezien bewuste keuze voor geïmporteerde mock-CSS.

---

## Sessie 2 — CMS Foundation

### Wat is gebouwd

- **Sanity-schema’s**: `headerNavigation`, `footerNavigation`, `analyticsAndTracking`, `cookieConsent`, `seoDefaults`; `siteSettings` uitgebreid met `companyName`, `logo`/`brcBadge` als `imageWithAlt`, `formRecipientEmail`, `primaryPhone`/`primaryEmail`, `locations[]`; objecten `location`, `menuItem` (recursive), `footerLink`, `footerColumn`, `pageScriptOverride`; **`seo.structuredData`** (Article / Product / WebPage / FAQPage + FAQ-entries).
- **Studio**: `sanity/structure.ts` met groepen (Pagina’s / Content / Site Foundation / Marketing) en vaste document-ID’s voor singleton-gedrag; i18n-plugin uitgebreid met `headerNavigation`, `footerNavigation`, `seoDefaults`.
- **SiteHeader + SiteFooter**: server components die GROQ-data per locale laden; interne links via `resolveInternalHref`; dropdown-nav (`hdr-dd` / mobiel genest); CTA uit CMS; footer-kolommen + bottom links + BRC (afbeelding of fallback-box); contactregel uit `siteSettings` (eerste locatie + primary phone/e-mail).
- **Tracking**: `SiteAnalytics` + `GtmNoScript`; **Cookiebot** `beforeInteractive` + `data-blockingmode="auto"`; GTM/GA4/custom scripts en `pageOverrides` alleen als `cookieConsent.cookiebotEnabled` én geldige CBID (geen placeholder); pad-match via middleware-header `x-pathname` (zonder locale-prefix).
- **SEO**: `buildPageMetadata` async met fallbacks uit `getSeoDefaults` (React `cache`), title-suffix, OG/Twitter; **Organization JSON-LD** globaal in `[locale]/layout.tsx`; **`lib/seo/structuredData.ts`** (Article, Product, WebPage, FAQPage, BreadcrumbList helpers — per-pagina injectie volgt in Sessie B).
- **Sitemap**: `app/sitemap.xml/route.ts` als index → `sitemap-nl.xml` / `sitemap-fr.xml` / `sitemap-en.xml` met `lastmod`, `priority`, `changefreq` uit Sanity.
- **`robots.ts`**: meerdere user-agents (o.a. GPTBot, ClaudeBot, …); vaste sitemap-URL `https://hobon-next.vercel.app/sitemap.xml`.
- **`/llms.txt`**: route met NL-kern uit `seoDefaults` + dynamische insights-lijst.
- **`SITE_ORIGIN`**: `lib/siteUrl.ts` (`NEXT_PUBLIC_SITE_URL` of Vercel-default); canonicals/JSON-LD/sitemaps/llms hiermee consistent.
- **Seed**: uitgebreide `siteSettings`, navigatie per taal, marketing-singletons, `seoDefaults` NL/FR/EN.

### Pragmatische keuzes

1. **Tracking-gate**: snippets worden niet gerenderd tenzij Cookiebot **aan** staat met een echte CBID (placeholder `[YOUR_COOKIEBOT_CBID]` telt niet mee) — zo blijft acceptatie “geen tracking zonder consent-flow” ook zonder werkende Cookiebot-load.
2. **FR/EN header-dropdowns**: verwijzen in de seed naar **overview**-documenten (`productOverviewPage-*` / `sectorOverviewPage-*`) i.p.v. naar alleen-NL product/sector-refs, om 404’s te vermijden tot er FR/EN content is.
3. **Footer bottom links**: externe placeholders (`hobon.be`, `brcgs.com`) — aan te passen in Studio naar echte privacy-/cookie-URL’s en BRC-PDF.
4. **Dropdown-CSS**: minimale toevoegingen in `hobon-mock.css` (`hdr-dd`, mobiel subnav) zodat bestaande header-look behouden blijft.
5. **`menuItem`-validatie**: geen strikte Sanity-rule voor max diepte 2; editors worden geacht conform briefing te blijven.

### Aanbevolen vervolg

- **Sessie B**: contact-, insights-, product-templates die de foundation gebruiken (o.a. per-pagina JSON-LD).
- **Sessie C**: sector-templates logistiek, agro, chemie.
- **Klant**: Cookiebot-account, CBID in Studio, `cookieConsent.cookiebotEnabled = true`; GTM/GA4 invullen in `analyticsAndTracking`.

### Open issues / TODO

- `formRecipientEmail` in schema/seed — nog niet overal in formulier-componenten aangesloten (SectorCtaForm e.d.).

---

## Sessie 3a — Content templates (Contact + Insights + Over + Duurzaamheid)

### Wat is gebouwd

- Vijf nieuwe templates: **ContactTemplate** (+ client **ContactForm** met mailto + fallback `action`), **InsightsOverviewTemplate**, **InsightDetailTemplate** (Portable Text, leestijd, gerelateerd of terug-link, CTA naar contact), **AboutTemplate**, **SustainabilityTemplate**.
- Nieuw documenttype **insightCategory** (i18n) + Studio-lijst onder Content; **insightArticle** met categorie-ref, lead, relatedArticles, enz.
- **Seed**: vier NL-categorieën, vier NL-artikels met body, FR/EN stubs; contact/about/sustainability/insights-overview NL-copy zoals in de briefing; insights-overview `hero`.
- Routes: `/[locale]/contact`, `/insights`, `/insights/[slug]` (incl. `generateStaticParams` + `dynamicParams`), `/over`, `/duurzaamheid`.
- **hobon-mock.css**: contact-layout (`.c-*`), about/duurzaamheid (`.abt-*`, `.sus-*`), insights overview hero-variant (`.ins-hero--overview`) en responsive grids.

### Pragmatische beslissingen

1. **Contact submit**: primaire flow via `<button type="submit">` + `preventDefault` en dynamische `mailto:`-URL (zelfde gedrag als gevraagd); minimale `mailto:` als form-`action` voor edge cases zonder JS.
2. **Insights filter-chips**: alleen UI + `console.log('filter not implemented')` met TODO-comment voor ticket **HOB-XX**.
3. **`SimpleRichText`**: optionele variant **`onNavy`** voor leesbare tekst op het donkere standpunt-blok op Duurzaamheid.
4. **Statische insight-paden**: dataset bepaalt welke `[slug]` bij build worden voorgegenereerd; `dynamicParams = true` zodat nieuwe Studio-slugs zonder rebuild toch renderen.

### Open issues

- Insights filterbalk visueel maar niet functioneel (TODO HOB-XX).
- Over/Duurzaamheid story-content bevat `[TODO: Frederik review]` markers in seed waar gevraagd.
- FR/EN blijft placeholder; geen echte vertaling.
- Geen echte kaart op contact (placeholder “Kaart — later”).
- Na **seed** opnieuw `npm run build` draaien zodat `generateStaticParams` alle nieuwe insight-slugs oppikt (oude dataset kan nog oude slugs tonen).

### Aanbevolen vervolg

- **Sessie 3b**: drie overige sectoren + productoverzicht + producttemplates (zie gebruikersbrief).

---

## Sessie 3b-1 — Sector-URL’s en content (lopend)

### Deel 1.1 — Voeding → voedingsindustrie

- **Sanity**: NL food-sector behoudt `_id` `sector-nl-voeding`; **`slug.current`** is **`voedingsindustrie`** (canonieke URL `/nl/sectoren/voedingsindustrie`). Zelfde GROQ-inhoud als voorheen “Voeding”.
- **URL-rename (single source of truth)**: alleen **`next.config.ts` → `redirects()`**: `/nl/sectoren/voeding` en `/nl/sectoren/voeding/` → `/nl/sectoren/voedingsindustrie`. Next zet `permanent: true` om naar **HTTP 308** (niet 301). De Voeding-redirect is uit **`middleware.ts`** gehaald zodat permanente renames op één plek staan.
- **Vercel**: alias volgt de laatste production deploy; na wijzigingen aan redirects opnieuw deployen (`vercel --prod` of Git-integratie). Stond de deploy achter op Sanity-slug `voedingsindustrie` zonder redirect → **404** op het oude pad.
- **Na pull**: `node --env-file=.env.local --import tsx scripts/seed.ts` zodat Studio en resolveInternalHref de nieuwe slug gebruiken.

### Fix 3: IntersectionObserver-zichtbaarheidsbug

- **Probleem**: Op productie kregen `.rv`-elementen de `.in`-class niet, waardoor secties verborgen bleven (`opacity: 0`).
- **Fix**: Defensieve CSS-fallback. **Default = zichtbaar.** Animaties alleen actief wanneer `body.js-ready` is gezet door **SiteEffects** én de gebruiker **geen** `prefers-reduced-motion: reduce` heeft.
- **Bestanden**: `app/hobon-mock.css` (`.rv`, `.rvl`, `.rvr`, `.rvd` — duplicaat scroll-reveal-blok verwijderd zodat één bron de waarheid is), `components/site/SiteEffects.tsx` (`document.body.classList.add/remove("js-ready")` rond de effect lifecycle).
- **Faal-pad**: Als JS niet laadt, crasht vóór `js-ready`, of de observer faalt → content blijft zichtbaar. **Werking gaat boven animaties.**
- **Opmerking**: `classList.remove("js-ready")` in de effect-cleanup kan in React Strict Mode (dev) kort togglen; productie-build zonder dubbele unmount is normaal.

### Fix 1a: Sectoren-content geseed

- **Probleem**: Logistiek / Chemie / Agro toonden `[TODO]`-placeholders i.p.v. echte copy.
- **Fix**: Script **`scripts/seed-sectors-content.ts`** patcht alleen **`sector-nl-logistiek`**, **`sector-nl-chemie`**, **`sector-nl-agro`** (NL) via `client.patch().set()` — **Voeding** en **FR/EN**-sectoren ongemoeid gelaten.
- **Run**: `npm run seed:sectors` (`.env.local` met `SANITY_API_WRITE_TOKEN`). Optioneel: `npm run seed:sectors -- --inspect` dump’t het Voeding-document voor veldnaam-controle.
- **Schema-mapping t.o.v. PM-terminologie**: `heroPrimaryCta` / `heroSecondaryCta` (niet `heroCtaPrimary`); problem-band gebruikt **`description`** (niet `body`); FAQ’s in **`deepFaqs`** met **`title`** + **`body`**; CTA-band heeft geen aparte primary-button — alleen **`ctaBandTitle1`**, **`ctaBandTitle2`**, **`ctaBandBody`** + het vaste formulier in de template. Secundaire CTA-link naar oplossingen: **`#oplossingen`** (sectie-`id` in `SectorTemplate`), niet `#solutions`.
- **Extra i.h.k.v. zichtbare pagina**: `listingDescription`, `tapeItems`, korte **deep-** en **compliance-**teksten (geen `[TODO]` meer op die blokken) + **4 solutionCards** met beeld-URL’s; geen wijziging aan header/footer/producten/home-niche.

### Fix 1b: Solutions-grid voor variabel aantal kaarten

- **Probleem**: Vaste `repeat(3, 1fr)` gaf bij **4** oplossingen een leeg rastercel op desktop (Logistiek / Chemie / Agro).
- **Fix**: `SectorTemplate` zet **`data-sol-count`** op `.sol-grid`. In **`hobon-mock.css`**: default blijft **3 kolommen** (Voeding ×6 ongewijzigd); alleen **1**, **2** en **4** kaarten krijgen op **desktop (`min-width: 1025px`)** expliciet **1** of **2** kolommen — zo overschrijven die regels de bestaande tablet/mobiel-`@media .sol-grid` niet (specificiteit/order).

---

## Sessie 2 — Producten + Navigatie + Homepage

### Fix 2a: 5 producten content

- **Probleem**: NL-productpagina’s toonden `[TODO]` (schema: `title`, `lead`, `body` rich text, `seo`).
- **Fix**: Script **`scripts/seed-products-content.ts`** patcht `product-nl-blaasfolies`, `…-zakken`, `…-vellen`, `…-stretch-hood`, `…-pattyn` met Copy Brief-secties in **Portable Text** (`h2`/`h3`, bullets, CTA-link). **“Lamineren”** komt niet voor in waarom-Hobon-teksten.
- **Frontend**: `app/[locale]/producten/[slug]/page.tsx` — `lead` met **`whitespace-pre-line`** zodat kop + subline uit twee alinea’s leesbaar blijven.
- **Run**: `npm run seed:products` (token in `.env.local`).

### Fix 2b: Header-navigatie (NL)

- **Fix**: Script **`scripts/seed-header-navigation-nl.ts`** patcht **`headerNavigation-nl`**: Producten-dropdown (**5** items, labels **Stretch hood**, **PATTYN**), Sectoren-dropdown (**4** items, label **Chemie & industrie**), CTA **Bespreek uw vraag** → `/nl/contact`.
- **Run**: `npm run seed:header-nl`.

### Fix 2c: Footer-navigatie (NL)

- **Fix**: Script **`scripts/seed-footer-navigation-nl.ts`** patcht **`footerNavigation-nl`**: productkolom (+ Stretch hood, PATTYN), sectorenkolom (+ Chemie & industrie, Agro-industrie), slogan met em dash, bottom links **Privacy** → `/nl/privacy`, **Cookies** → `/nl/cookies` (BRC blijft externe URL).
- **Code**: **`SiteFooter`**: externe URL’s die met **`/`** beginnen renderen als **Next `<Link>`** (zelfde tab, geen `target=_blank`).
- **Pagina’s**: placeholders **`/[locale]/privacy`** en **`/[locale]/cookies`** (NL/FR/EN stub — definitieve juridische copy volgt).
- **Run**: `npm run seed:footer-nl`.

### Fix 2d: Homepage niches

- **Schema-wijziging**: **nee** — `homePage.productCards` was al een array zonder maximum.
- **Fix**: Script **`scripts/seed-home-niches-nl.ts`** patcht **`homePage-nl`**: **5** niches in volgorde **DOLAV-zakken** (featured), **Patijnrollen**, **Stretchfolie**, **Boterfolie**, **Kratzakken**; **Boterfolie** en **Kratzakken** hebben **lege `description`** (geen `[TODO]`). **processSteps** (Productie): *lamineren* vervangen door extrusie → … → **verwerking tot zakken en vellen**.
- **Frontend**: **`HomeTemplate`** — `data-pc-count` op `.prod-grid`; lege beschrijving rendert geen lege `<p>`.
- **`scripts/seed.ts`**: zelfde home-niche- en processStep-copy voor toekomstige volledige re-seeds; NL-footer/header defaults gelijkgetrokken.
- **`SiteHeader`**: relatieve externe menulinks (`/`…) via **`<Link>`** i.p.v. nieuw tabblad.
- **Run**: `npm run seed:home-nl`.

**Niet gedaan in deze sessie**

- FR/EN navigatie- en productcontent (vertaalbureau / AI-translate)
- Definitieve privacy/cookie-juridische teksten (placeholders staan)
- Body-copy voor homepage-niches **Boterfolie** en **Kratzakken** in Studio (Frederik)
