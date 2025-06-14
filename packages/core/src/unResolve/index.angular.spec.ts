// @vitest-environment happy-dom

import {
  isSignal as isAngularSignal,
  NgModule,
  provideZonelessChangeDetection,
} from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { beforeAll, expect, it, vi } from 'vitest';
import { unResolve } from '.';
import { describeAngular } from '../_testUtils/angular';
import { unSignal } from '../unSignal';

@NgModule({ providers: [provideZonelessChangeDetection()] })
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ZonelessTestModule {}

describeAngular('unResolve', () => {
  beforeAll(() => {
    getTestBed().initTestEnvironment(
      [BrowserTestingModule, ZonelessTestModule],
      platformBrowserTesting()
    );
  });

  it('should resolve to an Angular Signal', () => {
    const mySignal = unSignal(0);

    getTestBed().runInInjectionContext(() => {
      const actual = unResolve(mySignal, { framework: 'angular' });

      expect(actual).toSatisfy(isAngularSignal);
    });
  });

  it('should update the Angular Signal on change', () => {
    const mySignal = unSignal(0);

    getTestBed().runInInjectionContext(() => {
      const actual = unResolve(mySignal, { framework: 'angular' });

      expect(actual()).toBe(0);

      mySignal.set(42);
      expect(actual()).toBe(42);
    });
  });

  it('should update back the original signal on change', async () => {
    const mySignal = unSignal(0);

    getTestBed().runInInjectionContext(() => {
      const actual = unResolve(mySignal, { framework: 'angular' });

      actual.set(100);
    });

    await vi.waitFor(() => {
      expect(mySignal.get()).toBe(100);
    });
  });

  it('should resolve to a Angular Signal when readonly is true', () => {
    const mySignal = unSignal(0);

    getTestBed().runInInjectionContext(() => {
      const actual = unResolve(mySignal, {
        framework: 'angular',
        readonly: true,
      });

      expect(actual).toBeTypeOf('function');
      expect(actual).toSatisfy(isAngularSignal);
    });
  });
});
