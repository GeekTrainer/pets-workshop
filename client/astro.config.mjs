// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import svelte from '@astrojs/svelte';

import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  vite: {
    plugins: [tailwindcss(), svelte()],
    server: {
      proxy: {
        '/api': {
          target: 'http://localhost:5100',
          changeOrigin: true,
        }
      }
    }
  },

  adapter: node({
    mode: 'standalone'
  }),

  integrations: [svelte()]
});