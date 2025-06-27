// @vitest-environment happy-dom

import { beforeEach, expect, it, vi } from 'vitest';
import type { Ref } from 'vue';
import { isRef } from 'vue';
import type { WebSocketStatus } from '.';
import { useWebSocket } from '.';
import { describeVue, useSetup } from '../_testUtils/vue';

describeVue('useWebSocket', () => {
  const mockWebSocket = vi.fn<(host: string) => WebSocket>();

  mockWebSocket.prototype.send = vi.fn();
  mockWebSocket.prototype.close = vi.fn();

  beforeEach(() => {
    vi.stubGlobal('WebSocket', mockWebSocket);

    return () => {
      vi.unstubAllGlobals();
    };
  });

  it('should initialize web socket', () => {
    const vm = useSetup(() => {
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
});
