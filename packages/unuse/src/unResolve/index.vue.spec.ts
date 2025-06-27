import { unSignal } from 'unuse-reactivity';
import { expect, it } from 'vitest';
import { isRef } from 'vue';
import { unResolve } from '.';
import { describeVue } from '../_testUtils/vue';

describeVue('unResolve', () => {
  it('should resolve to an Vue Ref', () => {
    const mySignal = unSignal(0);

    const actual = unResolve(mySignal, { framework: 'vue' });
    expect(actual).toSatisfy(isRef);
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

  it('should resolve to a Vue Computed when readonly is true', () => {
    const mySignal = unSignal(0);

    const actual = unResolve(mySignal, { framework: 'vue', readonly: true });
    expect(actual).toSatisfy(isRef);

    // @ts-expect-error: try to set a value
    actual.value = 100;
    expect(mySignal.get()).toBe(0);
  });
});
