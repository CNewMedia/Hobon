import Script from "next/script";

type Tracking = {
  googleAnalyticsId?: string | null;
  googleTagManagerId?: string | null;
  customHeadScripts?: string | null;
  customBodyEndScripts?: string | null;
  pageOverrides?: Array<{
    pagePath?: string | null;
    extraHeadScripts?: string | null;
    extraBodyEndScripts?: string | null;
  }> | null;
} | null;

function normalizePath(p: string): string {
  const s = p.startsWith("/") ? p : `/${p}`;
  if (s === "/") return "/";
  return s.replace(/\/+$/, "") || "/";
}

function pathsMatch(pattern: string, pathnameBare: string): boolean {
  return normalizePath(pattern) === normalizePath(pathnameBare);
}

export function SiteAnalytics({
  tracking,
  enabled,
  pathnameBare,
}: {
  tracking: Tracking;
  enabled: boolean;
  pathnameBare: string;
}) {
  if (!enabled || !tracking) return null;

  const bare = normalizePath(pathnameBare);
  const overrides =
    tracking.pageOverrides?.filter((o) => o?.pagePath && pathsMatch(o.pagePath, bare)) ?? [];

  const gtmId = tracking.googleTagManagerId?.trim();
  const gaId = tracking.googleAnalyticsId?.trim();
  const gtmSnippet = gtmId
    ? `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`
    : null;

  const ga4Head =
    gaId && !gtmId ? (
      <>
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
        <Script id="ga4-init" strategy="afterInteractive">
          {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}');
`}
        </Script>
      </>
    ) : null;

  return (
    <>
      {gtmSnippet ? (
        <Script id="gtm" strategy="afterInteractive" dangerouslySetInnerHTML={{ __html: gtmSnippet }} />
      ) : null}
      {ga4Head}
      {tracking.customHeadScripts?.trim() ? (
        <Script
          id="custom-head-global"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: tracking.customHeadScripts }}
        />
      ) : null}
      {overrides.map((o, i) =>
        o.extraHeadScripts?.trim() ? (
          <Script
            key={`ov-head-${i}`}
            id={`custom-head-override-${i}`}
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: o.extraHeadScripts }}
          />
        ) : null,
      )}
      {tracking.customBodyEndScripts?.trim() ? (
        <Script
          id="custom-body-global"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: tracking.customBodyEndScripts }}
        />
      ) : null}
      {overrides.map((o, i) =>
        o.extraBodyEndScripts?.trim() ? (
          <Script
            key={`ov-body-${i}`}
            id={`custom-body-override-${i}`}
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{ __html: o.extraBodyEndScripts }}
          />
        ) : null,
      )}
    </>
  );
}

export function GtmNoScript({ tracking, enabled }: { tracking: Tracking; enabled: boolean }) {
  if (!enabled || !tracking?.googleTagManagerId?.trim()) return null;
  const id = tracking.googleTagManagerId.trim();
  return (
    <noscript>
      <iframe
        title="Google Tag Manager"
        src={`https://www.googletagmanager.com/ns.html?id=${id}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}
