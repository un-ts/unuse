// @vitest-environment happy-dom

import type { UnComputed } from 'unuse-reactivity';
import { isUnComputed, unSignal } from 'unuse-reactivity';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Pausable } from '.';
import { useIntervalFn } from '.';

describe('useIntervalFn', () => {
  it('should be defined', () => {
    expect(useIntervalFn).toBeTypeOf('function');
  });

  let callback = vi.fn();
  vi.useFakeTimers();

  beforeEach(() => {
    callback = vi.fn();
  });

  async function exec({ isActive, pause, resume }: Pausable) {
    expect(isActive).toSatisfy(isUnComputed);
    expect((isActive as unknown as UnComputed<boolean>).get()).toBeTruthy();
    expect(callback).toHaveBeenCalledTimes(0);

    await vi.advanceTimersByTimeAsync(60);
    expect(callback).toHaveBeenCalledTimes(1);

    pause();
    expect((isActive as unknown as UnComputed<boolean>).get()).toBeFalsy();

    await vi.advanceTimersByTimeAsync(60);
    expect(callback).toHaveBeenCalledTimes(1);

    resume();
    expect((isActive as unknown as UnComputed<boolean>).get()).toBeTruthy();

    await vi.advanceTimersByTimeAsync(60);
    expect(callback).toHaveBeenCalledTimes(2);
  }

  it('basic pause/resume', async () => {
    await exec(useIntervalFn(callback, 50));

    callback = vi.fn();

    const interval = unSignal(50);
    await exec(useIntervalFn(callback, interval));

    callback.mockClear();
    interval.set(20);
    await vi.advanceTimersByTimeAsync(30);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('pause in callback', async () => {
    const pausable = useIntervalFn(
      () => {
        callback();
        pausable.pause();
      },
      50,
      { immediateCallback: true, immediate: false }
    );

    pausable.resume();
    expect(pausable.isActive).toSatisfy(isUnComputed);
    expect(
      (pausable.isActive as unknown as UnComputed<boolean>).get()
    ).toBeFalsy();
    expect(callback).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(60);
    expect(callback).toHaveBeenCalledTimes(1);

    pausable.resume();
    expect(
      (pausable.isActive as unknown as UnComputed<boolean>).get()
    ).toBeFalsy();
    expect(callback).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(60);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('cant work when interval is negative', async () => {
    const { isActive } = useIntervalFn(callback, -1);

    expect((isActive as unknown as UnComputed<boolean>).get()).toBeFalsy();
    await vi.advanceTimersByTimeAsync(60);
    expect(callback).toHaveBeenCalledTimes(0);
  });
});
