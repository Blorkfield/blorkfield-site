// @ts-check
import { defineConfig, passthroughImageService } from 'astro/config';
import svelte from '@astrojs/svelte';
import overlayFonts from '@blorkfield/overlay-core/vite';

// https://astro.build/config
export default defineConfig({
  integrations: [svelte()],
  image: {
    service: passthroughImageService()
  },
  vite: {
    plugins: [overlayFonts()]
  }
});
