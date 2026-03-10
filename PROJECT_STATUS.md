## 1. HTML-pagina’s in dit project

- **index.html** (28,061 bytes)  
  Homepagina van Hobon met hero, aanpak, sectorenoverzicht, producten, kwaliteit en contact-CTA.

- **contact.html** (131,569 bytes)  
  Contactpagina met formulier, contactgegevens, team en aanvullende informatie over het opnemen van contact.

- **sectoren/voeding.html** (38,851 bytes)  
  Sectorpagina voor voeding & levensmiddelen, met sector-hero, oplossingen, deep dive, compliance, cases, andere sectoren en CTA.

- **hobon-v11.html** (149,219 bytes)  
  Oudere of alternatieve homepagevariant van Hobon met vergelijkbare structuur (hero, aanpak, producten, enz.).

- **hobon-v12.html** (152,525 bytes)  
  Verdere iteratie/variant van de Hobon-homepage met uitgebreide secties en stylingproeven.

- **hobon-homepage-v4.html** (124,353 bytes)  
  Vroege homepageversie met andere typografie en layout-experimenten.

- **hobon-homepage-v5.html** (112,901 bytes)  
  Latere homepagevariant met focus op flexibele PE-verpakkingen en alternatieve contentstructuur.

- **index-2.html** (142,789 bytes)  
  Alternatieve indexversie (prototype) met andere fonts en mogelijk eerdere ontwerpkeuzes.

- **hobon-sector-voeding-v1.html** (151,793 bytes)  
  Eerste ontwerpversie van de voedingssectorpagina, inclusief eigen inline CSS en experimentele content.

- **hobon-sector-voeding-v2.html** (70,365 bytes)  
  Tweede iteratie van de voedingssectorpagina, met verdere layout- en copy-aanpassingen.

- **hobon-sector-voeding-v3.html** (165,989 bytes)  
  Uitgewerkte derde versie van de voedingssectorpagina (rijke content, veel secties), gebruikt als inhoudelijke basis voor de huidige `sectoren/voeding.html`.

---

## 2. Externe URL’s in gebruik

**Fonts (Google Fonts)**
- `https://fonts.googleapis.com`
- `https://fonts.gstatic.com`
- `https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap`
- `https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,200;12..96,300;12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap`
- `https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500&display=swap`

**Afbeeldingen (Unsplash) – voorbeelden uit sector-/prototypepagina’s**
- `https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1000&q=80&auto=format&fit=crop`
- `https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=300&q=70&auto=format&fit=crop`
- `https://images.unsplash.com/photo-1607349913338-fca6f7fc42d0?w=300&q=70&auto=format&fit=crop`
- `https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=300&q=70&auto=format&fit=crop`
- `https://images.unsplash.com/photo-1495461199391-8c39ab674f8a?w=600&q=75&auto=format&fit=crop`
- `https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&q=75&auto=format&fit=crop`
- `https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=600&q=75&auto=format&fit=crop`
- `https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=700&q=80&auto=format&fit=crop`
- `https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?w=400&q=65&auto=format&fit=crop`
- `https://images.unsplash.com/photo-1553413077-190dd305871c?w=400&q=65&auto=format&fit=crop`
- `https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=65&auto=format&fit=crop`
- `https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&q=65&auto=format&fit=crop`

*(Er zijn meerdere varianten van soortgelijke Unsplash-URL’s met andere query-parameters; bovenstaand is representatief.)*

**Hobon productie-/preview-URLs (voornamelijk in oudere v1–v3 sectorpagina’s)**
- `https://hobon.be/sectoren/voeding-levensmiddelen` (canonical in oudere sectorversies)
- Talrijke links naar `https://cnewmedia.github.io/Hobon/...` (home, contact, sectoren) in `hobon-sector-voeding-v1.html`, `v2.html`, `v3.html` en mogelijk andere prototypes.

**Inline SVG-noise achtergrond (in CSS)**
- In `assets/css/style.css` en enkele oudere HTML/CSS-bestanden:  
  `background-image:url("data:image/svg+xml,...")` – inline SVG via data-URL voor ruistextuur.

---

## 3. Kleuren en font stack

**CSS-variabelen (in `assets/css/style.css`)**

```text
:root {
  --navy:        #1a2d6b;
  --navy-d:      #111e4a;
  --orange:      #f5a300;
  --orange-d:    #d48b00;
  --white:       #ffffff;
  --chalk:       #f6f4f0;
  --bone:        #ede9e3;
  --ink:         #0f1117;
  --ink-mid:     #171b27;
  --ink-lt:      #1e2436;
  --mist:        #8891a8;
  --rule-dk:     rgba(255,255,255,0.07);
  --rule-lt:     #ddd8d0;
  --f-head:      "Geist", sans-serif;
  --f-body:      "DM Sans", sans-serif;
  --ease:        cubic-bezier(0.16,1,0.3,1);
}
```

