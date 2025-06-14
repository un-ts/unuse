import type { SuiteCollector, SuiteFactory } from 'vitest';
import { beforeAll, describe } from 'vitest';
import { initFrameworkImport } from '../_framework';

/**
 * Wraps a suite for Angular tests.
 *
 * Sets the `globalThis.__UNUSE_FRAMEWORK__` variable to `'angular'` before running the tests,
 * and cleans it up after the tests are done.
 */
export function describeAngular(
  name: string,
  fn: SuiteFactory
): SuiteCollector {
  beforeAll(async () => {
    // @ts-ignore: override global variable
    globalThis.__UNUSE_FRAMEWORK__ = 'angular';
    await initFrameworkImport('angular');

    return () => {
      // @ts-expect-error: clean up global variable
      delete globalThis.__UNUSE_FRAMEWORK__;
    };
  });

  return describe(name, () => {
    describe('Angular', fn);
  });
}
