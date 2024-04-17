import { date } from "astro/zod";
import { z, defineCollection } from "astro:content";

const demoCollection = defineCollection({
  type: "content",
  schema: z.object({
    name: z.string(),
    date: z.date().optional(),
  }),
});

export const collections = {
  demos: demoCollection,
};
