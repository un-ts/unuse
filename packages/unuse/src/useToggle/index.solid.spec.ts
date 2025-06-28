import type { Signal } from 'solid-js';
import { createSignal } from 'solid-js';
import { expect, it } from 'vitest';
import { describeSolid } from '../_testUtils/solid';
import type { ToggleFn } from './index';
import { useToggle } from './index';

describeSolid('useToggle', () => {
  it('default result', () => {
    const result = useToggle() as unknown as [Signal<boolean>, ToggleFn];
    const [value, toggle] = result;

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);

    expect(toggle).toBeTypeOf('function');
    expect(value).toSatisfy(Array.isArray);
    expect(value[0]()).toBe(false);
  });

  it('default result with initialValue', () => {
    const result = useToggle(true) as unknown as [Signal<boolean>, ToggleFn];
    const [value, toggle] = result;

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);

    expect(toggle).toBeTypeOf('function');
    expect(value).toSatisfy(Array.isArray);
    expect(value[0]()).toBe(true);
  });

  it('should toggle', () => {
    const result = useToggle() as unknown as [Signal<boolean>, ToggleFn];
    const [value, toggle] = result;

    expect(toggle()).toBe(true);
    expect(value[0]()).toBe(true);

    expect(toggle()).toBe(false);
    expect(value[0]()).toBe(false);
  });

  it('should receive toggle param', () => {
    const result = useToggle() as unknown as [Signal<boolean>, ToggleFn];
    const [value, toggle] = result;

    expect(toggle(false)).toBe(false);
    expect(value[0]()).toBe(false);

    expect(toggle(true)).toBe(true);
    expect(value[0]()).toBe(true);
  });

  it('signal initialValue', () => {
    const isDark = createSignal(true);
    const toggle = useToggle(isDark);

    expect(toggle).toBeTypeOf('function');

    expect(toggle()).toBe(false);
    expect(isDark[0]()).toBe(false);

    expect(toggle()).toBe(true);
    expect(isDark[0]()).toBe(true);

    expect(toggle(false)).toBe(false);
    expect(isDark[0]()).toBe(false);

    expect(toggle(true)).toBe(true);
    expect(isDark[0]()).toBe(true);
  });

  it('should toggle with truthy & falsy', () => {
    const status = createSignal('ON');
    const toggle = useToggle(status, {
      truthyValue: 'ON',
      falsyValue: 'OFF',
    });

    expect(status[0]()).toBe('ON');
    expect(toggle).toBeTypeOf('function');

    expect(toggle()).toBe('OFF');
    expect(status[0]()).toBe('OFF');

    expect(toggle()).toBe('ON');
    expect(status[0]()).toBe('ON');

    expect(toggle('OFF')).toBe('OFF');
    expect(status[0]()).toBe('OFF');

    expect(toggle('ON')).toBe('ON');
    expect(status[0]()).toBe('ON');
  });
});
