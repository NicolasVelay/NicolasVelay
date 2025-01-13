import { defineConfig } from 'astro/config';
import { remarkReadingTime } from './remark-reading-time.mjs';
import sectionize from 'remark-sectionize'
import icon from "astro-icon";

import expressiveCode from 'astro-expressive-code';

// https://astro.build/config
export default defineConfig({
  site: "https://nicolasvelay.nybtech.fr",
  integrations: [icon(), expressiveCode()],
  markdown: {
    remarkPlugins: [remarkReadingTime, sectionize],
    shikiConfig: {
      theme: 'dracula',
    },
  },
});