import type { useState } from 'react';
import type { UnSignal } from 'unuse';

type ReactState<T> = ReturnType<typeof useState<T>>;

declare module 'unuse' {
  function unResolve<T>(signal: UnSignal<T>): ReactState<T>;
  function unResolve<T>(
    signal: UnSignal<T>,
    options: { framework: 'react' }
  ): ReactState<T>;
  function unResolve<T>(
    signal: UnSignal<T>,
    options: { readonly: true }
  ): Readonly<ReactState<T>>;

  interface Pausable {
    readonly isActive: Readonly<ReactState<boolean>>;
    pause: () => void;
    resume: () => void;
  }

  type UseIntervalFnReturn = Pausable;

  function useIntervalFn(
    cb: () => void,
    interval?: MaybeUnRef<number>,
    options?: UseIntervalFnOptions
  ): UseIntervalFnReturn;
}
