import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', 'dist', '.idea', '.git', '.cache', 'test/e2e'],
    // CI-specific optimizations to prevent fork timeout issues
    ...(process.env.CI && {
      // Reduce concurrency in CI to prevent resource exhaustion
      // Using 2 workers instead of default (which can be CPU count)
      maxWorkers: 2,
      minWorkers: 1,
      // Increase test timeout for CI environments (30 seconds)
      testTimeout: 30000,
      // Increase hook timeout (30 seconds)
      hookTimeout: 30000,
      // Use threads pool with increased timeout
      pool: 'threads',
      poolOptions: {
        threads: {
          singleThread: false,
          isolate: true,
        },
      },
    }),
    reporters: process.env.CI
      ? ['verbose', ['junit', { outputFile: './test-results/vitest-junit.xml' }]]
      : ['verbose'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'test/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@test': path.resolve(__dirname, './test'),
    },
  },
});

