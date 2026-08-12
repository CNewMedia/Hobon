# Pre-go-live audit — Hobon next-poc

**Datum:** 2026-08-12  
**Scope:** read-only (geen fixes)  
**Dataset:** Sanity `production` (`14bi8ppf`)  
**Build:** `npm run build` → **exit 0** (Next.js 15.5.18, types OK, linting skipped)

Severity:
- **P0** — blocker voor FR/EN go-live of SEO/taalswitch
- **P1** — zichtbaar defect of incomplete content
- **P2** — cosmetisch / a11y / polish

---

## 1. Hardcoded NL-strings (grootste prioriteit)

Scan van `components/**` en `app/**`. Uitgesloten: merknaam Hobon, BRC, PE, classNames, Sanity-keys, `useUILabels()`/`defaultUILabels`.

### P0 — lekt direct op FR/EN UI

| Bestand | Regel | String | Context |
|---------|-------|--------|---------|
| `components/contact/ContactForm.tsx` | 19–23 | `Voeding`, `Logistiek`, `Chemie & industrie`, `Agro-industrie`, `Andere` | Sector-opties altijd NL |
| `components/contact/ContactForm.tsx` | 27 | `Verzenden mislukt. Probeer het opnieuw of mail ons rechtstreeks.` | Error fallback |
| `components/contact/ContactForm.tsx` | 95–146 | `Voornaam`, `Naam`, `Bedrijf`, `E-mail`, `Telefoon`, `Sector`, `Bericht` | Label-fallbacks |
| `components/contact/ContactForm.tsx` | 164 | `Uw gegevens worden uitsluitend gebruikt…` | Disclaimer-fallback |
| `components/contact/ContactForm.tsx` | 168 | `Privacybeleid` | Link-label fallback |
| `components/contact/ContactTemplate.tsx` | 151 | `Aanvraag ontvangen` | Success kicker |
| `components/contact/ContactTemplate.tsx` | 158 | `Stel een nieuwe vraag` | Reset-knop |
| `components/contact/ContactTemplate.tsx` | 43 | `Bedankt voor uw bericht. Een van onze specialisten…` | Success fallback |
| `components/sector/SectorCtaForm.tsx` | 10 | `Verzenden mislukt. Probeer het opnieuw of mail ons rechtstreeks.` | Error |
| `components/sector/SectorCtaForm.tsx` | 34 | `Aanvraag ontvangen` | Success kicker |
| `components/sector/SectorCtaForm.tsx` | 37 | `Stel een nieuwe vraag` | Reset-knop |
| `components/sector/SectorCtaForm.tsx` | 87 | `Jan Janssen` | Placeholder |
| `components/sector/SectorCtaForm.tsx` | 93 | `Uw bedrijfsnaam` | Placeholder |
| `components/sector/SectorCtaForm.tsx` | 101 | `jan@bedrijf.be` | Placeholder |
| `app/api/contact/route.ts` | 19 | `Ongeldige JSON.` | API → UI |
| `app/api/contact/route.ts` | 35 | `Te veel aanvragen. Probeer het over enkele minuten opnieuw.` | API → UI |
| `app/api/contact/route.ts` | 46 | `Verzenden mislukt. Probeer het later opnieuw of mail ons rechtstreeks.` | API → UI |
| `lib/contact/validate.ts` | 12–42 | `Ongeldige aanvraag.`, `Voer een geldig e-mailadres in.`, `Voornaam is verplicht.`, `Naam is verplicht.`, `Sector is verplicht.`, `Bericht is verplicht.`, `Bedrijf is verplicht.` | Validatie → UI |

### P1 — zichtbaar / a11y / legal

