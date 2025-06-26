import { unSignal } from 'unuse-reactivity';
import { describe, expect, it } from 'vitest';
import { unAccess } from '.';

describe('unAccess', () => {
  it('should be defined', () => {
    expect(unAccess).toBeTypeOf('function');
  });

  it('should resolve null', () => {
    const actual = unAccess(null);
    expect(actual).toBe(null);
  });

  it('should resolve undefined', () => {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression, unicorn/no-useless-undefined
    const actual = unAccess(undefined);
    expect(actual).toBe(undefined);
  });

  it('should resolve string', () => {
    const actual = unAccess('Hello World');
    expect(actual).toBe('Hello World');
  });

  it('should resolve number', () => {
    const actual = unAccess(42);
    expect(actual).toBe(42);
  });

  it('should resolve accessor callback', () => {
    const actual = unAccess(() => 42);
    expect(actual).toBe(42);
  });

  describe('UnSignal', () => {
    it('should resolve an UnSignal', () => {
      const state = unSignal(42);
      const actual = unAccess(state);
      expect(actual).toBe(42);
    });
  });
});
