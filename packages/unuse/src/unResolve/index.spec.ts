import { isUnComputed, isUnSignal, unSignal } from 'unuse-reactivity';
import { describe, expect, it } from 'vitest';
import { unResolve } from '.';

describe('unResolve', () => {
  it('should be defined', () => {
    expect(unResolve).toBeTypeOf('function');
  });

  describe('UnSignal', () => {
    it('should resolve to an UnSignal', () => {
      const mySignal = unSignal(0);

      const actual = unResolve(mySignal, { framework: 'none' });

      expect(actual).toSatisfy(isUnSignal);
    });

    it('should update the UnSignal on change', () => {
      const mySignal = unSignal(0);

      const actual = unResolve(mySignal, { framework: 'none' });

      expect(actual.get()).toBe(0);

      mySignal.set(42);
      expect(actual.get()).toBe(42);
    });

    it('should update back the original signal on change', () => {
      const mySignal = unSignal(0);

      const actual = unResolve(mySignal, { framework: 'none' });

      actual.set(100);
      expect(mySignal.get()).toBe(100);
    });

    it('should resolve to an UnComputed when readonly is true', () => {
      const mySignal = unSignal(0);

      const actual = unResolve(mySignal, {
        framework: 'none',
        readonly: true,
      });
      expect(actual).toSatisfy(isUnComputed);
    });
  });
});
