import { signal } from 'alien-signals';

export const UN_SIGNAL = Symbol('UN_SIGNAL');

export interface UnSignal<T> {
  readonly [UN_SIGNAL]: true;
  get(): T;
  set(value: T): void;
}

export function unSignal<T>(initialValue: T): UnSignal<T>;
export function unSignal<T = undefined>(): UnSignal<T | undefined>;
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
