import { defaultExclude, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['**/e2e/**', ...defaultExclude],
    coverage: {
      all: true,
      provider: 'v8',
      reporter: ['clover', 'cobertura', 'json-summary', 'json', 'lcov', 'text'],
      exclude: ['examples', '**/*.config.ts'],
      reportOnFailure: true,
      thresholds: {
        // TODO @Shinigami92 2025-06-22: should be:
        // lines: 90,
        // statements: 90,
        // functions: 90,
        // branches: 85,

        // for now:
        lines: 40,
        statements: 40,
        functions: 70,
        branches: 70,
      },
    },
    reporters: process.env.CI
      ? ['default', 'github-actions']
      : [['default', { summary: false }]],
  },
});
