import { describe, expect, it, vi } from 'vitest';
import { unEffect } from '.';
import { getCurrentSub } from '../unReactiveSystem';
import { unSignal } from '../unSignal';

describe('unEffect', () => {
  it('should be defined', () => {
    expect(unEffect).toBeTypeOf('function');
  });

  it('should execute the callback immediately', () => {
    const fnSpy = vi.fn();

    const mySignal = unSignal(0);

    unEffect(() => {
      mySignal.get();
      fnSpy();
    });

    expect(fnSpy).toHaveBeenCalledTimes(1);

    mySignal.set(1);
    expect(fnSpy).toHaveBeenCalledTimes(2);
  });

  it('should not trigger when disposed', () => {
    const fnSpy = vi.fn();

    const source = unSignal(0);

    const dispose = unEffect(() => {
      fnSpy(source.get());
    });

    expect(fnSpy).toHaveBeenCalledTimes(1);
    expect(fnSpy).toHaveBeenCalledWith(0);

    source.set(1);
    expect(fnSpy).toHaveBeenCalledTimes(2);
    expect(fnSpy).toHaveBeenCalledWith(1);

    dispose();

    source.set(2);
    expect(fnSpy).toHaveBeenCalledTimes(2);
  });

  it('should trigger in current sub', () => {
    const source = unSignal(0);

    expect(getCurrentSub()).toBeUndefined();

    unEffect(() => {
      const outerSub = getCurrentSub();
      expect(outerSub).toBeDefined();

      unEffect(() => {
        const innerSub = getCurrentSub();
        expect(innerSub).toBeDefined();
        expect(innerSub).not.toBe(outerSub);

        source.get();
      });
    });
  });
});