**Font stack en gebruik**
- **Kopteksten**: `var(--f-head)` → `"Geist", sans-serif`  
- **Bodytekst en UI**: `var(--f-body)` → `"DM Sans", sans-serif`  
- Prototypebestanden (`hobon-homepage-v4.html`, `v5.html`, `index-2.html`, oudere sectorversies) gebruiken incidenteel andere fonts:
  - `"Bricolage Grotesque"` + `"DM Sans"`
  - `"Syne"` + `"Inter"`

---

## 4. Navigatiestructuur

**Globale navigatie (huidige productie-varianten: `index.html`, `contact.html`, `sectoren/voeding.html`)**

- **Hoofdmenu in header** (desktop):
  - `index.html` (root):
    - `Sectoren` → `sectoren/voeding.html`
    - `Werkwijze` → `./#werkwijze`
    - `Producten` → `./#producten`
    - `Over Hobon` → `./#over`
    - `Contact` → `contact.html`
  - `contact.html`:
    - Zelfde structuur als index, maar met paden relatief vanuit root (naar `sectoren/voeding.html`, `./#werkwijze`, `./#producten`, `./#over`, `contact.html`).
  - `sectoren/voeding.html` (vanuit `/sectoren/`):
    - `Sectoren` → `../#sectoren` (home-anker)
    - `Werkwijze` → `../#werkwijze`
    - `Producten` → `../#producten`
    - `Over Hobon` → `../#over`
    - `Contact` → `../contact.html`

- **Call-to-action knop in header**
  - Op alle drie pagina’s aanwezig als `Vraag advies`:
    - `index.html` → `href="contact.html"`
    - `contact.html` → `href="contact.html"`
    - `sectoren/voeding.html` → `href="../contact.html"`

- **Mobiel menu (`.mob-nav`)**
  - `index.html`:
    - Sectoren → `sectoren/voeding.html`
    - Werkwijze → `./#werkwijze`
    - Producten → `./#producten`
    - Over Hobon → `./#over`
    - Contact → `contact.html`
    - Vraag advies → `contact.html`
  - `contact.html`: zelfde structuur en bestemmingen als op `index.html`.
  - `sectoren/voeding.html`:
    - Sectoren → `../#sectoren`
    - Werkwijze → `../#werkwijze`
    - Producten → `../#producten`
    - Over Hobon → `../#over`
    - Contact → `../contact.html`
    - Vraag advies → `../contact.html`

**Footer-navigatie (huidige structuur)**

- **`index.html` footer (`.ft`)**
  - Logo (`assets/images/logo.jpg`) – niet klikbaar (geen link).
  - Kolom “Sectoren”:
    - `Voeding & levensmiddelen` → `sectoren/voeding.html`
    - Overige sectoren → `href="#"` met `data-placeholder="tijdelijk"` (nog geen echte links).
  - Kolom “Producten”:
    - 6 items (`Automatenfolie & FFS`, `Dolafzakken`, `Patijnrollen & buizen`, `Krimphoezen`, `PE zakken op maat`, `Stretchfolie`) → allemaal `href="#"` met `data-placeholder="tijdelijk"`.
  - Kolom “Contact”:
    - Adres (plain text)
    - Telefoon → `tel:+3293774516`
    - E-mail → `mailto:info@hobon.be`
  - Bottom:
    - Copyright
    - BRC-badge (`.ft-brc`, `.ft-brc-box`, `.ft-brc-txt`)

- **`sectoren/voeding.html` footer**
  - Zelfde HTML-structuur en classes als `index.html`, met paden aangepast:
    - Logo: `../assets/images/logo.jpg`
    - `Voeding & levensmiddelen` → `voeding.html` (huidige pagina)
    - Andere sectoren → `../#sectoren` (met `data-placeholder="tijdelijk"`)
    - Producten → `../#producten` (met `data-placeholder="tijdelijk"`)
    - Telefoon → `tel:+3293774516`
    - E-mail → `mailto:info@hobon.be`

**Interne sectie-ankers (belangrijkste)**

- Op `index.html`:
  - `#home`, `#over`, `#sectoren`, `#werkwijze`, `#producten`, `#over` (over Hobon-sectie), `#contact` (of contactblok).
- Op `sectoren/voeding.html`:
  - o.a. `#oplossingen` (solutions-grid), mogelijk andere sectie-ID’s (`#cases`, `#cta`, enz.) voor interne scroll-links.

**Verwijzingen tussen pagina’s**

