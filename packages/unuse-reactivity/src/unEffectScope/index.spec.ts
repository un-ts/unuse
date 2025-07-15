import { describe, expect, it, vi } from 'vitest';
import { unEffectScope } from '.';
import { getCurrentScope } from '../unReactiveSystem';

describe('unEffectScope', () => {
  it('should be defined', () => {
    expect(unEffectScope).toBeTypeOf('function');
  });

  it('should return the cleanup function', () => {
    const actual = unEffectScope(() => {});
    expect(actual).toBeTypeOf('function');
  });

  it('should execute the effect function', () => {
    const fnSpy = vi.fn();
    unEffectScope(fnSpy);
    expect(fnSpy).toHaveBeenCalled();
  });

  it('should set the current scope', () => {
    expect(getCurrentScope()).toBeUndefined();

    unEffectScope(() => {
      const outerScope = getCurrentScope();
      expect(outerScope).toBeDefined();

      unEffectScope(() => {
        const innerScope = getCurrentScope();

        expect(innerScope).toBeDefined();
        expect(innerScope).not.toBe(outerScope);
      });
    });
  });
});
