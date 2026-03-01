import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: [
      'lib/**/__tests__/**/*.{test,spec}.{ts,tsx}',
      'lib/**/*.test.{ts,tsx}',
      'test/integration/**/*.test.{ts,tsx}'
    ],
    exclude: ['node_modules', '.next', 'dist'],
    setupFiles: ['./lib/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: ['node_modules/', '.next/', 'lib/**/__tests__/'],
    },
  },
  resolve: {
    alias: {
      '@': './',
    },
  },
});
