"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowBtnIcon } from "@/components/layout/icons";
import { useUILabels } from "@/components/providers/UILabelsProvider";
import { submitContactForm } from "@/lib/contact/client";

const ERROR_FALLBACK: Record<string, string> = {
  nl: "Verzenden mislukt. Probeer het opnieuw of mail ons rechtstreeks.",
  fr: "L'envoi a échoué. Réessayez ou contactez-nous directement par e-mail.",
  en: "Sending failed. Please try again or email us directly.",
};

export function SectorCtaForm() {
  const labels = useUILabels();
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "nl";
  const privacyHref = `/${locale}/privacy`;
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const resetSent = () => setSent(false);
    resetSent();
    window.addEventListener("pageshow", resetSent);
    return () => window.removeEventListener("pageshow", resetSent);
  }, []);

  if (sent) {
    return (
      <div id="cta-success" className="cf-success" role="status" aria-live="polite">
        <div className="cf-success-kicker">Aanvraag ontvangen</div>
        <p className="cf-success-text">{labels.formSuccessMessage}</p>
        <button type="button" className="cf-success-link" onClick={() => setSent(false)}>
          Stel een nieuwe vraag
        </button>
      </div>
    );
  }

  return (
    <form
      id="cta-form"
      className="cf"
      noValidate
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        setSubmitting(true);

        const form = e.currentTarget;
        const fd = new FormData(form);
        const intentValue = String(fd.get("intent") ?? "");
        const intentLabel =
          labels.formIntentOptions.find((opt) => opt.value === intentValue)?.label || intentValue;

        const result = await submitContactForm({
          source: "cta",
          locale,
          name: String(fd.get("name") ?? ""),
          company: String(fd.get("company") ?? ""),
          email: String(fd.get("email") ?? ""),
          intent: intentValue || undefined,
          intentLabel: intentLabel || undefined,
          message: String(fd.get("message") ?? ""),
          website: String(fd.get("website") ?? ""),
        });

        setSubmitting(false);

        if (!result.ok) {
          setError(result.error || ERROR_FALLBACK[locale] || ERROR_FALLBACK.nl);
          return;
        }

        form.reset();
        setSent(true);
      }}
    >
      <div className="cf-row">
        <div className="cf-field">
          <label className="cf-lbl" htmlFor="cfn">
            {labels.formFieldNameLabel}
          </label>
          <input className="cf-in" id="cfn" name="name" type="text" placeholder="Jan Janssen" required />
        </div>
        <div className="cf-field">
          <label className="cf-lbl" htmlFor="cfb">
            {labels.formFieldCompanyLabel}
          </label>
          <input className="cf-in" id="cfb" name="company" type="text" placeholder="Uw bedrijfsnaam" required />
        </div>
      </div>
      <div className="cf-row">
        <div className="cf-field">
          <label className="cf-lbl" htmlFor="cfe">
            {labels.formFieldEmailLabel}
          </label>
          <input className="cf-in" id="cfe" name="email" type="email" placeholder="jan@bedrijf.be" required />
        </div>
        <div className="cf-field">
          <label className="cf-lbl" htmlFor="cft">
            {labels.formIntentLabel}
          </label>
          <select className="cf-sel" id="cft" name="intent" defaultValue="">
            <option value="" disabled>
              {labels.formIntentPlaceholder}
            </option>
            {labels.formIntentOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="cf-row">
        <div className="cf-field full">
          <label className="cf-lbl" htmlFor="cfm">
            {labels.formFieldChallengeLabel}
          </label>
          <textarea
            className="cf-ta"
            id="cfm"
            name="message"
            placeholder={labels.formChallengePlaceholder}
          />
        </div>
      </div>
      <div className="c-hp" aria-hidden="true">
        <label htmlFor="cta-website">Website</label>
        <input id="cta-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      {error ? (
        <p className="cf-form-error" role="alert">
          {error}
        </p>
      ) : null}
      <div className="cf-bottom">
        <button className="cf-btn" type="submit" disabled={submitting}>
          <span>{submitting ? "…" : labels.formSubmitLabel}</span>
          <ArrowBtnIcon size={14} />
        </button>
      </div>
      <div className="cf-privacy">
        {labels.formDisclaimerText}{" "}
        <a href={privacyHref}>{labels.formPrivacyLinkLabel}</a>.
      </div>
    </form>
  );
}
