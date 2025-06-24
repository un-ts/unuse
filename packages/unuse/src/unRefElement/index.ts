import type { SupportedFramework } from '../_framework';
import type { MaybeUnRef } from '../unAccess';
import { unAccess } from '../unAccess';

export type MaybeElementRef<T extends MaybeElement = MaybeElement> =
  MaybeUnRef<T>;

export type MaybeComputedElementRef<T extends MaybeElement = MaybeElement> =
  MaybeUnRef<T>;

export type MaybeElement = HTMLElement | SVGElement | undefined | null;

export type UnRefElementReturn<T extends MaybeElement = MaybeElement> =
  | T
  | undefined;

/**
 * Get the dom element of a ref of element.
 *
 * @param elementRef
 */
export function unRefElement<T extends MaybeElement>(
  elementRef: MaybeComputedElementRef<T>
): UnRefElementReturn<T> {
  const plain = unAccess(elementRef);

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const framework = (globalThis.__UNUSE_FRAMEWORK__ ||
    'none') as SupportedFramework;
  if (framework === 'vue') {
    // @ts-expect-error: eat it
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, @typescript-eslint/no-unsafe-return
    return plain?.$el ?? plain;
  }

  return plain;
}
