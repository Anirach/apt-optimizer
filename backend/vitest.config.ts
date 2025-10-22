import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        'dist/',
        '**/*.test.ts',
        '**/*.spec.ts',
        'src/db/seed.ts',
      ],
    },
    // Run tests sequentially to avoid database conflicts
    threads: false,
    // Increase timeout for integration tests
    testTimeout: 10000,
  },
});
