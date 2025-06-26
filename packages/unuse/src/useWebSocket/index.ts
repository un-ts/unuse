/* eslint-disable unicorn/prefer-add-event-listener */
import { unSignal, unWatch } from 'unuse-reactivity';
import { IS_CLIENT } from '../isClient';
import { IS_WORKER } from '../isWorker';
import { toUnSignal } from '../toUnSignal';
import { tryOnScopeDispose } from '../tryOnScopeDispose';
import type { MaybeUnRef, UnRef } from '../unAccess';
import { unAccess } from '../unAccess';
import type { WritableUnResolveReturn } from '../unResolve';
import { unResolve } from '../unResolve';
import { useEventListener } from '../useEventListener';
import { useIntervalFn } from '../useIntervalFn';

export type WebSocketStatus = 'OPEN' | 'CONNECTING' | 'CLOSED';
export type WebSocketHeartbeatMessage = string | ArrayBuffer | Blob;

export const DEFAULT_PING_MESSAGE = 'ping';

export interface UseWebSocketOptions {
  onConnected?: (ws: WebSocket) => void;
  onDisconnected?: (ws: WebSocket, event: CloseEvent) => void;
  onError?: (ws: WebSocket, event: Event) => void;
  onMessage?: (ws: WebSocket, event: MessageEvent) => void;

  /**
   * Send heartbeat for every x milliseconds passed.
   *
   * @default false
   */
  heartbeat?:
    | boolean
    | {
        /**
         * Message for the heartbeat.
         *
         * @default 'ping'
         */
        message?: UnRef<WebSocketHeartbeatMessage>;

        /**
         * Response message for the heartbeat, if undefined the message will be used.
         */
        responseMessage?: UnRef<WebSocketHeartbeatMessage>;

        /**
         * Interval, in milliseconds.
         *
         * @default 1000
         */
        interval?: number;

        /**
         * Heartbeat response timeout, in milliseconds.
         *
         * @default 1000
         */
        pongTimeout?: number;
      };

  /**
   * Enabled auto reconnect,
   *
   * @default false
   */
  autoReconnect?:
    | boolean
    | {
        /**
         * Maximum retry times.
         *
         * Or you can pass a predicate function (which returns true if you want to retry).
         *
         * @default -1
         */
        retries?: number | ((retried: number) => boolean);

        /**
         * Delay for reconnect, in milliseconds,
         *
         * @default 1000
         */
        delay?: number;

        /**
         * On maximum retry times reached.
         */
        onFailed?: () => void;
      };

  /**
   * Immediately open the connection when calling this composable.
   *
   * @default true
   */
  immediate?: boolean;

  /**
   * Automatically connect to the websocket when URL changes.
   *
   * @default true
   */
  autoConnect?: boolean;

  /**
   * Automatically close a connection.
   *
   * @default true
   */
  autoClose?: boolean;

  /**
   * List of one or more sub-protocol strings.
   *
   * @default []
   */
  protocols?: string[];
}

export interface UseWebSocketReturn<TData> {
  /**
   * Reference to the latest data received via the WebSocket.
   *
   * Can be watched to respond to incoming messages.
   */
  readonly data: WritableUnResolveReturn<TData | null>;

  /**
   * The current WebSocket status.
   */
  readonly status: WritableUnResolveReturn<WebSocketStatus>;

  /**
   * Closes the WebSocket connection gracefully.
   */
  readonly close: () => void;

  /**
   * Reopen the WebSocket connection.
   *
   * If the current one is active, will close it before opening a new one.
   */
  readonly open: () => void;

  /**
   * Sends data through the WebSocket connection.
   *
   * @param data
   * @param useBuffer When the socket is not yet open, store the data into the buffer and sent them one connected. Defaults to true.
   */
  readonly send: (
    data: string | ArrayBuffer | Blob,
    useBuffer?: boolean
  ) => boolean;

  /**
   * Reference to the WebSocket instance.
   */
  readonly ws: WritableUnResolveReturn<WebSocket | undefined>;
}

function resolveNestedOptions<T>(options: T | true): T {
  return options === true ? ({} as T) : options;
}

/**
 * Reactive WebSocket client.
 *
 * @param url The WebSocket URL to connect to. Can be a string or a URL object.
 * @param options Options for the WebSocket client.
 */
