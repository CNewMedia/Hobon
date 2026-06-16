# Product-template mapping (HOB-51a)

Referentie-demo: **PATTYN / buisfolie** (`product-nl-pattyn`) als gedeelde productpagina-layout.  
Dit document koppelt elke zichtbare sectie aan Sanity-velden. **Geen template- of GROQ-wijzigingen** — dat is HOB-51b.

---

## Sectievolgorde (demo → template)

| # | Demo-sectie (visueel) | Sanity-veld(en) | Object / type | Status |
|---|------------------------|-----------------|---------------|--------|
| 1 | Hero — breadcrumb “Alle producten” | — | UI-labels (`uiLabels`) | Bestaand |
| 2 | Hero — eyebrow | `heroEyebrow` | `string` | Bestaand |
| 3 | Hero — H1 | `heroHeadline` | `string` | Bestaand |
| 4 | Hero — intro | `heroIntro` | `text` | Bestaand |
| 5 | Hero — primaire / secundaire CTA | `heroPrimaryCta`, `heroSecondaryCta` | `cta` | Bestaand |
| 6 | Hero — hoofdbeeld (rechts) | `heroImage` | `imageWithAlt` | Bestaand |
| 7 | Hero — fotostrip (thumbnails) | `heroThumbs[]` | `heroThumb` | **Nieuw** |
| 8 | Hero — BRC-badge | — | Hardcoded in template + `uiLabels` | Bestaand |
| 9 | Specificaties-grid | `specifications[]` | inline object (`title`, `body`, `icon?`) | Bestaand |
| 10 | Toepassingen (tags) | `applications[]` | `string[]` | Bestaand |
| 11 | Varianten / oplossingskaarten — kop | `solutionsTitle` | `string` (optioneel; fallback `uiLabels`) | **Nieuw** |
| 12 | Varianten / oplossingskaarten | `solutionCards[]` | `solutionCard` | **Nieuw** |
| 13 | Fotogalerij — kop | `galleryTitle` | `string` (optioneel; fallback `uiLabels`) | **Nieuw** |
| 14 | Fotogalerij | `productGallery[]` | `imageWithAlt` (direct in array) | **Nieuw** |
| 15 | Waarom Hobon | `whyHobonTitle`, `whyHobonBody` | `string`, `text` | Bestaand |
| 16 | FAQ-accordeon | `faqs[]` | `faqItem` | **Nieuw** |
| 17 | “Folie voor” / Veel gebruikt in (sector-grid) | `relatedSectors[]` | `reference` → `sector` | Bestaand (beschrijving bijgewerkt) |
| 18 | CTA-band + contactformulier | `ctaBandTitle1`, `ctaBandBody`, `ctaBandPrimary` | `string`, `text`, inline object | Bestaand |
| 19 | Extra notities (optioneel, onderaan) | `additionalNotes` | `richText` | Bestaand |

**Niet in demo-template:** overzichtsvelden (`listingEyebrow`, `listingDescription`, `showInOverview`), `seo`, legacy `body`/`lead` op niche-docs.

---

## Nieuwe velden — detail

### `heroThumbs[]` → `heroThumb`

| Subveld | Type | Gebruik |
|---------|------|---------|
| `image` | `imageWithAlt` | Upload + alt |
| `imageUrl` | `url` | Legacy fallback (sector-migratiepatroon) |
| `label` | `string` | Label onder thumb |

**CSS-referentie (HOB-51b):** `.s-hero-thumbs`, `.s-hero-thumb` (hergebruik sector-hero).

### `solutionCards[]` → `solutionCard`

Sectiekop: `solutionsTitle` (optioneel; leeg → `uiLabels` in HOB-51b).

| Subveld | Type | Product | Sector |
|---------|------|---------|--------|
| `image` | `imageWithAlt` | ✓ | ✓ |
| `imageUrl` | `url` | optioneel | ✓ legacy |
| `title` | `string` | ✓ verplicht | ✓ |
| `description` | `text` | ✓ | ✓ |
| `num` | `string` | — | optioneel |
| `tags` | `string[]` | — | optioneel |
| `cta` | `cta` | — | optioneel |

