import { PortableText, type PortableTextComponents } from "@portabletext/react";

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="mb-4 mt-10 font-[family-name:var(--f-head)] text-2xl font-semibold text-[var(--navy)] first:mt-0">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mb-3 mt-8 font-[family-name:var(--f-head)] text-xl font-semibold text-[var(--navy)]">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-[var(--orange)] pl-4 text-[var(--mist)]">{children}</blockquote>
    ),
    normal: ({ children }) => <p className="mb-4 leading-relaxed text-[#5a5f72] last:mb-0">{children}</p>,
  },
  list: {
    bullet: ({ children }) => <ul className="mb-4 list-disc pl-6 text-[#5a5f72]">{children}</ul>,
    number: ({ children }) => <ol className="mb-4 list-decimal pl-6 text-[#5a5f72]">{children}</ol>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-[var(--navy)]">{children}</strong>,
    em: ({ children }) => <em>{children}</em>,
    link: ({ children, value }) => (
      <a href={value?.href} className="text-[var(--navy)] underline underline-offset-4">
        {children}
      </a>
    ),
  },
};

export function SimpleRichText({ value }: { value: unknown }) {
  if (!value || !Array.isArray(value)) return null;
  return <PortableText value={value as never} components={components} />;
}
