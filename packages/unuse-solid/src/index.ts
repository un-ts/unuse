/* eslint-disable import-x/export */
import { effect } from 'alien-signals';
import type {
  Accessor as SolidAccessor,
  Signal as SolidSignal,
} from 'solid-js';
import {
  createEffect as createSolidEffect,
  createSignal as createSolidSignal,
  getOwner as getSolidOwner,
  onCleanup as onSolidCleanup,
} from 'solid-js';
import type {
  MaybeUnRef,
  SupportedFramework,
  UnComputed,
  UnSignal,
} from 'unuse';
import {
  isUnComputed,
  isUnSignal,
  overrideIsUnRefFn,
  overrideToUnSignalFn,
  overrideTryOnScopeDisposeFn,
  overrideUnResolveFn,
  unComputed,
  unSignal,
} from 'unuse';

declare global {
  // @ts-ignore: set global variable type
  var __UNUSE_FRAMEWORK__: 'solid';
}

// @ts-ignore: set global variable
globalThis.__UNUSE_FRAMEWORK__ = 'solid';

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
  if (typeof value === 'function') {
    // got Accessor
    const result = unSignal<T>((value as SolidAccessor<T>)());

    createSolidEffect(() => {
      result.set((value as SolidAccessor<T>)());
    });

    return result;
  } else if (
    Array.isArray(value) &&
    (value as unknown[]).length > 0 &&
    typeof value[0] === 'function'
  ) {
    // got Signal
    const accessor = value[0] as SolidAccessor<T>;
    const result = unSignal<T>(accessor());

    createSolidEffect(() => {
      result.set(accessor());
    });

    effect(() => {
      value[1](() => result.get());
    });

    return result;
  }

  return unSignal(value) as UnSignal<T>;
}

export interface UnResolveOptions<
  TFramework extends SupportedFramework | undefined = 'solid',
  TReadonly extends boolean = false,
> {
  /**
   * @default 'solid'
   */
  framework?: TFramework;
  /**
   * @default false
   */
  readonly?: TReadonly;
}

export type ReadonlyUnResolveReturn<
  T,
  TFramework extends SupportedFramework | undefined = 'solid',
> = TFramework extends 'solid' ? SolidAccessor<T> : UnComputed<T>;

export type WritableUnResolveReturn<
  T,
  TFramework extends SupportedFramework | undefined = 'solid',
> = TFramework extends 'solid' ? SolidSignal<T> : UnSignal<T>;

export type UnResolveReturn<
  T,
  TFramework extends SupportedFramework | undefined = 'solid',
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
  TFramework extends SupportedFramework | undefined = 'solid',
  TReadonly extends boolean = false,
>(
  signal: UnSignal<T>,
  options: UnResolveOptions<TFramework, TReadonly> = {}
): UnResolveReturn<T, TFramework, TReadonly> {
  const {
    framework = 'solid' as SupportedFramework | undefined,
    readonly = false as boolean,
  } = options;

  if (framework === 'solid') {
    const state = createSolidSignal(signal.get());

    if (!readonly) {
      createSolidEffect(() => {
        const value = state[0]();
        signal.set(value);
      });
    }

    effect(() => state[1](() => signal.get()));

    // @ts-expect-error: just do it
    return readonly ? state[0] : state;
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
function tryOnScopeDispose(fn: () => void): boolean {
  if (getSolidOwner()) {
    onSolidCleanup(fn);
    return true;
  }

  return false;
}

/**
 * UnRef represents any kind of reference or signal that can be dereferenced to get its value.
 */
export type UnRef<T> =
  | SolidAccessor<T>
  | SolidSignal<T>
  | UnSignal<T>
  | UnComputed<T>
  | (() => T);

function isUnRef<T>(value: unknown): value is UnRef<T> {
  return (
    // signal
    (Array.isArray(value) && value.length > 0) ||
    // accessor(/getter)
    typeof value === 'function' ||
    isUnSignal(value) ||
    isUnComputed(value)
  );
}

overrideToUnSignalFn(toUnSignal);
// @ts-expect-error: just do it
overrideUnResolveFn(unResolve);
overrideTryOnScopeDisposeFn(tryOnScopeDispose);
overrideIsUnRefFn(isUnRef);

// Above we export everything from 'unuse'.
// So here we export some internal functions as undefined to make it inaccessible from the public API.
const UNDEFINED = undefined;

export {
  isUnRef,
  UNDEFINED as overrideIsUnRefFn,
  UNDEFINED as overrideToUnSignalFn,
  UNDEFINED as overrideTryOnScopeDisposeFn,
  UNDEFINED as overrideUnResolveFn,
  toUnSignal,
  tryOnScopeDispose,
  unResolve,
};
