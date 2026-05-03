export function MinimalPage({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-[var(--chalk)] px-6 py-20 md:px-[52px] md:py-28">
      <h1 className="font-[family-name:var(--f-head)] text-[clamp(32px,4vw,48px)] font-bold leading-[0.98] tracking-[-0.02em] text-[var(--navy)]">
        {title}
      </h1>
      <div className="mt-8 max-w-3xl">{children}</div>
    </section>
  );
}
