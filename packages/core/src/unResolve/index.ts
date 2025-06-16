import type { WritableSignal as AngularWritableSignal } from '@angular/core';
import { effect } from 'alien-signals';
import type { useState as useReactState } from 'react';
import type { Signal as SolidSignal } from 'solid-js';
import type { Ref as VueRef } from 'vue';
import type { SupportedFramework } from '../_framework';
import { importedFramework } from '../_framework';
import type { UnSignal } from '../unSignal';

export interface UnResolveOptions<
  TFramework extends SupportedFramework | undefined = undefined,
  TReadonly extends boolean = false,
> {
  /**
   * @default undefined
   */
  framework?: TFramework;
  /**
   * @default false
   */
  readonly?: TReadonly;
}

// export function unResolve<T>(
//   signal: UnSignal<T>,
//   options: UnResolveOptions<'angular'>
// ): AngularWritableSignal<T>;
// export function unResolve<T>(
//   signal: UnSignal<T>,
//   options: UnResolveOptions<'react'>
// ): ReturnType<typeof useReactState<T>>;
// export function unResolve<T>(
//   signal: UnSignal<T>,
//   options: UnResolveOptions<'solid'>
// ): SolidSignal<T>;
// export function unResolve<T>(
//   signal: UnSignal<T>,
//   options: UnResolveOptions<'vue'>
// ): VueRef<T>;
// export function unResolve<T>(
//   signal: UnSignal<T>,
//   options?: UnResolveOptions
// ): UnSignal<T>;
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
  TFramework extends SupportedFramework | undefined = undefined,
  TReadonly extends boolean = false,
>(
  signal: UnSignal<T>,
  options: UnResolveOptions<TFramework, TReadonly> = {}
): TFramework extends 'angular'
  ? AngularWritableSignal<T>
  : TFramework extends 'react'
    ? ReturnType<typeof useReactState<T>>
    : TFramework extends 'solid'
      ? SolidSignal<T>
      : TFramework extends 'vue'
        ? VueRef<T>
        : UnSignal<T> {
  const {
    framework = process.env.UNUSE_FRAMEWORK as SupportedFramework | undefined,
    readonly = false as boolean,
  } = options as UnResolveOptions<SupportedFramework | undefined>;

  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (framework) {
    case 'angular': {
      const Angular = importedFramework('angular');

      const state = Angular.signal(signal.get());

      effect(() => state.set(signal.get()));

      if (!readonly) {
        Angular.effect(() => signal.set(state()));
      }

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

      return state as ReturnType<typeof useReactState<T>>;
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

      return state;
    }

    case 'vue': {
      const Vue = importedFramework('vue');

      const state = Vue.ref(signal.get());

      effect(() => (state.value = signal.get()));

      if (!readonly) {
        Vue.watch(state, (newValue) => signal.set(newValue), { flush: 'sync' });
      }

      return state as VueRef<T>;
    }

    default: {
      // TODO @Shinigami92 2025-06-15: Implement a readonly UnSignal
      return signal;
    }
  }
}
