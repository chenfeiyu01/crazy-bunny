import { describe, expect, it } from 'vitest';
import { getCoopSpawnPositions } from '../coopSpawn';

describe('coopSpawn', () => {
  it('keeps the pair centered around the level spawn point', () => {
    const positions = getCoopSpawnPositions({ x: 10, y: 2 }, 0.8);

    expect((positions[0].x + positions[1].x) / 2).toBeCloseTo(10, 6);
    expect((positions[0].y + positions[1].y) / 2).toBeCloseTo(2, 6);
  });

  it('separates players by more than their combined body diameter', () => {
    const bodyRadius = 0.8;
    const positions = getCoopSpawnPositions({ x: 0, y: 0 }, bodyRadius);
    const dx = positions[1].x - positions[0].x;
    const dy = positions[1].y - positions[0].y;

    expect(Math.hypot(dx, dy)).toBeGreaterThan(bodyRadius * 2);
  });
});
