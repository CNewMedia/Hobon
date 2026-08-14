import Link from "next/link";
import { headers } from "next/headers";
import { localeFromHeader, notFoundCopy } from "@/lib/i18n/not-found-copy";

export async function NotFoundView() {
  const h = await headers();
  const locale = localeFromHeader(h.get("x-locale"));
  const copy = notFoundCopy[locale];

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center bg-[var(--chalk)] px-6 py-24 text-center">
      <p className="font-[family-name:var(--f-head)] text-2xl font-semibold text-[var(--navy)]">{copy.title}</p>
      <Link href={`/${locale}/`} className="mt-6 text-[var(--navy)] underline underline-offset-4">
        {copy.home}
      </Link>
    </div>
  );
}
