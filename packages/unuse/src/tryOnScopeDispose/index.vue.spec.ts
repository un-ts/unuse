// @vitest-environment happy-dom

import { expect, it, vi } from 'vitest';
import { tryOnScopeDispose } from '.';
import { describeVue, useSetup } from '../_testUtils/vue';

describeVue('tryOnScopeDispose', () => {
  it('should return false when not in a Vue scope', () => {
    const fnSpy = vi.fn();

    const actual = tryOnScopeDispose(fnSpy);
    expect(actual).toBe(false);

    expect(fnSpy).not.toHaveBeenCalled();
  });

  it('should call onScopeDispose when in a Vue scope', () => {
    const fnSpy = vi.fn();

    const vm = useSetup(() => {
      tryOnScopeDispose(fnSpy);
    });

    expect(fnSpy).not.toHaveBeenCalled();

    vm.unmount();

    expect(fnSpy).toHaveBeenCalledTimes(1);
  });
});
