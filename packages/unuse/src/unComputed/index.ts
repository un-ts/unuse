import { computed } from '../alien-signals';

export const UN_COMPUTED = Symbol('UN_COMPUTED');

export interface UnComputed<T> {
  readonly [UN_COMPUTED]: true;
  get(): T;
}

export function unComputed<T>(callback: () => T): UnComputed<T> {
  const value = computed(callback);

  return {
    [UN_COMPUTED]: true,
    get: value,
  };
}

export function isUnComputed<T>(value: unknown): value is UnComputed<T> {
  return (
    !!value &&
    typeof value === 'object' &&
    UN_COMPUTED in value &&
    value[UN_COMPUTED] === true
  );
}
