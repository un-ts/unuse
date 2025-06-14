import type { Signal as AngularSignal } from "@angular/core";
import { signal as angularSignal } from "@angular/core";
import type { RefObject as ReactRefObject } from "react";
import type {
  Accessor as SolidAccessor,
  Signal as SolidSignal,
} from "solid-js";
import type { Ref as VueRef } from "vue";
import { toRef as toVueRef } from "vue";

export type UnRef<T> =
  | AngularSignal<T>
  | ReactRefObject<T> // not sure if ReactRefObject is the correct one we want
  | SolidAccessor<T>
  | SolidSignal<T>
  | VueRef<T>
  | (() => T);

export interface UnSignal<T> {
  get(): T;
  set(value: T): void;
}

export function unSignal<T>(initialValue: T): UnSignal<T>;
export function unSignal<T = undefined>(): UnSignal<T | undefined>;
export function unSignal<T>(initialValue?: T): UnSignal<T> {
  let state = initialValue;
  return {
    get: () => state as T,
    set: (value) => {
      state = value;
    },
  };
}

function unAccess<T>(ref: UnRef<T>): T {
  if (typeof ref === "function") {
    return ref();
  } else if ("current" in ref) {
    return ref.current as T;
  } else if ("value" in ref) {
    return ref.value as T;
  } else {
    return ref as T;
  }
}

export function unResolve<T>(
  signal: UnSignal<T>,
  options: { kind: "angular" }
): AngularSignal<T>;
export function unResolve<T>(
  signal: UnSignal<T>,
  options: { kind: "react" }
): T; // need to understand how react works
export function unResolve<T>(
  signal: UnSignal<T>,
  options: { kind: "solid" }
): SolidAccessor<T>;
export function unResolve<T>(
  signal: UnSignal<T>,
  options: { kind: "vue" }
): VueRef<T>;
export function unResolve<T>(
  signal: UnSignal<T>,
  options: { kind: "angular" | "react" | "solid" | "vue" }
): any {
  const { kind } = options;

  // TODO @Shinigami92 2025-06-14: trigger signals on update
  switch (kind) {
    case "angular": {
      return angularSignal(signal.get()) as AngularSignal<T>;
    }
    case "react": {
      return signal.get() as T;
    }
    case "solid": {
      return () => signal.get() as SolidAccessor<T>;
    }
    case "vue": {
      return toVueRef(signal.get()) as VueRef<T>;
    }
  }
}

export interface UseWebSocketOptions {
  /**
   * @default true
   */
  immediate?: boolean;
}

export interface UseWebSocketReturn {}

export function useWebSocket(
  url: UnRef<string | URL>,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn {
  const { immediate = true } = options;

  const wsRef = unSignal<WebSocket | undefined>();

  function init(): void {
    const ws = new WebSocket(unAccess(url));
    wsRef.set(ws);
  }

  function open(): void {
    init();
  }

  if (immediate) {
    open();
  }

  return {
    ws: unResolve(wsRef, { kind: "vue" }),
  };
}
