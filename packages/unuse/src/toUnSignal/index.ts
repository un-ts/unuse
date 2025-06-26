import type { Signal as AngularSignal } from '@angular/core';
import type { Accessor as SolidAccessor } from 'solid-js';
import type { UnSignal } from 'unuse-reactivity';
import { isUnSignal, unEffect, unSignal } from 'unuse-reactivity';
import type { Ref as VueRef } from 'vue';
import type { SupportedFramework } from '../_framework';
import { importedFramework } from '../_framework';
import type { MaybeUnRef } from '../unAccess';

const REGISTRY: {
  toUnSignalOverride?: typeof toUnSignal;
} = {
  toUnSignalOverride: undefined,
};

export function overrideToUnSignalFn(fn: typeof toUnSignal): void {
  REGISTRY.toUnSignalOverride = fn;
}

/**
 * Tries to convert any given framework-specific ref/signal/state to an `UnSignal`.
 *
 * The reactivity will be maintained, meaning that changes to the framework-specific ref/signal/state will also update the `UnSignal`, and vice versa. However, this only works if the given value is reactive.
 *
 * @param value The value to convert to an `UnSignal`.
 *
 * @returns An `UnSignal` that wraps the given value, or an empty `UnSignal` if the value is `undefined` or `null`.
 */
export function toUnSignal<T>(value: MaybeUnRef<T>): UnSignal<T> {
  if (value === undefined) {
    return unSignal() as UnSignal<T>;
  }

  if (value === null) {
    return unSignal(null) as UnSignal<T>;
  }

  if (isUnSignal(value)) {
    return value;
  }

  if (typeof REGISTRY.toUnSignalOverride === 'function') {
    return REGISTRY.toUnSignalOverride(value);
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const framework = (globalThis.__UNUSE_FRAMEWORK__ ||
    'none') as SupportedFramework;
  if (framework === 'none') {
    return unSignal(value) as UnSignal<T>;
  }

  switch (framework) {
    case 'angular': {
      const Angular = importedFramework('angular');

      if (Angular.isSignal(value)) {
        const result = unSignal<T>((value as AngularSignal<T>)());

        Angular.effect(() => {
          result.set((value as AngularSignal<T>)());
        });

        if ('set' in value) {
          unEffect(() => {
            value.set(result.get());
          });
        }

        return result;
      }

      break;
    }

    case 'react': {
      const React = importedFramework('react');

      if (typeof value === 'object' && 'current' in value) {
        // got ref
        const result = unSignal<T>(value.current);

        React.useEffect(() => {
          result.set(value.current);
        }, [value]);

        return result;
      } else if (Array.isArray(value) && (value as unknown[]).length > 0) {
        // got state
        const result = unSignal<T>(value[0] as T);

        React.useEffect(() => {
          result.set(value[0] as T);
        });

        unEffect(() => {
          if (value[0] !== result.get()) {
            value[1](() => result.get());
          }
        });

        return result;
      }

      break;
    }

    case 'solid': {
      const Solid = importedFramework('solid');

      if (typeof value === 'function') {
        // got Accessor
        const result = unSignal<T>((value as SolidAccessor<T>)());

        Solid.createEffect(() => {
          result.set((value as SolidAccessor<T>)());
        });

        return result;
      } else if (
        Array.isArray(value) &&
        (value as unknown[]).length > 0 &&
        typeof value[0] === 'function'
      ) {
        // got Signal
        const accessor = value[0] as SolidAccessor<T>;
        const result = unSignal<T>(accessor());

        Solid.createEffect(() => {
          result.set(accessor());
        });

        unEffect(() => {
          value[1](() => result.get());
        });

        return result;
      }

      break;
    }

    case 'vue': {
      const Vue = importedFramework('vue');

      if (Vue.isRef(value)) {
        const result = unSignal<T>(value.value);

        Vue.watch(
          value,
          (newValue) => {
            result.set(newValue);
          },
          { flush: 'sync' }
        );

        if (!Vue.isReadonly(value)) {
          unEffect(() => {
            (value as VueRef<T>).value = result.get();
          });
        }

        return result;
      }

      break;
    }
  }

  return unSignal(value) as UnSignal<T>;
}
