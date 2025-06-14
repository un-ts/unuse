import type { Signal as AngularSignal } from '@angular/core';
import type { RefObject as ReactRefObject } from 'react';
import type {
  Accessor as SolidAccessor,
  Signal as SolidSignal,
} from 'solid-js';
import type { Ref as VueRef } from 'vue';

export type UnRef<T> =
  | AngularSignal<T>
  | ReactRefObject<T> // not sure if ReactRefObject is the correct one we want
  | SolidAccessor<T>
  | SolidSignal<T>
  | VueRef<T>
  | (() => T);

export function unAccess<T>(ref: UnRef<T>): T {
  if (typeof ref === 'function') {
    return ref();
  } else if ('current' in ref) {
    return ref.current;
  } else if ('value' in ref) {
    return ref.value;
  }

  return ref as T;
}
