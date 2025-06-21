import { describe, expect, it } from 'vitest';
import { toUnSignal } from '.';
import { unSignal } from '../unSignal';

describe('toUnSignal', () => {
  it('should be defined', () => {
    expect(toUnSignal).toBeTypeOf('function');
  });

  it('should return a given UnSignal as is', () => {
    const state = unSignal(42);

    const actual = toUnSignal(state);
    expect(actual).toBe(state);
  });

  it('should maintain the reactivity of the signal', () => {
    const state = unSignal(42);

    const actual = toUnSignal(state);
    expect(state.get()).toBe(42);
    expect(actual.get()).toBe(42);

    actual.set(100);
    expect(state.get()).toBe(100);
    expect(actual.get()).toBe(100);

    state.set(200);
    expect(actual.get()).toBe(200);
  });
});
