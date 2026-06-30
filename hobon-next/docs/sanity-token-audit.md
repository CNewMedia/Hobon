# Sanity token audit — Hobon (`14bi8ppf` / `production`)

Laatste inventarisatie: 2026-06-16 (HOB-XX). Geen token-waarden in dit document.

## Samenvatting

| Wat | Aantal (doel) |
|-----|----------------|
| Sanity API-tokens in Manage | **2** actief (`viewer-preview`, `editor-migrate`) |
| Server secrets (geen Sanity-token) | **1** (`SANITY_PREVIEW_SECRET`) |
| Publieke config | `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET` (geen secrets) |

**Studio (`/studio`)** gebruikt **Sanity-login (OAuth)** van de ingelogde redacteur — **niet** `SANITY_API_WRITE_TOKEN` in env.

---

## Naming convention (Sanity Manage → env var)

Pattern: **`hobon-{scope}-{purpose}`**

| Label in [sanity.io/manage](https://sanity.io/manage) → API → Tokens | Sanity-rol | Env var (server-only) | Scope |
|-----------------------------------------------------------------------|------------|------------------------|-------|
| `hobon-viewer-preview` | **Viewer** | `SANITY_API_READ_TOKEN` | Next.js draft preview (`previewDrafts`) |
| `hobon-editor-migrate` | **Editor** | `SANITY_API_WRITE_TOKEN` | CLI/scripts: seed, migrate, translate, patch |

Regels:

- Geen `NEXT_PUBLIC_` op tokens of preview-secret.
- Geen token hergebruiken tussen viewer en editor.
- Bij rotatie: nieuw token aanmaken → env updaten (lokaal + Vercel) → oud token revoken → deploy.
- Token-label in Manage = bron van waarheid; env var = vaste mapping in code.

`SANITY_PREVIEW_SECRET` is **geen** Sanity-token — lokaal gegenereerd geheim voor signed `/api/draft`-URLs (`openssl rand -hex 32`).

---

## Waar wordt wat gebruikt?

### Zonder API-token (publiek)

| Component | Mechanisme |
|-----------|------------|
| Live site (bezoekers) | `lib/sanity/client.ts` — geen token, CDN, gepubliceerde content |
| `app/api/i18n/resolve-slug` | Zelfde publieke client |
| `app/llms.txt` | Zelfde publieke client |
| Studio UI | Ingelogde Sanity-gebruiker (browser-sessie) |

### `SANITY_API_READ_TOKEN` (Viewer)

| Bestand | Gebruik |
|---------|---------|
| `lib/sanity/fetchSanity.ts` | Draft mode → `perspective: previewDrafts` |
| `lib/sanity/previewClient.ts` | Slug ophalen voor preview-redirect |
| `app/api/draft/route.ts` | Indirect (via bovenstaande) |

**Waar zetten:** `.env.local`, Vercel (Production + Preview). **Niet** in git.

### `SANITY_API_WRITE_TOKEN` (Editor)

Alleen **`hobon-next/scripts/*.ts`**, aangeroepen via `npm run …` (lokaal of CI):

| Script | Doel |
|--------|------|
| `seed.ts` | Initiële dataset |
| `seed-sectors-content.ts` | Sectorcontent |
| `seed-*-navigation-nl.ts`, `seed-home-niches-nl.ts`, `seed-ui-labels.ts`, `seed-overview-singletons.ts` | Nav / singletons |
| `migrate-*.ts`, `migrate-product-content-51c.ts`, `migrate-product-images-51g.ts`, `migrate-zakken-kratzakken-51h.ts` | Schema/content-migraties |
| `translate-*.ts`, `patch-*.ts` | Vertalingen & patches |

**Niet** gebruikt door: Next.js app routes, Studio, Vercel runtime (tenzij bewust toegevoegd — nu niet).

**Waar zetten:** `.env.local` (dev), optioneel Vercel als je scripts in CI draait. **Niet** nodig op productie-runtime voor de live site.

### `SANITY_PREVIEW_SECRET`

| Bestand | Gebruik |
|---------|---------|
| `lib/sanity/previewToken.ts` | HMAC signed preview URLs |
| `app/api/draft/route.ts` | Validatie GET `/api/draft` |

---

## Opkuis-checklist (Sanity Manage — handmatig)

> Vereist **project owner/admin** in sanity.io/manage. De migrate-token kan tokens **niet** zelf listen/revoken.

1. Ga naar **Project `14bi8ppf` → API → Tokens**.
2. Exporteer/noteren: label, rol, aanmaakdatum (geen token-string kopiëren naar Slack/git).
3. **Behouden** (hernoemen indien nodig):
   - `hobon-viewer-preview` (Viewer) → `SANITY_API_READ_TOKEN`
   - `hobon-editor-migrate` (Editor) → `SANITY_API_WRITE_TOKEN`
4. **Revoken** (typische kandidaten):
   - Onbekende of generieke labels (`Untitled`, `dev`, `test`, `cursor`, oude deploy-namen)
   - **Duplicaten** met dezelfde rol (twee Editors → één behouden)
   - Tokens aangemaakt rond een **leak-incident** (altijd roteren + oud revoken)
   - **Developer** / **Administrator** tokens tenzij expliciet nodig voor beheer
   - Tokens niet gekoppeld aan bovenstaande env vars (niet meer in Vercel/.env.local)
5. Na revoke: smoke-test preview (`Open preview` in Studio) + één migrate-script dry-run.
6. Vercel → Project → Settings → Environment Variables: verwijder obsolete var-namen; align labels in Manage met deze doc.

---

## Vercel env vars (verwacht)

| Variable | Production site | Preview deploys | Notes |
|----------|-----------------|-----------------|-------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | ✅ | ✅ | Publiek |
| `NEXT_PUBLIC_SANITY_DATASET` | ✅ | ✅ | Publiek |
| `NEXT_PUBLIC_SITE_URL` | ✅ | ✅ | Publiek |
| `SANITY_API_READ_TOKEN` | ✅ | ✅ | Draft preview |
| `SANITY_PREVIEW_SECRET` | ✅ | ✅ | Draft route signing |
| `SANITY_API_WRITE_TOKEN` | ⚠️ optioneel | ⚠️ optioneel | Alleen als CI/scripts; **niet** verplicht voor live traffic |

---

## Veiligheid (post-incident)

- Write-token **nooit** in client bundle, chat, commits, of `NEXT_PUBLIC_`.
- Bij vermoeden van leak: **rotate** (`editor-migrate` + evt. `viewer-preview`) vóór revoke van het oude token.
- `SANITY_PREVIEW_SECRET` roteren = nieuwe waarde in Vercel + `.env.local`; oude signed URLs verlopen binnen 15 min.
- Build-check: `rg "SANITY_API_READ_TOKEN|SANITY_API_WRITE_TOKEN" .next/static` → alleen env-**namen** in Studio-fouttekst toegestaan, geen waarden.

---

## Actie-log (invullen na Manage-audit)

| Datum | Actie | Door |
|-------|-------|------|
| | Tokens geïnventariseerd in Manage | |
| | `hobon-viewer-preview` aangemaakt/hernoemd | |
| | `hobon-editor-migrate` aangemaakt/hernoemd | |
| | Overtollige tokens revoked (aantal: …) | |
| | Vercel env gesynchroniseerd | |
| | Preview NL + FR getest | |
