import {
  z,
  defineCollection,
  getCollection,
  getEntry,
  getEntries,
  reference,
  render,
} from 'astro:content';
import { glob } from 'astro/loaders';

const demos = defineCollection({
  loader: glob({
    pattern: '**/index.{mdx,astro}',
    base: './src/demos',
  }),
  schema: z.object({
    name: z.string(),
    // permalink: z.string().optional(),
  }),
});

// Expose your defined collection to Astro
// with the `collections` export
// export const collections = { blog };

// const demosCollection = defineCollection({
//   type: 'content',
//   schema: z.object({
//     name: z.string(),
//   }),
// });

export const collections = {
  demos,
};
