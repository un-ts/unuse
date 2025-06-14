export function toArray<T>(value: T | ReadonlyArray<T>): ReadonlyArray<T>;
export function toArray<T>(value: T | T[]): T[];
export function toArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}
