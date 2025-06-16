import type {
  MaybeUnRef,
  UnSignal,
  UseIntervalFnOptions,
  UseWebSocketOptions,
} from 'unuse';
import type { Ref } from 'vue';

type VueRef<T> = Ref<T>;

declare module 'unuse' {
  function unResolve<T>(signal: UnSignal<T>): VueRef<T>;
  function unResolve<T>(
    signal: UnSignal<T>,
    options: { framework: 'vue' }
  ): VueRef<T>;
  function unResolve<T>(
    signal: UnSignal<T>,
    options: { readonly: true }
  ): Readonly<VueRef<T>>;

  interface Pausable {
    readonly isActive: Readonly<VueRef<boolean>>;
    pause: () => void;
    resume: () => void;
  }

  type UseIntervalFnReturn = Pausable;

  function useIntervalFn(
    cb: () => void,
    interval?: MaybeUnRef<number>,
    options?: UseIntervalFnOptions
  ): UseIntervalFnReturn;

  interface UseWebSocketReturn<TData> {
    /**
     * Reference to the latest data received via the WebSocket.
     *
     * Can be watched to respond to incoming messages.
     */
    readonly data: VueRef<TData | null>;

    /**
     * The current WebSocket status.
     */
    readonly status: VueRef<WebSocketStatus>;

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
    readonly ws: VueRef<WebSocket | undefined>;
  }

  function useWebSocket<TData = unknown>(
    url: MaybeUnRef<string | URL>,
    options: UseWebSocketOptions = {}
  ): UseWebSocketReturn<TData>;
}
