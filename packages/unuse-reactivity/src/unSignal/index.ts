import type { ReactiveFlags, ReactiveNode } from 'alien-signals';
import {
  REACTIVITY_STATE,
  flush,
  link,
  propagate,
  setCurrentSub,
  shallowPropagate,
  updateSignal,
} from '../unReactiveSystem';

export interface UnSignalState<T> extends ReactiveNode {
  previousValue: T;
  value: T;
}

/**
 * A unique symbol used to identify `UnSignal` objects.
 *
 * This helps distinguish them from other objects and ensures type safety.
 */
export const UN_SIGNAL = Symbol('UN_SIGNAL');

/**
 * An interface representing a writable signal object.
 *
 * This is a wrapper around an `alien-signals` signal that provides methods to get, set, and update the value.
 *
 * @template T The type of the value held by the signal.
 */
export interface UnSignal<T> {
  readonly [UN_SIGNAL]: true;

  /**
   * Retrieves the current value of the signal.
   */
  get(): T;

  /**
   * Retrieves the current value of the signal without triggering effects.
   */
  peek(): T;

  /**
   * Sets a new value for the signal.
   */
  set(value: T): void;

  /**
   * Updates the signal based on the previous value.
   */
  update(updater: (prev: T) => T): void;
}

export function unSignal<T>(initialValue: T): UnSignal<T>;
export function unSignal<T = undefined>(): UnSignal<T | undefined>;
/**
 * Creates an `UnSignal`, which is a writable signal object that can be used to manage state.
 *
 * @param initialValue The initial value of the signal. If not provided, it defaults to `undefined`.
 *
 * @returns An `UnSignal` object that has a `get` method to retrieve the current value, a `set` method to update the value, and an `update` method to update based on the previous value.
 */
export function unSignal<T>(initialValue?: T): UnSignal<T> {
  const state: UnSignalState<T> = {
    previousValue: initialValue as T,
    value: initialValue as T,
    subs: undefined,
    subsTail: undefined,
    flags: 1 satisfies ReactiveFlags.Mutable,
  };

  const get: UnSignal<T>['get'] = () => {
    const value = state.value;
    if (
      state.flags & (16 satisfies ReactiveFlags.Dirty) &&
      updateSignal(state, value)
    ) {
      const subs = state.subs;
      if (subs !== undefined) {
        shallowPropagate(subs);
      }
    }

    if (REACTIVITY_STATE.activeSub !== undefined) {
      link(state, REACTIVITY_STATE.activeSub);
    }

    return value;
  };

  const peek: UnSignal<T>['peek'] = () => {
    const prev = setCurrentSub(undefined);
    const val = get();
    setCurrentSub(prev);
    return val;
  };

  const set: UnSignal<T>['set'] = (newValue) => {
    if (state.value !== (state.value = newValue)) {
      state.flags = 17 as ReactiveFlags.Mutable | ReactiveFlags.Dirty;
      const subs = state.subs;
      if (subs !== undefined) {
        propagate(subs);
        if (!REACTIVITY_STATE.batchDepth) {
          flush();
        }
      }
    }
  };

  const update: UnSignal<T>['update'] = (updater) => {
    set(updater(state.value));
  };

  return {
    [UN_SIGNAL]: true,
    get,
    peek,
    set,
    update,
  };
}

/**
 * Checks if a value is an `UnSignal`.
 */
export function isUnSignal<T>(value: unknown): value is UnSignal<T> {
  return value ? (value as Partial<UnSignal<T>>)[UN_SIGNAL] === true : false;
}