export function useWebSocket<TData = unknown>(
  url: MaybeUnRef<string | URL>,
  options: UseWebSocketOptions = {}
): UseWebSocketReturn<TData> {
  const {
    onConnected,
    onDisconnected,
    onError,
    onMessage,
    immediate = true,
    autoConnect = true,
    autoClose = true,
    protocols = [],
  } = options;

  const dataRef = unSignal<TData | null>(null);
  const statusRef = unSignal<WebSocketStatus>('CLOSED');
  const wsRef = unSignal<WebSocket | undefined>();
  const urlRef = toUnSignal(url);

  let heartbeatPause: (() => void) | undefined;
  let heartbeatResume: (() => void) | undefined;

  let explicitlyClosed = false;
  let retried = 0;

  let bufferedData: Array<string | ArrayBuffer | Blob> = [];

  let retryTimeout: ReturnType<typeof setTimeout> | undefined;
  let pongTimeoutWait: ReturnType<typeof setTimeout> | undefined;

  function _sendBuffer(): void {
    const ws = wsRef.get();

    if (bufferedData.length > 0 && ws && statusRef.get() === 'OPEN') {
      for (const buffer of bufferedData) {
        ws.send(buffer);
      }

      bufferedData = [];
    }
  }

  function resetRetry(): void {
    if (retryTimeout != null) {
      clearTimeout(retryTimeout);
      retryTimeout = undefined;
    }
  }

  function resetHeartbeat(): void {
    clearTimeout(pongTimeoutWait);
    pongTimeoutWait = undefined;
  }

  // Status code 1000 -> Normal Closure https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent/code
  const close: WebSocket['close'] = (code = 1000, reason) => {
    resetRetry();
    if ((!IS_CLIENT && !IS_WORKER) || !wsRef.get()) {
      return;
    }

    explicitlyClosed = true;
    resetHeartbeat();
    heartbeatPause?.();
    const ws =
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      wsRef.get()!;
    ws.close(code, reason);
    wsRef.set(undefined);
  };

  const send: UseWebSocketReturn<TData>['send'] = (data, useBuffer = true) => {
    const ws = wsRef.get();
    if (!ws || statusRef.get() !== 'OPEN') {
      if (useBuffer) {
        bufferedData.push(data);
      }

      return false;
    }

    _sendBuffer();
    ws.send(data);
    return true;
  };

  function _init(): void {
    const url = urlRef.get();

    if (explicitlyClosed || !url) {
      return;
    }

    const ws = new WebSocket(url, protocols);
    wsRef.set(ws);
    statusRef.set('CONNECTING');

    ws.onopen = () => {
      statusRef.set('OPEN');
      retried = 0;
      onConnected?.(ws);
      heartbeatResume?.();
      _sendBuffer();
    };

    ws.onclose = (ev) => {
      statusRef.set('CLOSED');
      resetHeartbeat();
      heartbeatPause?.();
      onDisconnected?.(ws, ev);

      if (
        !explicitlyClosed &&
        options.autoReconnect &&
        (wsRef.get() == null || ws === wsRef.get())
      ) {
        const {
          retries = -1,
          delay = 1000,
          onFailed,
        } = resolveNestedOptions(options.autoReconnect);

        const checkRetires =
          typeof retries === 'function'
            ? retries
            : () =>
                typeof retries === 'number' &&
                (retries < 0 || retried < retries);

        if (checkRetires(retried)) {
          retried += 1;
          retryTimeout = setTimeout(_init, delay);
        } else {
          onFailed?.();
        }
      }
    };

    ws.onerror = (e) => {
      onError?.(ws, e);
    };

    ws.onmessage = (e) => {
      if (options.heartbeat) {
        resetHeartbeat();
        const { message = DEFAULT_PING_MESSAGE, responseMessage = message } =
          resolveNestedOptions(options.heartbeat);
        if (e.data === unAccess(responseMessage)) {
          return;
        }
      }

      dataRef.set(e.data);
      onMessage?.(ws, e);
    };
  }

  if (options.heartbeat) {
    const {
      message = DEFAULT_PING_MESSAGE,
      interval = 1000,
      pongTimeout = 1000,
    } = resolveNestedOptions(options.heartbeat);

    const { pause, resume } = useIntervalFn(
      () => {
        send(unAccess(message), false);
        if (pongTimeoutWait != null) {
          return;
        }

        pongTimeoutWait = setTimeout(() => {
          // auto-reconnect will be trigger with ws.onclose()
          close();
          explicitlyClosed = false;
        }, pongTimeout);
      },
      interval,
      { immediate: false }
    );

    heartbeatPause = pause;
    heartbeatResume = resume;
  }

  if (autoClose) {
    if (IS_CLIENT) {
      useEventListener('beforeunload', () => close(), { passive: true });
    }

    tryOnScopeDispose(close);
  }

  const open: UseWebSocketReturn<TData>['open'] = () => {
    if (!IS_CLIENT && !IS_WORKER) {
      return;
    }

    close();
    explicitlyClosed = false;
    retried = 0;
    _init();
  };

  if (immediate) {
    open();
  }

  if (autoConnect) {
    unWatch(urlRef, open);
  }

  return {
    data: unResolve(dataRef),
    status: unResolve(statusRef),
    close,
    open,
    send,
    ws: unResolve(wsRef),
  };
}
