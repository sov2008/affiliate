// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  base: '/',
  site: 'https://flirtcheck.site',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/go') && !page.includes('/draft/'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    })
  ],
  vite: {
    plugins: [tailwindcss()]
  }
});