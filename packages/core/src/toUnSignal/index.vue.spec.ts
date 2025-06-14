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
});
