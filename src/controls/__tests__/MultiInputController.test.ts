// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';
import { MultiInputController } from '../MultiInputController';

describe('MultiInputController', () => {
  it('keeps player one and player two jump presses isolated', () => {
    const input = new MultiInputController();

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Space' }));

    expect(input.player1.jump).toBe(true);
    expect(input.player2.jump).toBe(false);

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Enter' }));
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter' }));

    expect(input.player1.jump).toBe(false);
    expect(input.player2.jump).toBe(true);
  });

  it('can clear buffered inputs before a new level starts', () => {
    const input = new MultiInputController();

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'Space' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyA' }));
    input.reset();

    expect(input.player1.jump).toBe(false);
    expect(input.player1.left).toBe(false);
    expect(input.player1.right).toBe(false);
    expect(input.player2.jump).toBe(false);
    expect(input.player2.left).toBe(false);
    expect(input.player2.right).toBe(false);
  });

  it('tracks grab hold state for both players', () => {
    const input = new MultiInputController();

    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'KeyW' }));
    window.dispatchEvent(new KeyboardEvent('keydown', { code: 'ArrowUp' }));

    expect(input.player1.grabHeld).toBe(true);
    expect(input.player2.grabHeld).toBe(true);

    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'KeyW' }));
    window.dispatchEvent(new KeyboardEvent('keyup', { code: 'ArrowUp' }));

    expect(input.player1.grabHeld).toBe(false);
    expect(input.player2.grabHeld).toBe(false);
  });
});
