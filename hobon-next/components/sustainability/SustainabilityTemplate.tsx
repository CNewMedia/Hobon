import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { resolveInternalHref } from "@/lib/sanity/resolveInternalHref";
import { SimpleRichText } from "@/components/portable/SimpleRichText";
import { ArrowBtnIcon } from "@/components/layout/icons";

export type SustainabilityPageDoc = {
  hero?: { headline?: string | null; subline?: string | null } | null;
  standpoint?: { headline?: string | null; body?: unknown } | null;
  practicePoints?: { title?: string | null; body?: unknown }[] | null;
  cta?: {
    title?: string | null;
    buttonLabel?: string | null;
    buttonLink?: { _type?: string; slug?: string | null } | null;
  } | null;
};

export function SustainabilityTemplate({
  locale,
  sustainabilityPage,
}: {
  locale: Locale;
  sustainabilityPage: SustainabilityPageDoc | null;
}) {
  const hero = sustainabilityPage?.hero;
  const ctaHref = resolveInternalHref(locale, sustainabilityPage?.cta?.buttonLink ?? null);

  return (
    <div className="sus-page">
      <section className="sus-hero">
        {hero?.headline ? <h1 className="sus-hero-h1">{hero.headline}</h1> : <h1 className="sus-hero-h1">Duurzaamheid</h1>}
        {hero?.subline ? <p className="sus-hero-sub">{hero.subline}</p> : null}
      </section>

      {sustainabilityPage?.standpoint?.headline || sustainabilityPage?.standpoint?.body ? (
        <section className="sus-stand">
          <div className="sus-stand-inner">
            {sustainabilityPage.standpoint.headline ? (
              <h2 className="sus-stand-h2">{sustainabilityPage.standpoint.headline}</h2>
            ) : null}
            <div className="sus-stand-body">
              <SimpleRichText value={sustainabilityPage.standpoint.body} variant="onNavy" />
            </div>
          </div>
        </section>
      ) : null}

      {(sustainabilityPage?.practicePoints?.length ?? 0) > 0 ? (
        <section className="sus-points">
          <div className="sus-points-grid">
            {(sustainabilityPage?.practicePoints ?? []).map((p, i) => (
              <div key={`${p.title ?? i}`} className="sus-point">
                <span className="sus-point-num">{i + 1}</span>
                {p.title ? <h3 className="sus-point-h3">{p.title}</h3> : null}
                <div className="sus-point-body">
                  <SimpleRichText value={p.body} />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {sustainabilityPage?.cta?.title ? (
        <section className="cta-band">
          <div className="cta-inner" style={{ gridTemplateColumns: "1fr" }}>
            <div>
              <h2 className="cta-h2">{sustainabilityPage.cta.title}</h2>
              {ctaHref && sustainabilityPage.cta.buttonLabel ? (
                <Link href={ctaHref} className="btn-primary">
                  <span>{sustainabilityPage.cta.buttonLabel}</span>
                  <ArrowBtnIcon size={14} />
                </Link>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
