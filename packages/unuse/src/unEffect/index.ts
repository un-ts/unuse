import { effect } from 'alien-signals';

export type UnEffectReturn = () => void;

export function unEffect(callback: () => void): UnEffectReturn {
  return effect(callback);
}
