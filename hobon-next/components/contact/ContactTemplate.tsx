"use client";

/* eslint-disable @next/next/no-img-element */
import { ContactForm, type ContactFormLabels } from "@/components/contact/ContactForm";
import { HeroMediaPanel } from "@/components/hero/HeroMedia";
import type { HeroMediaData } from "@/components/hero/heroMediaTypes";
import { hasHeroMedia } from "@/components/hero/heroMediaTypes";
import { SimpleRichText } from "@/components/portable/SimpleRichText";
import { resolveImageSrc } from "@/lib/sanity/resolveImageSrc";
import { useUILabels } from "@/components/providers/UILabelsProvider";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export type ContactPageDoc = {
  hero?: { headline?: string | null; subline?: string | null } | null;
  heroMedia?: HeroMediaData;
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
    mapImage?: { image?: unknown; alt?: string | null } | null;
  }[] | null;
};

type LocationRow = NonNullable<SiteSettingsContact["locations"]>[number];

const FALLBACK_SUCCESS_MESSAGE =
  "Bedankt voor uw bericht. Een van onze specialisten neemt binnen 1 werkdag contact met u op.";

function LocationCards({
  locations,
  mapPlaceholder,
}: {
  locations: LocationRow[];
  mapPlaceholder: string;
}) {
  return (
    <div className="c-locs">
      {locations.map((loc) => {
        const addr = [loc.streetAddress, [loc.postalCode, loc.city].filter(Boolean).join(" "), loc.country]
          .filter(Boolean)
          .join(", ");
        const mapImage = resolveImageSrc(loc.mapImage, { width: 640, quality: 82 });
        return (
          <div key={loc._key ?? loc.name} className="c-loc">
            <div className="c-loc-map">
              {mapImage.src ? (
                <img
                  className="c-loc-map-img"
                  src={mapImage.src}
                  alt={mapImage.alt || loc.name || ""}
                  loading="lazy"
                />
              ) : (
                <span className="c-loc-map-ph">{mapPlaceholder}</span>
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
  );
}

export function ContactTemplate({
  contactPage,
  siteSettings,
}: {
  contactPage: ContactPageDoc | null;
  siteSettings: SiteSettingsContact | null;
}) {
  const labels = useUILabels();
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "nl";
  const [submitted, setSubmitted] = useState(false);
  const hero = contactPage?.hero;
  const locations = siteSettings?.locations ?? [];
  const splitHero = hasHeroMedia(contactPage?.heroMedia);
  const headline = hero?.headline?.trim() || labels.listingContact;
  const subline = hero?.subline?.trim() || "";

  useEffect(() => {
    const resetSubmitted = () => setSubmitted(false);
    resetSubmitted();
    window.addEventListener("pageshow", resetSubmitted);
    return () => window.removeEventListener("pageshow", resetSubmitted);
  }, []);

  return (
    <div className={`c-page${splitHero ? " c-page--split-hero" : ""}`}>
      {splitHero ? (
        <section className="s-hero listing-overview-hero c-hero-band">
          <div className="s-hero-dots" aria-hidden="true" />
          <div className="s-hero-glow" aria-hidden="true" />
          <div className="s-hero-l listing-overview-hero-l">
            <div className="s-hero-eyebrow">
              <div className="s-hero-eyebrow-line" aria-hidden="true" />
              <span className="s-hero-eyebrow-txt">{labels.listingContact}</span>
            </div>
            <h1 className="s-hero-h1 listing-overview-h1">{headline}</h1>
            {subline ? <p className="s-hero-intro">{subline}</p> : null}
          </div>
          <HeroMediaPanel media={contactPage?.heroMedia} />
        </section>
      ) : (
        <section className="c-hero-fallback">
          <div className="c-eyebrow">
            <div className="c-eyebrow-line" aria-hidden />
            <span className="c-eyebrow-txt">{labels.listingContact}</span>
          </div>
          <h1 className="c-h1">{headline}</h1>
          {subline ? <p className="c-intro">{subline}</p> : null}
        </section>
      )}

      <section className="c-body">
        <div className="c-body-l">
          {contactPage?.intro ? <p className="c-intro">{contactPage.intro}</p> : null}

          {submitted ? (
            <div className="c-success" role="status" aria-live="polite">
              <div className="c-success-kicker">Aanvraag ontvangen</div>
              <p className="c-success-text">
                {contactPage?.formThankYouMessage?.trim() ||
                  labels.formSuccessMessage ||
                  FALLBACK_SUCCESS_MESSAGE}
              </p>
              <button type="button" className="c-success-link" onClick={() => setSubmitted(false)}>
                Stel een nieuwe vraag
              </button>
            </div>
          ) : (
            <ContactForm
              formFields={contactPage?.formFields ?? {}}
              formTitle={contactPage?.formTitle ?? ""}
              formSubmitLabel={contactPage?.formSubmitLabel ?? labels.formSubmitLabel}
              formDisclaimerText={labels.formDisclaimerText}
              formPrivacyHref={`/${locale}/privacy`}
              formPrivacyLinkLabel={labels.formPrivacyLinkLabel}
              onSubmitted={() => setSubmitted(true)}
            />
          )}

          {contactPage?.additionalInfo ? (
            <div className="c-additional">
              <SimpleRichText value={contactPage.additionalInfo} />
            </div>
          ) : null}
        </div>

        <div className="c-body-r">
          <LocationCards locations={locations} mapPlaceholder={labels.uiContactMapPlaceholder} />
        </div>
      </section>
    </div>
  );
}
