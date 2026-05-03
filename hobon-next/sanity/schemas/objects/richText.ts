import { defineArrayMember, defineField, defineType } from "sanity";

export const richText = defineType({
  name: "richText",
  title: "Rich text",
  type: "array",
  of: [
    defineArrayMember({
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
        { title: "Quote", value: "blockquote" },
      ],
      lists: [
        { title: "Bullet", value: "bullet" },
        { title: "Numbered", value: "number" },
      ],
      marks: {
        decorators: [
          { title: "Strong", value: "strong" },
          { title: "Emphasis", value: "em" },
        ],
        annotations: [
          {
            name: "link",
            type: "object",
            title: "Link",
            fields: [
              defineField({
                name: "href",
                type: "url",
                title: "URL",
                validation: (Rule) =>
                  Rule.uri({ allowRelative: true, scheme: ["http", "https", "mailto", "tel"] }),
              }),
            ],
          },
        ],
      },
    }),
    defineArrayMember({
      type: "image",
      options: { hotspot: true },
      fields: [defineField({ name: "alt", type: "string", title: "Alt" })],
    }),
  ],
});
