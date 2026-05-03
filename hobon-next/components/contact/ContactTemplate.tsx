/* eslint-disable @next/next/no-img-element */
import { ContactForm, type ContactFormLabels } from "@/components/contact/ContactForm";
import { SimpleRichText } from "@/components/portable/SimpleRichText";

export type ContactPageDoc = {
  hero?: { headline?: string | null; subline?: string | null } | null;
  intro?: string | null;
  formTitle?: string | null;
  formSubmitLabel?: string | null;
  formThankYouMessage?: string | null;
  formFields?: ContactFormLabels | null;
  additionalInfo?: unknown;
};

export type SiteSettingsContact = {
  formRecipientEmail?: string | null;
  locations?: {
    _key?: string;
    name?: string | null;
    streetAddress?: string | null;
    postalCode?: string | null;
    city?: string | null;
    country?: string | null;
    phone?: string | null;
    email?: string | null;
  }[] | null;
};

export function ContactTemplate({
  contactPage,
  siteSettings,
}: {
  contactPage: ContactPageDoc | null;
  siteSettings: SiteSettingsContact | null;
}) {
  const recipient = (siteSettings?.formRecipientEmail ?? "info@hobon.be").trim();
  const fallbackMailto = `mailto:${recipient}?subject=${encodeURIComponent("Verpakkingsvraag via hobon.be")}`;
  const hero = contactPage?.hero;
  const locations = siteSettings?.locations ?? [];

  return (
    <div className="c-page">
      <div className="c-hero">
        <div className="c-hero-l">
          <div className="c-eyebrow">
            <div className="c-eyebrow-line" aria-hidden />
            <span className="c-eyebrow-txt">Contact</span>
          </div>
          {hero?.headline ? (
            <h1 className="c-h1">
              {hero.headline}
              {hero.subline ? <span className="muted">{hero.subline}</span> : null}
            </h1>
          ) : (
            <h1 className="c-h1">Contact</h1>
          )}
          {contactPage?.intro ? <p className="c-intro">{contactPage.intro}</p> : null}

          <ContactForm
            recipientEmail={recipient}
            formFields={contactPage?.formFields ?? {}}
            formTitle={contactPage?.formTitle ?? ""}
            formSubmitLabel={contactPage?.formSubmitLabel ?? "Verstuur"}
            fallbackMailtoHref={fallbackMailto}
          />

          {contactPage?.formThankYouMessage ? (
            <p className="c-additional text-sm text-[#5a5f72]" role="note">
              {contactPage.formThankYouMessage}
            </p>
          ) : null}

          {contactPage?.additionalInfo ? (
            <div className="c-additional">
              <SimpleRichText value={contactPage.additionalInfo} />
            </div>
          ) : null}
        </div>

        <div className="c-hero-r">
          <div className="c-hero-r-dots" aria-hidden />
          <div className="c-locs">
            {locations.map((loc) => {
              const addr = [loc.streetAddress, [loc.postalCode, loc.city].filter(Boolean).join(" "), loc.country]
                .filter(Boolean)
                .join(", ");
              return (
                <div key={loc._key ?? loc.name} className="c-loc">
                  <div className="c-loc-map" aria-hidden>
                    <span className="c-loc-map-ph">Kaart — later</span>
                  </div>
                  <div className="c-loc-body">
                    {loc.name ? <div className="c-loc-name">{loc.name}</div> : null}
                    {addr ? <div className="c-loc-line">{addr}</div> : null}
                    {loc.phone ? (
                      <div className="c-loc-line">
                        <a href={`tel:${loc.phone.replace(/\s/g, "")}`}>{loc.phone}</a>
                      </div>
                    ) : null}
                    {loc.email ? (
                      <div className="c-loc-line">
                        <a href={`mailto:${loc.email}`}>{loc.email}</a>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
