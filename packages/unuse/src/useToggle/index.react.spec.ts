// @vitest-environment happy-dom

import { renderHook } from '@testing-library/react';
import { useState } from 'react';
import { expect, it } from 'vitest';
import { describeReact } from '../_testUtils/react';
import type { ToggleFn } from './index';
import { useToggle } from './index';

describeReact('useToggle', () => {
  it('default result', () => {
    renderHook(() => {
      const result = useToggle() as unknown as [
        ReturnType<typeof useState<boolean>>,
        ToggleFn,
      ];
      const [value, toggle] = result;

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);

      expect(toggle).toBeTypeOf('function');
      expect(value).toSatisfy(Array.isArray);
      expect(value[0]).toBe(false);
    });
  });

  it('default result with initialValue', () => {
    renderHook(() => {
      const result = useToggle(true) as unknown as [
        ReturnType<typeof useState<boolean>>,
        ToggleFn,
      ];
      const [value, toggle] = result;

      expect(Array.isArray(result)).toBe(true);
      expect(result).toHaveLength(2);

      expect(toggle).toBeTypeOf('function');
      expect(value).toBeTypeOf('object');
      expect(value[0]).toBe(true);
    });
  });

  it.todo('should toggle', () => {
    renderHook(() => {
      const result = useToggle() as unknown as [
        ReturnType<typeof useState<boolean>>,
        ToggleFn,
      ];
      const [value, toggle] = result;

      expect(toggle()).toBe(true);
      expect(value[0]).toBe(true);

      expect(toggle()).toBe(false);
      expect(value[0]).toBe(false);
    });
  });

  it.todo('should receive toggle param', () => {
    renderHook(() => {
      const result = useToggle() as unknown as [
        ReturnType<typeof useState<boolean>>,
        ToggleFn,
      ];
      const [value, toggle] = result;

      expect(toggle(false)).toBe(false);
      expect(value[0]).toBe(false);

      expect(toggle(true)).toBe(true);
      expect(value[0]).toBe(true);
    });
  });

  it.todo('state initialValue', () => {
    renderHook(() => {
      const isDark = useState(true);
      const toggle = useToggle(isDark);

      expect(toggle).toBeTypeOf('function');

      expect(toggle()).toBe(false);
      expect(isDark[0]).toBe(false);

      expect(toggle()).toBe(true);
      expect(isDark[0]).toBe(true);

      expect(toggle(false)).toBe(false);
      expect(isDark[0]).toBe(false);

      expect(toggle(true)).toBe(true);
      expect(isDark[0]).toBe(true);
    });
  });

  it.todo('should toggle with truthy & falsy', () => {
    renderHook(() => {
      const status = useState('ON');
      const toggle = useToggle(status, {
        truthyValue: 'ON',
        falsyValue: 'OFF',
      });

      expect(status[0]).toBe('ON');
      expect(toggle).toBeTypeOf('function');

      expect(toggle()).toBe('OFF');
      expect(status[0]).toBe('OFF');

      expect(toggle()).toBe('ON');
      expect(status[0]).toBe('ON');

      expect(toggle('OFF')).toBe('OFF');
      expect(status[0]).toBe('OFF');

      expect(toggle('ON')).toBe('ON');
      expect(status[0]).toBe('ON');
    });
  });
});
