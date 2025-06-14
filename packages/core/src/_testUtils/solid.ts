import type { SuiteCollector, SuiteFactory } from 'vitest';
import { beforeAll, describe } from 'vitest';
import { initFrameworkImport } from '../_framework';

/**
 * Wraps a suite for SolidJS tests.
 *
 * Sets the `UNUSE_FRAMEWORK` environment variable to `'solid'` before running the tests,
 * and cleans it up after the tests are done.
 */
export function describeSolid(name: string, fn: SuiteFactory): SuiteCollector {
  beforeAll(async () => {
    process.env.UNUSE_FRAMEWORK = 'solid';
    await initFrameworkImport('solid');

    return () => {
      delete process.env.UNUSE_FRAMEWORK;
    };
  });

  return describe(name, () => {
    describe('Solid', fn);
  });
}
