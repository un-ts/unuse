export const IS_WORKER =
  // @ts-expect-error: need to define globals
  typeof WorkerGlobalScope !== 'undefined' &&
  // @ts-expect-error: need to define globals
  globalThis instanceof WorkerGlobalScope;
