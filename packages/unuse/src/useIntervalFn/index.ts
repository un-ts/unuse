import { unSignal, unWatch } from 'unuse-reactivity';
import { IS_CLIENT } from '../isClient';
import { toUnSignal } from '../toUnSignal';
import { tryOnScopeDispose } from '../tryOnScopeDispose';
import type { MaybeUnRef } from '../unAccess';
import { isUnRef, unAccess } from '../unAccess';
import type { ReadonlyUnResolveReturn } from '../unResolve';
import { unResolve } from '../unResolve';

export interface Pausable {
  /**
   * A ref indicate whether a pausable instance is active.
   */
  readonly isActive: ReadonlyUnResolveReturn<boolean>;

  /**
   * Temporary pause the effect from executing.
   */
  pause: () => void;

  /**
   * Resume the effects.
   */
  resume: () => void;
}

export interface UseIntervalFnOptions {
  /**
   * Start the timer immediately.
   *
   * @default true
   */
  immediate?: boolean;

  /**
   * Execute the callback immediately after calling `resume`.
   *
   * @default false
   */
  immediateCallback?: boolean;
}

export type UseIntervalFnReturn = Pausable;

/**
 * Wrapper for `setInterval` with controls.
 *
 * @param cb
 * @param interval
 * @param options
 */
export function useIntervalFn(
  cb: () => void,
  interval: MaybeUnRef<number> = 1000,
  options: UseIntervalFnOptions = {}
): UseIntervalFnReturn {
  const { immediate = true, immediateCallback = false } = options;

  let timer: ReturnType<typeof setInterval> | null = null;
  const isActiveRef = unSignal(false);

  function clean() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  const pause: UseIntervalFnReturn['pause'] = () => {
    isActiveRef.set(false);
    clean();
  };

  const resume: UseIntervalFnReturn['resume'] = () => {
    const intervalValue = unAccess(interval);
    if (intervalValue <= 0) {
      return;
    }

    isActiveRef.set(true);
    if (immediateCallback) {
      cb();
    }

    clean();
    if (isActiveRef.get()) {
      timer = setInterval(cb, intervalValue);
    }
  };

  if (immediate && IS_CLIENT) {
    resume();
  }

  if (isUnRef(interval) || typeof interval === 'function') {
    const stopWatch = unWatch(toUnSignal(interval), () => {
      if (isActiveRef.get() && IS_CLIENT) {
        resume();
      }
    });

    tryOnScopeDispose(stopWatch);
  }

  tryOnScopeDispose(pause);

  return {
    isActive: unResolve(isActiveRef, { readonly: true }),
    pause,
    resume,
  };
}
