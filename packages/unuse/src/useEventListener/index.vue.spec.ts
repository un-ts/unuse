// @vitest-environment happy-dom

import type { MockInstance } from 'vitest';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEventListener } from '.';
import { describeVue } from '../_testUtils/vue';

describeVue('useEventListener', () => {
  const options = { capture: true };
  let stop: () => void;
  let target: HTMLDivElement;
  let removeSpy: MockInstance;
  let addSpy: MockInstance;

  beforeEach(() => {
    target = document.createElement('div');
    removeSpy = vi.spyOn(target, 'removeEventListener');
    addSpy = vi.spyOn(target, 'addEventListener');
  });

  describe('given both none array', () => {
    const listener = vi.fn();
    const event = 'click';

    beforeEach(() => {
      listener.mockReset();
      stop = useEventListener(target, event, listener, options);
    });

    it('should add listener', () => {
      expect(addSpy).toHaveBeenCalledTimes(1);
    });

    it('should trigger listener', () => {
      expect(listener).not.toHaveBeenCalled();
      target.dispatchEvent(new MouseEvent(event));
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should remove listener', () => {
      expect(removeSpy).not.toHaveBeenCalled();

      stop();

      expect(removeSpy).toHaveBeenCalledTimes(1);
      expect(removeSpy).toHaveBeenCalledWith(event, listener, options);
    });
  });
});
