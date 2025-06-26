import { effectScope } from 'alien-signals';

export type UnEffectScopeReturn = () => void;

export function unEffectScope(callback: () => void): UnEffectScopeReturn {
  return effectScope(callback);
}