| Bestand | Regel | String | Context |
|---------|-------|--------|---------|
| `components/product/ProductGalleryLightbox.tsx` | 71 | `Sluiten` | aria-label |
| `components/product/ProductGalleryLightbox.tsx` | 76 | `Vorige` | aria-label |
| `components/product/ProductGalleryLightbox.tsx` | 79 | `Volgende` | aria-label |
| `components/product/ProductGallery.tsx` | 71 | `` `Vergroot: ${…}` `` | aria-label |
| `components/product/ProductTemplate.tsx` | 263 | `` `Foto ${i + 1}` `` | aria-label |
| `components/about/AboutTemplate.tsx` | 30 | `Over Hobon` | h1 fallback |
| `components/sustainability/SustainabilityTemplate.tsx` | 34 | `Duurzaamheid` | h1 fallback |
| `app/not-found.tsx` | 7 | `Pagina niet gevonden` | 404 title |
| `app/not-found.tsx` | 10 | `Terug naar home` | 404 link → `/nl/` |
| `app/[locale]/cookies/page.tsx` | 12, 22, 25 | `Cookiebeleid \| Hobon`, `Cookiebeleid`, placeholder-body NL | Meta + page (NL branch; FR/EN hebben stubs) |
| `app/[locale]/privacy/page.tsx` | 12, 25 | `Privacybeleid Hobon.`, NL placeholder-body | Meta description + body |
| `app/layout.tsx` | 23 | `PE-verpakkingsfolie op maat` | Root metadata.description |

### P2 — cosmetisch / edge

| Bestand | Regel | String | Context |
|---------|-------|--------|---------|
| `app/[locale]/page.tsx` | 41 | `Homepage-content ontbreekt in Sanity voor deze taal…` | Dev empty-state |
| `app/llms.txt/route.ts` | 17–45 | NL taglines / sectiekoppen | Machine-feed (niet site-UI) |
| `components/insights/InsightsOverviewTemplate.tsx` | 65 | `Insights` | EN fallback h1 (geen NL-leak) |
| `components/product/ProductTemplate.tsx` | 169 | `Product` | EN fallback |

**Relatief schoon:** home, listing, sector/product body-chrome, insights (na HOB-58/58b) via `useUILabels()`.

---

## 2. Onvertaalde / ontbrekende content

### 2.1 Sanity: NL gevuld, FR/EN leeg (pad-aligned telling)

| Document-type | Pair NL↔FR | Velden NL gevuld & FR leeg | Velden NL gevuld & EN leeg | Severity |
|---------------|------------|----------------------------|----------------------------|----------|
| `product` | 8 | **43** | **45** | **P0** |
| `sector` | 4 | 0 | 0 | OK |
| `insightArticle` (patterned IDs) | 4 | 0 | **25** (body-structuur/EN incompleet) | **P1** |
| `homePage` | 1 | **~9+** (productCards[0] specs/cta) | zelfde cluster | **P1** |
| `aboutPage` | 1 | 0 | 1 | P2 |
| `contactPage` | 1 | 0 | 0 | OK |
| `sustainabilityPage` | 1 | **6** (`practicePoints`) | **7** | **P1** |
| `uiLabels` | 1 | 0 | 0 | OK |

Voorbeelden product FR leeg: `faqs[]`, `galleryTitle`, `heroThumbs[].label`, `solutionCards[]`, `solutionsTitle` (o.a. `product-fr-blaasfolies`).

### 2.2 Markers in live content (`[TODO]` / `[AI-translated]` / `[FR: vertaling nodig]`)

| Marker | Aantal hits (production) | Waar | Severity |
|--------|--------------------------|------|----------|
| `[TODO…]` | **25** | `product-{nl,fr,en}-{boterfolie,dolav-zakken,kratzakken}` — `body`, `lead`, `seo.metaDescription` | **P0** |
| `[AI-translated]` | **0** in live strings | Strip bij fetch (`fetchSanity` + HOB-48); seed/docs kunnen nog referenties hebben | OK live |
| `[FR: vertaling nodig]` / `[EN: translation needed]` | **0** in live scanned docs | Alleen in `seed.ts` stubs | OK live |
| Cookies/privacy page stubs | — | `[FR]…` / `[EN]…` hardcoded in pages | **P1** |

### 2.3 Ontbrekende FR-productvelden (HOB-62d) — bevestigde lijst

**Huidige telling (xlsx `FR (nieuw)` vs Sanity FR-doc via `pathExists`): 53 `missing_path` op producten** (niet 68 — 68 was een eerdere/bredere schatting).

