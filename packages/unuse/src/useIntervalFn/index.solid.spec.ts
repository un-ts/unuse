import type { Accessor } from 'solid-js';
import { beforeEach, expect, it, vi } from 'vitest';
import { useIntervalFn } from '.';
import { describeSolid } from '../_testUtils/solid';

describeSolid('useIntervalFn', () => {
  let callback = vi.fn();
  vi.useFakeTimers();

  beforeEach(() => {
    callback = vi.fn();
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
    expect(pausable.isActive).toSatisfy((value) => typeof value === 'function');
    expect((pausable.isActive as Accessor<boolean>)()).toBeFalsy();
    expect(callback).toHaveBeenCalledTimes(1);

    await vi.advanceTimersByTimeAsync(60);
    expect(callback).toHaveBeenCalledTimes(1);

    pausable.resume();
    expect((pausable.isActive as Accessor<boolean>)()).toBeFalsy();
    expect(callback).toHaveBeenCalledTimes(2);

    await vi.advanceTimersByTimeAsync(60);
    expect(callback).toHaveBeenCalledTimes(2);
  });

  it('cant work when interval is negative', async () => {
    const { isActive } = useIntervalFn(callback, -1);

    expect((isActive as Accessor<boolean>)()).toBeFalsy();
    await vi.advanceTimersByTimeAsync(60);
    expect(callback).toHaveBeenCalledTimes(0);
  });
});
