export interface GrabParticipant {
  position: {
    x: number;
    y: number;
  };
  grabHeld: boolean;
}

const DEFAULT_GRAB_DISTANCE = 1.8;

export function getGrabPair(
  players: GrabParticipant[],
  maxDistance: number = DEFAULT_GRAB_DISTANCE
): { a: number; b: number } | null {
  if (players.length < 2) {
    return null;
  }

  for (let index = 0; index < players.length; index++) {
    if (!players[index].grabHeld) {
      continue;
    }

    for (let otherIndex = 0; otherIndex < players.length; otherIndex++) {
      if (index === otherIndex) {
        continue;
      }

      const dx = players[index].position.x - players[otherIndex].position.x;
      const dy = players[index].position.y - players[otherIndex].position.y;

      if (Math.hypot(dx, dy) <= maxDistance) {
        return {
          a: Math.min(index, otherIndex),
          b: Math.max(index, otherIndex),
        };
      }
    }
  }

  return null;
}
