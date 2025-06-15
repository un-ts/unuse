import { describe, expect, it } from 'vitest';
import { toUnSignal } from '.';

describe('toUnSignal', () => {
  it('should be defined', () => {
    expect(toUnSignal).toBeTypeOf('function');
  });
});
