import { describe, expect, it } from 'vitest';
import {
  isUnComputed,
  isUnSignal,
  unComputed,
  unEffect,
  unEffectScope,
  unSignal,
  unWatch,
} from '.';

describe('unuse-reactivity', () => {
  it('should expose reactivity functions', () => {
    expect(isUnComputed).toBeTypeOf('function');
    expect(isUnSignal).toBeTypeOf('function');
    expect(unComputed).toBeTypeOf('function');
    expect(unEffect).toBeTypeOf('function');
    expect(unEffectScope).toBeTypeOf('function');
    expect(unSignal).toBeTypeOf('function');
    expect(unWatch).toBeTypeOf('function');
  });
});
