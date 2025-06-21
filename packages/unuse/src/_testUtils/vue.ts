/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */

import type { SuiteCollector, SuiteFactory } from 'vitest';
import { beforeAll, describe } from 'vitest';
import { createApp, defineComponent, h } from 'vue';
import { initFrameworkImport } from '../_framework';

/**
 * Wraps a suite for Vue tests.
 *
 * Sets the `globalThis.__UNUSE_FRAMEWORK__` variable to `'vue'` before running the tests,
 * and cleans it up after the tests are done.
 */
export function describeVue(name: string, fn: SuiteFactory): SuiteCollector {
  beforeAll(async () => {
    // @ts-ignore: override global variable
    globalThis.__UNUSE_FRAMEWORK__ = 'vue';
    await initFrameworkImport('vue');

    return () => {
      // @ts-expect-error: clean up global variable
      delete globalThis.__UNUSE_FRAMEWORK__;
    };
  });

  return describe(name, () => {
    describe('Vue', fn);
  });
}

type InstanceType<V> = V extends { new (...arg: any[]): infer X } ? X : never;
type VM<V> = InstanceType<V> & { unmount: () => void };

function mount<V>(Comp: V) {
  const el = document.createElement('div');
  const app = createApp(Comp as any);

  const unmount = () => app.unmount();
  const comp = app.mount(el) as any as VM<V>;
  comp.unmount = unmount;
  return comp;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useSetup<V>(setup: () => V) {
  const Comp = defineComponent({
    setup,
    render() {
      return h('div', []);
    },
  });

  return mount(Comp);
}
