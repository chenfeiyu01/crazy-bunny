// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { InputController } from '../InputController';

describe('InputController', () => {
  it('preserves a quick space tap until the game loop consumes it', () => {
    const input = new InputController();

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));

    expect(input.jump).toBe(true);
    expect(input.jump).toBe(false);
  });
});
