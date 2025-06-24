export type SupportedFramework = 'angular' | 'react' | 'solid' | 'vue' | 'none';

let Angular: typeof import('@angular/core') | undefined;
let React: typeof import('react') | undefined;
let Solid: typeof import('solid-js') | undefined;
let Vue: typeof import('vue') | undefined;

// HACK @Shinigami92 2025-06-16: https://github.com/tc39/proposal-import-sync

export async function initFrameworkImport(
  framework: Exclude<SupportedFramework, 'none'>
): Promise<void> {
  switch (framework) {
    case 'angular': {
      if (!Angular) {
        Angular = await import('@angular/core');
      }

      return;
    }

    case 'react': {
      if (!React) {
        React = await import('react');
      }

      return;
    }

    case 'solid': {
      if (!Solid) {
        Solid = await import('solid-js');
      }

      return;
    }

    case 'vue': {
      if (!Vue) {
        Vue = await import('vue');
      }

      return;
    }
  }

  // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
  throw new Error(`Unsupported framework: ${framework}`);
}

export type ImportedFrameworkReturn<
  TFramework extends Exclude<SupportedFramework, 'none'>,
> = TFramework extends 'angular'
  ? typeof import('@angular/core')
  : TFramework extends 'react'
    ? typeof import('react')
    : TFramework extends 'solid'
      ? typeof import('solid-js')
      : typeof import('vue');

export function importedFramework<
  TFramework extends Exclude<SupportedFramework, 'none'>,
>(framework: TFramework): ImportedFrameworkReturn<TFramework> {
  switch (framework) {
    case 'angular': {
      if (!Angular) {
        throw new Error('Please call `await initFrameworkImport("angular")`.');
      }

      // @ts-expect-error: just do it
      return Angular;
    }

    case 'react': {
      if (!React) {
        throw new Error('Please call `await initFrameworkImport("react")`.');
      }

      // @ts-expect-error: just do it
      return React;
    }

    case 'solid': {
      if (!Solid) {
        throw new Error('Please call `await initFrameworkImport("solid")`.');
      }

      // @ts-expect-error: just do it
      return Solid;
    }

    case 'vue': {
      if (!Vue) {
        throw new Error('Please call `await initFrameworkImport("vue")`.');
      }

      // @ts-expect-error: just do it
      return Vue;
    }
  }

  throw new Error(`Unsupported framework: ${framework}`);
}
