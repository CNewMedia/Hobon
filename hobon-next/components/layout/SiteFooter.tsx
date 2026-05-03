import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import { buildLocalizedPath } from "@/lib/i18n/paths";

type Settings = {
  hobonAddress?: string;
  phone?: string;
  email?: string;
} | null;

export function SiteFooter({
  locale,
  logoSrc,
  settings,
}: {
  locale: Locale;
  logoSrc: string;
  settings: Settings;
}) {
  const base = buildLocalizedPath(locale, []);
  const sectorsHref = buildLocalizedPath(locale, [{ type: "key", key: "sectors" }]);

  return (
    <footer>
      <div className="ft">
        <div>
          <Image src={logoSrc} alt="Hobon" width={160} height={44} className="ft-logo h-auto max-h-11 w-auto" />
          <p className="ft-tagline">
            De juiste folie voorkomt problemen. Verkeerde keuzes kosten u meer dan u denkt.
          </p>
        </div>
        <div>
          <div className="ft-col-h">Sectoren</div>
          <nav className="ft-links">
            <Link href={sectorsHref}>Alle sectoren</Link>
          </nav>
        </div>
        <div>
          <div className="ft-col-h">Producten</div>
          <nav className="ft-links">
            <Link href={`${base}#producten`}>Productoverzicht</Link>
          </nav>
        </div>
        <div>
          <div className="ft-col-h">Contact</div>
          <div className="ft-ci">
            <div className="ft-ci-l">Adres</div>
            <div className="ft-ci-v">
              {settings?.hobonAddress?.split("\n").map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              )) ?? (
                <>
                  Arisdonk 139
                  <br />
                  B-9950 Lievegem
                </>
              )}
            </div>
          </div>
          <div className="ft-ci">
            <div className="ft-ci-l">Telefoon</div>
            <div className="ft-ci-v">
              <a href={`tel:${(settings?.phone ?? "+3293774516").replace(/\s/g, "")}`}>
                {settings?.phone ?? "+32 9 377 45 16"}
              </a>
            </div>
          </div>
          <div className="ft-ci">
            <div className="ft-ci-l">E-mail</div>
            <div className="ft-ci-v">
              <a href={`mailto:${settings?.email ?? "info@hobon.be"}`}>
                {settings?.email ?? "info@hobon.be"}
              </a>
            </div>
          </div>
        </div>
      </div>
      <div className="ft-bottom">
        <p className="ft-copy">&copy; {new Date().getFullYear()} Hobon NV · Alle rechten voorbehouden</p>
        <div className="ft-brc">
          <div className="ft-brc-box">
            <span>
              BRC
              <br />
              AA
            </span>
          </div>
          <span className="ft-brc-txt">BRC Packaging Level AA</span>
        </div>
      </div>
    </footer>
  );
}
