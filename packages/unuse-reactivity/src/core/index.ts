/* eslint-disable @typescript-eslint/naming-convention */

/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */

// @see https://github.com/stackblitz/alien-signals/blob/v2.0.5/src/index.ts

import type { ReactiveFlags, ReactiveNode } from 'alien-signals/system';
// eslint-disable-next-line import-x/no-unresolved
import { createReactiveSystem } from 'alien-signals/system';

// const enum EffectFlags {
//   Queued = 1 << 6,
// }
const Queued = 1 << 6;

type EffectScope = ReactiveNode;

interface Effect extends ReactiveNode {
  fn(): void;
}

interface Computed<T = any> extends ReactiveNode {
  value: T | undefined;
  getter: (previousValue?: T) => T;
}

interface Signal<T = any> extends ReactiveNode {
  previousValue: T;
  value: T;
}

const queuedEffects: Array<Effect | EffectScope | undefined> = [];
const {
  link,
  unlink,
  propagate,
  checkDirty,
  endTracking,
  startTracking,
  shallowPropagate,
} = createReactiveSystem({
  update(signal: Signal | Computed): boolean {
    if ('getter' in signal) {
      return updateComputed(signal);
    }

    return updateSignal(signal, signal.value);
  },
  notify,
  unwatched(node: Signal | Computed | Effect | EffectScope) {
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

let batchDepth = 0;
let notifyIndex = 0;
let queuedEffectsLength = 0;
let activeSub: ReactiveNode | undefined;
let activeScope: EffectScope | undefined;

export function getCurrentSub(): ReactiveNode | undefined {
  return activeSub;
}

export function setCurrentSub(
  sub: ReactiveNode | undefined
): ReactiveNode | undefined {
  const prevSub = activeSub;
  activeSub = sub;
  return prevSub;
}

export function getCurrentScope(): EffectScope | undefined {
  return activeScope;
}

export function setCurrentScope(
  scope: EffectScope | undefined
): EffectScope | undefined {
  const prevScope = activeScope;
  activeScope = scope;
  return prevScope;
}

export function getBatchDepth(): number {
  return batchDepth;
}

export function startBatch(): void {
  ++batchDepth;
}

export function endBatch(): void {
  if (!--batchDepth) {
    flush();
  }
}

//#region UnSignal
// @see https://github.com/solidjs/solid/blob/3d3207dd3aeb84c2a38377cf9f3b895995c2d969/packages/solid/src/reactive/signal.ts#L189

type Setter<T> = (value: T) => void;

/**
 * A unique symbol used to identify `UnSignal` objects.
 *
 * This helps distinguish them from other objects and ensures type safety.
 */
export const UN_SIGNAL = Symbol('UN_SIGNAL');

export interface UnSignal<T> {
  readonly [UN_SIGNAL]: true;

  /**
   * Retrieves the current value of the signal.
   */
  get(): T;

  /**
   * Sets a new value for the signal.
   */
  set(value: T): void;

  /**
   * Updates the signal based on the previous value.
   */
  update: <U extends T>(value: (prev: T) => U) => U;
}

export function unSignal<T>(initialValue: T): UnSignal<T>;
export function unSignal<T>(): UnSignal<T | undefined>;
/**
 * Creates an `UnSignal`, which is a writable signal object that can be used to manage state.
 *
 * @param initialValue The initial value of the signal. If not provided, it defaults to `undefined`.
 *
 * @returns An `UnSignal` object that has a `get` method to retrieve the current value, a `set` method to update the value, and an `update` method to update based on the previous value.
 */
export function unSignal<T>(initialValue?: T): UnSignal<T | undefined> {
  const state = {
    previousValue: initialValue,
    value: initialValue,
    subs: undefined,
    subsTail: undefined,
    flags: 1 satisfies ReactiveFlags.Mutable,
  } as Signal<T>;

  const setter: Setter<T> = (newValue) => {
    if (state.value !== (state.value = newValue)) {
      state.flags = 17 as ReactiveFlags.Mutable | ReactiveFlags.Dirty;
      const subs = state.subs;
      if (subs !== undefined) {
        propagate(subs);
        if (!batchDepth) {
          flush();
        }
      }
    }
  };

  return {
    [UN_SIGNAL]: true,
    get() {
      const value = state.value;
      if (
        state.flags & (16 satisfies ReactiveFlags.Dirty) &&
        updateSignal(state, value)
      ) {
        const subs = state.subs;
        if (subs !== undefined) {
          shallowPropagate(subs);
        }
      }

      if (activeSub !== undefined) {
        link(state, activeSub);
      }

      return value;
    },
    set: setter,
    update(cb) {
      setter(cb(state.value) as T);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return state.value as any;
    },
  };
}

/**
 * Checks if a value is an `UnSignal`.
 */
export function isUnSignal<T>(r: unknown): r is UnSignal<T> {
  return r ? (r as any)[UN_SIGNAL] === true : false;
}

//#endregion

//#region UnComputed
/**
 * A unique symbol used to identify `UnComputed` objects.
 *
 * This helps distinguish them from other objects and ensures type safety.
 */
export const UN_COMPUTED = Symbol('UN_COMPUTED');

/**
 * An interface representing a readonly signal object.
 *
 * This is a wrapper around an `alien-signals` computed that provides a method to get the value.
 *
 * @template T The type of the value held by the computed.
 */
export interface UnComputed<T> {
  readonly [UN_COMPUTED]: true;
  /**
   * Retrieves the current value of the computed.
   */
  get(): T;
}

/**
 * Creates an `UnComputed`, which is a readonly signal object that can be used to manage derived state.
 *
 * @param callback The function that computes the value of the signal.
 *
 * @returns An `UnComputed` object that has a `get` method to retrieve the current value.
 */
export function unComputed<T>(getter: (previousValue?: T) => T): UnComputed<T> {
  return {
    [UN_COMPUTED]: true,
    get: computedOper.bind({
      value: undefined,
      subs: undefined,
      subsTail: undefined,
      deps: undefined,
      depsTail: undefined,
      flags: 17 as ReactiveFlags.Mutable | ReactiveFlags.Dirty,
      getter: getter as (previousValue?: unknown) => unknown,
    }) as () => T,
  };
}

/**
 * Checks if a value is an `UnComputed` object.
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function isUnComputed<T = any>(r: any): r is UnComputed<T> {
  return r ? r[UN_COMPUTED] === true : false;
}
//#endregion

//#region unEffect
export function unEffect(fn: () => void): () => void {
  const e: Effect = {
    fn,
    subs: undefined,
    subsTail: undefined,
    deps: undefined,
    depsTail: undefined,
    flags: 2 satisfies ReactiveFlags.Watching,
  };
  if (activeSub !== undefined) {
    link(e, activeSub);
  } else if (activeScope !== undefined) {
    link(e, activeScope);
  }

  const prev = setCurrentSub(e);
  try {
    e.fn();
  } finally {
    setCurrentSub(prev);
  }

  return effectOper.bind(e);
}

export function unEffectScope(fn: () => void): () => void {
  const e: EffectScope = {
    deps: undefined,
    depsTail: undefined,
    subs: undefined,
    subsTail: undefined,
    flags: 0 satisfies ReactiveFlags.None,
  };
  if (activeScope !== undefined) {
    link(e, activeScope);
  }

  const prevSub = setCurrentSub(undefined);
  const prevScope = setCurrentScope(e);
  try {
    fn();
  } finally {
    setCurrentScope(prevScope);
    setCurrentSub(prevSub);
  }

  return effectOper.bind(e);
}
//#endregion

function updateComputed(c: Computed): boolean {
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

function updateSignal(s: Signal, value: any): boolean {
  s.flags = 1 satisfies ReactiveFlags.Mutable;
  return s.previousValue !== (s.previousValue = value);
}

function notify(e: Effect | EffectScope) {
  const flags = e.flags;
  if (!(flags & Queued)) {
    e.flags = flags | Queued;
    const subs = e.subs;
    if (subs === undefined) {
      queuedEffects[queuedEffectsLength++] = e;
    } else {
      notify(subs.sub);
    }
  }
}

function run(e: Effect | EffectScope, flags: ReactiveFlags): void {
  if (
    flags & (16 satisfies ReactiveFlags.Dirty) ||
    (flags & (32 satisfies ReactiveFlags.Pending) && checkDirty(e.deps!, e))
  ) {
    const prev = setCurrentSub(e);
    startTracking(e);
    try {
      (e as Effect).fn();
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

function flush(): void {
  while (notifyIndex < queuedEffectsLength) {
    const effect = queuedEffects[notifyIndex]!;
    queuedEffects[notifyIndex++] = undefined;
    run(effect, (effect.flags &= ~Queued));
  }

  notifyIndex = 0;
  queuedEffectsLength = 0;
}

function computedOper<T>(this: Computed<T>): T {
  const flags = this.flags;
  if (
    flags & (16 satisfies ReactiveFlags.Dirty) ||
    (flags & (32 satisfies ReactiveFlags.Pending) &&
      checkDirty(this.deps!, this))
  ) {
    if (updateComputed(this)) {
      const subs = this.subs;
      if (subs !== undefined) {
        shallowPropagate(subs);
      }
    }
  } else if (flags & (32 satisfies ReactiveFlags.Pending)) {
    this.flags = flags & ~(32 satisfies ReactiveFlags.Pending);
  }

  if (activeSub !== undefined) {
    link(this, activeSub);
  } else if (activeScope !== undefined) {
    link(this, activeScope);
  }

  return this.value!;
}

function effectOper(this: Effect | EffectScope): void {
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
