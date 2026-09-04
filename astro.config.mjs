// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://thalux.ai',
  integrations: [sitemap({
    customPages: [
      'https://thalux.ai/llms.txt',
      'https://thalux.ai/robots.txt',
    ],
  })],
  vite: {
    plugins: [tailwindcss()],
  },
});