Volledige productlijst:

```
product-nl-blaasfolies·faqs[0].answer
product-nl-blaasfolies·faqs[0].question
product-nl-blaasfolies·faqs[1].answer
product-nl-blaasfolies·faqs[1].question
product-nl-blaasfolies·faqs[2].answer
product-nl-blaasfolies·faqs[2].question
product-nl-blaasfolies·faqs[3].answer
product-nl-blaasfolies·faqs[3].question
product-nl-blaasfolies·galleryTitle
product-nl-blaasfolies·heroThumbs[0].image.alt
product-nl-blaasfolies·heroThumbs[0].label
product-nl-blaasfolies·heroThumbs[1].image.alt
product-nl-blaasfolies·heroThumbs[1].label
product-nl-blaasfolies·heroThumbs[2].image.alt
product-nl-blaasfolies·heroThumbs[2].label
product-nl-blaasfolies·heroThumbs[3].image.alt
product-nl-blaasfolies·heroThumbs[3].label
product-nl-blaasfolies·heroThumbs[4].image.alt
product-nl-blaasfolies·heroThumbs[4].label
product-nl-blaasfolies·heroThumbs[5].image.alt
product-nl-blaasfolies·heroThumbs[5].label
product-nl-blaasfolies·heroThumbs[6].image.alt
product-nl-blaasfolies·heroThumbs[6].label
product-nl-blaasfolies·solutionCards[0].description
product-nl-blaasfolies·solutionCards[0].image.alt
product-nl-blaasfolies·solutionCards[0].title
product-nl-blaasfolies·solutionCards[1].description
product-nl-blaasfolies·solutionCards[1].image.alt
product-nl-blaasfolies·solutionCards[1].title
product-nl-blaasfolies·solutionCards[2].description
product-nl-blaasfolies·solutionCards[2].image.alt
product-nl-blaasfolies·solutionCards[2].title
product-nl-blaasfolies·solutionCards[3].description
product-nl-blaasfolies·solutionCards[3].image.alt
product-nl-blaasfolies·solutionCards[3].title
product-nl-blaasfolies·solutionsTitle
product-nl-kratzakken·heroEyebrow
product-nl-kratzakken·heroHeadline
product-nl-kratzakken·heroIntro
product-nl-kratzakken·heroPrimaryCta.label
product-nl-kratzakken·heroSecondaryCta.label
product-nl-kratzakken·productGallery[0].alt
product-nl-kratzakken·productGallery[1].alt
product-nl-kratzakken·productGallery[2].alt
product-nl-pattyn·productGallery[0].alt
product-nl-stretch-hood·productGallery[0].alt
product-nl-stretch-hood·productGallery[1].alt
product-nl-stretch-hood·productGallery[2].alt
product-nl-stretch-hood·solutionCards[0].description
product-nl-stretch-hood·solutionCards[0].image.alt
product-nl-stretch-hood·solutionCards[0].title
product-nl-zakken·productGallery[0].alt
product-nl-zakken·productGallery[1].alt
```

**Context totaal xlsx `missing_path` (alle doc-types):** 74  
- product: 53 (HOB-62d)  
- `sector-nl-chemie`: 6 — **verwacht** na HOB-62b ATEX-verwijdering (indexen/array korter)  
- `homePage-nl`: 9 — productCards[0] specs/cta  
- `sustainabilityPage-nl`: 6 — practicePoints  

**False positive `missing_fr_doc` (12 refs):** `insight-nl-audit-klaar…`, `ffs-lijn…`, `recyclaat-op-de-lijn…` — FR docs bestaan als UUID; `nlDocIdToFr` zoekt `insight-fr-*`. Opgelost inhoudelijk via HOB-62c; import-pipeline ziet ze nog als missing.

---

## 3. Bugs / runtime

### 3.1 Build / TypeScript

| Bevinding | Severity |
|-----------|----------|
| `npm run build` **slaagt** (exit 0), 65 static pages, types OK | OK |
| **Linting skipped** (`Skipping linting`) — geen ESLint-gate in build | **P2** |
| Geen TypeScript-fouten in deze run | OK |
| Netwerk-retries tijdens compile (`Retrying 1/3…`) — transient, geen fail | P2 |

