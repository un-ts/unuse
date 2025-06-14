import { describe, expect, it } from 'vitest';
import { unAccess } from '.';

describe('unAccess', () => {
  it('should be defined', () => {
    expect(unAccess).toBeTypeOf('function');
  });
});
