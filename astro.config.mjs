// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://jonasb.github.io',
  base: '/',
  build: {
    format: 'file',
  },
  image: {
    service: {
      entrypoint: 'astro/assets/services/noop',
    },
  },
});
