import type { Metadata } from "next";
import { DM_Sans, Geist } from "next/font/google";
import { draftMode } from "next/headers";
import { headers } from "next/headers";
import Script from "next/script";
import { DraftVisualEditing } from "@/components/sanity/DraftVisualEditing";
import { cookiebotCulture, getCookiebotCbid } from "@/lib/cookiebot";
import "./globals.css";
import "./hobon-mock.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: { default: "Hobon", template: "%s | Hobon" },
  description: "PE-verpakkingsfolie op maat",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const h = await headers();
  const locale = h.get("x-locale") ?? "nl";
  const cookiebotCbid = getCookiebotCbid();
  let draftEnabled = false;
  try {
    draftEnabled = (await draftMode()).isEnabled;
  } catch {
    draftEnabled = false;
  }

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      className={`${geist.variable} ${dmSans.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        {cookiebotCbid ? (
          <Script
            id="Cookiebot"
            src="https://consent.cookiebot.com/uc.js"
            data-cbid={cookiebotCbid}
            data-blockingmode="auto"
            data-culture={cookiebotCulture(locale)}
            strategy="beforeInteractive"
          />
        ) : null}
        {children}
        {draftEnabled ? <DraftVisualEditing /> : null}
      </body>
    </html>
  );
}
