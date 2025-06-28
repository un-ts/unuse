// @vitest-environment happy-dom

import { renderHook } from '@testing-library/react';
import { useMemo, useRef, useState } from 'react';
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

describe('unuse-react', () => {
  it('should export correct global variable', () => {
    expect(globalThis.__UNUSE_FRAMEWORK__).toBe('react');
  });

  describe('toUnSignal', () => {
    it('should export toUnSignal function', () => {
      expect(toUnSignal).toBeTypeOf('function');
    });

    it.todo('should convert a React State to an UnSignal', () => {
      const hook = renderHook(() => {
        const reactState = useState(42);
        const mySignal = toUnSignal(reactState);
        expect(mySignal.get()).toBe(42);

        mySignal.set(100);
      });

      expect(hook.result.current).toBe(100);
    });

    it.todo('should convert a React Ref to an UnSignal', () => {
      const hook = renderHook(() => {
        const reactRef = useRef(42);
        const mySignal = toUnSignal(reactRef);
        expect(mySignal.get()).toBe(42);

        mySignal.set(100);
        return reactRef;
      });

      expect(hook.result.current.current).toBe(100);
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

    it.todo('should resolve an UnSignal to a React State', () => {
      const mySignal = unSignal(42);
      const hook = renderHook(() => {
        const reactState = unResolve(mySignal);
        expect(reactState[0]).toBe(42);
        return reactState;
      });

      hook.result.current[1](100);

      expect(mySignal.get()).toBe(100);
    });

    it('should resolve an UnSignal to a React value when readonly is true', () => {
      const mySignal = unSignal(42);
      const hook = renderHook(() => unResolve(mySignal, { readonly: true }));

      expect(hook.result.current).toBe(42);
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

    it.todo('should call the provided callback on scope dispose', () => {
      const callback = vi.fn();
      let isDisposable!: boolean;

      const hook = renderHook(() => {
        isDisposable = tryOnScopeDispose(callback);
      });

      expect(isDisposable).toBe(true);
      expect(callback).toHaveBeenCalledTimes(0);

      hook.unmount();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should return false if not inside a React effect scope', () => {
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

    it('should return true for React State', () => {
      const hook = renderHook(() => useState(42));
      expect(isUnRef(hook.result.current)).toBe(true);
    });

    it('should return true for React Ref', () => {
      const hook = renderHook(() => useRef(42));
      expect(isUnRef(hook.result.current)).toBe(true);
    });

    it('should return true for React Memo', () => {
      // TODO @Shinigami92 2025-06-24: This is tricky 🤔
      // useMemo returns a primitive value, so we cant check it in isUnRef
      const hook = renderHook(() => useMemo(() => 42, []));
      expect(isUnRef(hook.result.current)).toBe(false);
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
