import { describe, expect, it } from 'vitest';
import { useEventListener } from '.';

describe('useEventListener', () => {
  it('should be defined', () => {
    expect(useEventListener).toBeTypeOf('function');
  });
});
