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
});
