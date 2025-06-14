import { getCurrentScope, onScopeDispose } from 'vue';

/**
 * Call framework's specific onScopeDispose() if it's inside an effect scope lifecycle, if not, do nothing.
 *
 * @param fn
 */
export function tryOnScopeDispose(fn: () => void): boolean {
  const framework = process.env.UNUSE_FRAMEWORK;

  if (!framework) {
    return false;
  }

  switch (framework) {
    case 'vue': {
      if (getCurrentScope()) {
        onScopeDispose(fn);
        return true;
      }

      break;
    }

    default: {
      break;
    }
  }

  return false;
}
