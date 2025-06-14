import type { SupportedFramework } from '../_framework';
import { importedFramework } from '../_framework';

/**
 * Call framework's specific onScopeDispose() if it's inside an effect scope lifecycle, if not, do nothing.
 *
 * @param fn
 */
export function tryOnScopeDispose(fn: () => void): boolean {
  const framework = globalThis.__UNUSE_FRAMEWORK__ as
    | SupportedFramework
    | undefined;

  if (!framework) {
    return false;
  }

  switch (framework) {
    case 'angular': {
      return false;
    }

    case 'react': {
      // React does not have a direct equivalent to onScopeDispose,
      return false;
    }

    case 'solid': {
      const Solid = importedFramework('solid');

      if (Solid.getOwner()) {
        Solid.onCleanup(fn);
        return true;
      }

      break;
    }

    case 'vue': {
      const Vue = importedFramework('vue');

      if (Vue.getCurrentScope()) {
        Vue.onScopeDispose(fn);
        return true;
      }

      break;
    }
  }

  return false;
}
