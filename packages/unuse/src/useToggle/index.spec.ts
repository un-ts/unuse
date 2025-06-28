import type { UnSignal } from 'unuse-reactivity';
import { isUnSignal, unSignal } from 'unuse-reactivity';
import { describe, expect, it } from 'vitest';
import { useToggle } from '.';

describe('useToggle', () => {
  it('should be defined', () => {
    expect(useToggle).toBeTypeOf('function');
  });

  it('default result', () => {
    const result = useToggle();
    const [value, toggle] = result;

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);

    expect(toggle).toBeTypeOf('function');
    expect(value).toSatisfy(isUnSignal);
    expect((value as unknown as UnSignal<boolean>).get()).toBe(false);
  });

  it('default result with initialValue', () => {
    const result = useToggle(true);
    const [value, toggle] = result;

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);

    expect(toggle).toBeTypeOf('function');
    expect(value).toSatisfy(isUnSignal);
    expect((value as unknown as UnSignal<boolean>).get()).toBe(true);
  });

  it('should toggle', () => {
    const result = useToggle();
    const [value, toggle] = result;

    expect(toggle()).toBe(true);
    expect((value as unknown as UnSignal<boolean>).get()).toBe(true);

    expect(toggle()).toBe(false);
    expect((value as unknown as UnSignal<boolean>).get()).toBe(false);
  });

  it('should receive toggle param', () => {
    const result = useToggle();
    const [value, toggle] = result;

    expect(toggle(false)).toBe(false);
    expect((value as unknown as UnSignal<boolean>).get()).toBe(false);

    expect(toggle(true)).toBe(true);
    expect((value as unknown as UnSignal<boolean>).get()).toBe(true);
  });

  it('signal initialValue', () => {
    const isDark = unSignal(true);
    const toggle = useToggle(isDark);

    expect(toggle).toBeTypeOf('function');

    expect(toggle()).toBe(false);
    expect(isDark.get()).toBe(false);

    expect(toggle()).toBe(true);
    expect(isDark.get()).toBe(true);

    expect(toggle(false)).toBe(false);
    expect(isDark.get()).toBe(false);

    expect(toggle(true)).toBe(true);
    expect(isDark.get()).toBe(true);
  });

  it('should toggle with truthy & falsy', () => {
    const status = unSignal('ON');
    const toggle = useToggle(status, {
      truthyValue: 'ON',
      falsyValue: 'OFF',
    });

    expect(status.get()).toBe('ON');
    expect(toggle).toBeTypeOf('function');

    expect(toggle()).toBe('OFF');
    expect(status.get()).toBe('OFF');

    expect(toggle()).toBe('ON');
    expect(status.get()).toBe('ON');

    expect(toggle('OFF')).toBe('OFF');
    expect(status.get()).toBe('OFF');

    expect(toggle('ON')).toBe('ON');
    expect(status.get()).toBe('ON');
  });
});
