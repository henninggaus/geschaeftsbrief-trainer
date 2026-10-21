import { defineConfig } from 'vite';
import { swPrecache } from './build/sw-precache.js';

export default defineConfig({
  // Relative Pfade, damit die App unter https://<user>.github.io/<repo>/ funktioniert.
  base: './',
  plugins: [swPrecache()],
  test: {
    include: ['tests/**/*.test.js'],
  },
});
