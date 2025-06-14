import type { SupportedFramework } from '../_framework';
import { importedFramework } from '../_framework';
import type { MaybeUnRef } from '../unAccess';
import type { UnSignal } from '../unSignal';
import { isUnSignal, unSignal } from '../unSignal';

/**
 * Tries to convert any given framework-specific ref/signal/state to an `UnSignal`.
 *
 * The reactivity will be maintained, meaning that changes to the framework-specific ref/signal/state will also update the `UnSignal`, and vice versa. However, this only works if the given value is reactive.
 *
 * @param value The value to convert to an `UnSignal`.
 *
 * @returns An `UnSignal` that wraps the given value, or an empty `UnSignal` if the value is `undefined` or `null`.
 */
export function toUnSignal<T>(value: MaybeUnRef<T>): UnSignal<T> {
  if (value === undefined) {
    return unSignal() as UnSignal<T>;
  }

  if (value === null) {
    return unSignal(null) as UnSignal<T>;
  }

  if (isUnSignal(value)) {
    return value;
  }

  // TODO @Shinigami92 2025-06-16: Maybe use UNUSE_FRAMEWORK here
  const framework = process.env.UNUSE_FRAMEWORK as
    | SupportedFramework
    | undefined;

  if (!framework) {
    return unSignal(value) as UnSignal<T>;
  }

  switch (framework) {
    case 'angular': {
      break;
    }

    case 'react': {
      break;
    }

    case 'solid': {
      break;
    }

    case 'vue': {
      const Vue = importedFramework('vue');

      if (Vue.isRef(value)) {
        const result = unSignal<T>(value.value);

        Vue.watch(value, (newValue) => {
          result.set(newValue);
        });

        return result;
      }

      break;
    }
  }

  return unSignal(value) as UnSignal<T>;
}
