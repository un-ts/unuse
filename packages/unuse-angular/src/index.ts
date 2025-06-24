/* eslint-disable import-x/export */
import type {
  Signal as AngularSignal,
  WritableSignal as AngularWritableSignal,
} from '@angular/core';
import {
  effect as angularEffect,
  signal as angularSignal,
  isSignal as isAngularSignal,
} from '@angular/core';
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
  var __UNUSE_FRAMEWORK__: 'angular';
}

// @ts-ignore: set global variable
globalThis.__UNUSE_FRAMEWORK__ = 'angular';

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
  if (isAngularSignal(value)) {
    const result = unSignal<T>((value as AngularSignal<T>)());

    angularEffect(() => {
      result.set((value as AngularSignal<T>)());
    });

    if ('set' in value) {
      unEffect(() => {
        value.set(result.get());
      });
    }

    return result;
  }

  return unSignal(value) as UnSignal<T>;
}

export interface UnResolveOptions<
  TFramework extends SupportedFramework | undefined = 'angular',
  TReadonly extends boolean = false,
> {
  /**
   * @default 'angular'
   */
  framework?: TFramework;
  /**
   * @default false
   */
  readonly?: TReadonly;
}

export type ReadonlyUnResolveReturn<
  T,
  TFramework extends SupportedFramework | undefined = 'angular',
> = TFramework extends 'angular' ? AngularSignal<T> : UnComputed<T>;

export type WritableUnResolveReturn<
  T,
  TFramework extends SupportedFramework | undefined = 'angular',
> = TFramework extends 'angular' ? AngularWritableSignal<T> : UnSignal<T>;

export type UnResolveReturn<
  T,
  TFramework extends SupportedFramework | undefined = 'angular',
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
  TFramework extends SupportedFramework | undefined = 'angular',
  TReadonly extends boolean = false,
>(
  signal: UnSignal<T>,
  options: UnResolveOptions<TFramework, TReadonly> = {}
): UnResolveReturn<T, TFramework, TReadonly> {
  const {
    framework = 'angular' as SupportedFramework | undefined,
    readonly = false as boolean,
  } = options;

  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (framework) {
    case 'angular': {
      // TODO @Shinigami92 2025-06-20: Looks like Angular does not get the same instance and therefore it is not the same signal
      const state = angularSignal(signal.get());

      unEffect(() => state.set(signal.get()));

      if (!readonly) {
        // HACK @Shinigami92 2025-06-20: This is horrible dangerously unsafe, but currently works 👀
        const originalSet = state.set;

        state.set = (value) => {
          originalSet(value);
          signal.set(value);
        };

        const originalUpdate = state.update;

        state.update = (updater) => {
          const result = updater(signal.get());
          originalUpdate(() => result);
          signal.set(result);
        };
      }

      // @ts-expect-error: just do it
      return state;
    }
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
  return false;
}

/**
 * UnRef represents any kind of reference or signal that can be dereferenced to get its value.
 */
export type UnRef<T> =
  | AngularSignal<T>
  | AngularWritableSignal<T>
  | UnSignal<T>
  | UnComputed<T>
  | (() => T);

function isUnRef<T>(value: unknown): value is UnRef<T> {
  if (isAngularSignal(value)) {
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
