export function isObject(val: unknown): val is object {
  return Object.prototype.toString.call(val) === '[object Object]';
}
