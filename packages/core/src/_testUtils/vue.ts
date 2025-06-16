import 'unuse/vue';
import type { SuiteCollector, SuiteFactory } from 'vitest';
import { beforeAll, describe } from 'vitest';

/**
 * Wraps a suite for Vue tests.
 *
 * Sets the `UNUSE_FRAMEWORK` environment variable to `'vue'` before running the tests,
 * and cleans it up after the tests are done.
 */
export function describeVue(name: string, fn: SuiteFactory): SuiteCollector {
  beforeAll(() => {
    process.env.UNUSE_FRAMEWORK = 'vue';

    return () => {
      delete process.env.UNUSE_FRAMEWORK;
    };
  });

  return describe(name, () => {
    describe('Vue', fn);
  });
}
