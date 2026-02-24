import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    // Prefer TS sources over tracked JS artifacts in src/
    extensions: ['.ts', '.tsx', '.mjs', '.js', '.jsx', '.json'],
  },
});
