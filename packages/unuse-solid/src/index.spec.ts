// @vitest-environment happy-dom

import { renderHook } from '@solidjs/testing-library';
import { createMemo, createSignal } from 'solid-js';
import { describe, expect, it, vi } from 'vitest';
import {
  isUnComputed,
  isUnRef,
  isUnSignal,
  overrideIsUnRefFn,
  overrideToUnSignalFn,
  overrideTryOnScopeDisposeFn,
  overrideUnResolveFn,
  toUnSignal,
  tryOnScopeDispose,
  unComputed,
  unResolve,
  unSignal,
} from '.';

describe('unuse-solid', () => {
  it('should export correct global variable', () => {
    expect(globalThis.__UNUSE_FRAMEWORK__).toBe('solid');
  });

  describe('toUnSignal', () => {
    it('should export toUnSignal function', () => {
      expect(toUnSignal).toBeTypeOf('function');
    });

    it('should convert a Solid Signal to an UnSignal', () => {
      const solidSignal = createSignal(42);
      const mySignal = toUnSignal(solidSignal);
      expect(mySignal.get()).toBe(42);

      mySignal.set(100);
      expect(solidSignal[0]()).toBe(100);
    });

    it('should convert a non-reactive value to an UnSignal', () => {
      const mySignal = toUnSignal(42);
      expect(mySignal.get()).toBe(42);

      mySignal.set(100);
      expect(mySignal.get()).toBe(100);
    });
  });

  describe('unResolve', () => {
    it('should export unResolve function', () => {
      expect(unResolve).toBeTypeOf('function');
    });

    it.todo('should resolve an UnSignal to a Solid Signal', () => {
      const mySignal = unSignal(42);

      renderHook(() => {
        const resolved = unResolve(mySignal);
        expect(resolved[0]()).toBe(42);

        resolved[1](100);

        return resolved;
      });
      expect(mySignal.get()).toBe(100);
    });

    it('should resolve an UnSignal to a Signal Accessor when readonly is true', () => {
      const mySignal = unSignal(42);
      const resolved = unResolve(mySignal, { readonly: true });

      expect(resolved()).toBe(42);
    });

    it('should resolve an UnSignal to an UnSignal when framework is none', () => {
      const mySignal = unSignal(42);
      const resolved = unResolve(mySignal, { framework: 'none' });

      expect(resolved).toSatisfy(isUnSignal);
      expect(resolved.get()).toBe(42);
    });

    it('should resolve an UnSignal to an UnComputed when framework is none and readonly is true', () => {
      const mySignal = unSignal(42);
      const resolved = unResolve(mySignal, {
        framework: 'none',
        readonly: true,
      });

      expect(resolved).toSatisfy(isUnComputed);
      expect(resolved.get()).toBe(42);
    });
  });

  describe('tryOnScopeDispose', () => {
    it('should export tryOnScopeDispose function', () => {
      expect(tryOnScopeDispose).toBeTypeOf('function');
    });

    it('should call the provided callback on scope dispose', () => {
      const callback = vi.fn();

      const hook = renderHook(() => tryOnScopeDispose(callback));
      const isDisposable = hook.result;
      expect(isDisposable).toBe(true);
      expect(callback).toHaveBeenCalledTimes(0);

      hook.cleanup();
      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should return false if not inside a Solid effect scope', () => {
      const callback = vi.fn();
      const isDisposable = tryOnScopeDispose(callback);

      expect(isDisposable).toBe(false);
      expect(callback).toHaveBeenCalledTimes(0);
    });
  });

  describe('isUnRef', () => {
    it('should export isUnRef function', () => {
      expect(isUnRef).toBeTypeOf('function');
    });

    it('should return true for Solid Signal', () => {
      const solidSignal = createSignal(42);
      expect(isUnRef(solidSignal)).toBe(true);
    });

    it('should return true for Solid Memo', () => {
      const solidMemo = createMemo(() => 42);
      expect(isUnRef(solidMemo)).toBe(true);
    });

    it('should return true for UnSignal', () => {
      const mySignal = unSignal(42);
      expect(isUnRef(mySignal)).toBe(true);
    });

    it('should return true for UnComputed', () => {
      const myComputed = unComputed(() => 42);
      expect(isUnRef(myComputed)).toBe(true);
    });

    it('should return true for Getters', () => {
      // eslint-disable-next-line unicorn/consistent-function-scoping
      const myGetter = () => 42;
      expect(isUnRef(myGetter)).toBe(true);
    });

    it('should return false for non-UnRef values', () => {
      expect(isUnRef(42)).toBe(false);
      expect(isUnRef('string')).toBe(false);
      expect(isUnRef({})).toBe(false);
      expect(isUnRef([])).toBe(false);
    });
  });

  it('should not expose override functions', () => {
    expect(overrideToUnSignalFn).toBeUndefined();
    expect(overrideUnResolveFn).toBeUndefined();
    expect(overrideTryOnScopeDisposeFn).toBeUndefined();
    expect(overrideIsUnRefFn).toBeUndefined();
  });
});
