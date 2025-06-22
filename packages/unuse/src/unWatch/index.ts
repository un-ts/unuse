import { effect, effectScope } from 'alien-signals';
import type { UnComputed } from '../unComputed';
import type { UnSignal } from '../unSignal';

export interface UnWatchOptions {
  /**
   * @default false
   */
  immediate?: boolean;
}

export function unWatch<T>(
  source: UnSignal<T> | UnComputed<T>,
  callback: (value: T, oldValue: T | undefined) => void,
  options: UnWatchOptions = {}
): () => void {
  let { immediate = false } = options;

  let firstRun = true;
  let oldValue: T | undefined = undefined;

  return effectScope(() => {
    effect(() => {
      const value = source.get();

      if ((value !== oldValue && !firstRun) || immediate) {
        // Reset immediate after the first call so that it doesn't trigger again
        immediate = false;

        callback(value, oldValue);
        oldValue = value;
      }

      firstRun = false;
    });
  });
}