- Hoofdstroom:
  - Home (`index.html`) → sectorenpagina (`sectoren/voeding.html`) & contact (`contact.html`).
  - Sectorpagina (`sectoren/voeding.html`) → terug naar home via `../#sectoren` en naar `../contact.html`.
  - Contact (`contact.html`) → terug naar home-secties (`./#werkwijze`, `./#producten`, `./#over`) en sectorenoverzicht (`sectoren/voeding.html`).

Prototypebestanden (`hobon-*.html`, `index-2.html`, sector-v1/v2/v3) hebben eigen, vaak hardgecodeerde navigatie (meestal met `https://cnewmedia.github.io/Hobon/...`), maar worden duidelijk als iteraties gebruikt.

---

## 5. TODO’s en bekende aandachtspunten (alleen observaties)

**Navigatie & placeholders**
- In de footers van `index.html` en `sectoren/voeding.html` verwijzen veel links nog naar `href="#"` met `data-placeholder="tijdelijk"`:
  - Sectoren: alle behalve “Voeding & levensmiddelen”.
  - Producten: alle zes items.
  - Dit duidt op **TODO’s om daadwerkelijke pagina’s/ankers aan te maken** voor overige sectoren en producttypes.

**Meerdere prototypeversies**
- Bestanden als `hobon-v11.html`, `hobon-v12.html`, `index-2.html`, `hobon-homepage-v4.html`, `hobon-homepage-v5.html` en de drie `hobon-sector-voeding-v*.html` zijn uitgebreide alternatieve versies.
  - Ze bevatten vaak:
    - Inline `<style>`-blokken en inline `<script>`-blokken.
    - Hardgecodeerde absolute URLs (`https://cnewmedia.github.io/Hobon/...`).
    - Base64-ingesloten logo’s.
  - Deze zijn waardevol als referentie, maar **niet opgeschoond volgens de huidige structuur**; dat is relevant als het project ooit wordt opgeschoond of opgesplitst in “live” vs “archive”.

**Externe afhankelijkheden / performance**
- De site gebruikt:
  - Google Fonts met meerdere families/gewichten (soms meer dan nodig in prototypes).
  - Meerdere Unsplash-beeld-URLs, vaak met hoge resolutie (`w=700–1000`, `q=70–80`).
  - Inline SVG-noise-textuur via een data-URL in CSS.
- Dit kan implicaties hebben voor **performance en bandbreedte**, vooral op mobiele verbindingen; er is geen lazy-loading zichtbaar in de HTML-fragmenten.

**Custom cursor & toegankelijkheid**
- `assets/css/style.css` zet `cursor:none` op `body` en tekent een custom cursor (`#cur`, `#cur-dot`) die via JavaScript meebeweegt.
  - Dit gebeurt op alle pagina’s waar `style.css` geladen wordt, dus ook op contact- en sectorpagina’s.
  - Dit kan een **toegankelijkheidsissue** zijn (screenreaders, gebruikers met aangepaste cursors, of als JS faalt).

**Responsive gedrag en duplicatie**
- Zowel in de CSS als in de oudere HTML-bestanden zijn uitgebreide media queries voor tablet/mobiel aanwezig, soms dubbel (bijvoorbeeld dubbele blokken voor `.hdr-hamburger`/`.mob-nav` in oudere sectorv-versies).
  - Dit lijkt afkomstig van iteratieve ontwikkeling; de huidige `assets/css/style.css` consolideert een groot deel, maar de prototypes bevatten nog duplicatie.

**Cloudflare e-mail protection / base64-logo’s in prototypes**
- In ten minste `hobon-sector-voeding-v3.html` (en mogelijk v1/v2) staan:
  - Cloudflare e-mailprotecties (`/cdn-cgi/l/email-protection`, `__cf_email__`, `data-cfemail`).
  - Base64-ingesloten logo-afbeeldingen in header/footer.
- Deze zijn **niet meer aanwezig in de huidige productiepagina’s** (`index.html`, `contact.html`, `sectoren/voeding.html`), maar blijven wel als “legacy” in de prototypes staan.

**Linkconsistency en canonical-URLs**
- `sectoren/voeding.html` gebruikt als canonical:
  - `https://hobon.be/sectoren/voeding`
- Oudere sectorbestanden (`hobon-sector-voeding-v1/v2/v3.html`) gebruiken:
  - `https://hobon.be/sectoren/voeding-levensmiddelen`
- Dit wijst op een **URL-naming-convention die mogelijk is gewijzigd**; relevant om later te alignen of redirects voor te voorzien.

---

Deze `PROJECT_STATUS.md` is bedoeld als read-only overzicht van de huidige stand van het project, zonder wijzigingen aan bestaande bestanden.

