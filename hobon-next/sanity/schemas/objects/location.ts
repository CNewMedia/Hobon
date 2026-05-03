import { defineField, defineType } from "sanity";

export const location = defineType({
  name: "location",
  title: "Location",
  type: "object",
  fields: [
    defineField({ name: "name", title: "Name", type: "string", validation: (r) => r.required() }),
    defineField({ name: "streetAddress", title: "Street address", type: "string", validation: (r) => r.required() }),
    defineField({ name: "postalCode", title: "Postal code", type: "string", validation: (r) => r.required() }),
    defineField({ name: "city", title: "City", type: "string", validation: (r) => r.required() }),
    defineField({
      name: "country",
      title: "Country (ISO)",
      type: "string",
      initialValue: "BE",
      validation: (r) => r.required(),
    }),
    defineField({ name: "phone", title: "Phone", type: "string" }),
    defineField({ name: "email", title: "Email", type: "string" }),
    defineField({ name: "latitude", title: "Latitude", type: "number" }),
    defineField({ name: "longitude", title: "Longitude", type: "number" }),
    defineField({
      name: "openingHours",
      title: "Opening hours (schema.org text)",
      type: "array",
      of: [{ type: "string" }],
      description: 'e.g. "Mo-Fr 08:00-17:00"',
    }),
  ],
});
