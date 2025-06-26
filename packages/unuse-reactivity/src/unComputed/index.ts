import { computed } from 'alien-signals';

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
}

/**
 * Creates an `UnComputed`, which is a readonly signal object that can be used to manage derived state.
 *
 * @param callback The function that computes the value of the signal.
 *
 * @returns An `UnComputed` object that has a `get` method to retrieve the current value.
 */
export function unComputed<T>(callback: () => T): UnComputed<T> {
  const value = computed(callback);

  return {
    [UN_COMPUTED]: true,
    get() {
      // We need to call the computed inside the getter to ensure effects are triggered
      return value();
    },
  };
}

/**
 * Checks if a value is an `UnComputed` object.
 */
export function isUnComputed<T>(value: unknown): value is UnComputed<T> {
  return (
    !!value &&
    typeof value === 'object' &&
    UN_COMPUTED in value &&
    value[UN_COMPUTED] === true &&
    typeof (value as UnComputed<T>).get === 'function'
  );
}
