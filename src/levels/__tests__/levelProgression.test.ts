import { describe, expect, it } from 'vitest';
import { getLevelClearOutcome, normalizeLevelIndex } from '../levelProgression';

describe('level progression helpers', () => {
  it('advances to the next level when the current level is not the last one', () => {
    expect(getLevelClearOutcome(0, 3)).toEqual({
      type: 'next',
      nextLevelIndex: 1,
    });
  });

  it('finishes the game when the current level is the last one', () => {
    expect(getLevelClearOutcome(2, 3)).toEqual({
      type: 'complete',
    });
  });

  it('clamps out-of-range level indices into the valid catalog bounds', () => {
    expect(normalizeLevelIndex(-5, 3)).toBe(0);
    expect(normalizeLevelIndex(99, 3)).toBe(2);
    expect(normalizeLevelIndex(1, 3)).toBe(1);
  });
});
