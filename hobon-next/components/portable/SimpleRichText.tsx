import { PortableText, type PortableTextComponents } from "@portabletext/react";

function componentsForVariant(variant: "default" | "onNavy"): PortableTextComponents {
  const onNavy = variant === "onNavy";
  return {
    block: {
      h2: ({ children }) => (
        <h2
          className={`mb-4 mt-10 font-[family-name:var(--f-head)] text-2xl font-semibold first:mt-0 ${onNavy ? "text-white" : "text-[var(--navy)]"}`}
        >
          {children}
        </h2>
      ),
      h3: ({ children }) => (
        <h3
          className={`mb-3 mt-8 font-[family-name:var(--f-head)] text-xl font-semibold ${onNavy ? "text-white/95" : "text-[var(--navy)]"}`}
        >
          {children}
        </h3>
      ),
      blockquote: ({ children }) => (
        <blockquote
          className={`border-l-4 border-[var(--orange)] pl-4 ${onNavy ? "text-white/55" : "text-[var(--mist)]"}`}
        >
          {children}
        </blockquote>
      ),
      normal: ({ children }) => (
        <p className={`mb-4 leading-relaxed last:mb-0 ${onNavy ? "text-white/65" : "text-[#5a5f72]"}`}>{children}</p>
      ),
    },
    list: {
      bullet: ({ children }) => (
        <ul className={`mb-4 list-disc pl-6 ${onNavy ? "text-white/65" : "text-[#5a5f72]"}`}>{children}</ul>
      ),
      number: ({ children }) => (
        <ol className={`mb-4 list-decimal pl-6 ${onNavy ? "text-white/65" : "text-[#5a5f72]"}`}>{children}</ol>
      ),
    },
    marks: {
      strong: ({ children }) => (
        <strong className={`font-semibold ${onNavy ? "text-white" : "text-[var(--navy)]"}`}>{children}</strong>
      ),
      em: ({ children }) => <em>{children}</em>,
      link: ({ children, value }) => (
        <a
          href={value?.href}
          className={`underline underline-offset-4 ${onNavy ? "text-[var(--orange)]" : "text-[var(--navy)]"}`}
        >
          {children}
        </a>
      ),
    },
  };
}

export function SimpleRichText({
  value,
  variant = "default",
}: {
  value: unknown;
  variant?: "default" | "onNavy";
}) {
  if (!value || !Array.isArray(value)) return null;
  return <PortableText value={value as never} components={componentsForVariant(variant)} />;
}
