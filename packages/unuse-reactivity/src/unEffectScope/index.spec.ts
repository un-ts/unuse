import { describe, expect, it } from 'vitest';
import { unEffectScope } from '.';

describe('unEffectScope', () => {
  it('should be defined', () => {
    expect(unEffectScope).toBeTypeOf('function');
  });
});
