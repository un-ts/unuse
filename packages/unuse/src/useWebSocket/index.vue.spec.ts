// @vitest-environment happy-dom

import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { Ref } from 'vue';
import { isRef, nextTick, shallowRef } from 'vue';
import type { UseWebSocketReturn, WebSocketStatus } from '.';
import { useWebSocket } from '.';
import { describeVue, useSetup } from '../_testUtils/vue';

describeVue('useWebSocket', () => {
  const mockWebSocket = vi.fn<(host: string) => WebSocket>();
  let vm: ReturnType<
    typeof useSetup<{ ref: UseWebSocketReturn<unknown> }>
  > | null = null;

  mockWebSocket.prototype.send = vi.fn();
  mockWebSocket.prototype.close = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('WebSocket', mockWebSocket);
  });

  afterEach(() => {
    vm?.unmount();
    vi.unstubAllGlobals();
  });

  it('should initialize web socket', () => {
    vm = useSetup(() => {
      const ref = useWebSocket('ws://localhost');
      return { ref };
    });

    expect(vm.ref.data).toSatisfy(isRef);
    expect((vm.ref.data as unknown as Ref<unknown>).value).toBe(null);
    expect(vm.ref.status).toSatisfy(isRef);
    expect((vm.ref.status as unknown as Ref<WebSocketStatus>).value).toBe(
      'CONNECTING'
    );
    expect(mockWebSocket).toHaveBeenCalledWith('ws://localhost', []);
    expect(vm.ref.close).toBeTypeOf('function');
    expect(vm.ref.send).toBeTypeOf('function');
    expect(vm.ref.open).toBeTypeOf('function');
    expect(vm.ref.ws).toSatisfy(isRef);
    expect(
      (vm.ref.ws as unknown as Ref<WebSocket | undefined>).value
    ).toBeDefined();
  });

  it('should reconnect if URL changes', async () => {
    const url = shallowRef('ws://localhost');
    vm = useSetup(() => {
      const ref = useWebSocket(url);
      return { ref };
    });

    url.value = 'ws://127.0.0.1';
    await nextTick();

    expect(mockWebSocket.prototype.close).toHaveBeenCalledWith(1000, undefined);
    expect(mockWebSocket).toHaveBeenCalledWith('ws://127.0.0.1', []);
    expect((vm.ref.status as unknown as Ref<WebSocketStatus>).value).toBe(
      'CONNECTING'
    );
  });

  it('should not reconnect on URL change if immediate and autoConnect are false', async () => {
    const url = shallowRef('ws://localhost');
    vm = useSetup(() => {
      const ref = useWebSocket(url, {
        immediate: false,
        autoConnect: false,
      });
      return { ref };
    });

    url.value = 'ws://127.0.0.1';
    await nextTick();

    expect(mockWebSocket.prototype.close).not.toHaveBeenCalled();
    expect(mockWebSocket).not.toHaveBeenCalledWith('ws://127.0.0.1', []);
    expect((vm.ref.status as unknown as Ref<WebSocketStatus>).value).toBe(
      'CLOSED'
    );
  });

  it('should remain closed if immediate is false', () => {
    vm = useSetup(() => {
      const ref = useWebSocket('ws://localhost', {
        immediate: false,
      });
      return { ref };
    });

    expect((vm.ref.status as unknown as Ref<WebSocketStatus>).value).toBe(
      'CLOSED'
    );
  });
});
