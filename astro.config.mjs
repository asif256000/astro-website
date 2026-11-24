import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://asifiqbal.xyz',
  outDir: 'dist',
  integrations: [
    sitemap({
      // /404 must not advertise itself for indexing.
      filter: (page) => !page.includes('/404'),
      changefreq: 'monthly',
      lastmod: new Date(),
      // Astro emits directory-style URLs (/overview/), but the canonical tags
      // in BaseLayout are slash-free. Normalise here so the sitemap and the
      // canonical never disagree about a page's one true URL.
      serialize(item) {
        item.url = item.url.replace(/(.+)\/$/, '$1');
        // The home page keeps its single trailing slash.
        if (item.url === 'https://asifiqbal.xyz') item.url = 'https://asifiqbal.xyz/';
        // Home is the entry point; the rest are equal siblings.
        item.priority = item.url === 'https://asifiqbal.xyz/' ? 1.0 : 0.8;
        return item;
      },
    }),
  ],
});
