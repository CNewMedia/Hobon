import { defineField, defineType } from "sanity";
import { INTERNAL_LINK_TO } from "../constants";

export const menuItem = defineType({
  name: "menuItem",
  title: "Menu item",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Label",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "linkType",
      title: "Link type",
      type: "string",
      initialValue: "internal",
      options: {
        list: [
          { title: "Internal", value: "internal" },
          { title: "External", value: "external" },
          { title: "Dropdown", value: "dropdown" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "internalLink",
      title: "Internal page",
      type: "reference",
      to: [...INTERNAL_LINK_TO],
      hidden: ({ parent }) => (parent as { linkType?: string })?.linkType !== "internal",
    }),
    defineField({
      name: "externalUrl",
      title: "External URL",
      type: "url",
      hidden: ({ parent }) => (parent as { linkType?: string })?.linkType !== "external",
    }),
    defineField({
      name: "subItems",
      title: "Sub-items",
      type: "array",
      of: [{ type: "menuItem" }],
      hidden: ({ parent }) => (parent as { linkType?: string })?.linkType !== "dropdown",
    }),
  ],
});
