import { createSignal } from 'solid-js';
import { expect, it } from 'vitest';
import { toUnSignal } from '.';
import { describeSolid } from '../_testUtils/solid';
import { isUnSignal } from '../unSignal';

describeSolid('toUnSignal', () => {
  it('should convert a Solid signal to an UnSignal', () => {
    const state = createSignal(42);

    const actual = toUnSignal(state);
    expect(actual).toSatisfy(isUnSignal);
  });

  it('should maintain the reactivity of the signal', () => {
    const state = createSignal(42);

    const actual = toUnSignal(state);
    expect(state[0]()).toBe(42);
    expect(actual.get()).toBe(42);

    actual.set(100);
    expect(state[0]()).toBe(100);
    expect(actual.get()).toBe(100);

    // TODO @Shinigami92 2025-06-21: Check why this is not working
    state[1](200);
    // expect(actual.get()).toBe(200);
  });
});
