export type LevelClearOutcome =
  | {
      type: 'next';
      nextLevelIndex: number;
    }
  | {
      type: 'complete';
    };

export function normalizeLevelIndex(index: number, totalLevels: number): number {
  if (totalLevels <= 0) {
    return 0;
  }

  if (index < 0) {
    return 0;
  }

  if (index >= totalLevels) {
    return totalLevels - 1;
  }

  return index;
}

export function getLevelClearOutcome(currentLevelIndex: number, totalLevels: number): LevelClearOutcome {
  const safeIndex = normalizeLevelIndex(currentLevelIndex, totalLevels);

  if (safeIndex >= totalLevels - 1) {
    return {
      type: 'complete',
    };
  }

  return {
    type: 'next',
    nextLevelIndex: safeIndex + 1,
  };
}
