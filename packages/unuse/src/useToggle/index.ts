import { toUnSignal } from '../toUnSignal';
import type { MaybeUnRef, UnRef } from '../unAccess';
import { isUnRef, unAccess } from '../unAccess';
import type { ReadonlyUnResolveReturn } from '../unResolve';
import { unResolve } from '../unResolve';

export type ToggleFn<
  TTruthy = true,
  TFalsy = false,
  T extends TTruthy | TFalsy | undefined = TTruthy | TFalsy | undefined,
> = (value?: T) => T;

export type UseToggleReturn<
  TTruthy = true,
  TFalsy = false,
  T extends TTruthy | TFalsy | undefined = TTruthy | TFalsy | undefined,
> =
  | [ReadonlyUnResolveReturn<T>, ToggleFn<TTruthy, TFalsy, T>]
  | ToggleFn<TTruthy, TFalsy, T>;

export interface UseToggleOptions<TTruthy = true, TFalsy = false> {
  truthyValue?: MaybeUnRef<TTruthy>;
  falsyValue?: MaybeUnRef<TFalsy>;
}

export function useToggle<
  TTruthy = true,
  TFalsy = false,
  T extends TTruthy | TFalsy = TTruthy | TFalsy,
>(
  initialValue: UnRef<T>,
  options?: UseToggleOptions<TTruthy, TFalsy>
): ToggleFn<TTruthy, TFalsy, T>;
export function useToggle<
  TTruthy = true,
  TFalsy = false,
  T extends TTruthy | TFalsy = TTruthy | TFalsy,
>(
  initialValue?: T,
  options?: UseToggleOptions<TTruthy, TFalsy>
): [ReadonlyUnResolveReturn<T>, ToggleFn<TTruthy, TFalsy, T>];
/**
 * A simple toggle hook that allows you to toggle a value.
 *
 * @param initialValue The initial value to toggle, defaults to `false`.
 * @param options Optional options to configure the toggle value.
 */
export function useToggle<
  TTruthy = true,
  TFalsy = false,
  T extends TTruthy | TFalsy | undefined = TTruthy | TFalsy | undefined,
>(
  initialValue: MaybeUnRef<T> = false as T,
  options: UseToggleOptions<TTruthy, TFalsy> = {}
): UseToggleReturn<TTruthy, TFalsy, T> {
  const { truthyValue = true as TTruthy, falsyValue = false as TFalsy } =
    options;

  const valueIsUnRef = isUnRef(initialValue);
  const _value = toUnSignal(initialValue);

  // This needs to be a function, because `arguments` is not valid in arrow functions!
  function toggle(value?: T): T {
    // has arguments
    if (arguments.length > 0) {
      _value.set(value as T);
      return _value.get();
    }

    const truthy = unAccess(truthyValue);
    const falsy = unAccess(falsyValue);
    _value.update((prev) => (prev === truthy ? falsy : truthy) as T);
    return _value.get();
  }

  if (valueIsUnRef) {
    return toggle;
  }

  return [unResolve(_value), toggle] as const;
}
