// @ts-check
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";

// https://astro.build/config
export default defineConfig({
  site: "https://arcbase.one",
  // In Astro 6, "static" is the default output mode and now supports
  // per-route server rendering by setting `export const prerender = false`
  // in any page or API route — equivalent to the old "hybrid" mode.
  output: "static",
  adapter: vercel(),
  integrations: [sitemap()],
});
