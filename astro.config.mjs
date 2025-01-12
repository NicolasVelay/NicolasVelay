// @ts-check
import { defineConfig } from 'astro/config';
import { remarkReadingTime } from './remark-reading-time.mjs';
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://nicolasvelay.nybtech.fr",
  integrations: [icon()],
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
});