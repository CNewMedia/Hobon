# HOB-63 — Dry-run: contact/CTA/API → uiLabels

**Status:** STOP — goedgekeurd voor review; **geen** Sanity `--write` / commit / deploy tot expliciete OK.  
**Audit:** `docs/pre-golive-audit.md` (§1 P0) — commit `2080cdc`.  
**Migrate:** `npm run migrate:63-contact-labels` (dry-run) → `--write` na goedkeuring.

---

## 1. API-aanpak: (a) error-keys

`/api/contact` en `lib/contact/validate.ts` sturen **geen** NL-proza meer. Alleen:

```json
{ "errorCode": "invalid_email" }
```

Client mapt via `resolveContactErrorLabel(uiLabels, errorCode)` (`lib/contact/resolve-error.ts`).

| Code | uiLabel key |
|------|-------------|
| `invalid_json` | `formErrorInvalidJson` |
| `rate_limit` | `formErrorRateLimit` |
| `send_failed` | `formErrorSendFailed` |
| `invalid_request` | `formErrorInvalidRequest` |
| `invalid_email` | `formErrorInvalidEmail` |
| `required_firstname` | `formErrorRequiredFirstname` |
| `required_lastname` | `formErrorRequiredLastname` |
| `required_sector` | `formErrorRequiredSector` |
| `required_message` | `formErrorRequiredMessage` |
| `required_name` | `formErrorRequiredName` |
| `required_company` | `formErrorRequiredCompany` |

Optie (b) locale server-side is **niet** gekozen.

---

## 2. uiLabel-keys + NL / FR / EN

Register: FR **vous/votre**, EN **you/your**. Geen em-dashes in nieuwe copy.

### Nieuw (leeg in Sanity → PATCH)

| Key | NL | FR | EN |
|-----|----|----|-----|
| `formFieldFirstnameLabel` | Voornaam | Prénom | First name |
| `formFieldLastnameLabel` | Naam | Nom | Last name |
| `formFieldPhoneLabel` | Telefoon | Téléphone | Phone |
| `formFieldSectorLabel` | Sector | Secteur | Sector |
| `formFieldMessageLabel` | Bericht | Message | Message |
| `formPlaceholderName` | Jan Janssen | Jean Dupont | John Smith |
| `formPlaceholderCompany` | Uw bedrijfsnaam | Le nom de votre entreprise | Your company name |
| `formPlaceholderEmail` | jan@bedrijf.be | jean@entreprise.be | john@company.com |
| `formContactSuccessMessage` | Bedankt voor uw bericht. Een van onze specialisten neemt binnen 1 werkdag contact met u op. | Merci pour votre message. L'un de nos spécialistes vous contactera dans un délai d'un jour ouvrable. | Thank you for your message. One of our specialists will contact you within 1 working day. |
| `formSuccessKicker` | Aanvraag ontvangen | Demande reçue | Request received |
| `formAskAgain` | Stel een nieuwe vraag | Posez une nouvelle question | Ask another question |
| `formErrorInvalidJson` | Ongeldige JSON. | JSON non valide. | Invalid JSON. |
| `formErrorRateLimit` | Te veel aanvragen. Probeer het over enkele minuten opnieuw. | Trop de demandes. Réessayez dans quelques minutes. | Too many requests. Please try again in a few minutes. |
| `formErrorSendFailed` | Verzenden mislukt. Probeer het later opnieuw of mail ons rechtstreeks. | L'envoi a échoué. Réessayez plus tard ou envoyez-nous un e-mail directement. | Sending failed. Please try again later or email us directly. |
| `formErrorInvalidRequest` | Ongeldige aanvraag. | Demande non valide. | Invalid request. |
| `formErrorInvalidEmail` | Voer een geldig e-mailadres in. | Saisissez une adresse e-mail valide. | Enter a valid email address. |
| `formErrorRequiredFirstname` | Voornaam is verplicht. | Le prénom est obligatoire. | First name is required. |
| `formErrorRequiredLastname` | Naam is verplicht. | Le nom est obligatoire. | Last name is required. |
| `formErrorRequiredSector` | Sector is verplicht. | Le secteur est obligatoire. | Sector is required. |
| `formErrorRequiredMessage` | Bericht is verplicht. | Le message est obligatoire. | Message is required. |
| `formErrorRequiredName` | Naam is verplicht. | Le nom est obligatoire. | Name is required. |
| `formErrorRequiredCompany` | Bedrijf is verplicht. | L'entreprise est obligatoire. | Company is required. |

### `formSectorOptions` (stabiele `value`, gelokaliseerde `label`)

| value | NL | FR | EN |
|-------|----|----|-----|
| `voeding` | Voeding | Alimentation | Food |
| `logistiek` | Logistiek | Logistique | Logistics |
| `chemie-industrie` | Chemie & industrie | Chimie & industrie | Chemicals & industry |
| `agro-industrie` | Agro-industrie | Agro-industrie | Agro-industry |
| `andere` | Andere | Autre | Other |

### Al aanwezig (unchanged in dry-run)

| Key | NL | FR | EN |
|-----|----|----|-----|
| `formFieldNameLabel` | Naam * | Nom * | Name * |
| `formFieldCompanyLabel` | Bedrijf * | Entreprise * | Company * |
| `formFieldEmailLabel` | E-mail * | E-mail * | Email * |
| `formDisclaimerText` | Uw gegevens worden uitsluitend gebruikt voor de behandeling van uw aanvraag. | Vos données sont utilisées uniquement pour le traitement de votre demande. | Your data will only be used to process your request. |
| `formPrivacyLinkLabel` | Privacybeleid | Politique de confidentialité | Privacy policy |
| `formSuccessMessage` | Bedankt, we nemen zo snel mogelijk contact met u op. | Merci, nous vous contacterons dans les plus brefs délais. | Thank you, we will contact you as soon as possible. |

Dry-run summary: **69 field-patches** pending over `uiLabels-nl` / `uiLabels-fr` / `uiLabels-en`.

---

## 3. Geen hardcoded NL meer in user-facing contact/CTA-flow

| Bestand | Status |
|---------|--------|
| `components/contact/ContactForm.tsx` | labels/sectors/errors via uiLabels + error-keys |
| `components/contact/ContactTemplate.tsx` | success kicker / ask again / thank-you via uiLabels |
| `components/sector/SectorCtaForm.tsx` | placeholders, disclaimer, success, errors via uiLabels |
| `app/api/contact/route.ts` | alleen `{ errorCode }` |
| `lib/contact/validate.ts` | alleen `errorCode` |
| `lib/contact/client.ts` | doorgeven van `errorCode` |
| `lib/contact/error-codes.ts` | nieuw |
| `lib/contact/resolve-error.ts` | nieuw |
| `types/uiLabels.ts` | keys + defaults + `mergeUILabels` voor `formSectorOptions` |
| `sanity/schemas/documents/uiLabels.ts` | schema-velden |
| `scripts/seed-ui-labels.ts` | PATCH_ON_EXISTING uitgebreid |
| `scripts/migrate-63-contact-labels.ts` | dry-run / write |

**Buiten user-facing scope (bewust):** `lib/contact/send-mail.ts` blijft NL voor interne mail naar Hobon.

**Buiten ticket:** lightbox aria, 404, privacy/cookies-pages, meta descriptions.

---

## 4. Volgende stappen (na goedkeuring)

1. `npm run migrate:63-contact-labels -- --write`
2. Commit + push (code + schema + scripts)
3. `vercel --prod`
4. Live test: FR-contactpagina — labels + bewust foute submit (error-vertaling)
