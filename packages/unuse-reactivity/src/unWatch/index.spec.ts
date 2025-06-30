import { describe, expect, it, vi } from 'vitest';
import { unWatch } from '.';
import { unComputed } from '../unComputed';
import { unSignal } from '../unSignal';

describe('unWatch', () => {
  it('should be defined', () => {
    expect(unWatch).toBeTypeOf('function');
  });

  it('with callback', () => {
    let dummy: number | undefined;
    const source = unSignal(0);

    unWatch(source, () => {
      dummy = source.get();
    });

    expect(dummy).toBe(undefined);

    source.set(1);
    expect(dummy).toBe(1);
  });

  it('should ensure correct execution order in batch processing', () => {
    const dummy: number[] = [];
    const n1 = unSignal(0);
    const n2 = unSignal(0);
    const sum = unComputed(() => n1.get() + n2.get());

    unWatch(n1, () => {
      dummy.push(1);
      n2.update((prev) => prev + 1);
    });

    unWatch(sum, () => dummy.push(2));

    unWatch(n1, () => dummy.push(3));

    n1.update((prev) => prev + 1);

    expect(dummy).toEqual([1, 2, 3]);
  });

  it('should not trigger immediate callback on first run', () => {
    const fnSpy = vi.fn();

    const source = unSignal(0);

    unWatch(source, fnSpy);

    expect(fnSpy).toHaveBeenCalledTimes(0);

    source.set(1);
    expect(fnSpy).toHaveBeenCalledTimes(1);
    expect(fnSpy).toHaveBeenCalledWith(1, 0);
  });

  it('should trigger immediate callback on first run when immediate option is true', () => {
    const fnSpy = vi.fn();

    const source = unSignal(0);

    unWatch(source, fnSpy, { immediate: true });

    expect(fnSpy).toHaveBeenCalledTimes(1);
    expect(fnSpy).toHaveBeenCalledWith(0, undefined);

    source.set(1);
    expect(fnSpy).toHaveBeenCalledTimes(2);
    expect(fnSpy).toHaveBeenCalledWith(1, 0);
  });

  it('should only trigger based on source', () => {
    const fnSpy = vi.fn();

    const source = unSignal(0);
    const otherSource = unSignal(10);

    unWatch(source, (newValue, oldValue) => {
      const otherValue = otherSource.get();
      fnSpy(newValue, oldValue, otherValue);
    });

    otherSource.set(20);

    expect(fnSpy).toHaveBeenCalledTimes(0);

    source.set(1);
    expect(fnSpy).toHaveBeenCalledTimes(1);
    expect(fnSpy).toHaveBeenCalledWith(1, 0, 20);
  });

  it('should not trigger when disposed', () => {
    const fnSpy = vi.fn();

    const source = unSignal(0);

    const dispose = unWatch(source, fnSpy);

    source.set(1);
    expect(fnSpy).toHaveBeenCalledTimes(1);
    expect(fnSpy).toHaveBeenCalledWith(1, 0);

    dispose();

    source.set(2);
    expect(fnSpy).toHaveBeenCalledTimes(1);
  });
});
