# Status — HOB-64 + HOB-66

**Test altijd op** `https://hobon-next.vercel.app` — **niet** op `www.hobon.be` (nog WordPress tot DNS-switch).

---

## HOB-64 — i18n-resolutie: taalswitcher + hreflang

**Status:** uitgevoerd, gecommit, gedeployed.  
**Commit:** `6cf8fa0` — `fix(HOB-64): resolve i18n siblings via translation.metadata + localized hreflang`  
**Prod:** Ready (`dpl_CK8TZr2DFW557xgp2EzqYrFudp3q`)

### Wat er veranderde

Slug-resolutie gaat eerst via `translation.metadata`, daarna patterned `_id` (`insight-` / `sector-` / `product-`, niet `insightArticle-`). UUID-insights (o.a. BRC-audit) resolven nu de echte sibling-slug. Zonder sibling: switcher → overview; hreflang-entry weggelaten.

Hreflang per taal eigen slug + `x-default` → NL. `SITE_ORIGIN` blijft `NEXT_PUBLIC_SITE_URL` (nu staging `hobon-next.vercel.app`; bij DNS-switch naar `https://hobon.be` + redeploy). `robots.ts` gebruikt dezelfde env-var.

### Live hreflang (BRC/IFS-audit, geverifieerd)

```
hreflang="nl"        …/nl/insights/brc-en-ifs-audit-hoe-uw-foliekeuze-het-verschil-maakt
hreflang="fr"        …/fr/insights/audit-brc-and-ifs-le-role-du-film
hreflang="en"        …/en/insights/brc-and-ifs-audits-why-film-choice-matters
hreflang="x-default" …/nl/insights/brc-en-ifs-audit-hoe-uw-foliekeuze-het-verschil-maakt
```

### Bestanden

- `lib/sanity/locale-mapping.ts` — `resolveSiblingSlug` / `resolveSiblingSlugsByLocale`
- `app/api/i18n/resolve-slug/route.ts`
- `lib/seo/metadata.ts` — per-locale hreflang + `x-default`
- `app/[locale]/insights|[sectoren]|producten/[slug]/page.tsx`
- `app/robots.ts`
- Dry-run: `docs/hob-64-dry-run.md`

### Buiten scope (blijft P1)

11 insights zonder `translation.metadata` vullen — patterned fallback dekt de seed-trio’s.

---

## HOB-66 — Cookiebot consent

**Status:** code + lokale build OK (`exit 0`). **Nog geen commit / Vercel-env / prod-deploy** — STOP na build, wacht op OK.

### Wat er klaarstaat (lokaal, uncommitted)

**Banner** in root `app/layout.tsx` (`beforeInteractive` werkt alleen daar):

```tsx
<Script
  id="Cookiebot"
  src="https://consent.cookiebot.com/uc.js"
  data-cbid={cookiebotCbid}              // NEXT_PUBLIC_COOKIEBOT_CBID
  data-blockingmode="auto"
  data-culture={cookiebotCulture(locale)} // NL | FR | EN via x-locale
  strategy="beforeInteractive"
/>
```

CBID uit env, niet hardcoded. Lokaal in `.env.local`; placeholder in `.env.local.example`.

**Cookies-pagina:** NL/FR/EN titel + intro (geen `[FR]`/`[EN]`-stubs). `CookieDeclaration` injecteert `cd.js` in de pagina-body; Cookiebot rendert het overzicht zelf.

Tracking-gate in locale-layout: GTM/GA4 alleen als env-CBID aanwezig is (banner blokkeert tot consent). Geen GA4/GTM toegevoegd.

### Bestanden (working tree)

| Pad | Rol |
|-----|-----|
| `lib/cookiebot.ts` | `getCookiebotCbid()` + `cookiebotCulture()` |
| `app/layout.tsx` | banner `beforeInteractive` |
| `app/[locale]/layout.tsx` | Sanity-CBID-gate weg; tracking via env |
| `app/[locale]/cookies/page.tsx` | vertaalde chrome + declaration |
| `components/cookies/CookieDeclaration.tsx` | `cd.js` injectie |
| `.env.local.example` | `NEXT_PUBLIC_COOKIEBOT_CBID=` |

### Nog te doen na OK

1. `NEXT_PUBLIC_COOKIEBOT_CBID` op Vercel (Production + Preview)
2. Commit + push + `vercel --prod` (vanaf repo-root `/Hobon`)
3. Live test op `hobon-next.vercel.app`: banner NL/FR/EN, accepteren, `/nl/cookies` + `/fr/cookies` + `/en/cookies` declaration-overzicht

**Let op:** Cookiebot-dashboard moet `hobon-next.vercel.app` (en later `hobon.be`) als domein toestaan, anders verschijnt de banner niet.
