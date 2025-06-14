import type {
  Signal as AngularSignal,
  WritableSignal as AngularWritableSignal,
} from '@angular/core';
import type {
  Dispatch as ReactDispatch,
  RefObject as ReactRefObject,
  SetStateAction as SetReactStateAction,
} from 'react';
import type {
  Accessor as SolidAccessor,
  Signal as SolidSignal,
} from 'solid-js';
import type { ComputedRef as VueComputedRef, Ref as VueRef } from 'vue';
import type { SupportedFramework } from '../_framework';
import { importedFramework } from '../_framework';
import type { UnComputed } from '../unComputed';
import { isUnComputed } from '../unComputed';
import type { UnSignal } from '../unSignal';
import { isUnSignal } from '../unSignal';

/**
 * UnRef represents any kind of reference or signal that can be dereferenced to get its value.
 */
export type UnRef<T> =
  | AngularSignal<T>
  | AngularWritableSignal<T>
  | ReactRefObject<T> // not sure if ReactRefObject is the correct one we want
  | [T, ReactDispatch<SetReactStateAction<T>>]
  | SolidAccessor<T>
  | SolidSignal<T>
  | VueRef<T>
  | VueComputedRef<T>
  | UnSignal<T>
  | UnComputed<T>
  | (() => T);

const REGISTRY: {
  isUnRefOverride?: typeof isUnRef;
} = {
  isUnRefOverride: undefined,
};

export function overrideIsUnRefFn(fn: typeof isUnRef): void {
  REGISTRY.isUnRefOverride = fn;
}

export function isUnRef<T>(value: unknown): value is UnRef<T> {
  if (value === undefined || value === null) {
    return false;
  }

  if (
    typeof value === 'bigint' ||
    typeof value === 'boolean' ||
    typeof value === 'number' ||
    typeof value === 'string' ||
    typeof value === 'symbol'
  ) {
    return false;
  }

  if (isUnSignal(value) || isUnComputed(value)) {
    return true;
  }

  if (typeof REGISTRY.isUnRefOverride === 'function') {
    return REGISTRY.isUnRefOverride(value);
  }

  const framework = globalThis.__UNUSE_FRAMEWORK__ as
    | SupportedFramework
    | undefined;

  if (framework) {
    switch (framework) {
      case 'angular': {
        const Angular = importedFramework('angular');

        if (Angular.isSignal(value)) {
          return true;
        }

        break;
      }

      case 'react': {
        if (typeof value === 'object' && 'current' in value) {
          return true;
        }

        if (Array.isArray(value) && value.length > 0) {
          return true;
        }

        break;
      }

      case 'solid': {
        if (typeof value === 'function') {
          return true;
        }

        if (Array.isArray(value) && value.length > 0) {
          return true;
        }

        break;
      }

      case 'vue': {
        const Vue = importedFramework('vue');

        if (Vue.isRef(value)) {
          return true;
        }

        break;
      }
    }
  }

  return false;
}

/**
 * MaybeUnRef represents a value that can either be a direct value or an UnRef.
 */
export type MaybeUnRef<T> = T | UnRef<T>;

export interface UnAccessOptions {
  /**
   * @default true
   */
  unwrapFunction?: boolean;
}

export type UnAccessReturn<T> = Readonly<T>;

/**
 * Dereferences a MaybeUnRef value to get its actual value.
 *
 * Getting the value will trigger reactivity if the value is a signal or ref.
 *
 * @param ref The MaybeUnRef value to dereference. It can be a direct value, a signal, a ref, or a function that returns a value.
 *
 * @returns The dereferenced value, which is readonly.
 */
export function unAccess<T>(
  ref: MaybeUnRef<T>,
  options: UnAccessOptions = {}
): UnAccessReturn<T> {
  const { unwrapFunction = true } = options;

  if (ref === undefined || ref === null) {
    return ref;
  }

  if (isUnSignal(ref) || isUnComputed(ref)) {
    return ref.get();
  }

  // TODO @Shinigami92 2025-06-16: Maybe use UNUSE_FRAMEWORK here

  if (typeof ref === 'function' && unwrapFunction) {
    // @ts-expect-error: call it
    return ref() as T;
  }

  if (typeof ref === 'object') {
    if ('current' in ref) {
      return ref.current;
    }

    if ('value' in ref) {
      return ref.value;
    }

    if (Array.isArray(ref)) {
      // TODO @Shinigami92 2025-06-15: What if a function wanted to be stored in the Signal?
      const ref0 = ref[0];
      if (typeof ref0 === 'function' && unwrapFunction) {
        // @ts-expect-error: call it
        return ref0() as T;
      }

      return ref0 as T;
    }
  }

  return ref as T;
}
