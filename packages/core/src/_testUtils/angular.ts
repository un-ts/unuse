import type { SuiteCollector, SuiteFactory } from 'vitest';
import { beforeAll, describe } from 'vitest';

/**
 * Wraps a suite for Angular tests.
 *
 * Sets the `UNUSE_FRAMEWORK` environment variable to `'angular'` before running the tests,
 * and cleans it up after the tests are done.
 */
export function describeAngular(
  name: string,
  fn: SuiteFactory
): SuiteCollector {
  beforeAll(() => {
    process.env.UNUSE_FRAMEWORK = 'angular';

    return () => {
      delete process.env.UNUSE_FRAMEWORK;
    };
  });

  return describe(name, () => {
    describe('Angular', fn);
  });
}
