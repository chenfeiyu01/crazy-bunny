export interface PointLike {
  x: number;
  y: number;
}

export function hasReachedExit(player: PointLike, exit: PointLike, radius: number): boolean {
  const dx = player.x - exit.x;
  const dy = player.y - exit.y;

  return Math.sqrt(dx * dx + dy * dy) <= radius;
}
