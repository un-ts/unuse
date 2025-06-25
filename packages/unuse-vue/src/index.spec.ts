/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */

// @vitest-environment happy-dom

import { describe, expect, it, vi } from 'vitest';
import { computed, createApp, defineComponent, h, ref } from 'vue';
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

type InstanceType<V> = V extends { new (...arg: any[]): infer X } ? X : never;
type VM<V> = InstanceType<V> & { unmount: () => void };

function mount<V>(Comp: V) {
  const el = document.createElement('div');
  const app = createApp(Comp as any);

  const unmount = () => app.unmount();
  const comp = app.mount(el) as any as VM<V>;
  comp.unmount = unmount;
  return comp;
}

function useSetup<V>(setup: () => V) {
  const Comp = defineComponent({
    setup,
    render() {
      return h('div', []);
    },
  });

  return mount(Comp);
}

describe('unuse-vue', () => {
  it('should export correct global variable', () => {
    expect(globalThis.__UNUSE_FRAMEWORK__).toBe('vue');
  });

  describe('toUnSignal', () => {
    it('should export toUnSignal function', () => {
      expect(toUnSignal).toBeTypeOf('function');
    });

    it('should convert a Vue ref to an UnSignal', () => {
      const vueRef = ref(42);
      const mySignal = toUnSignal(vueRef);
      expect(mySignal.get()).toBe(42);

      mySignal.set(100);
      expect(vueRef.value).toBe(100);
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

    it('should resolve an UnSignal to a Vue ref', () => {
      const mySignal = unSignal(42);
      const resolved = unResolve(mySignal);

      expect(resolved.value).toBe(42);
      resolved.value = 100;
      expect(mySignal.get()).toBe(100);
    });

    it('should resolve an UnSignal to a Vue computed ref when readonly is true', () => {
      const mySignal = unSignal(42);
      const resolved = unResolve(mySignal, { readonly: true });

      expect(resolved.value).toBe(42);
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

    it('should call the provided callback on scope dispose', () => {
      const callback = vi.fn();
      let isDisposable!: boolean;

      const { unmount } = useSetup(() => {
        isDisposable = tryOnScopeDispose(callback);
      });

      expect(isDisposable).toBe(true);
      expect(callback).toHaveBeenCalledTimes(0);

      unmount();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should return false if not inside a Vue effect scope', () => {
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

    it('should return true for Vue ref', () => {
      const vueRef = ref(42);
      expect(isUnRef(vueRef)).toBe(true);
    });

    it('should return true for Vue computed ref', () => {
      const vueComputed = computed(() => 42);
      expect(isUnRef(vueComputed)).toBe(true);
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
