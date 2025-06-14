// @vitest-environment happy-dom

import { beforeEach, expect, it, vi } from 'vitest';
import type { Ref } from 'vue';
import { isRef, shallowRef } from 'vue';
import type { Pausable } from '.';
import { useIntervalFn } from '.';
import { describeVue } from '../_testUtils/vue';

describeVue('useIntervalFn', () => {
  let callback = vi.fn();
  vi.useFakeTimers();

  beforeEach(() => {
    callback = vi.fn();
  });

  async function exec({ isActive, pause, resume }: Pausable) {
    expect(isActive).toSatisfy(isRef);
    expect((isActive as unknown as Ref<boolean>).value).toBeTruthy();
    expect(callback).toHaveBeenCalledTimes(0);

    await vi.advanceTimersByTimeAsync(60);
    expect(callback).toHaveBeenCalledTimes(1);

    pause();
    expect((isActive as unknown as Ref<boolean>).value).toBeFalsy();

    await vi.advanceTimersByTimeAsync(60);
    expect(callback).toHaveBeenCalledTimes(1);

    resume();
    expect((isActive as unknown as Ref<boolean>).value).toBeTruthy();

    await vi.advanceTimersByTimeAsync(60);
    expect(callback).toHaveBeenCalledTimes(2);
  }

  it('basic pause/resume', async () => {
    await exec(useIntervalFn(callback, 50));

    callback = vi.fn();

    const interval = shallowRef(50);
    await exec(useIntervalFn(callback, interval));

    callback.mockClear();
    interval.value = 20;
    await vi.advanceTimersByTimeAsync(30);
    // expect(callback).toHaveBeenCalledTimes(1);
  });
});
