"use client";

import { useMemo, type FormEvent } from "react";
import { ArrowBtnIcon } from "@/components/layout/icons";

export type ContactFormLabels = {
  firstname?: string | null;
  lastname?: string | null;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  sector?: string | null;
  message?: string | null;
};

const SECTOR_OPTIONS = [
  "Voeding",
  "Logistiek",
  "Chemie & industrie",
  "Agro-industrie",
  "Andere",
] as const;

function buildMailtoBody(labels: ContactFormLabels, fd: FormData) {
  const firstname = String(fd.get("firstname") ?? "").trim();
  const lastname = String(fd.get("lastname") ?? "").trim();
  const company = String(fd.get("company") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim();
  const phone = String(fd.get("phone") ?? "").trim();
  const sector = String(fd.get("sector") ?? "").trim();
  const message = String(fd.get("message") ?? "").trim();
  const L = (k: keyof ContactFormLabels, fallback: string) => labels[k] ?? fallback;
  return [
    `${L("firstname", "Voornaam")}: ${firstname}`,
    `${L("lastname", "Naam")}: ${lastname}`,
    `${L("company", "Bedrijf")}: ${company}`,
    `${L("email", "E-mail")}: ${email}`,
    `${L("phone", "Telefoon")}: ${phone}`,
    `${L("sector", "Sector")}: ${sector}`,
    "",
    `${L("message", "Bericht")}:`,
    message,
  ].join("\n");
}

export function ContactForm({
  recipientEmail,
  formFields,
  formTitle,
  formSubmitLabel,
  fallbackMailtoHref,
  onSubmitted,
}: {
  recipientEmail: string;
  formFields: ContactFormLabels;
  formTitle: string;
  formSubmitLabel: string;
  /** Minimal mailto when JS is disabled */
  fallbackMailtoHref: string;
  onSubmitted?: () => void;
}) {
  const labels = useMemo(() => formFields ?? {}, [formFields]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const firstname = String(fd.get("firstname") ?? "").trim();
    const lastname = String(fd.get("lastname") ?? "").trim();
    const subject = `Verpakkingsvraag van ${firstname} ${lastname}`.trim();
    const body = buildMailtoBody(labels, fd);
    const mailto = `mailto:${recipientEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    e.currentTarget.reset();
    onSubmitted?.();
    window.location.href = mailto;
  }

  const L = (k: keyof ContactFormLabels, fallback: string) => labels[k] ?? fallback;

  return (
    <form
      className="c-form"
      action={fallbackMailtoHref}
      method="get"
      encType="text/plain"
      onSubmit={onSubmit}
    >
      {formTitle ? <h2 className="c-form-title">{formTitle}</h2> : null}
      <div className="c-row">
        <div className="c-field">
          <label className="c-lbl" htmlFor="firstname">
            {L("firstname", "Voornaam")}
          </label>
          <input id="firstname" name="firstname" className="c-in" type="text" autoComplete="given-name" required />
        </div>
        <div className="c-field">
          <label className="c-lbl" htmlFor="lastname">
            {L("lastname", "Naam")}
          </label>
          <input id="lastname" name="lastname" className="c-in" type="text" autoComplete="family-name" required />
        </div>
      </div>
      <div className="c-row">
        <div className="c-field">
          <label className="c-lbl" htmlFor="company">
            {L("company", "Bedrijf")}
          </label>
          <input id="company" name="company" className="c-in" type="text" autoComplete="organization" />
        </div>
        <div className="c-field">
          <label className="c-lbl" htmlFor="email">
            {L("email", "E-mail")}
          </label>
          <input id="email" name="email" className="c-in" type="email" autoComplete="email" required />
        </div>
      </div>
      <div className="c-row">
        <div className="c-field">
          <label className="c-lbl" htmlFor="phone">
            {L("phone", "Telefoon")}
          </label>
          <input id="phone" name="phone" className="c-in" type="tel" autoComplete="tel" />
        </div>
        <div className="c-field">
          <label className="c-lbl" htmlFor="sector">
            {L("sector", "Sector")}
          </label>
          <select id="sector" name="sector" className="c-sel" required defaultValue="">
            <option value="" disabled>
              —
            </option>
            {SECTOR_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="c-row full">
        <div className="c-field">
          <label className="c-lbl" htmlFor="message">
            {L("message", "Bericht")}
          </label>
          <textarea id="message" name="message" className="c-ta" required />
        </div>
      </div>
      <div className="c-form-bottom">
        <div className="c-privacy-wrap">
          <p className="c-privacy">
            Door te verzenden opent u uw e-mailprogramma met een vooraf ingevulde e-mail. U kunt het bericht nog
            aanpassen voor u verzendt.
          </p>
        </div>
        <button type="submit" className="c-submit">
          <span>{formSubmitLabel}</span>
          <ArrowBtnIcon size={14} />
        </button>
      </div>
    </form>
  );
}
