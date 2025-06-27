/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { unComputed, unWatch } from 'unuse-reactivity';
import { IS_CLIENT } from '../isClient';
import { isObject } from '../isObject';
import { toArray } from '../toArray';
import { tryOnScopeDispose } from '../tryOnScopeDispose';
import type { MaybeUnRef } from '../unAccess';
import { unAccess } from '../unAccess';
import { unRefElement } from '../unRefElement';

export const defaultWindow = IS_CLIENT
  ? // eslint-disable-next-line unicorn/prefer-global-this
    window
  : undefined;

export type Arrayable<T> = T[] | T;

interface InferEventTarget<Events> {
  addEventListener: (event: Events, fn?: any, options?: any) => any;
  removeEventListener: (event: Events, fn?: any, options?: any) => any;
}

export type WindowEventName = keyof WindowEventMap;
export type DocumentEventName = keyof DocumentEventMap;

export interface GeneralEventListener<E = Event> {
  (evt: E): void;
}

export type UseEventListenerReturn = () => void;

function register(
  el: EventTarget,
  event: string,
  listener: any,
  options: boolean | AddEventListenerOptions | undefined
): () => void {
  el.addEventListener(event, listener, options);
  return () => el.removeEventListener(event, listener, options);
}

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 1: Omitted Window target
 *
 * @param event
 * @param listener
 * @param options
 */
// @ts-expect-error: Overload 1 is not compatible with the other overloads right now 🤔
export function useEventListener<E extends keyof WindowEventMap>(
  event: MaybeUnRef<Arrayable<E>>,
  listener: MaybeUnRef<Arrayable<(this: Window, ev: WindowEventMap[E]) => any>>,
  options?: MaybeUnRef<boolean | AddEventListenerOptions>
): UseEventListenerReturn;

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 2: Explicitly Window target
 *
 * @param target
 * @param event
 * @param listener
 * @param options
 */
export function useEventListener<E extends keyof WindowEventMap>(
  target: Window,
  event: MaybeUnRef<Arrayable<E>>,
  listener: MaybeUnRef<Arrayable<(this: Window, ev: WindowEventMap[E]) => any>>,
  options?: MaybeUnRef<boolean | AddEventListenerOptions>
): UseEventListenerReturn;

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 3: Explicitly Document target
 *
 * @param target
 * @param event
 * @param listener
 * @param options
 */
export function useEventListener<E extends keyof DocumentEventMap>(
  target: DocumentOrShadowRoot,
  event: MaybeUnRef<Arrayable<E>>,
  listener: MaybeUnRef<
    Arrayable<(this: Document, ev: DocumentEventMap[E]) => any>
  >,
  options?: MaybeUnRef<boolean | AddEventListenerOptions>
): UseEventListenerReturn;

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 4: Explicitly HTMLElement target
 *
 * @param target
 * @param event
 * @param listener
 * @param options
 */
export function useEventListener<E extends keyof HTMLElementEventMap>(
  target: MaybeUnRef<Arrayable<HTMLElement> | null | undefined>,
  event: MaybeUnRef<Arrayable<E>>,
  listener: MaybeUnRef<(this: HTMLElement, ev: HTMLElementEventMap[E]) => any>,
  options?: MaybeUnRef<boolean | AddEventListenerOptions>
): UseEventListenerReturn;

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 5: Custom event target with event type infer
 *
 * @param target
 * @param event
 * @param listener
 * @param options
 */
export function useEventListener<Names extends string, EventType = Event>(
  target: MaybeUnRef<Arrayable<InferEventTarget<Names>> | null | undefined>,
  event: MaybeUnRef<Arrayable<Names>>,
  listener: MaybeUnRef<Arrayable<GeneralEventListener<EventType>>>,
  options?: MaybeUnRef<boolean | AddEventListenerOptions>
): UseEventListenerReturn;

/**
 * Register using addEventListener on mounted, and removeEventListener automatically on unmounted.
 *
 * Overload 6: Custom event target fallback
 *
 * @param target
 * @param event
 * @param listener
 * @param options
 */
export function useEventListener<EventType = Event>(
  target: MaybeUnRef<Arrayable<EventTarget> | null | undefined>,
  event: MaybeUnRef<Arrayable<string>>,
  listener: MaybeUnRef<Arrayable<GeneralEventListener<EventType>>>,
  options?: MaybeUnRef<boolean | AddEventListenerOptions>
): UseEventListenerReturn;

export function useEventListener(
  ...args: Parameters<typeof useEventListener>
): UseEventListenerReturn {
  // TODO @Shinigami92 2025-06-16: use the target and find out if `firstParamTargets` is really what we need here
  const target = args[0];

  const firstParamTargets = unComputed(() => {
    const test = toArray(unAccess(target)).filter((e) => e != null);
    return test.every((e) => typeof e !== 'string') ? test : undefined;
  });

  const event = firstParamTargets.get() ? args[1] : args[0];
  const listener = firstParamTargets.get() ? args[2] : args[1];
  const options = firstParamTargets.get() ? args[3] : args[2];

  const cleanups: Array<() => void> = [];
  function cleanup() {
    for (const fn of cleanups) {
      fn();
    }

    cleanups.length = 0;
  }

  const computedForWatch = unComputed(() => {
    return [
      firstParamTargets.get()?.map((e) => unRefElement(e as never)) ??
        [defaultWindow].filter((e) => e != null),
      toArray(unAccess(event as any) as unknown as string[]),
      toArray(unAccess(listener as any, { unwrapFunction: false })),
      unAccess(options as any) as boolean | AddEventListenerOptions | undefined,
    ] as const;
  });

  const stopWatch = unWatch(
    computedForWatch,
    ([raw_targets, raw_events, raw_listeners, raw_options]) => {
      cleanup();

      if (
        /* eslint-disable @typescript-eslint/no-unnecessary-condition */
        !raw_targets?.length ||
        !raw_events?.length ||
        !raw_listeners?.length
        /* eslint-enable @typescript-eslint/no-unnecessary-condition */
      ) {
        return;
      }

      // create a clone of options, to avoid it being changed reactively on removal
      const optionsClone = isObject(raw_options)
        ? { ...raw_options }
        : raw_options;
      cleanups.push(
        ...raw_targets.flatMap((el) =>
          raw_events.flatMap((event) =>
            raw_listeners.map((listener) =>
              register(el as any, event, listener, optionsClone)
            )
          )
        )
      );
    },
    {
      // TODO @Shinigami92 2025-06-16: Check if we need to implement the `flush` option
      // @ts-expect-error: `flush` is not implemented yet for `unWatch`
      flush: 'post',
      immediate: true,
    }
  );

  const stop: UseEventListenerReturn = () => {
    stopWatch();
    cleanup();
  };

  tryOnScopeDispose(cleanup);

  return stop;
}
