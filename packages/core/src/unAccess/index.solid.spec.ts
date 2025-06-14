import { createSignal } from 'solid-js';
import { expect, it } from 'vitest';
import { unAccess } from '.';
import { describeSolid } from '../_testUtils/solid';

describeSolid('unAccess', () => {
  it('should resolve null', () => {
    const actual = unAccess(null);
    expect(actual).toBe(null);
  });

  it('should resolve undefined', () => {
    // eslint-disable-next-line @typescript-eslint/no-confusing-void-expression, unicorn/no-useless-undefined
    const actual = unAccess(undefined);
    expect(actual).toBe(undefined);
  });

  it('should resolve string', () => {
    const actual = unAccess('Hello World');
    expect(actual).toBe('Hello World');
  });

  it('should resolve number', () => {
    const actual = unAccess(42);
    expect(actual).toBe(42);
  });

  it('should resolve accessor callback', () => {
    const actual = unAccess(() => 42);
    expect(actual).toBe(42);
  });

  it('should resolve a Solid signal', () => {
    const state = createSignal(42);
    const actual = unAccess(state);
    expect(actual).toBe(42);
  });
});
