import { signal } from 'alien-signals';

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
  let internalValue = initialValue as T;
  const state = signal(initialValue);

  return {
    [UN_SIGNAL]: true,
    get: () => {
      // We need to call the signal inside the getter to ensure effects are triggered
      return state() as T;
    },
    set: (value) => {
      internalValue = value;
      state(value);
    },
    update: (updater) => {
      internalValue = updater(internalValue);
      state(internalValue);
    },
  };
}

/**
 * Checks if a value is an `UnSignal`.
 */
export function isUnSignal<T>(value: unknown): value is UnSignal<T> {
  return (
    !!value &&
    typeof value === 'object' &&
    UN_SIGNAL in value &&
    value[UN_SIGNAL] === true &&
    typeof (value as UnSignal<T>).get === 'function' &&
    typeof (value as UnSignal<T>).set === 'function' &&
    typeof (value as UnSignal<T>).update === 'function'
  );
}
