import { describe, expect, it, vi } from 'vitest';
import { isUnComputed, UN_COMPUTED, unComputed } from '.';
import { unSignal } from '../unSignal';

describe('unComputed', () => {
  it('should be defined', () => {
    expect(unComputed).toBeTypeOf('function');
    expect(isUnComputed).toBeTypeOf('function');
  });

  it('should create an UnComputed', () => {
    const myComputed = unComputed(() => 0);

    expect(myComputed).toBeTypeOf('object');
    expect(myComputed.get).toBeTypeOf('function');
    expect(isUnComputed(myComputed)).toBe(true);
  });

  it('should get the derived value', () => {
    const myComputed = unComputed(() => 42);
    expect(myComputed.get()).toBe(42);
  });

  it('should react on derived signal value', () => {
    const mySignal = unSignal(0);

    const myComputed = unComputed(() => mySignal.get());
    expect(myComputed.get()).toBe(0);

    mySignal.set(42);
    expect(myComputed.get()).toBe(42);

    mySignal.update((value) => value + 1);
    expect(myComputed.get()).toBe(43);
  });

  it('should only trigger effects when the derived signal changed', () => {
    const fnSpy = vi.fn();

    const mySignal = unSignal(0);
    const myComputed = unComputed(() => {
      fnSpy();
      return mySignal.get();
    });

    // computed got never triggered yet
    expect(fnSpy).toHaveBeenCalledTimes(0);

    // multiple calls of getting the value should not trigger the effect multiple times, but only once
    myComputed.get();
    myComputed.get();
    expect(fnSpy).toHaveBeenCalledTimes(1);

    // changing the signal should trigger the effect
    mySignal.set(1);
    expect(fnSpy).toHaveBeenCalledTimes(1);

    // mySignal got updated, so the computed triggers again
    myComputed.get();
    expect(fnSpy).toHaveBeenCalledTimes(2);

    // setting mySignal to same value does not trigger the computed again
    mySignal.set(1);
    expect(fnSpy).toHaveBeenCalledTimes(2);
  });

  describe('isUnComputed', () => {
    it('should return true for an UnComputed', () => {
      const myComputed = unComputed(() => 42);
      expect(isUnComputed(myComputed)).toBe(true);
    });

    it('should return false for a regular object', () => {
      const obj = { foo: 'bar' };
      expect(isUnComputed(obj)).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(isUnComputed(null)).toBe(false);
      // eslint-disable-next-line unicorn/no-useless-undefined
      expect(isUnComputed(undefined)).toBe(false);
    });

    it('should return false for non-object types', () => {
      expect(isUnComputed(42)).toBe(false);
      expect(isUnComputed('string')).toBe(false);
      expect(isUnComputed(true)).toBe(false);
    });

    it('should return false for an object without UN_COMPUTED', () => {
      const obj = { get: () => 42, set: () => {} };
      expect(isUnComputed(obj)).toBe(false);
    });

    it('should return false for an object with UN_COMPUTED but not true', () => {
      const obj = {
        [UN_COMPUTED]: false,
        get: () => 42,
      };
      expect(isUnComputed(obj)).toBe(false);
    });

    it('should return true for an object with UN_COMPUTED but missing functions', () => {
      const obj = {
        [UN_COMPUTED]: true,
      };
      expect(isUnComputed(obj)).toBe(true);
    });

    it('should return true for an object with UN_COMPUTED set to true', () => {
      const obj = {
        [UN_COMPUTED]: true,
        get: () => 42,
      };
      expect(isUnComputed(obj)).toBe(true);
    });
  });
});
