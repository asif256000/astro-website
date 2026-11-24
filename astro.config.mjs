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
      // Astro's directory build emits trailing-slash URLs, and Cloudflare Pages
      // 308-redirects the slash-free form to them, so these URLs are left
      // exactly as generated - they already match the canonical tags.
      serialize(item) {
        // Home is the entry point; the rest are equal siblings.
        item.priority = item.url === 'https://asifiqbal.xyz/' ? 1.0 : 0.8;
        return item;
      },
    }),
  ],
});
