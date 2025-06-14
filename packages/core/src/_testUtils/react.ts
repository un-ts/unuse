import type { SuiteCollector, SuiteFactory } from 'vitest';
import { beforeAll, describe } from 'vitest';
import { initFrameworkImport } from '../_framework';

/**
 * Wraps a suite for React tests.
 *
 * Sets the `UNUSE_FRAMEWORK` environment variable to `'react'` before running the tests,
 * and cleans it up after the tests are done.
 */
export function describeReact(name: string, fn: SuiteFactory): SuiteCollector {
  beforeAll(async () => {
    process.env.UNUSE_FRAMEWORK = 'react';
    await initFrameworkImport('react');

    return () => {
      delete process.env.UNUSE_FRAMEWORK;
    };
  });

  return describe(name, () => {
    describe('React', fn);
  });
}
