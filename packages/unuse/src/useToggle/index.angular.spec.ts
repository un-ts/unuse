// @vitest-environment happy-dom

import type { WritableSignal } from '@angular/core';
import { isSignal, signal } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { beforeAll, expect, it } from 'vitest';
import { describeAngular, ZonelessTestModule } from '../_testUtils/angular';
import type { ToggleFn } from './index';
import { useToggle } from './index';

describeAngular('useToggle', () => {
  beforeAll(() => {
    getTestBed().initTestEnvironment(
      [BrowserTestingModule, ZonelessTestModule],
      platformBrowserTesting()
    );
  });

  it('default result', () => {
    const result = useToggle() as unknown as [
      WritableSignal<boolean>,
      ToggleFn,
    ];
    const [value, toggle] = result;

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);

    expect(toggle).toBeTypeOf('function');
    expect(value).toSatisfy(isSignal);
    expect(value()).toBe(false);
  });

  it('default result with initialValue', () => {
    const result = useToggle(true) as unknown as [
      WritableSignal<boolean>,
      ToggleFn,
    ];
    const [value, toggle] = result;

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);

    expect(toggle).toBeTypeOf('function');
    expect(value).toSatisfy(isSignal);
    expect(value()).toBe(true);
  });

  it('should toggle', () => {
    const result = useToggle() as unknown as [
      WritableSignal<boolean>,
      ToggleFn,
    ];
    const [value, toggle] = result;

    expect(toggle()).toBe(true);
    expect(value()).toBe(true);

    expect(toggle()).toBe(false);
    expect(value()).toBe(false);
  });

  it('should receive toggle param', () => {
    const result = useToggle() as unknown as [
      WritableSignal<boolean>,
      ToggleFn,
    ];
    const [value, toggle] = result;

    expect(toggle(false)).toBe(false);
    expect(value()).toBe(false);

    expect(toggle(true)).toBe(true);
    expect(value()).toBe(true);
  });

  it('signal initialValue', () => {
    getTestBed().runInInjectionContext(() => {
      const isDark = signal(true);
      const toggle = useToggle(isDark);

      expect(toggle).toBeTypeOf('function');

      expect(toggle()).toBe(false);
      expect(isDark()).toBe(false);

      expect(toggle()).toBe(true);
      expect(isDark()).toBe(true);

      expect(toggle(false)).toBe(false);
      expect(isDark()).toBe(false);

      expect(toggle(true)).toBe(true);
      expect(isDark()).toBe(true);
    });
  });

  it('should toggle with truthy & falsy', () => {
    getTestBed().runInInjectionContext(() => {
      const status = signal('ON');
      const toggle = useToggle(status, {
        truthyValue: 'ON',
        falsyValue: 'OFF',
      });

      expect(status()).toBe('ON');
      expect(toggle).toBeTypeOf('function');

      expect(toggle()).toBe('OFF');
      expect(status()).toBe('OFF');

      expect(toggle()).toBe('ON');
      expect(status()).toBe('ON');

      expect(toggle('OFF')).toBe('OFF');
      expect(status()).toBe('OFF');

      expect(toggle('ON')).toBe('ON');
      expect(status()).toBe('ON');
    });
  });
});
