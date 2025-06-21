// @vitest-environment happy-dom

import { signal } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { beforeAll, expect, it, vi } from 'vitest';
import { toUnSignal } from '.';
import { describeAngular, ZonelessTestModule } from '../_testUtils/angular';
import type { UnSignal } from '../unSignal';
import { isUnSignal } from '../unSignal';

describeAngular('toUnSignal', () => {
  beforeAll(() => {
    getTestBed().initTestEnvironment(
      [BrowserTestingModule, ZonelessTestModule],
      platformBrowserTesting()
    );
  });

  it('should convert a Angular signal to an UnSignal', () => {
    getTestBed().runInInjectionContext(() => {
      const state = signal(42);

      const actual = toUnSignal(state);
      expect(actual).toSatisfy(isUnSignal);
    });
  });

  it('should maintain the reactivity of the signal', async () => {
    let actual: UnSignal<number>;

    getTestBed().runInInjectionContext(() => {
      const state = signal(42);

      actual = toUnSignal(state);
      expect(state()).toBe(42);
      expect(actual.get()).toBe(42);

      actual.set(100);
      expect(state()).toBe(100);
      expect(actual.get()).toBe(100);

      state.set(200);
      // The signal is not updated immediately
    });

    await vi.waitFor(() => {
      expect(actual.get()).toBe(200);
    });
  });
});
