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
import { renderHook as renderSolidHook } from '@solidjs/testing-library';
import { renderHook as renderReactHook } from '@testing-library/react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { isRef as isVueRef } from 'vue';
import { unResolve } from '.';
import { isUnSignal, unSignal } from '../unSignal';

@NgModule({ providers: [provideZonelessChangeDetection()] })
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ZonelessTestModule {}

describe('unResolve', () => {
  it('should be defined', () => {
    expect(unResolve).toBeTypeOf('function');
  });

  describe('Angular Signal', () => {
    beforeAll(() => {
      getTestBed().initTestEnvironment(
        [BrowserTestingModule, ZonelessTestModule],
        platformBrowserTesting()
      );
    });

    it('should resolve to an Angular Signal', () => {
      const mySignal = unSignal(0);

      getTestBed().runInInjectionContext(() => {
        const actual = unResolve(mySignal, { kind: 'angular' });

        expect(actual).toSatisfy(isAngularSignal);
      });
    });

    it('should update the Angular Signal on change', () => {
      const mySignal = unSignal(0);

      getTestBed().runInInjectionContext(() => {
        const actual = unResolve(mySignal, { kind: 'angular' });

        expect(actual()).toBe(0);

        mySignal.set(42);
        expect(actual()).toBe(42);
      });
    });

    it('should update back the original signal on change', async () => {
      const mySignal = unSignal(0);

      getTestBed().runInInjectionContext(() => {
        const actual = unResolve(mySignal, { kind: 'angular' });

        actual.set(100);
      });

      await vi.waitFor(() => {
        expect(mySignal.get()).toBe(100);
      });
    });
  });

  describe('React Ref', () => {
    it('should resolve to a React Ref', () => {
      const mySignal = unSignal(0);

      const hook = renderReactHook(() =>
        unResolve(mySignal, { kind: 'react' })
      );

      const actual = hook.result.current;

      expect(actual).toBeDefined();
      expect(actual).toBeTypeOf('object');
    });

    it('should update the React Ref on change', () => {
      const mySignal = unSignal(0);

      const hook = renderReactHook(() =>
        unResolve(mySignal, { kind: 'react' })
      );

      const actual = hook.result.current;

      expect(actual[0]).toBe(0);

      mySignal.set(42);
      expect(actual[0]).toBe(42);
    });

    it('should update back the original signal on change', () => {
      const mySignal = unSignal(0);

      const hook = renderReactHook(() =>
        unResolve(mySignal, { kind: 'react' })
      );

      const actual = hook.result.current;

      actual[1](100);
      expect(mySignal.get()).toBe(100);

      actual[1](() => 200);
      expect(mySignal.get()).toBe(200);
    });
  });

  describe('Solid Signal', () => {
    it('should resolve to an Solid Signal', () => {
      const mySignal = unSignal(0);

      const [actual] = unResolve(mySignal, { kind: 'solid' });

      expect(actual).toBeTypeOf('function');
    });

    it('should update the Solid Signal on change', () => {
      const mySignal = unSignal(0);

      const [actual] = unResolve(mySignal, { kind: 'solid' });

      expect(actual()).toBe(0);

      mySignal.set(42);
      expect(actual()).toBe(42);
    });

    it('should update back the original signal on change', () => {
      const mySignal = unSignal(0);

      const hook = renderSolidHook(() =>
        unResolve(mySignal, { kind: 'solid' })
      );

      const [, setActual] = hook.result;

      setActual(100);
      expect(mySignal.get()).toBe(100);

      setActual(() => 200);
      expect(mySignal.get()).toBe(200);
    });
  });

  describe('Vue Ref', () => {
    it('should resolve to an Vue Ref', () => {
      const mySignal = unSignal(0);

      const actual = unResolve(mySignal, { kind: 'vue' });

      expect(actual).toSatisfy(isVueRef);
    });

    it('should update the Vue Ref on change', () => {
      const mySignal = unSignal(0);

      const actual = unResolve(mySignal, { kind: 'vue' });

      expect(actual.value).toBe(0);

      mySignal.set(42);
      expect(actual.value).toBe(42);
    });

    it('should update back the original signal on change', () => {
      const mySignal = unSignal(0);

      const actual = unResolve(mySignal, { kind: 'vue' });

      actual.value = 100;
      expect(mySignal.get()).toBe(100);
    });
  });

  describe('UnSignal', () => {
    it('should resolve to an UnSignal', () => {
      const mySignal = unSignal(0);

      const actual = unResolve(mySignal, { kind: undefined });

      expect(actual).toSatisfy(isUnSignal);
    });

    it('should update the UnSignal on change', () => {
      const mySignal = unSignal(0);

      const actual = unResolve(mySignal, {});

      expect(actual.get()).toBe(0);

      mySignal.set(42);
      expect(actual.get()).toBe(42);
    });

    it('should update back the original signal on change', () => {
      const mySignal = unSignal(0);

      const actual = unResolve(mySignal, {});

      actual.set(100);
      expect(mySignal.get()).toBe(100);
    });
  });
});
