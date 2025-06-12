import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

export default defineConfig({
  integrations: [react(), mdx()],
  content: {
    collections: ['demos'],
    contentDir: 'src/demos',
  },
  vite: {
    resolve: {
      alias: {
        // '@demos': '@demo-archive/demos',
        '@demo-archive/demos': new URL('../demos', import.meta.url).pathname,
      },
    },
  },
});
