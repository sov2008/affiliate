// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  output: 'static',
  base: '/blog',
  site: 'https://flirtcheck.site',
  trailingSlash: 'ignore',
  vite: {
    plugins: [tailwindcss()]
  }
});