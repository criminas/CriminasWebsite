// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  vite: {
    server: {
      fs: {
        // Allow serving files from one level up to the project root
        // This fixes the dev-toolbar error when node_modules is hoisted
        allow: ['..']
      }
    }
  }
});
