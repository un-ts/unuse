import { describe, expect, it } from 'vitest';
import { useWebSocket } from '.';

describe('useWebSocket', () => {
  it('should be defined', () => {
    expect(useWebSocket).toBeTypeOf('function');
  });
});
