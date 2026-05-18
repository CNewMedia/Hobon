import { defineField, defineType } from "sanity";

export const contactPage = defineType({
  name: "contactPage",
  title: "Contact",
  type: "document",
  fields: [
    defineField({ name: "language", type: "string", readOnly: true, hidden: true }),
    defineField({ name: "seo", type: "seo" }),
    defineField({ name: "hero", title: "Hero", type: "pageHero" }),
    defineField({
      name: "heroMedia",
      title: "Hero media (foto of video)",
      type: "heroMedia",
    }),
    defineField({ name: "intro", title: "Intro", type: "text", rows: 4 }),
    defineField({ name: "formTitle", title: "Form title", type: "string" }),
    defineField({ name: "formSubmitLabel", title: "Submit button label", type: "string" }),
    defineField({ name: "formThankYouMessage", title: "Thank you message", type: "text", rows: 3 }),
    defineField({ name: "formFields", title: "Form field labels", type: "contactFormLabels" }),
    defineField({ name: "additionalInfo", title: "Additional info (under form)", type: "richText" }),
  ],
});
