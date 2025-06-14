import type {
  Signal as AngularSignal,
  WritableSignal as AngularWritableSignal,
} from '@angular/core';
import { effect } from 'alien-signals';
import type { useMemo as useReactMemo, useState as useReactState } from 'react';
import type {
  Accessor as SolidAccessor,
  Signal as SolidSignal,
} from 'solid-js';
import type { ComputedRef as VueComputedRef, Ref as VueRef } from 'vue';
import type { SupportedFramework } from '../_framework';
import { importedFramework } from '../_framework';
import type { UnComputed } from '../unComputed';
import { unComputed } from '../unComputed';
import type { UnSignal } from '../unSignal';

export interface UnResolveOptions<
  TFramework extends
    | SupportedFramework
    | undefined = typeof globalThis.__UNUSE_FRAMEWORK__,
  TReadonly extends boolean = false,
> {
  /**
   * @default globalThis.__UNUSE_FRAMEWORK__
   */
  framework?: TFramework;
  /**
   * @default false
   */
  readonly?: TReadonly;
}

export type ReadonlyUnResolveReturn<
  T,
  TFramework extends
    | SupportedFramework
    | undefined = typeof globalThis.__UNUSE_FRAMEWORK__,
> = TFramework extends 'angular'
  ? AngularSignal<T>
  : TFramework extends 'react'
    ? ReturnType<typeof useReactMemo<T>>
    : TFramework extends 'solid'
      ? SolidAccessor<T>
      : TFramework extends 'vue'
        ? VueComputedRef<T>
        : UnComputed<T>;

export type WritableUnResolveReturn<
  T,
  TFramework extends
    | SupportedFramework
    | undefined = typeof globalThis.__UNUSE_FRAMEWORK__,
> = TFramework extends 'angular'
  ? AngularWritableSignal<T>
  : TFramework extends 'react'
    ? ReturnType<typeof useReactState<T>>
    : TFramework extends 'solid'
      ? SolidSignal<T>
      : TFramework extends 'vue'
        ? VueRef<T>
        : UnSignal<T>;

export type UnResolveReturn<
  T,
  TFramework extends
    | SupportedFramework
    | undefined = typeof globalThis.__UNUSE_FRAMEWORK__,
  TReadonly extends boolean = false,
> = TReadonly extends true
  ? ReadonlyUnResolveReturn<T, TFramework>
  : WritableUnResolveReturn<T, TFramework>;

const REGISTRY: {
  unResolveOverride?: typeof unResolve;
} = {
  unResolveOverride: undefined,
};

export function overrideUnResolveFn(fn: typeof unResolve): void {
  REGISTRY.unResolveOverride = fn;
}

/**
 * Converts an `UnSignal` to a framework-specific ref/signal/state.
 *
 * The reactivity will be maintained, meaning that changes to the `UnSignal` will also update the framework-specific ref/signal/state, and vice versa.
 *
 * @param signal The `UnSignal` to convert.
 * @param options The options to configure the conversion.
 *
 * @returns The framework-specific ref/signal/state.
 */
export function unResolve<
  T,
  TFramework extends
    | SupportedFramework
    | undefined = typeof globalThis.__UNUSE_FRAMEWORK__,
  TReadonly extends boolean = false,
>(
  signal: UnSignal<T>,
  options: UnResolveOptions<TFramework, TReadonly> = {}
): UnResolveReturn<T, TFramework, TReadonly> {
  if (typeof REGISTRY.unResolveOverride === 'function') {
    return REGISTRY.unResolveOverride(signal, options);
  }

  const {
    framework = globalThis.__UNUSE_FRAMEWORK__ as
      | SupportedFramework
      | undefined,
    readonly = false as boolean,
  } = options;

  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (framework) {
    case 'angular': {
      const Angular = importedFramework('angular');

      // TODO @Shinigami92 2025-06-20: Looks like Angular does not get the same instance and therefore it is not the same signal
      const state = Angular.signal(signal.get());

      effect(() => state.set(signal.get()));

      if (!readonly) {
        // HACK @Shinigami92 2025-06-20: This is horrible dangerously unsafe, but currently works 👀
        const originalSet = state.set;

        state.set = (value) => {
          originalSet(value);
          signal.set(value);
        };

        const originalUpdate = state.update;

        state.update = (updater) => {
          const result = updater(signal.get());
          originalUpdate(() => result);
          signal.set(result);
        };
      }

      // @ts-expect-error: just do it
      return state;
    }

    case 'react': {
      const React = importedFramework('react');

      const state = React.useState(signal.get());

      if (!readonly) {
        // HACK @Shinigami92 2025-06-15: This is horrible dangerously unsafe, but currently works 👀
        const originalSet = state[1];

        state[1] = (value) => {
          if (typeof value !== 'function') {
            originalSet(() => value);
            state[0] = value;
            signal.set(value);
          } else if (typeof value === 'function') {
            const result =
              // @ts-expect-error: eat it
              value(state[0]);
            originalSet(result);
            state[0] = result;
            signal.set(result);
          }
        };
      }

      effect(() => {
        const newValue = signal.get();

        if (state[0] === newValue) {
          return;
        }

        state[1](newValue);
      });

      return readonly
        ? // @ts-expect-error: just do it
          state[0]
        : // @ts-expect-error: just do it
          (state as ReturnType<typeof useReactState<T>>);
    }

    case 'solid': {
      const Solid = importedFramework('solid');

      const state = Solid.createSignal(signal.get());

      if (!readonly) {
        // HACK @Shinigami92 2025-06-15: This is horrible dangerously unsafe, but currently works 👀
        const originalSet = state[1];
        // @ts-expect-error: eat it
        state[1] = (value) => {
          if (typeof value !== 'function') {
            const casted = value as T;

            originalSet(() => casted);
            signal.set(casted);
          } else if (typeof value === 'function') {
            const result =
              // @ts-expect-error: eat it
              value(state[0]);
            originalSet(result);
            signal.set(result);
          }

          // TODO @Shinigami92 2025-06-15: do we need to add a fallback for `undefined`?
        };
      }

      effect(() => state[1](() => signal.get()));

      // @ts-expect-error: just do it
      return readonly ? state[0] : state;
    }

    case 'vue': {
      const Vue = importedFramework('vue');

      const state = Vue.ref(signal.get());

      effect(() => (state.value = signal.get()));

      if (!readonly) {
        Vue.watch(state, (newValue) => signal.set(newValue), { flush: 'sync' });
      }

      // @ts-expect-error: just do it
      return state as VueRef<T>;
    }

    default: {
      if (readonly) {
        // @ts-expect-error: just do it
        return unComputed(() => signal.get());
      }

      // @ts-expect-error: just do it
      return signal;
    }
  }
}
