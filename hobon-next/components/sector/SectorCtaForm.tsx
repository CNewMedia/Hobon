"use client";

import { useState } from "react";
import { ArrowBtnIcon } from "@/components/layout/icons";

export function SectorCtaForm() {
  const [sent, setSent] = useState(false);

  if (sent) {
    return (
      <div
        id="cta-success"
        className="flex min-h-[320px] flex-col items-center justify-center gap-3 rounded-md border border-[var(--rule-lt)] bg-[var(--chalk)] p-8 text-center"
      >
        <p className="font-[family-name:var(--f-head)] text-lg font-semibold text-[var(--navy)]">
          Bedankt — we nemen contact op.
        </p>
        <p className="text-sm text-[var(--mist)]">[TODO: copy invullen — bevestiging na formulier]</p>
      </div>
    );
  }

  return (
    <form
      id="cta-form"
      className="cf"
      onSubmit={(e) => {
        e.preventDefault();
        setSent(true);
      }}
    >
      <div className="cf-row">
        <div className="cf-field">
          <label className="cf-lbl" htmlFor="cfn">
            Naam *
          </label>
          <input className="cf-in" id="cfn" type="text" placeholder="Jan Janssen" required />
        </div>
        <div className="cf-field">
          <label className="cf-lbl" htmlFor="cfb">
            Bedrijf *
          </label>
          <input className="cf-in" id="cfb" type="text" placeholder="Uw bedrijfsnaam" required />
        </div>
      </div>
      <div className="cf-row">
        <div className="cf-field">
          <label className="cf-lbl" htmlFor="cfe">
            E-mail *
          </label>
          <input className="cf-in" id="cfe" type="email" placeholder="jan@bedrijf.be" required />
        </div>
        <div className="cf-field">
          <label className="cf-lbl" htmlFor="cft">
            Ik zoek...
          </label>
          <select className="cf-sel" id="cft" defaultValue="">
            <option value="" disabled>
              Kies een optie
            </option>
            <option>Technisch advies food-folie</option>
            <option>BRC-gecertificeerd alternatief</option>
            <option>Oplossing voor lijnbreuk</option>
            <option>Recyclaat-oplossing food</option>
            <option>Offerte aanvragen</option>
            <option>Andere vraag</option>
          </select>
        </div>
      </div>
      <div className="cf-row">
        <div className="cf-field full">
          <label className="cf-lbl" htmlFor="cfm">
            Uw uitdaging of machine
          </label>
          <textarea
            className="cf-ta"
            id="cfm"
            placeholder="Beschrijf uw machine, lijnsnelheid, product of probleem. Hoe meer detail, hoe sneller en gerichter ons advies."
          />
        </div>
      </div>
      <div className="cf-bottom">
        <button className="cf-btn" type="submit">
          <span>Vraag versturen</span>
          <ArrowBtnIcon size={14} />
        </button>
      </div>
      <div className="cf-privacy">
        Uw gegevens worden uitsluitend gebruikt voor de behandeling van uw aanvraag.{" "}
        <a href="#">Privacybeleid</a>.
      </div>
    </form>
  );
}
