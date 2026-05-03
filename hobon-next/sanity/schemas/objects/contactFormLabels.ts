import { defineField, defineType } from "sanity";

export const contactFormLabels = defineType({
  name: "contactFormLabels",
  title: "Form field labels",
  type: "object",
  fields: [
    defineField({ name: "firstname", title: "Voornaam", type: "string" }),
    defineField({ name: "lastname", title: "Naam", type: "string" }),
    defineField({ name: "company", title: "Bedrijf", type: "string" }),
    defineField({ name: "email", title: "E-mail", type: "string" }),
    defineField({ name: "phone", title: "Telefoon", type: "string" }),
    defineField({ name: "sector", title: "Sector", type: "string" }),
    defineField({ name: "message", title: "Bericht", type: "string" }),
  ],
});
