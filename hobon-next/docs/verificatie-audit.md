# Verificatie-audit — Hobon next-poc

**Datum:** 2026-08-14  
**Scope:** read-only (geen code-, Sanity- of env-writes)  
**Branch:** `next-poc` @ `821bc0c` (in sync met `origin/next-poc`)  
**Dataset:** Sanity `production` (`14bi8ppf`)  
**Live:** [https://hobon-next.vercel.app](https://hobon-next.vercel.app) — niet `www.hobon.be` (Vercel-alias bestaat; DNS is tot switch nog WordPress)

Statuslegenda: **✅ gedaan** / **❌ niet gedaan** / **⚠️ deels/onzeker**

---

## Recent werk — weggeschreven + gedeployed?

### 1. HOB-66 Cookiebot — ✅ gedaan (code + env + prod-deploy)

| Check | Status | Bewijs |
|-------|--------|--------|
| `NEXT_PUBLIC_COOKIEBOT_CBID` op Vercel Production + Preview | ✅ | `vercel env ls`: var aanwezig, environments **Preview, Production**, aangemaakt ~20u geleden |
| Zelfde var in `.env.local` | ✅ | `hobon-next/.env.local` (naam aanwezig; waarde = publieke CBID `d70b1eb9-4324-42b9-9af9-22fd175a926a`) |
| Banner via `next/script` `strategy="beforeInteractive"` in `app/layout.tsx` | ✅ | `app/layout.tsx:51-59` — `id="Cookiebot"`, `src="https://consent.cookiebot.com/uc.js"` |
| CBID uit env, niet hardcoded | ✅ | `lib/cookiebot.ts:3-5` `getCookiebotCbid()`; geen UUID in `app/layout.tsx` (rg op `d70b1eb9` = 0 hits in layout) |
| Cookies-pagina FR/EN-stub → CookieDeclaration `cd.js` | ✅ | `app/[locale]/cookies/page.tsx:62-63` + `components/cookies/CookieDeclaration.tsx:26-31` (`…/${cbid}/cd.js`). Live FR-titel **Politique de cookies**, EN **Cookie policy**, geen `[FR]`/`[EN]`-stubs. RSC: `"$L11"` CookieDeclaration met `cbid` + `locale` |
| Gecommit | ✅ | `2f380f38840c845df36ab350ea8b4e26a4ba596f` — *HOB-66: Cookiebot integatie + gitignore cleanup* (2026-08-13 11:16 +0100) |
| Prod-deploy sindsdien | ✅ | Meerdere Production Ready-deploys ná die commit, o.a. `dpl_NDsLFquS8kGxWqd4dt1ygys5WdKy` (13 aug 21:34) en HEAD-deploys `dpl_FcLGpY1huDQeHAm5N3tWsR1mXFpb` / `dpl_AmwvPtXVgoNfznzaV9o5oP4yua1d` (14 aug). Live HTML: `data-cbid":"d70b1eb9-4324-42b9-9af9-22fd175a926a"`, `strategy":"beforeInteractive"` |

Live-URL’s:

- Banner-script: [https://hobon-next.vercel.app/fr/cookies](https://hobon-next.vercel.app/fr/cookies) (preload `consent.cookiebot.com/uc.js`, culture `FR`)
- Declaration-container: zelfde pagina, `<div class="cookiebot-declaration mt-10">` + client `cd.js`

Niet in scope van “gedaan”, wel gezien: Cookiebot-dashboard kan nog TEST-watermark tonen (niet in deze audit visueel herbevestigd).

---

### 2. HOB-67 product-UI koppen — ✅ gedaan (+ HOB-68 enlarge)

| Check | Status | Bewijs |
|-------|--------|--------|
| `uiLabels-fr` / `uiLabels-en`: `productGalleryTag/Title`, `productSolutionsTag/Title` + overige `product*` | ✅ | Live Sanity + RSC-payload `/fr/cookies` (`_id":"uiLabels-fr"`, `_updatedAt":"2026-08-14T05:56:40Z"`). Alle 17 `product*` keys gevuld, geen lege string |
| Lightbox-aria via uiLabels | ✅ | `ProductGalleryLightbox.tsx:73,78,81` — `labels.uiAriaClose/Prev/Next`. FR: Fermer / Précédent / Suivant. EN: Close / Previous / Next |
| Nog NL-default op FR/EN voor `product-*`? | ✅ geen | Scan `types/uiLabels.ts` vs live docs: geen enkele `product*` key leeg op FR/EN → `mergeUILabels` valt niet terug op NL-defaults. Identieke waarden die toevallig hetzelfde zijn in 3 talen: `productExpertise` (“Expertise”), `productContact` (“Contact”), `productExtra` (“Extra”) — geen NL-lek |
| Gecommit | ✅ | `a030daf64940ffd28bb44bdcd45d5464571bc50a` — *HOB-67: FR/EN product-labels + aria-lightbox* |
| Gedeployed | ✅ | Zit in alle prod-deploys ná 13 aug 11:01, inclusief huidige alias `hobon-next.vercel.app` |

Aanvulling (niet HOB-67, wél gerelateerd): **HOB-68** `821bc0c656d6f28b2811ae6595d700617402e5d6` — `uiLightboxEnlarge` FR Agrandir / EN Enlarge; `ProductGallery.tsx:73`. Prod `dpl_FcLGpY1huDQeHAm5N3tWsR1mXFpb` (14 aug 06:57).

---

### 3. HOB-62d — 53 FR-productvelden — ✅ gedaan

Commit: `9924bc0feb4e1c53f481c513631561831fb2e4d8` — *content(HOB-62d): build 53 FR product fields from NL structure + Herman FR text*

Live Sanity (2026-08-14), `defined()` + niet-lege string: **53/53**.

| FR-doc | Velden in de 53 | defined |
|--------|-----------------|--------|
| `product-fr-blaasfolies` | 36 (faqs×8, galleryTitle, solutionsTitle, heroThumbs×14, solutionCards×12) | 36/36 |
| `product-fr-kratzakken` | 8 (hero + 2 CTA labels + 3 gallery alts) | 8/8 |
| `product-fr-pattyn` | 1 gallery alt | 1/1 |
| `product-fr-stretch-hood` | 6 (3 gallery alts + 1 solutionCard×3) | 6/6 |
| `product-fr-zakken` | 2 gallery alts | 2/2 |

- Tekst is FR (Herman), bv. `product-fr-kratzakken.heroPrimaryCta.label` = « Demandez une offre de prix »; `product-fr-blaasfolies.galleryTitle` = « Notre film polyéthylène dans la pratique ».
- Asset-refs op thumbs/gallery/cards: waar gecontroleerd (`heroThumbs[].image`, `solutionCards[].image`, `productGallery[]`) **gelijk aan NL** (`asset=NL`).

Buiten de 53 (niet geclaimd door 62d): o.a. `product-fr-zakken` heeft nog **0 FAQ-items**; EN-equivalenten van deze 53 paden zijn deels leeg (zie punt 9).

---

### 4. HOB-65 EN-insight-bodies + hobon-producent FR — ❌ niet gedaan / ⚠️ FR-body structureel nog stuk

- **Geen ticket/commit/script `HOB-65`** in repo, git-log of docs (rg = 0).
- EN-bodies zijn **niet** herbouwd naar NL-structuur. Style-mismatches (normal↔h3) + kortere block-counts t.o.v. NL:

| Artikel | FR vs NL | EN vs NL |
|---------|----------|----------|
| `brc-aa-in-de-praktijk` | ✅ 0 mm, 33/33 (HOB-62f) | ❌ 5 mm, 33 vs 25 |
| `dunner-folie-zelfde-kwaliteit` | ✅ 0 mm, 23/23 | ❌ 4 mm, 23 vs 19 |
| `faalkosten-verkeerde-foliekeuze` | ✅ 0 mm, 38/38 | ❌ 2 mm, 38 vs 28 |
| `recyclaat-of-virgin-de-juiste-keuze` | ✅ 0 mm, 31/31 | ❌ 6 mm, 31 vs 24 |
| UUID audit-klaar | ✅ 0 mm, 40/40 | ❌ 4 mm, 40 vs 26 |
| UUID FFS | ✅ 0 mm, 29/29 | ⚠️ 0 style-mm maar 29 vs 22 blocks (afgekapt) |
| UUID recyclaat-op-de-lijn | ✅ 0 mm, 28/28 | ❌ 3 mm, 28 vs 23 |
| UUID **hobon-producent** | ❌ 4 mm, **19 vs 12** | ❌ 2 mm, 19 vs 17 |

**hobon-producent FR** (`2aee894a-edf2-40de-bc82-facb9b6e58bb`, slug `hobon-est-il-lui-meme-fabricant-de-film-pe`):

- Geen `[AI-translated]` in live content (dataset-wide AI-marker-query = **0 docs**).
- Tekst **is Frans** (titel + openingsalinea’s), niet de oude AI-NL-dump.
- Structuur **niet** meegenomen in HOB-62f write (xlsx-body ontbrak → FLAG in `scripts/migrate-62f.ts`). Heading-swap blijft: NL h3 « Wat betekent eigen productie concreet… » vs FR normal; extra FR h3’s op lege NL-indexen.

FR-herstel van de 7 xlsx-artikelen: commit `704026360f4e07fac81733f4e7cf7baedd116e1d` (HOB-62f), niet HOB-65.

---

## Openstaande content

### 5. Meta descriptions `[TODO]` boterfolie / dolav / kratzakken — ❌ niet gedaan

`seo.metaDescription` is letterlijk `[TODO]` op alle 9 docs:

| Doc | meta | lead | body |
|-----|------|------|------|
| `product-nl-boterfolie` | `[TODO]` | `[TODO: Copy Brief sectie 06, producttemplate]` | `[TODO: productdetail body…]` |
| `product-fr-boterfolie` | `[TODO]` | idem | idem |
| `product-en-boterfolie` | `[TODO]` | idem | idem |
| `product-nl-dolav-zakken` | `[TODO]` | idem | idem |
| `product-fr-dolav-zakken` | `[TODO]` | idem | idem |
| `product-en-dolav-zakken` | `[TODO]` | idem | idem |
| `product-nl-kratzakken` | `[TODO]` | `[TODO: Copy Brief…]` | `[TODO: productdetail body…]` |
| `product-fr-kratzakken` | `[TODO]` | idem | idem |
| `product-en-kratzakken` | `[TODO]` | *(leeg)* | *(leeg)* — meta wél `[TODO]` |

---

### 6. Placeholder-foto’s Vellen / DOLAV / Boterfolie — ⚠️ deels (boterfolie eigen PNG; vellen+DOLAV nog folie-fallback)

Zelfde hero-asset als blaasfolies: `folies-hero.jpg` / `image-53d95e8ddf…`

| Product | NL hero | FR/EN hero | Gallery |
|---------|---------|------------|---------|
| Vellen | `folies-hero.jpg` (leen van blaasfolies) | zelfde fallback | leeg |
| DOLAV-zakken | `folies-hero.jpg` (leen) | zelfde fallback | leeg |
| Boterfolie | `Boterfolie.png` (`image-42a87db7da…`) | zelfde PNG | `Boterfolie.png` |

Geen `placeholder`-filename. Wel **verkeerd productbeeld** (buisfolie/blaasfolie-hero) op Vellen en DOLAV.

---

### 7. Chemie & industrie-foto’s van Barbara — ❌ niet verwerkt (of niet herkenbaar als nieuw)

`sector-{nl,fr,en}-chemie`: listing/hero/deep/cards = **`chemie_industrie.jpg`** (`image-9d645b4f49…-1536x1024.jpg`). Thumbs leeg.

Legacy URL-velden nog aanwezig: o.a. `sector-nl-chemie.deepPhotoUrl` en `sector-fr-chemie.listingImageUrl` wijzen nog naar **Unsplash** `photo-1518709268805-4e9042af9f23`. Geen commit/docs die Barbara-chemie-uploads vermelden. Inventory (`docs/photo-inventory.md`) noemde dit al 🔴 stock / te vervangen.

---

## Terugkerende foutcategorieën

### 8. Hardcoded-NL in `components/**` en `app/**` — ⚠️ deels nog aanwezig (contact/CTA na HOB-63 grotendeels weg)

Scan 2026-08-14. Uitgesloten: `types/uiLabels.ts` defaults, `scripts/**`, `sanity/schemas`, locale-maps die alleen de NL-tak op `/nl` gebruiken (`nav.ts` NL-object, cookies `COPY.nl`).

**Lekt (of kan lekken) op FR/EN:**

| Bestand:regel | String | Wanneer zichtbaar |
|---------------|--------|-------------------|
| `app/not-found.tsx:7` | `Pagina niet gevonden` | Elke 404, ook `/fr/…` en `/en/…` — **live bevestigd** |
| `app/not-found.tsx:10` | `Terug naar home` + `href="/nl/"` | Idem |
| `app/layout.tsx:25` | `PE-verpakkingsfolie op maat` | Root `metadata.description` (fallback) |
| `app/[locale]/privacy/page.tsx:12` | `Privacybeleid Hobon.` | Meta description **alle** locales |
| `app/[locale]/privacy/page.tsx:25` | `Deze pagina is een tijdelijke placeholder…` | Alleen NL-body; FR/EN hebben `[FR]`/`[EN]` stubs |
| `app/[locale]/page.tsx:41` | `Homepage-content ontbreekt in Sanity…` | Alleen als home-doc ontbreekt |
| `components/about/AboutTemplate.tsx:30` | `Over Hobon` | Fallback als `hero.headline` leeg |
| `components/sustainability/SustainabilityTemplate.tsx:34` | `Duurzaamheid` | Fallback als headline leeg |
| `components/product/ProductTemplate.tsx:263` | `` `Foto ${i + 1}` `` | Aria als `thumb.label` ontbreekt |

**Niet langer UI-lek (na HOB-63/67/68):** ContactForm/SectorCtaForm/API error strings gaan via `useUILabels()` + error codes. Lightbox/gallery aria via uiLabels.

**Machine-feed, geen site-UI:** `app/llms.txt/route.ts:17-40` (NL tagline / Over Hobon / Duurzaamheid).

**Cookies:** NL-copy alleen in `COPY.nl` (`page.tsx:14-20`); FR/EN hebben eigen copy. CBID-fallback `page.tsx:66-70` is locale-aware.

---

### 9. Onvertaalde/lege FR/EN Sanity-velden (telling) — ⚠️ deels (product-FR 62d dicht; rest open)

Pad-aligned: NL-string gevuld, sibling leeg. Portable-text child/marks tellen mee (daarom insight-cijfers hoog).

| Type | NL gevuld & FR leeg | NL gevuld & EN leeg |
|------|---------------------|---------------------|
| `product` | **0** | **58** (o.a. EN faqs/thumbs/cards = 62d-gaten) |
| `sector` | 0 | 0 |
| `insightArticle` | 26 | 104 |
| `homePage` | 10 (`productCards[0]` cta/specs) | 10 |
| `aboutPage` | 0 | 2 |
| `contactPage` | 0 | 0 |
| `sustainabilityPage` | 9 (`practicePoints`) | 11 |
| `uiLabels` | 0 | 0 |
| `productOverviewPage` | 1 (`heroEyebrow`) | 0 |
| `sectorOverviewPage` | 7 (hero/cta/seo) | 7 |
| `insightsOverviewPage` | 0 | 0 |

---

### 10. Portable-text normal↔heading mismatch — ⚠️ deels (FR xlsx-7 gefixt; EN + hobon-producent FR niet)

Zie tabel punt 4. FR patterned + 62c-UUID’s: 0 mismatches na HOB-62f. EN: mismatches op vrijwel alle artikelen. hobon-producent FR: 4 mismatches.

---

### 11. Gelokaliseerde slugs + taalswitcher — ⚠️ deels (switcher werkt; sommige slugs taalsuffix / letterlijk)

Switcher-API live (`/api/i18n/resolve-slug`):

- product `nl/folies` → FR `films-hdpe-ldpe`
- product `nl/kratzakken` → EN `scratch-bags`
- sector `nl/voedingsindustrie` → FR `industrie-alimentaire`
- insight UUID producent → FR `hobon-est-il-lui-meme-fabricant-de-film-pe`
- insight patterned dunner-folie → EN `thinner-film-same-quality-lower-costs-but-how`

Code: `lib/sanity/locale-mapping.ts` (eerst `translation.metadata`, dan patterned `insight-`/`product-`/`sector-`). Header: `LocaleSwitcher.tsx` + `switchLocalePathWithSlugLookup`.

**Awkward slugs (kloppen als unieke keys, niet als natuurlijke taal):** `pattyn-nl` / `pattyn-fr` / `pattyn-en`; `stretch-hood-nl`; `agro-industrie-fr`; EN kratzakken `scratch-bags`.

**`translation.metadata`:** 6 metadata-docs, **13/24** insights gelinkt, **11 zonder** (patterned seed-trio’s). Patterned fallback dekt die 11 voor de switcher.

Doc-types met slug-lookup in de switcher: **product, sector, insightArticle**. Overige (over, duurzaamheid, contact, cookies) via pad-segmenten/rewrites — OK.

---

### 12. Locale-aware 404 — ❌ niet gedaan

- `app/not-found.tsx:7-10` hardcoded NL + link `/nl/`.
- Geen `app/[locale]/not-found.tsx`.
- Live: `GET https://hobon-next.vercel.app/fr/deze-pagina-bestaat-niet-xyz` → **HTTP 404**, body « Pagina niet gevonden » / « Terug naar home » (3× in HTML/RSC).
- Zelfde op `/en/this-page-does-not-exist-xyz`.

---

## Technische go-live blockers

### 13. Contactformulier SMTP — ❌ niet werkend (laatste test 535; SMTP-vars ontbreken op Vercel)

- Code: `lib/contact/send-mail.ts` nodemailer `smtp.office365.com:587`.
- **Vercel env ls:** geen `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` / `CONTACT_TO` (wel Cookiebot, Sanity, `NEXT_PUBLIC_SITE_URL`). Productie-API kan dus niet authenticeren.
- Lokaal: namen wél in `.env.local`. Laatste echte verzendtest (2026-08-12): HTTP 500, nodemailer **`EAUTH` / `535 5.7.139 Authentication unsuccessful, the user credentials were incorrect`**. Mail op `info@hobon.be` **niet** aangekomen.
- Deze audit heeft **geen nieuwe testmail** gestuurd (read-only).

---

### 14. 301-redirects oude WP-URL’s — ❌ niet gedaan

`next.config.ts:8-20` bevat alleen interne rename:

- `/nl/sectoren/voeding` → `/nl/sectoren/voedingsindustrie` (`permanent: true` = HTTP 308)

Geen WP-paden (`/wp-content`, oude permalinks, `/folie`, …). `middleware.ts` doet alleen `/` → `/nl/` (302) + locale-headers. Geen `vercel.json` redirects.

---

### 15. `NEXT_PUBLIC_SITE_URL` — ✅ staging-waarde (correct tot DNS); ❌ nog niet `https://hobon.be`

- Vercel: var bestaat op **Production + Preview** (103d).
- Live `robots.txt`: `Sitemap: https://hobon-next.vercel.app/sitemap.xml`.
- Live canonical cookies: `https://hobon-next.vercel.app/fr/cookies`.
- Code-fallback `lib/siteUrl.ts:3`: zelfde host als default.
- `.env.local`: **geen** `NEXT_PUBLIC_SITE_URL` (lokale builds gebruiken de code-default).
- Vercel-aliaslijst bevat `hobon.be` / `www.hobon.be`, maar dat is niet dezelfde vraag als DNS/go-live.

---

### 16. `npm run build` — ✅ schoon (0 compile/type errors; lint overgeslagen)

Draai 2026-08-14 in `hobon-next`:

```
Next.js 15.5.18
✓ Compiled successfully
Skipping linting          ← next.config.ts eslint.ignoreDuringBuilds: true
Checking validity of types ...
✓ Generating static pages (65/65)
exit 0
```

---

## Git-hygiëne

### 17. Working tree / exports — ✅ clean (vóór dit rapport); xlsx niet in git

Vóór het schrijven van dit bestand:

```
## next-poc...origin/next-poc
```

(geen modified/untracked in `git status -sb`)

- `git ls-files '*.xlsx' 'exports/*'` → leeg.
- `hobon-next/.gitignore:46` `exports/*.xlsx` — lokale xlsx’s aanwezig maar ignored:
  - `Hobon-website-teksten-NL-FR-EN.xlsx`
  - `Hobon-website-teksten-NL-FR-EN update 7_7 2.xlsx`
  - `Hobon_Keyword_Onderzoek.xlsx`
- `.DS_Store` ignored via root `.gitignore` (HOB-66).

**Dit rapport** (`docs/verificatie-audit.md`) is na afloop het enige nieuwe lokale bestand — niet gecommit, niet geüpload.

---

### 18. Laatste 10 commits

```
821bc0c HOB-68: gallery enlarge aria via uiLabels (NL/FR/EN)
2f380f3 HOB-66: Cookiebot integatie + gitignore cleanup
a030daf HOB-67: FR/EN product-labels + aria-lightbox
9924bc0 content(HOB-62d): build 53 FR product fields from NL structure + Herman FR text
6cf8fa0 fix(HOB-64): resolve i18n siblings via translation.metadata + localized hreflang
7f0458c content(HOB-63): contact/CTA/API labels to uiLabels (NL/FR/EN)
2080cdc docs: pre-go-live audit report
7040263 fix(HOB-62f): rebuild FR insight bodies from NL structure (7 articles)
d0b6644 docs(HOB-62e): FR insight body structure diagnosis
7f88daf fix(HOB-58b): move remaining blog template strings to uiLabels (NL/FR/EN)
```

Volledige hashes (HEAD →):

1. `821bc0c656d6f28b2811ae6595d700617402e5d6`
2. `2f380f38840c845df36ab350ea8b4e26a4ba596f`
3. `a030daf64940ffd28bb44bdcd45d5464571bc50a`
4. `9924bc0feb4e1c53f481c513631561831fb2e4d8`
5. `6cf8fa0ead376ddfa63c7576679fc78f43c9b010`
6. `7f0458c9b6bab0a72cbd6a2c9c0a8c9a06ed685c`
7. `2080cdc5afba409b4e5344db450f8c89ec11aa7f`
8. `704026360f4e07fac81733f4e7cf7baedd116e1d`
9. `d0b664429cf3b156a1fc5b66abbbec4239095d03`
10. `7f88dafdf5967e8397d3f156ee940e1200f082ee`

---

## Scorebord (checklist 1–18)

| # | Onderwerp | Status |
|---|-----------|--------|
| 1 | HOB-66 Cookiebot | ✅ |
| 2 | HOB-67 product-UI + aria | ✅ |
| 3 | HOB-62d 53 FR-velden | ✅ |
| 4 | HOB-65 EN-bodies / producent-FR structuur | ❌ / ⚠️ |
| 5 | `[TODO]` meta boterfolie/dolav/kratzakken | ❌ |
| 6 | Placeholder-foto’s Vellen/DOLAV/Boterfolie | ⚠️ |
| 7 | Barbara chemie-foto’s | ❌ |
| 8 | Hardcoded-NL leaks | ⚠️ |
| 9 | Lege FR/EN velden | ⚠️ |
| 10 | PT heading-mismatch | ⚠️ |
| 11 | Slugs + taalswitcher | ⚠️ |
| 12 | Locale-aware 404 | ❌ |
| 13 | SMTP contactformulier | ❌ |
| 14 | WP 301s | ❌ |
| 15 | `NEXT_PUBLIC_SITE_URL` staging | ✅ (go-live nog `hobon.be`) |
| 16 | `npm run build` | ✅ |
| 17 | Git-hygiëne | ✅ |
| 18 | Laatste 10 commits | (informatief) |

*Einde audit — geen fixes uitgevoerd.*
