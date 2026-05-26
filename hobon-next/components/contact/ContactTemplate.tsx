"use client";

/* eslint-disable @next/next/no-img-element */
import { ContactForm, type ContactFormLabels } from "@/components/contact/ContactForm";
import { HeroMediaPanel } from "@/components/hero/HeroMedia";
import type { HeroMediaData } from "@/components/hero/heroMediaTypes";
import { SimpleRichText } from "@/components/portable/SimpleRichText";
import { useUILabels } from "@/components/providers/UILabelsProvider";
import { useEffect, useState } from "react";

export type ContactPageDoc = {
  hero?: { headline?: string | null; subline?: string | null } | null;
  heroMedia?: HeroMediaData;
  intro?: string | null;
  formTitle?: string | null;
  formSubmitLabel?: string | null;
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

const MOCK_SUCCESS_MESSAGE =
  "Bedankt voor uw bericht. Een van onze specialisten neemt binnen 1 werkdag contact met u op.";

function getLocationMapImage(name?: string | null, index?: number) {
  const normalized = name?.toLowerCase() ?? "";
  if (normalized.includes("vhp") || normalized.includes("roeselare") || index === 1) {
    return { src: "/assets/images/vhp_map.jpg", alt: "Kaart van VHP Roeselare" };
  }
  if (normalized.includes("hobon") || normalized.includes("lievegem") || index === 0) {
    return { src: "/assets/images/hobon_map.jpg", alt: "Kaart van Hobon Lievegem" };
  }
  return null;
}

export function ContactTemplate({
  contactPage,
  siteSettings,
}: {
  contactPage: ContactPageDoc | null;
  siteSettings: SiteSettingsContact | null;
}) {
  const labels = useUILabels();
  const [submitted, setSubmitted] = useState(false);
  const hero = contactPage?.hero;
  const locations = siteSettings?.locations ?? [];

  useEffect(() => {
    const resetSubmitted = () => setSubmitted(false);
    resetSubmitted();
    window.addEventListener("pageshow", resetSubmitted);
    return () => window.removeEventListener("pageshow", resetSubmitted);
  }, []);

  return (
    <div className="c-page">
      <div className="c-hero">
        <div className="c-hero-l">
          <div className="c-eyebrow">
            <div className="c-eyebrow-line" aria-hidden />
            <span className="c-eyebrow-txt">{labels.listingContact}</span>
          </div>
          {hero?.headline ? (
            <h1 className="c-h1">
              {hero.headline}
              {hero.subline ? <span className="muted">{hero.subline}</span> : null}
            </h1>
          ) : (
            <h1 className="c-h1">{labels.listingContact}</h1>
          )}
          {contactPage?.intro ? <p className="c-intro">{contactPage.intro}</p> : null}

          {submitted ? (
            <div className="c-success" role="status" aria-live="polite">
              <div className="c-success-kicker">Aanvraag ontvangen</div>
              <p className="c-success-text">{MOCK_SUCCESS_MESSAGE}</p>
              <button type="button" className="c-success-link" onClick={() => setSubmitted(false)}>
                Stel een nieuwe vraag
              </button>
            </div>
          ) : (
            <ContactForm
              formFields={contactPage?.formFields ?? {}}
              formTitle={contactPage?.formTitle ?? ""}
              formSubmitLabel={contactPage?.formSubmitLabel ?? labels.formSubmitLabel}
              onSubmitted={() => setSubmitted(true)}
            />
          )}

          {contactPage?.additionalInfo ? (
            <div className="c-additional">
              <SimpleRichText value={contactPage.additionalInfo} />
            </div>
          ) : null}
        </div>

        <div className="c-hero-r">
          <HeroMediaPanel
            media={contactPage?.heroMedia}
            className="page-hero-media s-hero-r listing-overview-hero-r c-hero-media-panel"
          />
          <div className="c-hero-r-dots" aria-hidden />
          <div className="c-locs">
            {locations.map((loc, index) => {
              const addr = [loc.streetAddress, [loc.postalCode, loc.city].filter(Boolean).join(" "), loc.country]
                .filter(Boolean)
                .join(", ");
              const mapImage = getLocationMapImage(loc.name, index);
              return (
                <div key={loc._key ?? loc.name} className="c-loc">
                  <div className="c-loc-map">
                    {mapImage ? (
                      <img className="c-loc-map-img" src={mapImage.src} alt={mapImage.alt} loading="lazy" />
                    ) : (
                      <span className="c-loc-map-ph">{labels.uiContactMapPlaceholder}</span>
                    )}
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
