import { defineConfig } from 'vite';

/** GitHub Pages: https://<user>.github.io/GeneticAlgorithm/ */
export default defineConfig(({ mode }) => ({
  root: '.',
  base: mode === 'production' ? '/GeneticAlgorithm/' : '/',
}));
