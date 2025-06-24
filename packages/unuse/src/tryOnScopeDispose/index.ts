import type { SupportedFramework } from '../_framework';
import { importedFramework } from '../_framework';

const REGISTRY: {
  tryOnScopeDisposeOverride?: typeof tryOnScopeDispose;
} = {
  tryOnScopeDisposeOverride: undefined,
};

export function overrideTryOnScopeDisposeFn(
  fn: typeof tryOnScopeDispose
): void {
  REGISTRY.tryOnScopeDisposeOverride = fn;
}

/**
 * Call framework's specific onScopeDispose() if it's inside an effect scope lifecycle, if not, do nothing.
 *
 * @param fn
 */
export function tryOnScopeDispose(fn: () => void): boolean {
  if (typeof REGISTRY.tryOnScopeDisposeOverride === 'function') {
    return REGISTRY.tryOnScopeDisposeOverride(fn);
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const framework = (globalThis.__UNUSE_FRAMEWORK__ ||
    'none') as SupportedFramework;
  if (framework === 'none') {
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
