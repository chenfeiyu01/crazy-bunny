export interface SpawnPoint {
  x: number;
  y: number;
}

const SPAWN_CLEARANCE = 0.35;

export function getCoopSpawnPositions(spawn: SpawnPoint, bodyRadius: number): [SpawnPoint, SpawnPoint] {
  const spacing = bodyRadius * 2 + SPAWN_CLEARANCE;
  const halfSpacing = spacing / 2;

  return [
    { x: spawn.x - halfSpacing, y: spawn.y },
    { x: spawn.x + halfSpacing, y: spawn.y },
  ];
}
