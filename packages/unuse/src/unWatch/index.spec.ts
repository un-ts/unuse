import { describe, expect, it } from 'vitest';
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
});
