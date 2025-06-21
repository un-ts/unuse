import { renderHook as renderSolidHook } from '@solidjs/testing-library';
import { expect, it, vi } from 'vitest';
import { tryOnScopeDispose } from '.';
import { describeSolid } from '../_testUtils/solid';

describeSolid('tryOnScopeDispose', () => {
  it('should return false when not in a Solid scope', () => {
    const fnSpy = vi.fn();

    const actual = tryOnScopeDispose(fnSpy);
    expect(actual).toBe(false);

    expect(fnSpy).not.toHaveBeenCalled();
  });

  it('should call onScopeDispose when in a Solid scope', () => {
    const fnSpy = vi.fn();

    const hook = renderSolidHook(() => tryOnScopeDispose(fnSpy));

    const actual = hook.result;
    expect(actual).toBe(true);
    expect(fnSpy).not.toHaveBeenCalled();

    hook.cleanup();

    expect(fnSpy).toHaveBeenCalledTimes(1);
  });
});
