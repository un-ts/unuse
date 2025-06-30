import type { ReactiveFlags, ReactiveNode } from 'alien-signals';
import {
  effectOper,
  link,
  REACTIVITY_STATE,
  setCurrentScope,
  setCurrentSub,
} from '../unReactiveSystem';

export type UnEffectScopeState = ReactiveNode;

export type UnEffectScopeReturn = () => void;

export function unEffectScope(callback: () => void): UnEffectScopeReturn {
  const state: UnEffectScopeState = {
    deps: undefined,
    depsTail: undefined,
    subs: undefined,
    subsTail: undefined,
    flags: 0 satisfies ReactiveFlags.None,
  };

  if (REACTIVITY_STATE.activeScope !== undefined) {
    link(state, REACTIVITY_STATE.activeScope);
  }

  const prevSub = setCurrentSub(undefined);
  const prevScope = setCurrentScope(state);
  try {
    callback();
  } finally {
    setCurrentScope(prevScope);
    setCurrentSub(prevSub);
  }

  return effectOper.bind(state) as UnEffectScopeReturn;
}
