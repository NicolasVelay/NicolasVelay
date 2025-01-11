// @ts-check
import { defineConfig } from 'astro/config';

import icon from "astro-icon";
import lottie from "astro-integration-lottie";

// https://astro.build/config
export default defineConfig({
  site: "https://nicolasvelay.nybtech.fr",
  integrations: [icon(), lottie()]
});