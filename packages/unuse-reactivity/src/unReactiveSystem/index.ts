import type { ReactiveFlags, ReactiveNode } from 'alien-signals/system';
import { createReactiveSystem } from 'alien-signals/system';
import type { UnComputedState } from '../unComputed';
import type { UnEffectState } from '../unEffect';
import type { UnEffectScopeState } from '../unEffectScope';
import type { UnSignalState } from '../unSignal';

export const Queued = 1 << 6;

export const queuedEffects: Array<
  UnEffectState | UnEffectScopeState | undefined
> = [];
export const {
  link,
  unlink,
  propagate,
  checkDirty,
  endTracking,
  startTracking,
  shallowPropagate,
} = createReactiveSystem({
  update(signal: UnSignalState<unknown> | UnComputedState<unknown>): boolean {
    if ('getter' in signal) {
      return updateComputed(signal);
    }

    return updateSignal(signal, signal.value);
  },
  notify,
  unwatched(
    node:
      | UnSignalState<unknown>
      | UnComputedState<unknown>
      | UnEffectState
      | UnEffectScopeState
  ) {
    if ('getter' in node) {
      let toRemove = node.deps;
      if (toRemove !== undefined) {
        node.flags = 17 as ReactiveFlags.Mutable | ReactiveFlags.Dirty;
        do {
          toRemove = unlink(toRemove, node);
        } while (toRemove !== undefined);
      }
    } else if (!('previousValue' in node)) {
      effectOper.call(node);
    }
  },
});

export interface UnReactivityState {
  batchDepth: number;
  notifyIndex: number;
  queuedEffectsLength: number;
  activeSub: ReactiveNode | undefined;
  activeScope: UnEffectScopeState | undefined;
}

export const REACTIVITY_STATE: UnReactivityState = {
  batchDepth: 0,
  notifyIndex: 0,
  queuedEffectsLength: 0,
  activeSub: undefined,
  activeScope: undefined,
};

export function getCurrentSub(): ReactiveNode | undefined {
  return REACTIVITY_STATE.activeSub;
}

export function setCurrentSub(
  sub: ReactiveNode | undefined
): ReactiveNode | undefined {
  const prevSub = REACTIVITY_STATE.activeSub;
  REACTIVITY_STATE.activeSub = sub;
  return prevSub;
}

export function getCurrentScope(): UnEffectScopeState | undefined {
  return REACTIVITY_STATE.activeScope;
}

export function setCurrentScope(
  scope: UnEffectScopeState | undefined
): UnEffectScopeState | undefined {
  const prevScope = REACTIVITY_STATE.activeScope;
  REACTIVITY_STATE.activeScope = scope;
  return prevScope;
}

export function getBatchDepth(): number {
  return REACTIVITY_STATE.batchDepth;
}

export function startBatch(): void {
  ++REACTIVITY_STATE.batchDepth;
}

export function endBatch(): void {
  if (!--REACTIVITY_STATE.batchDepth) {
    flush();
  }
}

export function updateSignal<T>(s: UnSignalState<T>, value: T): boolean {
  s.flags = 1 satisfies ReactiveFlags.Mutable;
  return s.previousValue !== (s.previousValue = value);
}

export function updateComputed<T>(c: UnComputedState<T>): boolean {
  const prevSub = setCurrentSub(c);
  startTracking(c);
  try {
    const oldValue = c.value;
    return oldValue !== (c.value = c.getter(oldValue));
  } finally {
    setCurrentSub(prevSub);
    endTracking(c);
  }
}

export function notify(e: UnEffectState | UnEffectScopeState): void {
  const flags = e.flags;
  if (!(flags & Queued)) {
    e.flags = flags | Queued;
    const subs = e.subs;
    if (subs === undefined) {
      queuedEffects[REACTIVITY_STATE.queuedEffectsLength++] = e;
    } else {
      notify(subs.sub);
    }
  }
}

export function run(
  e: UnEffectState | UnEffectScopeState,
  flags: ReactiveFlags
): void {
  if (
    flags & (16 satisfies ReactiveFlags.Dirty) ||
    (flags & (32 satisfies ReactiveFlags.Pending) && checkDirty(e.deps!, e))
  ) {
    const prev = setCurrentSub(e);
    startTracking(e);
    try {
      (e as UnEffectState).fn();
    } finally {
      setCurrentSub(prev);
      endTracking(e);
    }

    return;
  } else if (flags & (32 satisfies ReactiveFlags.Pending)) {
    e.flags = flags & ~(32 satisfies ReactiveFlags.Pending);
  }

  let link = e.deps;
  while (link !== undefined) {
    const dep = link.dep;
    const depFlags = dep.flags;
    if (depFlags & Queued) {
      run(dep, (dep.flags = depFlags & ~Queued));
    }

    link = link.nextDep;
  }
}

export function flush(): void {
  while (REACTIVITY_STATE.notifyIndex < REACTIVITY_STATE.queuedEffectsLength) {
    const effect = queuedEffects[REACTIVITY_STATE.notifyIndex]!;
    queuedEffects[REACTIVITY_STATE.notifyIndex++] = undefined;
    run(effect, (effect.flags &= ~Queued));
  }

  REACTIVITY_STATE.notifyIndex = 0;
  REACTIVITY_STATE.queuedEffectsLength = 0;
}

export function effectOper(this: UnEffectState | UnEffectScopeState): void {
  let dep = this.deps;
  while (dep !== undefined) {
    dep = unlink(dep, this);
  }

  const sub = this.subs;
  if (sub !== undefined) {
    unlink(sub);
  }

  this.flags = 0 satisfies ReactiveFlags.None;
}
