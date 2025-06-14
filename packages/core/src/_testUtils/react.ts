import type { SuiteCollector, SuiteFactory } from 'vitest';
import { beforeAll, describe } from 'vitest';
import { initFrameworkImport } from '../_framework';

/**
 * Wraps a suite for React tests.
 *
 * Sets the `globalThis.__UNUSE_FRAMEWORK__` variable to `'react'` before running the tests,
 * and cleans it up after the tests are done.
 */
export function describeReact(name: string, fn: SuiteFactory): SuiteCollector {
  beforeAll(async () => {
    // @ts-ignore: override global variable
    globalThis.__UNUSE_FRAMEWORK__ = 'react';
    await initFrameworkImport('react');

    return () => {
      // @ts-expect-error: clean up global variable
      delete globalThis.__UNUSE_FRAMEWORK__;
    };
  });

  return describe(name, () => {
    describe('React', fn);
  });
}