Geen aparte `next dev` console-capture per route in deze audit (build = proxy voor compile/runtime page gen). Aanbevolen: manuele smoke op `/fr/*` + `/en/*` na de P0 i18n-fixes.

### 3.2 Kapotte / riskante links

| Bestand | Regel | Bevinding | Severity |
|---------|-------|-----------|----------|
| `lib/sanity/locale-mapping.ts` | 28–50 | Insight taalswitch: ID-prefix `insightArticle-` vs echt `insight-` + UUID-docs → fallback overview | **P0** |
| `app/not-found.tsx` | 10 | Link altijd `/nl/` vanuit elke locale | **P1** |
| `next.config.ts` | ~10–18 | Alleen NL redirect `voeding`→`voedingsindustrie`; geen FR/EN legacy | **P1** |
| CMS CTAs / portable links | — | Interne hrefs komen uit Sanity; geen automatische crawl van alle CMS-hrefs in deze audit | P2 (manueel) |
| `next.config.ts` rewrites | 28+ | FR/EN segmenten (`produits`, `secteurs`, …) → NL filesystem-routes — **werkt** | OK |

### 3.3 Portable-text body-structuur (na HOB-62f)

| Artikel | Status | Severity |
|---------|--------|----------|
| 7 FR insights gepatcht in 62f | Style-signature = NL, 0 mismatches | OK |
| `hobon-est-il-lui-meme-fabricant-de-film-pe` (FR UUID) | **Nog kapot:** NL 19 blocks / FR 12, styleDiff 4, blockDelta 7 — geen xlsx FR body | **P0** |
| EN patterned insights (brc-aa, dunner, faalkosten, recyclaat-of-virgin) | Block-count + styleDiff vs NL (bijv. 33→25, styleDiff 5) — zelfde klasse bug als 62e, niet gefixt | **P1** |

### 3.4 Ontbrekende alt-teksten

| Bevinding | Severity |
|-----------|----------|
| Scan `featuredImage` / `heroImage` / `heroMainImage` / `listingImage` met asset maar lege `alt`: **0 hits** | OK |
| Product gallery/heroThumb alts ontbreken als **veld op FR-doc** (zie 62d lijst) — geen asset zonder alt-path, maar FR kan NL-alt missen of veld ontbreken | **P1** (gekoppeld aan 62d) |

---

## 4. Responsiveness

Bijna geen Tailwind `w-[NNNpx]` in `components/**`. Risico zit vooral in `app/hobon-mock.css`. Breakpoints: 640 / 900 / 1024 (geen dedicated 768).

| Bestand | Regel (approx) | Bevinding | Severity |
|---------|----------------|-----------|----------|
| `app/hobon-mock.css` | ~189, 399, 452 | Sector cards `.sc { flex: 0 0 330px }` (280/260) — horizontale rail op 375 | **P2** |
| `app/hobon-mock.css` | ~560–565, 1274 | Hero thumbs 130×80; `.s-hero-r { display:none }` ≤1024 — **geen thumbs op tablet/mobiel** | **P1** |
| `app/hobon-mock.css` | ~803–811 | Product thumbs 74×54 + lightbox nav 54px — thumbs ook desktop-only; lightbox crowding op 375 | **P2** |
| `app/hobon-mock.css` | ~125–128, 574–577 | Tape `white-space: nowrap` + overflow hidden — OK visueel; geen `prefers-reduced-motion` | **P2** |
| `components/site/SiteEffects.tsx` | ~84–85 | `tape.innerHTML += tape.innerHTML` — remount kan content verdubbelen | **P2** |
| `app/hobon-mock.css` | ~181, 520, 1029 | `whitespace-nowrap` op sectors-cta / sn-item / c-submit — lange FR-labels | **P2** |
| `app/hobon-mock.css` | ~1215+, 1335+ | Dode selectors `.sh-*` (echte classes `.s-hero-*`) — sommige mobile rules grijpen niet | **P1** |

