import { defineConfig, configDefaults } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      src: path.resolve(__dirname, './src'),
    },
  },
  test: {

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
});