**Voorbeeld:** onder `product-nl-stretch-hood` kan een kaart “Krimphoezen” staan met foto, titel en korte omschrijving — zonder `num`/`tags`/`cta`.

**CSS-referentie (HOB-51b):** `.sol-grid`, `.sol-card` (sector solutions-grid).

### `productGallery[]` → `imageWithAlt`

Sectiekop: `galleryTitle` (optioneel; leeg → `uiLabels` in HOB-51b).

| Subveld | Type | Opmerking |
|---------|------|-----------|
| `image` | `image` | Sanity asset |
| `alt` | `string` | Verplicht voor toegankelijkheid |

Geen klantnaam, geen caption-veld. Array-items krijgen automatisch `_key` in Studio.

### `faqs[]` → `faqItem`

| Subveld | Type |
|---------|------|
| `question` | `string` (verplicht) |
| `answer` | `text` (verplicht) |

**CSS-referentie (HOB-51b):** `.deep-items` / `.di` accordeon (sector deep-dive patroon, zonder `num`/`tags`).

### `relatedSectors[]`

| Type | Opmerking |
|------|-----------|
| `reference` → `sector` | Alleen `_ref`; geen gekopieerde sector-tekst of -beelden |

Template resolved in GROQ (HOB-51b): `title`, `slug`, `listingDescription`, `listingImage` / `listingImageUrl`.

---

## Gedeelde objecten (hergebruik sector ↔ product)

| Object | Pad | Gebruikt door |
|--------|-----|---------------|
| `imageWithAlt` | `sanity/schemas/objects/imageWithAlt.ts` | `heroImage`, `productGallery[]`, nested in `heroThumb` / `solutionCard` |
| `heroThumb` | `sanity/schemas/objects/heroThumb.ts` | **product** `heroThumbs[]`, **sector** `heroThumbs[]` |
| `solutionCard` | `sanity/schemas/objects/solutionCard.ts` | **product** `solutionCards[]`, **sector** `solutionCards[]` |
| `faqItem` | `sanity/schemas/objects/faqItem.ts` | **product** `faqs[]` alleen |

### Bewust niet gedeeld (gedupliceerd concept, andere vorm)

| Sector-veld | Product-equivalent | Reden |
|-------------|-------------------|--------|
| `deepFaqs[]` (inline: `num`, `title`, `body`, `tags`) | `faqs[]` → `faqItem` (`question`, `answer`) | Sector-FAQ heeft nummering + tags; product-FAQ is eenvoudiger accordeon |

Sector `deepFaqs` blijft inline in `sector.ts` tot een latere consolidatie.

---

## Bestaande product-data

- Alle wijzigingen zijn **additief**: geen velden verwijderd of hernoemd.
- Nieuwe arrays starten leeg; bestaande documenten blijven valide.
- Sector `heroThumbs` / `solutionCards`: structuur ongewijzigd; alleen schema-type van anoniem object → benoemd type (`heroThumb`, `solutionCard`). Bestaande JSON zonder `_type` op array-items blijft compatibel in Studio.

---

## Buiten scope (HOB-51b / later)

- `ProductTemplate.tsx` — nieuwe secties renderen
- GROQ in `lib/sanity/queries.ts` — nieuwe velden ophalen + sector-deref
- Sectie-titels voor solutions/gallery: `solutionsTitle`, `galleryTitle` (FAQ-titel nog via `uiLabels` of later `faqsTitle`)
- Data-patches en foto-uploads (HOB-51c/d)

---

## Review-checklist (Christophe)

- [ ] Voldoende velden voor buisfolie-demo-layout?
- [ ] `solutionCard` met optionele sector-only velden (`num`, `tags`, `cta`) OK?
- [ ] `productGallery` als platte `imageWithAlt[]` (geen wrapper-object) OK?
- [ ] `faqItem` apart van sector `deepFaqs` OK, of liever één gedeeld FAQ-object met optionele velden?
- [ ] Akkoord → door naar HOB-51b (template + queries)
