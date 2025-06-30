import type { ReactiveFlags, ReactiveNode } from 'alien-signals';
import {
  effectOper,
  link,
  REACTIVITY_STATE,
  setCurrentSub,
} from '../unReactiveSystem';

export interface UnEffectState extends ReactiveNode {
  fn(): void;
}

export type UnEffectReturn = () => void;

export function unEffect(callback: () => void): UnEffectReturn {
  const state: UnEffectState = {
    fn: callback,
    subs: undefined,
    subsTail: undefined,
    deps: undefined,
    depsTail: undefined,
    flags: 2 satisfies ReactiveFlags.Watching,
  };

  if (REACTIVITY_STATE.activeSub !== undefined) {
    link(state, REACTIVITY_STATE.activeSub);
  } else if (REACTIVITY_STATE.activeScope !== undefined) {
    link(state, REACTIVITY_STATE.activeScope);
  }

  const prev = setCurrentSub(state);
  try {
    state.fn();
  } finally {
    setCurrentSub(prev);
  }

  return effectOper.bind(state) as UnEffectReturn;
}
