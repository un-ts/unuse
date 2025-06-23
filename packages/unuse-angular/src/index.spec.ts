// @vitest-environment happy-dom

import {
  computed,
  NgModule,
  provideZonelessChangeDetection,
  signal,
} from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { beforeAll, describe, expect, it, vi } from 'vitest';
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

@NgModule({ providers: [provideZonelessChangeDetection()] })
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
class ZonelessTestModule {}

describe('unuse-angular', () => {
  it('should export correct global variable', () => {
    expect(globalThis.__UNUSE_FRAMEWORK__).toBe('angular');
  });

  beforeAll(() => {
    getTestBed().initTestEnvironment(
      [BrowserTestingModule, ZonelessTestModule],
      platformBrowserTesting()
    );
  });

  describe('toUnSignal', () => {
    it('should export toUnSignal function', () => {
      expect(toUnSignal).toBeTypeOf('function');
    });

    it('should convert an Angular Signal to an UnSignal', () => {
      const angularSignal = signal(42);
      getTestBed().runInInjectionContext(() => {
        const mySignal = toUnSignal(angularSignal);
        expect(mySignal.get()).toBe(42);

        mySignal.set(100);
      });

      expect(angularSignal()).toBe(100);
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

    it('should resolve an UnSignal to an Angular WritableSignal', () => {
      const mySignal = unSignal(42);
      const resolved = unResolve(mySignal);

      expect(resolved()).toBe(42);
      resolved.set(100);
      expect(mySignal.get()).toBe(100);
    });

    it('should resolve an UnSignal to an Angular Signal when readonly is true', () => {
      const mySignal = unSignal(42);
      const resolved = unResolve(mySignal, { readonly: true });

      expect(resolved()).toBe(42);
    });

    it('should resolve an UnSignal to an UnSignal when framework is null', () => {
      const mySignal = unSignal(42);
      const resolved = unResolve(mySignal, { framework: 'none' });

      expect(resolved).toSatisfy(isUnSignal);
      expect(resolved.get()).toBe(42);
    });

    it('should resolve an UnSignal to an UnComputed when framework is null and readonly is true', () => {
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

      getTestBed().runInInjectionContext(() => {
        isDisposable = tryOnScopeDispose(callback);

        expect(isDisposable).toBe(true);
        expect(callback).toHaveBeenCalledTimes(0);
      });

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should return false if not inside an Angular effect scope', () => {
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

    it('should return true for Angular signal', () => {
      const angularSignal = signal(42);
      expect(isUnRef(angularSignal)).toBe(true);
    });

    it('should return true for Angular computed', () => {
      const angularComputed = computed(() => 42);
      expect(isUnRef(angularComputed)).toBe(true);
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
