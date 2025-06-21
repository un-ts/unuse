import { describe, expect, it, vi } from 'vitest';
import { tryOnScopeDispose } from '.';

describe('tryOnScopeDispose', () => {
  it('should be defined', () => {
    expect(tryOnScopeDispose).toBeTypeOf('function');
  });

  it('should return false if no framework is set', () => {
    const fnSpy = vi.fn();

    const actual = tryOnScopeDispose(fnSpy);
    expect(actual).toBe(false);

    expect(fnSpy).not.toHaveBeenCalled();
  });
});
