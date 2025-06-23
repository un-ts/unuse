/* eslint-disable import-x/export */
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
import type { ComputedRef as VueComputedRef, Ref as VueRef } from 'vue';
import {
  getCurrentScope as getCurrentVueScope,
  isReadonly as isVueReadonly,
  isRef as isVueRef,
  onScopeDispose as onVueScopeDispose,
  ref as vueRef,
  watch as vueWatch,
} from 'vue';

export * from 'unuse';

declare global {
  // @ts-ignore: set global variable type
  var __UNUSE_FRAMEWORK__: 'vue';
}

// @ts-ignore: set global variable
globalThis.__UNUSE_FRAMEWORK__ = 'vue';

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
  if (isVueRef(value)) {
    const result = unSignal<T>(value.value);

    vueWatch(
      value,
      (newValue) => {
        result.set(newValue);
      },
      { flush: 'sync' }
    );

    if (!isVueReadonly(value)) {
      unEffect(() => {
        (value as VueRef<T>).value = result.get();
      });
    }

    return result;
  }

  return unSignal(value) as UnSignal<T>;
}

export interface UnResolveOptions<
  TFramework extends SupportedFramework | undefined = 'vue',
  TReadonly extends boolean = false,
> {
  /**
   * @default 'vue'
   */
  framework?: TFramework;
  /**
   * @default false
   */
  readonly?: TReadonly;
}

export type ReadonlyUnResolveReturn<
  T,
  TFramework extends SupportedFramework | undefined = 'vue',
> = TFramework extends 'vue' ? VueComputedRef<T> : UnComputed<T>;

export type WritableUnResolveReturn<
  T,
  TFramework extends SupportedFramework | undefined = 'vue',
> = TFramework extends 'vue' ? VueRef<T> : UnSignal<T>;

export type UnResolveReturn<
  T,
  TFramework extends SupportedFramework | undefined = 'vue',
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
  TFramework extends SupportedFramework | undefined = 'vue',
  TReadonly extends boolean = false,
>(
  signal: UnSignal<T>,
  options: UnResolveOptions<TFramework, TReadonly> = {}
): UnResolveReturn<T, TFramework, TReadonly> {
  const {
    framework = 'vue' as SupportedFramework | undefined,
    readonly = false as boolean,
  } = options;

  if (framework === 'vue') {
    const state = vueRef(signal.get());

    unEffect(() => (state.value = signal.get()));

    if (!readonly) {
      vueWatch(
        state,
        (newValue) => {
          signal.set(newValue);
        },
        {
          flush: 'sync',
        }
      );
    }

    // @ts-expect-error: just do it
    return state as VueRef<T>;
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
  if (getCurrentVueScope()) {
    onVueScopeDispose(fn);
    return true;
  }

  return false;
}

/**
 * UnRef represents any kind of reference or signal that can be dereferenced to get its value.
 */
export type UnRef<T> =
  | VueRef<T>
  | VueComputedRef<T>
  | UnSignal<T>
  | UnComputed<T>
  | (() => T);

function isUnRef<T>(value: unknown): value is UnRef<T> {
  if (isVueRef(value)) {
    return true;
  }

  return false;
}

overrideToUnSignalFn(toUnSignal);
// @ts-expect-error: just do it
overrideUnResolveFn(unResolve);
overrideTryOnScopeDisposeFn(tryOnScopeDispose);
overrideIsUnRefFn(isUnRef);

export { isUnRef, toUnSignal, tryOnScopeDispose, unResolve };