**Visueel te testen:** 375 / 768 — sector-rail, hero zonder thumbs, lightbox, tape, CTA-nowrap, contact submit.

---

## 5. i18n / slugs

### 5.1 Taalswitcher / slug-resolutie

| Bestand | Regel | Bevinding | Severity |
|---------|-------|-----------|----------|
| `lib/sanity/locale-mapping.ts` | 28–33 | `getLocalizedSlug` zoekt `_id = insightArticle-{locale}-{key}` — docs zijn `insight-{locale}-…` | **P0** |
| `lib/sanity/locale-mapping.ts` | 48–50 | `getDocKeyBySlug` faalt op `insight-…` prefix | **P0** |
| UUID FR/EN insights | — | Geen patterned ID → switcher kan geen sibling resolven zonder `translation.metadata` | **P0** |
| `lib/i18n/switch-locale.ts` | 43–70 | Bij miss → zelfde slug andere locale of overview | **P0** |
| Sector/product patterned IDs | — | Convention werkt (mits counterpart bestaat) | OK |

### 5.2 `translation.metadata`

| Bevinding | Severity |
|-----------|----------|
| Insights: **24** docs, **13** gelinkt in metadata, **11 zonder** | **P1** |
| Zonder metadata (patterned seed-docs): o.a. `insight-{nl,fr,en}-brc-aa…`, `dunner-folie…`, `recyclaat-of-virgin…`, `insight-en-faalkosten…`, `insight-fr-faalkosten…` | **P1** |
| UUID-groep (audit/ffs/recyclaat/hobon-producent) **heeft** metadata NL↔FR↔EN | OK (maar runtime switcher gebruikt metadata niet) |

### 5.3 Hreflang / alternates

| Bestand | Regel | Bevinding | Severity |
|---------|-------|-----------|----------|
| `lib/seo/metadata.ts` | 58–61 | `languages` hergebruikt **zelfde** `pathParts` (zelfde detail-slug) voor nl/fr/en | **P0** |
| `lib/seo/metadata.ts` | 82–85 | Geen `x-default` | **P2** |
| Detail pages | — | Gelokaliseerde FR/EN slugs → verkeerde sibling-URL in hreflang | **P0** |

### 5.4 Gelokaliseerde URL-segmenten

| Bevinding | Severity |
|-----------|----------|
| Filesystem: NL mappen (`producten`, `sectoren`, `over`, `duurzaamheid`) | architectuur |
| `next.config.ts` rewrites FR/EN → NL paths | OK |
| Build-output toont `/fr/producten` etc. = interne destination, publieke URL via rewrite | OK (documenteer) |

### 5.5 404

| Bestand | Regel | Bevinding | Severity |
|---------|-------|-----------|----------|
| `app/not-found.tsx` | 7–10 | Hardcoded NL + link `/nl/` | **P1** |
| `app/[locale]/not-found.tsx` | — | **Ontbreekt** | **P1** |

---

## Samenvatting P0-blockers

1. **Hardcoded NL op contact/CTA/API-validatie** — lekt op elke FR/EN form-submit/UI.  
2. **`[TODO]` op product body/lead/seo** (boterfolie, dolav-zakken, kratzakken × NL/FR/EN).  
3. **53 ontbrekende FR-productvelden** (faqs, thumbs, solutionCards, gallery alts, kratzakken hero).  
4. **Insight taalswitcher kapot** (`insightArticle-` vs `insight-` + UUID zonder metadata-lookup).  
5. **Hreflang hergebruikt niet-vertaalde slugs.**  
6. **FR insight `hobon-producent` body-structuur** nog 62e-achtig (geen xlsx).  

## P1-highlights

- Privacy/cookies placeholders  
- Locale-aware 404  
- EN insight bodies met style/block-mismatch  
- Hero thumbs afwezig ≤1024  
- Dode `.sh-*` CSS  
- Home/sustainability FR-gaten (productCards / practicePoints)  
- 11 insights zonder `translation.metadata`  

---

*Einde audit — geen code of Sanity gewijzigd.*
