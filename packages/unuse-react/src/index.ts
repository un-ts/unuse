/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import-x/export */
import type {
  Dispatch as ReactDispatch,
  RefObject as ReactRefObject,
  SetStateAction as SetReactStateAction,
  useMemo as useReactMemo,
} from 'react';
import { useEffect as useReactEffect, useState as useReactState } from 'react';
import type {
  MaybeUnRef,
  SupportedFramework,
  UnComputed,
  UnSignal,
} from 'unuse';
import {
  overrideIsUnRefFn,
  overrideToUnSignalFn,
  overrideTryOnScopeDisposeFn,
  overrideUnResolveFn,
  unComputed,
  unEffect,
  unSignal,
} from 'unuse';

declare global {
  // @ts-ignore: set global variable type
  var __UNUSE_FRAMEWORK__: 'react';
}

// @ts-ignore: set global variable
globalThis.__UNUSE_FRAMEWORK__ = 'react';

export * from 'unuse';

/**
 * Tries to convert any given framework-specific ref/signal/state to an `UnSignal`.
 *
 * The reactivity will be maintained, meaning that changes to the framework-specific ref/signal/state will also update the `UnSignal`, and vice versa. However, this only works if the given value is reactive.
 *
 * @param value The value to convert to an `UnSignal`.
 *
 * @returns An `UnSignal` that wraps the given value, or an empty `UnSignal` if the value is `undefined` or `null`.
 */
function toUnSignal<T>(value: MaybeUnRef<T>): UnSignal<T> {
  if (value !== null && typeof value === 'object' && 'current' in value) {
    // got ref
    const result = unSignal<T>(value.current);

    useReactEffect(() => {
      result.set(value.current);
    }, [value]);

    return result;
  } else if (Array.isArray(value) && (value as unknown[]).length > 0) {
    // got state
    const result = unSignal<T>(value[0] as T);

    useReactEffect(() => {
      result.set(value[0] as T);
    });

    unEffect(() => {
      if (value[0] !== result.get()) {
        value[1](() => result.get());
      }
    });

    return result;
  }

  return unSignal(value) as UnSignal<T>;
}

export interface UnResolveOptions<
  TFramework extends SupportedFramework | undefined = 'react',
  TReadonly extends boolean = false,
> {
  /**
   * @default 'react'
   */
  framework?: TFramework;
  /**
   * @default false
   */
  readonly?: TReadonly;
}

export type ReadonlyUnResolveReturn<
  T,
  TFramework extends SupportedFramework | undefined = 'react',
> = TFramework extends 'react'
  ? ReturnType<typeof useReactMemo<T>>
  : UnComputed<T>;

export type WritableUnResolveReturn<
  T,
  TFramework extends SupportedFramework | undefined = 'react',
> = TFramework extends 'react'
  ? ReturnType<typeof useReactState<T>>
  : UnSignal<T>;

export type UnResolveReturn<
  T,
  TFramework extends SupportedFramework | undefined = 'react',
  TReadonly extends boolean = false,
> = TReadonly extends true
  ? ReadonlyUnResolveReturn<T, TFramework>
  : WritableUnResolveReturn<T, TFramework>;

/**
 * Converts an `UnSignal` to a framework-specific ref/signal/state.
 *
 * The reactivity will be maintained, meaning that changes to the `UnSignal` will also update the framework-specific ref/signal/state, and vice versa.
 *
 * @param signal The `UnSignal` to convert.
 * @param options The options to configure the conversion.
 *
 * @returns The framework-specific ref/signal/state.
 */
function unResolve<
  T,
  TFramework extends SupportedFramework | undefined = 'react',
  TReadonly extends boolean = false,
>(
  signal: UnSignal<T>,
  options: UnResolveOptions<TFramework, TReadonly> = {}
): UnResolveReturn<T, TFramework, TReadonly> {
  const {
    framework = 'react' as SupportedFramework | undefined,
    readonly = false as boolean,
  } = options;

  if (framework === 'react') {
    const state = useReactState(signal.get());

    if (!readonly) {
      useReactEffect(() => {
        const value = state[0];
        signal.set(value as any);
      });
    }

    unEffect(() => {
      const newValue = signal.get();

      if (state[0] === newValue) {
        return;
      }

      state[1](newValue);
    });

    // @ts-expect-error: just do it
    return readonly ? state[0] : (state as ReturnType<typeof useReactState<T>>);
  }

  if (readonly) {
    // @ts-expect-error: just do it
    return unComputed(() => signal.get());
  }

  // @ts-expect-error: just do it
  return signal;
}

/**
 * Call framework's specific onScopeDispose() if it's inside an effect scope lifecycle, if not, do nothing.
 *
 * @param fn
 */
function tryOnScopeDispose(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fn: () => void
): boolean {
  // React does not have a direct equivalent to onScopeDispose,
  return false;
}

/**
 * UnRef represents any kind of reference or signal that can be dereferenced to get its value.
 */
export type UnRef<T> =
  | ReactRefObject<T> // not sure if ReactRefObject is the correct one we want
  | [T, ReactDispatch<SetReactStateAction<T>>]
  | UnSignal<T>
  | UnComputed<T>
  | (() => T);

function isUnRef<T>(value: unknown): value is UnRef<T> {
  if (value !== null && typeof value === 'object' && 'current' in value) {
    return true;
  }

  if (Array.isArray(value) && value.length > 0) {
    return true;
  }

  return false;
}

overrideToUnSignalFn(toUnSignal);
// @ts-expect-error: just do it
overrideUnResolveFn(unResolve);
overrideTryOnScopeDisposeFn(tryOnScopeDispose);
// @ts-expect-error: just do it
overrideIsUnRefFn(isUnRef);

export { isUnRef, toUnSignal, tryOnScopeDispose, unResolve };
