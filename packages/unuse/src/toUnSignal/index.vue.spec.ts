import { expect, it } from 'vitest';
import { ref } from 'vue';
import { toUnSignal } from '.';
import { describeVue } from '../_testUtils/vue';
import { isUnSignal } from '../unSignal';

describeVue('toUnSignal', () => {
  it('should convert a Vue ref to an UnSignal', () => {
    const state = ref(42);

    const actual = toUnSignal(state);
    expect(actual).toSatisfy(isUnSignal);
  });

  it('should maintain the reactivity of the signal', () => {
    const state = ref(42);

    const actual = toUnSignal(state);
    expect(state.value).toBe(42);
    expect(actual.get()).toBe(42);

    actual.set(100);
    expect(state.value).toBe(100);
    expect(actual.get()).toBe(100);

    state.value = 200;
    expect(actual.get()).toBe(200);
  });
});
