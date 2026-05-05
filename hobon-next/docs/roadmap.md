# Hobon Website — Roadmap

**Laatst bijgewerkt:** 5 mei 2026
**Project:** Hobon B2B website (Next.js + Sanity CMS + Vercel)
**Branch:** `next-poc` (production)
**Live URL:** https://hobon-next.vercel.app/

---

## Status snapshot

| Fase | Status |
|---|---|
| POC bootstrap + CMS foundation | ✅ |
| Insights articles (4 NL) | ✅ |
| Sectoren detail-pagina's (4) | ✅ |
| Producten detail-pagina's (5 hoofd + 3 niches) | ✅ |
| Overzichtspagina's `/sectoren` + `/producten` | ✅ |
| Reveal-animatie bug bij client-side navigatie | ✅ gefixt in HOB-28b |
| FR/EN content (alle types) | 🟡 lopend in HOB-29 |
| Site-launch op hobon.be | 🔴 nog niet |

---

## Sessie 5 (huidige) — HOB-29 AI-vertalingen FR/EN

**Doel:** alle NL-content vertaald naar FR + EN via Claude API
**Aanpak:**
- Direct publiceren (geen drafts)
- `[AI-translated]` prefix in elk vertaald veld
- Markers worden door Frederik handmatig weggehaald na review
- Geen banner op pagina's

**Scope:**
- Sectoren (4)
- Producten (8)
- Sector + Product overview singletons
- Header + Footer navigatie
- Form-opties (toevoegen aan scope tijdens uitvoering)

**Stops:**
- Na audit (stap 1)
- Na test-mode (stap 2c) — 1 sector + 1 product, output naar console
- Na lokale verificatie (stap 3)
- Voor push

---

## Sessie 6 — Sanity-structure verificatie (HOB-30a)

**Type:** korte sessie (~30 min)
**Doel:** mijn audit-aannames valideren tegen werkelijke repo-state
**Output van Cursor:**

1. Tabel met ALLE document-types: type / singleton? / NL gevuld? / FR/EN gevuld? / hoofdvelden
2. Lijst hardcoded data in `SiteHeader.tsx` en `SiteFooter.tsx` (logo, adres, telefoon, email, BRC) met regel-nummers
3. Status `app/[locale]/privacy/page.tsx` en `cookies/page.tsx` — Sanity of hardcoded?
4. Status `SectorCtaForm.tsx` — zijn dropdown-opties hardcoded?

**Kritisch:** zonder deze verificatie schrijven we mogelijk tickets voor zaken die al bestaan.

**Geen wijzigingen, alleen rapportage.**

---

## Sessie 7 — HOB-30 siteSettings singleton

**Doel:** Frederik kan logo, adres, contact, social media zelf wijzigen
**Effort:** 3-4 uur Cursor
**Klant-impact:** zichtbaar zodra Frederik iets wijzigt — overal tegelijk geüpdatet

**Wat erin gaat:**
- Logo (image field met fallback)
- Bedrijfsnaam
- Volledig adres (string + structured fields voor geo-data)
- Telefoon (intentioneel niet prominent, klant-beslissing)
- E-mailadres
- BRC-certificaat label + image
- LinkedIn-URL (en eventueel andere socials)
- Default OG-image voor social shares
- Default site-meta-description (fallback)

**Wat aanpassen:**
- `SiteHeader.tsx` → leest logo uit siteSettings
- `SiteFooter.tsx` → leest contact-info, BRC, socials uit siteSettings
- SEO-component → fallback naar siteSettings.metaDescription

**Stops:**
- Na schema-design + plan
- Na test op alle pagina's
- Voor push

---

## Sessie 8 — HOB-31 Privacy/cookies pagina-content flexibel

**Doel:** Frederik update privacy/cookies zonder developer (GDPR-compliance)
**Effort:** 1-2 uur Cursor
**Scope hangt af van:** verificatie in Sessie 6

**Mogelijke implementatie:**
- `legalPage` document-type met velden: title, body (rich-text array), lastUpdated (auto), pageType enum (privacy/cookies/terms)
- `app/[locale]/privacy/page.tsx` + `cookies/page.tsx` → fetch uit Sanity
- Vertaalbaar via i18n-plugin
- AI-vertalen via dezelfde pipeline als HOB-29

