import { describe, expect, it } from 'vitest';
import { hasReachedExit } from '../levelGoals';

describe('level goal helpers', () => {
  it('clears the level when the player enters the exit radius', () => {
    expect(
      hasReachedExit(
        { x: 10, y: 2 },
        { x: 10.6, y: 2.3 },
        1
      )
    ).toBe(true);
  });

  it('does not clear the level when the player is still outside the exit radius', () => {
    expect(
      hasReachedExit(
        { x: 10, y: 2 },
        { x: 11.4, y: 2.1 },
        1
      )
    ).toBe(false);
  });
});
