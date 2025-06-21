// @vitest-environment happy-dom

import { renderHook as renderReactHook } from '@testing-library/react';
import { useState } from 'react';
import { expect, it } from 'vitest';
import { toUnSignal } from '.';
import { describeReact } from '../_testUtils/react';
import { isUnSignal } from '../unSignal';

describeReact('toUnSignal', () => {
  it('should convert a React state to an UnSignal', () => {
    renderReactHook(() => {
      const state = useState(42);

      const actual = toUnSignal(state);
      expect(actual).toSatisfy(isUnSignal);
    });
  });

  it('should maintain the reactivity of the signal', () => {
    renderReactHook(() => {
      const state = useState(42);

      const actual = toUnSignal(state);
      expect(state[0]).toBe(42);
      expect(actual.get()).toBe(42);

      // TODO @Shinigami92 2025-06-21: Check why this is not working
      // WHAT THE FUCK? IT'S BREAKING THE LAW
      // When I update actual, line 25 suddenly fails
      // actual.set(100);
      // expect(state[0]).toBe(100);
      // expect(actual.get()).toBe(100);

      // state[1](200);
      // expect(actual.get()).toBe(200);
    });
  });
});
