# unuse contributing guide

**Please read this guide before submitting issues or pull requests!**

Right now `unuse` is in early development, so there is not much available yet.

## Setup the project

1. Fork the repository on GitHub.
2. Clone the repository:
   ```bash
   git clone git@github.com:<your-username>/unuse.git
   ```
3. Run the preflight script to install dependencies and set up the project:

   ```bash
   pnpm run preflight
   ```

   This will not only install all needed dependencies, but also run formatting and linting checks, as well as build the project, then run tests and check TypeScript types.

You can run `pnpm run preflight` at any time to ensure everything works as expected.

## How it works

The `unuse` package exposes many composables that can be used by any framework. It uses `alien-signals` under the hood to provide a framework-agnostic API.

When using `unuse`, you can use any supported framework's variant of signals or the exposed UnSignal from `unuse` itself. `unuse` will try to convert the given signal to an `UnSignal` if it is not already one.  
As return values, it then returns either an `UnSignal` or a framework-specific signal, depending on the context.

Right now there are 4 specific methods that are framework-specific:

- [isUnRef](https://github.com/un-ts/unuse/blob/main/packages/unuse/src/unAccess/index.ts#L48)  
  Checks if the given value is an `UnSignal` or a framework-specific signal.

- [toUnSignal](https://github.com/un-ts/unuse/blob/main/packages/unuse/src/toUnSignal/index.ts#L28)  
  Converts a framework-specific signal to an `UnSignal`.

- [tryOnScopeDispose](https://github.com/un-ts/unuse/blob/main/packages/unuse/src/tryOnScopeDispose/index.ts#L21)  
  Registers a cleanup function that will be called when the current scope is disposed. This is useful for cleaning up resources in a framework-agnostic way.

- [unResolve](https://github.com/un-ts/unuse/blob/main/packages/unuse/src/unResolve/index.ts#L94)  
  Resolves a value from an `UnSignal` or a framework-specific signal, returning the value directly if it is not a signal.

`unResolve` is the most important method, as it allows to get the value from an UnSignal in a framework-agnostic way. It is used internally by all other methods to ensure that the value is always resolved correctly.

## How a composable is structured

```ts
import { toUnSignal } from '../toUnSignal';
import type { MaybeUnRef } from '../unAccess';
import type { ReadonlyUnResolveReturn } from '../unResolve';
import { unResolve } from '../unResolve';

export interface UseComposableNameOptions {
  /**
   * A string value.
   *
   * @default 'default'
   */
  input?: MaybeUnRef<string>;
}

export interface UseComposableNameReturn {
  readonly result: ReadonlyUnResolveReturn<string>;
}

export function useComposableName(
  options: UseComposableNameOptions = {}
): UseComposableNameReturn {
  const { input = 'default' } = options;

  const resultRef = toUnSignal(input);

  return {
    result: unResolve(resultRef),
  };
}
```

There is also a [unAccess](https://github.com/un-ts/unuse/blob/main/packages/unuse/src/unAccess/index.ts#L149) helper function that can be used to access the value of any kind of signal.

## Testing

Beside each composable, there should be a test to ensure that the composable works as expected.

The `useComposableName/index.spec.ts` covers the basic functionality and is tested without any framework-specific code.  
The `useComposableName/index.<framework>.spec.ts` covers the framework-specific code and is tested with a specific framework.  
There are `vitest` helpers to wrap the test like `describeVue`. These will setup the required environment for the specific framework and allow you to check that the correct values are returned.

Manually testing can also be done in the example projects. Just run the `pnpm run preflight` command to ensure everything got build and then run the relevant example project by using `pnpm run example:vue` (or any of the other frameworks) from the mono-root.
