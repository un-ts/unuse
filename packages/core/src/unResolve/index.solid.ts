import { effect } from 'alien-signals';
import type {
  Accessor as SolidAccessor,
  Signal as SolidSignal,
} from 'solid-js';
import { createSignal } from 'solid-js';
import type { SupportedFramework } from '../_framework';
import type { UnComputed } from '../unComputed';
import { unComputed } from '../unComputed';
import type { UnSignal } from '../unSignal';

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
export function unResolve<
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

  // eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check
  switch (framework) {
    case 'solid': {
      const state = createSignal(signal.get());

      if (!readonly) {
        // HACK @Shinigami92 2025-06-15: This is horrible dangerously unsafe, but currently works 👀
        const originalSet = state[1];
        // @ts-expect-error: eat it
        state[1] = (value) => {
          if (typeof value !== 'function') {
            const casted = value as T;

            originalSet(() => casted);
            signal.set(casted);
          } else if (typeof value === 'function') {
            const result =
              // @ts-expect-error: eat it
              value(state[0]);
            originalSet(result);
            signal.set(result);
          }

          // TODO @Shinigami92 2025-06-15: do we need to add a fallback for `undefined`?
        };
      }

      effect(() => state[1](() => signal.get()));

      // @ts-expect-error: just do it
      return readonly ? state[0] : state;
    }

    default: {
      if (readonly) {
        // @ts-expect-error: just do it
        return unComputed(() => signal.get());
      }

      // @ts-expect-error: just do it
      return signal;
    }
  }
}
