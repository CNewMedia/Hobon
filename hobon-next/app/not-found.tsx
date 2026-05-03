import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center bg-[var(--chalk)] px-6 py-24 text-center">
      <p className="font-[family-name:var(--f-head)] text-2xl font-semibold text-[var(--navy)]">
        Pagina niet gevonden
      </p>
      <Link href="/nl/" className="mt-6 text-[var(--navy)] underline underline-offset-4">
        Terug naar home
      </Link>
    </div>
  );
}
