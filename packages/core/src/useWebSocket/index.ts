import type { UnRef } from '../unAccess';
import { unAccess } from '../unAccess';
import { unResolve } from '../unResolve';
import type { UnSignal } from '../unSignal';
import { unSignal } from '../unSignal';

export interface UseWebSocketOptions {
  /**
   * @default true
   */
  immediate?: boolean;
}

export interface UseWebSocketReturn {
  readonly ws: UnSignal<WebSocket | undefined>;
}

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
    ws: unResolve(wsRef),
  };
}
