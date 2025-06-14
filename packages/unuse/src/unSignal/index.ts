import { signal } from 'alien-signals';

export const UN_SIGNAL = Symbol('UN_SIGNAL');

export interface UnSignal<T> {
  readonly [UN_SIGNAL]: true;
  get(): T;
  set(value: T): void;
}

export function unSignal<T>(initialValue: T): UnSignal<T>;
export function unSignal<T = undefined>(): UnSignal<T | undefined>;
/**
 * Creates an `UnSignal`, which is a writable signal-like object that can be used to manage state.
 *
 * @param initialValue The initial value of the signal. If not provided, it defaults to `undefined`.
 *
 * @returns An `UnSignal` object that has a `get` method to retrieve the current value and a `set` method to update the value.
 */
export function unSignal<T>(initialValue?: T): UnSignal<T> {
  const state = signal(initialValue);
  return {
    [UN_SIGNAL]: true,
    get: () => state() as T,
    set: (value) => {
      state(value);
    },
  };
}

export function isUnSignal<T>(value: unknown): value is UnSignal<T> {
  return (
    !!value &&
    typeof value === 'object' &&
    UN_SIGNAL in value &&
    value[UN_SIGNAL] === true
  );
}
