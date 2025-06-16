export type SupportedFramework = 'angular' | 'react' | 'solid' | 'vue';

let Angular: typeof import('@angular/core') | undefined;
let React: typeof import('react') | undefined;
let Solid: typeof import('solid-js') | undefined;
let Vue: typeof import('vue') | undefined;

// HACK @Shinigami92 2025-06-16: https://github.com/tc39/proposal-import-sync

export function importFramework<TFramework extends SupportedFramework>(
  framework: TFramework
): TFramework extends 'angular'
  ? typeof import('@angular/core')
  : TFramework extends 'react'
    ? typeof import('react')
    : TFramework extends 'solid'
      ? typeof import('solid-js')
      : TFramework extends 'vue'
        ? typeof import('vue')
        : never {
  if (typeof framework !== 'string') {
    throw new TypeError(
      `Expected framework to be a string, got ${typeof framework}`
    );
  }

  switch (framework) {
    case 'angular': {
      if (!Angular) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module
        Angular = require('@angular/core');
      }

      // @ts-expect-error: do it
      return Angular as typeof import('@angular/core');
    }

    case 'react': {
      if (!React) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module
        React = require('react');
      }

      // @ts-expect-error: do it
      return React as typeof import('react');
    }

    case 'solid': {
      if (!Solid) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module
        Solid = require('solid-js');
      }

      // @ts-expect-error: do it
      return Solid as typeof import('solid-js');
    }

    case 'vue': {
      if (!Vue) {
        // eslint-disable-next-line @typescript-eslint/no-require-imports, unicorn/prefer-module
        Vue = require('vue');
      }

      // @ts-expect-error: do it
      return Vue as typeof import('vue');
    }
  }

  throw new Error(`Unsupported framework: ${framework}`);
}
