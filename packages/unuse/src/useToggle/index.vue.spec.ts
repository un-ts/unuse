import { expect, it } from 'vitest';
import type { Ref } from 'vue';
import { isRef, shallowRef } from 'vue';
import { describeVue } from '../_testUtils/vue';
import type { ToggleFn } from './index';
import { useToggle } from './index';

describeVue('useToggle', () => {
  it('default result', () => {
    const result = useToggle() as unknown as [Ref<boolean>, ToggleFn];
    const [value, toggle] = result;

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);

    expect(toggle).toBeTypeOf('function');
    expect(value).toSatisfy(isRef);
    expect(value.value).toBe(false);
  });

  it('default result with initialValue', () => {
    const result = useToggle(true) as unknown as [Ref<boolean>, ToggleFn];
    const [value, toggle] = result;

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);

    expect(toggle).toBeTypeOf('function');
    expect(value).toSatisfy(isRef);
    expect(value.value).toBe(true);
  });

  it('should toggle', () => {
    const result = useToggle() as unknown as [Ref<boolean>, ToggleFn];
    const [value, toggle] = result;

    expect(toggle()).toBe(true);
    expect(value.value).toBe(true);

    expect(toggle()).toBe(false);
    expect(value.value).toBe(false);
  });

  it('should receive toggle param', () => {
    const result = useToggle() as unknown as [Ref<boolean>, ToggleFn];
    const [value, toggle] = result;

    expect(toggle(false)).toBe(false);
    expect(value.value).toBe(false);

    expect(toggle(true)).toBe(true);
    expect(value.value).toBe(true);
  });

  it('ref initialValue', () => {
    const isDark = shallowRef(true);
    const toggle = useToggle(isDark);

    expect(toggle).toBeTypeOf('function');

    expect(toggle()).toBe(false);
    expect(isDark.value).toBe(false);

    expect(toggle()).toBe(true);
    expect(isDark.value).toBe(true);

    expect(toggle(false)).toBe(false);
    expect(isDark.value).toBe(false);

    expect(toggle(true)).toBe(true);
    expect(isDark.value).toBe(true);
  });

  it('should toggle with truthy & falsy', () => {
    const status = shallowRef('ON');
    const toggle = useToggle(status, {
      truthyValue: 'ON',
      falsyValue: 'OFF',
    });

    expect(status.value).toBe('ON');
    expect(toggle).toBeTypeOf('function');

    expect(toggle()).toBe('OFF');
    expect(status.value).toBe('OFF');

    expect(toggle()).toBe('ON');
    expect(status.value).toBe('ON');

    expect(toggle('OFF')).toBe('OFF');
    expect(status.value).toBe('OFF');

    expect(toggle('ON')).toBe('ON');
    expect(status.value).toBe('ON');
  });
});
