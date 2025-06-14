import type {
  Signal as AngularSignal,
  WritableSignal as AngularWritableSignal,
} from '@angular/core';
import {
  effect as angularEffect,
  signal as angularSignal,
} from '@angular/core';
import { effect } from 'alien-signals';
import { useState as useReactState } from 'react';
import type { Signal as SolidSignal } from 'solid-js';
import { createSignal } from 'solid-js';
import type { Ref as VueRef } from 'vue';
import { ref as vueRef, watch as vueWatch } from 'vue';
import type { UnSignal } from '../unSignal';

export function unResolve<T>(
  signal: UnSignal<T>,
  options: {
    framework: 'angular';
    readonly?: boolean;
  }
): AngularWritableSignal<T>;
export function unResolve<T>(
  signal: UnSignal<T>,
  options: {
    framework: 'react';
    readonly?: boolean;
  }
): ReturnType<typeof useReactState<T>>;
export function unResolve<T>(
  signal: UnSignal<T>,
  options: {
    framework: 'solid';
    readonly?: boolean;
  }
): SolidSignal<T>;
export function unResolve<T>(
  signal: UnSignal<T>,
  options: {
    framework: 'vue';
    readonly?: boolean;
  }
): VueRef<T>;
export function unResolve<T>(
  signal: UnSignal<T>,
  options?: {
    framework?: undefined;
    readonly?: boolean;
  }
): UnSignal<T>;
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
export function unResolve<T>(
  signal: UnSignal<T>,
  options: {
    framework?: 'angular' | 'react' | 'solid' | 'vue' | undefined;
    readonly?: boolean;
  } = {}
):
  | AngularSignal<T>
  | ReturnType<typeof useReactState<T>>
  | UnSignal<T>
  | SolidSignal<T>
  | VueRef<T> {
  const { framework = process.env.UNUSE_FRAMEWORK, readonly = false } = options;

  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (framework) {
    case 'angular': {
      const state = angularSignal(signal.get());

      effect(() => state.set(signal.get()));

      if (!readonly) {
        angularEffect(() => signal.set(state()));
      }

      return state;
    }

    case 'react': {
      const state = useReactState(signal.get());

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
      const state = createSignal(signal.get());

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
      const state = vueRef(signal.get());

      effect(() => (state.value = signal.get()));

      if (!readonly) {
        vueWatch(state, (newValue) => signal.set(newValue), { flush: 'sync' });
      }

      return state as VueRef<T>;
    }

    default: {
      // TODO @Shinigami92 2025-06-15: Implement a readonly UnSignal
      return signal;
    }
  }
}