---

## Sessie 9 — HOB-32 Forms-opties configureerbaar

**Doel:** Frederik kan dropdown-opties contactformulier zelf wijzigen
**Effort:** 1-2 uur Cursor
**Klant-impact:** filtervragen kunnen getuned worden zonder developer

**Wat erin gaat:**
- `formSettings` singleton met:
  - "Ik zoek..." opties array (label + value)
  - Sector-dropdown opties
  - Submit success message
  - Privacy-disclaimer onder formulier
- Vertaalbaar via i18n-plugin

**Wat aanpassen:**
- `SectorCtaForm.tsx` → leest opties uit formSettings
- HOB-29 vertaal-pipeline hergebruiken voor FR/EN form-content

---

## Pre-launch checklist (Sessie 10+)

Niet starten tot Sessies 5-9 afgerond zijn.

### Must-do voor go-live op hobon.be

- HOB-25 — Security audit (30 vulnerabilities, 4 high) afwerken
- HOB-24 — Video-optimalisatie: 53 MB intro-video → max 5 MB met poster
- Cookiebot CBID invullen + script integreren
- Google Analytics + GTM IDs
- DNS koppeling hobon.be → Vercel
- SSL-certificaat verifiëren
- 301-redirects van oude site (lijst via Globis aan te leveren)

### Should-do

- Frederik review van alle FR/EN AI-vertalingen (verwijdert markers)
- Frederik review van alle `[Frederik nalezen aparte file]` markers
- Echte fotografie inserten (na fotoshoot — fase 1 groeiplan)
- HOB-17 — Hreflang slug-mapping locale-switcher
- HOB-22 — Tailwind-refactor mock-CSS

### Nice-to-have

- HOB-21 — Seed-scripts idempotent maken
- HOB-18 — ESLint v9 flat-config fix
- Reusable CTA-blocks (alleen als klant CTA-wijzigingen wenst)
- Redirects-management in Studio (alleen als klant vaak URL's wijzigt)
- Insights categorieën/tags (zinvol vanaf 10+ articles)
- HOB-27 — Sanity-project naar Oryen-organisatie

---

## Cursor: lees dit eerst

Bij elke sessie:

1. **Open dit bestand.** Bekijk welke sessie aan de beurt is.
2. **Lees ook `SESSION_NOTES.md`** voor de detailgeschiedenis per sessie.
3. **Volg de stop-momenten** in de PM-prompts. Niet doorduwen.
4. **Geen scope-creep.** Als je iets ziet dat aandacht verdient buiten ticket-scope: noteer in `SESSION_NOTES.md`, raak het niet aan.
5. **Vragen aan PM** in plaats van zelf interpreteren bij twijfel over klant-beslissingen.

### Klant-beslissingen die NOOIT veranderen tenzij PM expliciet zegt

- Hobon = oplossingspartner, geen catalogus, geen webshop
- Sector-first navigatie (4 sectoren als hoofdingang)
- Géén telefoonnummer prominent in hero/header CTA's
- Primary CTA: "Bespreek uw verpakkingsvraag" — niet wijzigen
- 5 hoofdproducten + 3 niches (showInOverview-flag)
- Tone: u/uw (NL), vous/votre (FR), you/your (EN), B2B, oplossingsgericht
- Géén stockfoto's of stockiconen — donker placeholder-blok tot fotoshoot

### Verboden zonder klant-akkoord

- Niet refactoren "while we're at it"
- Niet experimenteren met design-keuzes
- Niet copy verzinnen (gebruik `[Frederik nalezen aparte file]` marker)
- Niet pushen zonder PM-akkoord
- Niet deployen vanaf verkeerde folder (`vercel --prod` MOET in `hobon-next/` draaien, niet in repo-root)

---

## Werkwijze updates

Dit document wordt na elke afgeronde sessie geüpdatet door PM. Status in tabel + huidige sessie verschuift. Niet zelf bewerken zonder PM-akkoord.
