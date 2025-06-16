// @vitest-environment happy-dom

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */

import 'unuse/vue';

import { useWebSocket } from 'unuse';
import { beforeEach, expect, it, vi } from 'vitest';
import { createApp, defineComponent, h, isRef } from 'vue';
import { describeVue } from '../_testUtils/vue';

describeVue('useWebSocket', () => {
  type InstanceType<V> = V extends { new (...arg: any[]): infer X } ? X : never;
  type VM<V> = InstanceType<V> & { unmount: () => void };

  function mount<V>(Comp: V) {
    const el = document.createElement('div');
    const app = createApp(Comp as any);

    const unmount = () => app.unmount();
    const comp = app.mount(el) as any as VM<V>;
    comp.unmount = unmount;
    return comp;
  }

  function useSetup<V>(setup: () => V) {
    const Comp = defineComponent({
      setup,
      render() {
        return h('div', []);
      },
    });

    return mount(Comp);
  }

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
    expect(vm.ref.data.value).toBe(null);
    expect(vm.ref.status).toSatisfy(isRef);
    expect(vm.ref.status.value).toBe('CONNECTING');
    expect(mockWebSocket).toBeCalledWith('ws://localhost', []);
    expect(vm.ref.close).toBeTypeOf('function');
    expect(vm.ref.send).toBeTypeOf('function');
    expect(vm.ref.open).toBeTypeOf('function');
    expect(vm.ref.ws).toSatisfy(isRef);
    expect(vm.ref.ws.value).toBeDefined();
  });
});
