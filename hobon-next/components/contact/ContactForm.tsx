"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { ArrowBtnIcon } from "@/components/layout/icons";
import { useUILabels } from "@/components/providers/UILabelsProvider";
import { submitContactForm } from "@/lib/contact/client";
import { resolveContactErrorLabel } from "@/lib/contact/resolve-error";

export type ContactFormLabels = {
  firstname?: string | null;
  lastname?: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  sector?: string | null;
  message?: string | null;
};

export function ContactForm({
  formFields,
  formTitle,
  formSubmitLabel,
  formDisclaimerText,
  formPrivacyHref,
  formPrivacyLinkLabel,
  onSubmitted,
}: {
  formFields: ContactFormLabels;
  formTitle: string;
  formSubmitLabel: string;
  formDisclaimerText?: string;
  formPrivacyHref?: string;
  formPrivacyLinkLabel?: string;
  onSubmitted?: () => void;
}) {
  const ui = useUILabels();
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "nl";
  const labels = useMemo(() => formFields ?? {}, [formFields]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = e.currentTarget;
    const fd = new FormData(form);
    const sectorValue = String(fd.get("sector") ?? "");
    const sectorLabel =
      ui.formSectorOptions.find((opt) => opt.value === sectorValue)?.label || sectorValue;

    const result = await submitContactForm({
      source: "contact",
      locale,
      firstname: String(fd.get("firstname") ?? ""),
      lastname: String(fd.get("lastname") ?? ""),
      company: String(fd.get("company") ?? ""),
      email: String(fd.get("email") ?? ""),
      phone: String(fd.get("phone") ?? ""),
      sector: sectorLabel,
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""),
    });

    setSubmitting(false);

    if (!result.ok) {
      setError(resolveContactErrorLabel(ui, result.errorCode));
      return;
    }

    form.reset();
    onSubmitted?.();
  }

  const L = (k: keyof ContactFormLabels, fallback: string) => labels[k] ?? fallback;

  return (
    <form className="c-form" onSubmit={onSubmit} noValidate>
      {formTitle ? <h2 className="c-form-title">{formTitle}</h2> : null}
      <div className="c-row">
        <div className="c-field">
          <label className="c-lbl" htmlFor="firstname">
            {L("firstname", ui.formFieldFirstnameLabel)}
          </label>
          <input id="firstname" name="firstname" className="c-in" type="text" autoComplete="given-name" required />
        </div>
        <div className="c-field">
          <label className="c-lbl" htmlFor="lastname">
            {L("lastname", ui.formFieldLastnameLabel)}
          </label>
          <input id="lastname" name="lastname" className="c-in" type="text" autoComplete="family-name" required />
        </div>
      </div>
      <div className="c-row">
        <div className="c-field">
          <label className="c-lbl" htmlFor="company">
            {L("company", ui.formFieldCompanyLabel.replace(/\s*\*$/, ""))}
          </label>
          <input id="company" name="company" className="c-in" type="text" autoComplete="organization" />
        </div>
        <div className="c-field">
          <label className="c-lbl" htmlFor="email">
            {L("email", ui.formFieldEmailLabel.replace(/\s*\*$/, ""))}
          </label>
          <input id="email" name="email" className="c-in" type="email" autoComplete="email" required />
        </div>
      </div>
      <div className="c-row">
        <div className="c-field">
          <label className="c-lbl" htmlFor="phone">
            {L("phone", ui.formFieldPhoneLabel)}
          </label>
          <input id="phone" name="phone" className="c-in" type="tel" autoComplete="tel" />
        </div>
        <div className="c-field">
          <label className="c-lbl" htmlFor="sector">
            {L("sector", ui.formFieldSectorLabel)}
          </label>
          <select id="sector" name="sector" className="c-sel" required defaultValue="">
            <option value="" disabled>
              —
            </option>
            {ui.formSectorOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="c-row full">
        <div className="c-field">
          <label className="c-lbl" htmlFor="message">
            {L("message", ui.formFieldMessageLabel)}
          </label>
          <textarea id="message" name="message" className="c-ta" required />
        </div>
      </div>
      <div className="c-hp" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="c-form-bottom">
        <div className="c-privacy-wrap">
          {error ? (
            <p className="c-form-error" role="alert">
              {error}
            </p>
          ) : null}
          <p className="c-privacy">
            {formDisclaimerText || ui.formDisclaimerText}
            {formPrivacyHref ? (
              <>
                {" "}
                <a href={formPrivacyHref}>{formPrivacyLinkLabel || ui.formPrivacyLinkLabel}</a>.
              </>
            ) : null}
          </p>
        </div>
        <button type="submit" className="c-submit" disabled={submitting}>
          <span>{submitting ? "…" : formSubmitLabel}</span>
          <ArrowBtnIcon size={14} />
        </button>
      </div>
    </form>
  );
}
