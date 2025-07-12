import { describe, expect, it, vi } from 'vitest';
import { isUnSignal, UN_SIGNAL, unSignal } from '.';
import { unEffect } from '../unEffect';

describe('unSignal', () => {
  it('should be defined', () => {
    expect(unSignal).toBeTypeOf('function');
    expect(isUnSignal).toBeTypeOf('function');
  });

  it('should create an UnSignal with initial value', () => {
    const mySignal = unSignal(0);

    expect(mySignal).toBeTypeOf('object');
    expect(mySignal.get).toBeTypeOf('function');
    expect(mySignal.peek).toBeTypeOf('function');
    expect(mySignal.set).toBeTypeOf('function');
    expect(mySignal.update).toBeTypeOf('function');
    expect(isUnSignal(mySignal)).toBe(true);
  });

  it('should create an UnSignal without initial value', () => {
    const mySignal = unSignal();

    expect(mySignal).toBeTypeOf('object');
    expect(mySignal.get).toBeTypeOf('function');
    expect(mySignal.peek).toBeTypeOf('function');
    expect(mySignal.set).toBeTypeOf('function');
    expect(mySignal.update).toBeTypeOf('function');
    expect(isUnSignal(mySignal)).toBe(true);
  });

  it('should get the initial value', () => {
    const mySignal = unSignal(42);
    expect(mySignal.get()).toBe(42);
  });

  it('should set a new value', () => {
    const mySignal = unSignal(42);
    mySignal.set(100);
    expect(mySignal.get()).toBe(100);
  });

  it('should update based on previous value', () => {
    const mySignal = unSignal(42);
    mySignal.update((prev) => prev + 10);
    expect(mySignal.get()).toBe(52);
  });

  it('should handle multiple consecutive updates', () => {
    const mySignal = unSignal(10);
    mySignal.update((prev) => prev * 2); // 20
    mySignal.update((prev) => prev + 5); // 25
    expect(mySignal.get()).toBe(25);
  });

  it('should trigger unEffect on set', () => {
    const fn1Spy = vi.fn();

    const mySignal = unSignal(42);

    unEffect(() => {
      mySignal.get();
      fn1Spy();
    });

    mySignal.set(100);

    expect(fn1Spy).toHaveBeenCalledTimes(2);
  });

  it('should trigger unEffect on update', () => {
    const fn1Spy = vi.fn();

    const mySignal = unSignal(42);

    unEffect(() => {
      mySignal.get();
      fn1Spy();
    });

    mySignal.update((prev) => prev + 10);

    expect(fn1Spy).toHaveBeenCalledTimes(2);
  });

  it('should peek the current value without triggering effects', () => {
    const fn1Spy = vi.fn();

    const mySignal = unSignal(42);

    unEffect(() => {
      mySignal.peek();
      fn1Spy();
    });

    mySignal.set(100);
    expect(mySignal.peek()).toBe(100);

    expect(fn1Spy).toHaveBeenCalledTimes(1);
  });

  describe('isUnSignal', () => {
    it('should return true for an UnSignal', () => {
      const mySignal = unSignal(42);
      expect(isUnSignal(mySignal)).toBe(true);
    });

    it('should return false for a regular object', () => {
      const obj = { foo: 'bar' };
      expect(isUnSignal(obj)).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(isUnSignal(null)).toBe(false);
      // eslint-disable-next-line unicorn/no-useless-undefined
      expect(isUnSignal(undefined)).toBe(false);
    });

    it('should return false for non-object types', () => {
      expect(isUnSignal(42)).toBe(false);
      expect(isUnSignal('string')).toBe(false);
      expect(isUnSignal(true)).toBe(false);
    });

    it('should return false for an object without UN_SIGNAL', () => {
      const obj = { get: () => 42, set: () => {} };
      expect(isUnSignal(obj)).toBe(false);
    });

    it('should return false for an object with UN_SIGNAL but not true', () => {
      const obj = {
        [UN_SIGNAL]: false,
        get: () => 42,
        peek: () => 42,
        set: () => {},
        update: () => {},
      };
      expect(isUnSignal(obj)).toBe(false);
    });

    it('should return true for an object with UN_SIGNAL set to true but functions are missing', () => {
      // it was decided to do this for performance reasons
      const obj = {
        [UN_SIGNAL]: true,
      };
      expect(isUnSignal(obj)).toBe(true);
    });

    it('should return true for an object with UN_SIGNAL set to true', () => {
      const obj = {
        [UN_SIGNAL]: true,
        get: () => 42,
        peek: () => 42,
        set: () => {},
        update: () => {},
      };
      expect(isUnSignal(obj)).toBe(true);
    });
  });
});
