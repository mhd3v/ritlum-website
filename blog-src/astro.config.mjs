// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  site: "https://ritlum.com",
  base: "/blog",
  trailingSlash: "always",
  integrations: [mdx()],
  // Safari 15-17 still needs -webkit-backdrop-filter for the nav blur.
  vite: { build: { cssTarget: ["chrome107", "safari15"] } },
});