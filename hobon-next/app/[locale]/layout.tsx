import { SiteEffects } from "@/components/site/SiteEffects";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import type { Locale } from "@/lib/i18n/config";
import { isLocale } from "@/lib/i18n/config";
import { client } from "@/lib/sanity/client";
import { urlFor } from "@/lib/sanity/image";
import { siteSettingsQuery } from "@/lib/sanity/queries";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return [{ locale: "nl" }, { locale: "fr" }, { locale: "en" }];
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  const settings = await client.fetch(siteSettingsQuery);
  const logoSrc = settings?.logo
    ? urlFor(settings.logo).width(320).url()
    : "/assets/images/logo.jpg";

  return (
    <>
      <SiteEffects />
      <SiteHeader locale={locale} logoSrc={logoSrc} />
      <main className="flex-1">{children}</main>
      <SiteFooter locale={locale} logoSrc={logoSrc} settings={settings} />
    </>
  );
}
