import { isUnSignal, unSignal } from 'unuse-reactivity';
import { describe, expect, it, vi } from 'vitest';
import { overrideToUnSignalFn, toUnSignal } from '.';

describe('toUnSignal', () => {
  it('should be defined', () => {
    expect(toUnSignal).toBeTypeOf('function');
  });

  it('should return a given UnSignal as is', () => {
    const state = unSignal(42);

    const actual = toUnSignal(state);
    expect(actual).toBe(state);
  });

  it('should return an empty UnSignal', () => {
    const value = undefined;
    const actual = toUnSignal(value);
    expect(actual).toSatisfy(isUnSignal);
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression
    expect(actual.get()).toBeUndefined();
  });

  it('should return a UnSignal with null', () => {
    const actual = toUnSignal(null);
    expect(actual.get()).toBeNull();
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

  it('should be hookable for custom frameworks', () => {
    const fnSpy = vi.fn();

    overrideToUnSignalFn(fnSpy);
    expect(fnSpy).not.toHaveBeenCalled();

    toUnSignal('test');
    expect(fnSpy).toHaveBeenCalledWith('test');
  });
});
