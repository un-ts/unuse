import type { ReactiveFlags, ReactiveNode } from 'alien-signals';
import {
  checkDirty,
  link,
  REACTIVITY_STATE,
  setCurrentSub,
  shallowPropagate,
  updateComputed,
} from '../unReactiveSystem';

export interface UnComputedState<T> extends ReactiveNode {
  value: T | undefined;
  getter: (previousValue?: T) => T;
}

/**
 * A unique symbol used to identify `UnComputed` objects.
 *
 * This helps distinguish them from other objects and ensures type safety.
 */
export const UN_COMPUTED = Symbol('UN_COMPUTED');

/**
 * An interface representing a readonly signal object.
 *
 * This is a wrapper around an `alien-signals` computed that provides a method to get the value.
 *
 * @template T The type of the value held by the computed.
 */
export interface UnComputed<T> {
  readonly [UN_COMPUTED]: true;

  /**
   * Retrieves the current value of the computed.
   */
  get(): T;

  /**
   * Retrieves the current value of the signal without triggering effects.
   */
  peek(): T;
}

/**
 * Creates an `UnComputed`, which is a readonly signal object that can be used to manage derived state.
 *
 * @param callback The function that computes the value of the signal.
 *
 * @returns An `UnComputed` object that has a `get` method to retrieve the current value.
 */
export function unComputed<T>(callback: () => T): UnComputed<T> {
  const state: UnComputedState<T> = {
    value: undefined,
    subs: undefined,
    subsTail: undefined,
    deps: undefined,
    depsTail: undefined,
    flags: 17 as ReactiveFlags.Mutable | ReactiveFlags.Dirty,
    getter: callback,
  };

  return {
    [UN_COMPUTED]: true,
    get() {
      const flags = state.flags;
      if (
        flags & (16 satisfies ReactiveFlags.Dirty) ||
        (flags & (32 satisfies ReactiveFlags.Pending) &&
          checkDirty(state.deps!, state))
      ) {
        if (updateComputed(state)) {
          const subs = state.subs;
          if (subs !== undefined) {
            shallowPropagate(subs);
          }
        }
      } else if (flags & (32 satisfies ReactiveFlags.Pending)) {
        state.flags = flags & ~(32 satisfies ReactiveFlags.Pending);
      }

      if (REACTIVITY_STATE.activeSub !== undefined) {
        link(state, REACTIVITY_STATE.activeSub);
      } else if (REACTIVITY_STATE.activeScope !== undefined) {
        link(state, REACTIVITY_STATE.activeScope);
      }

      return state.value!;
    },
    peek() {
      const prev = setCurrentSub(undefined);
      const val = this.get();
      setCurrentSub(prev);
      return val;
    },
  };
}

/**
 * Checks if a value is an `UnComputed` object.
 */
export function isUnComputed<T>(value: unknown): value is UnComputed<T> {
  return value
    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (value as any)[UN_COMPUTED] === true
    : false;
}
