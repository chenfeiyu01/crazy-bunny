export interface GrabAnchorCandidate {
  x: number;
  y: number;
  bodyIndex: number;
}

export interface GrabAnchorTarget extends GrabAnchorCandidate {}

export function getGrabAnchorTarget(
  playerPosition: { x: number; y: number },
  grabHeld: boolean,
  candidates: GrabAnchorCandidate[],
  maxDistance: number = 1.6
): GrabAnchorTarget | null {
  if (!grabHeld || candidates.length === 0) {
    return null;
  }

  let best: GrabAnchorTarget | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    const dx = candidate.x - playerPosition.x;
    const dy = candidate.y - playerPosition.y;
    const distance = Math.hypot(dx, dy);

    if (distance <= maxDistance && distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  return best;
}
