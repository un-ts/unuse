import { unResolve, unSignal } from 'unuse';
import { expect, it } from 'vitest';
import { isRef as isVueRef } from 'vue';
import { describeVue } from '../_testUtils/vue';

describeVue('unResolve', () => {
  it('should resolve to an Vue Ref', () => {
    const mySignal = unSignal(0);

    const actual = unResolve(mySignal, { framework: 'vue' });

    expect(actual).toSatisfy(isVueRef);
  });

  it('should update the Vue Ref on change', () => {
    const mySignal = unSignal(0);

    const actual = unResolve(mySignal, { framework: 'vue' });

    expect(actual.value).toBe(0);

    mySignal.set(42);
    expect(actual.value).toBe(42);
  });

  it('should update back the original signal on change', () => {
    const mySignal = unSignal(0);

    const actual = unResolve(mySignal, { framework: 'vue' });

    actual.value = 100;
    expect(mySignal.get()).toBe(100);
  });
});
