import { defineCollection, z } from "astro:content";

const demosCollection = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
  }),
});

export const collections = {
  demos: demosCollection,
};
