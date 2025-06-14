import { describe, expect, it } from 'vitest';
import { useIntervalFn } from '.';

describe('useIntervalFn', () => {
  it('should be defined', () => {
    expect(useIntervalFn).toBeTypeOf('function');
  });
});
