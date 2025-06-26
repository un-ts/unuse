import { renderHook as renderSolidHook } from '@solidjs/testing-library';
import { unSignal } from 'unuse-reactivity';
import { expect, it } from 'vitest';
import { unResolve } from '.';
import { describeSolid } from '../_testUtils/solid';

describeSolid('unResolve', () => {
  it('should resolve to an Solid Signal', () => {
    const mySignal = unSignal(0);

    const [actual] = unResolve(mySignal, { framework: 'solid' });
    expect(actual).toBeTypeOf('function');
  });

  it('should update the Solid Signal on change', () => {
    const mySignal = unSignal(0);

    const [actual] = unResolve(mySignal, { framework: 'solid' });
    expect(actual()).toBe(0);

    mySignal.set(42);
    expect(actual()).toBe(42);
  });

  it('should update back the original signal on change', () => {
    const mySignal = unSignal(0);

    const hook = renderSolidHook(() =>
      unResolve(mySignal, { framework: 'solid' })
    );

    const [, setActual] = hook.result;

    setActual(100);
    expect(mySignal.get()).toBe(100);

    setActual(() => 200);
    expect(mySignal.get()).toBe(200);
  });

  it('should resolve to a Solid Memo when readonly is true', () => {
    const mySignal = unSignal(0);

    const actual = unResolve(mySignal, { framework: 'solid', readonly: true });
    expect(actual).toBeTypeOf('function');
  });
});
