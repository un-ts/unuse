import type { Signal as AngularSignal } from '@angular/core';
import type {
  Dispatch as ReactDispatch,
  RefObject as ReactRefObject,
  SetStateAction as SetReactStateAction,
} from 'react';
import type {
  Accessor as SolidAccessor,
  Signal as SolidSignal,
} from 'solid-js';
import type { Ref as VueRef } from 'vue';
import type { UnComputed } from '../unComputed';
import { isUnComputed } from '../unComputed';
import type { UnSignal } from '../unSignal';
import { isUnSignal } from '../unSignal';

/**
 * UnRef represents any kind of reference or signal that can be dereferenced to get its value.
 */
export type UnRef<T> =
  | AngularSignal<T>
  | ReactRefObject<T> // not sure if ReactRefObject is the correct one we want
  | [T, ReactDispatch<SetReactStateAction<T>>]
  | SolidAccessor<T>
  | SolidSignal<T>
  | VueRef<T>
  | UnSignal<T>
  | UnComputed<T>
  | (() => T);

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
