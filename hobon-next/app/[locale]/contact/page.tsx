import { ContactTemplate } from "@/components/contact/ContactTemplate";
import type { Locale } from "@/lib/i18n/config";
import { fetchSanity } from "@/lib/sanity/fetchSanity";
import { contactPageQuery, siteSettingsQuery } from "@/lib/sanity/queries";
import { getSeoDefaults } from "@/lib/sanity/seoDefaults";
import { buildPageMetadata } from "@/lib/seo/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const loc = locale as Locale;
  const [doc, defaults] = await Promise.all([
    fetchSanity(contactPageQuery, { locale }),
    getSeoDefaults(loc),
  ]);
  return buildPageMetadata({
    locale: loc,
    seo: doc?.seo ?? null,
    pathParts: [{ type: "key", key: "contact" }],
    defaults,
  });
}

export default async function ContactPageRoute({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const [contactPage, siteSettings] = await Promise.all([
    fetchSanity(contactPageQuery, { locale }),
    fetchSanity(siteSettingsQuery),
  ]);
  const initialContactPage = contactPage
    ? {
        ...contactPage,
        formThankYouMessage: null,
      }
    : null;

  return <ContactTemplate contactPage={initialContactPage} siteSettings={siteSettings} />;
}
