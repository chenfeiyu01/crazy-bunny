export interface Vec2Like {
  x: number;
  y: number;
}

export interface HitLike {
  hasHit: boolean;
  body?: unknown;
}

const PROBE_EPSILON = 0.02;
const IMPULSE_POINT_FACTOR = 0.9;

function cleanZero(value: number): number {
  return Math.abs(value) < 1e-10 ? 0 : value;
}

function normalize(x: number, y: number): Vec2Like {
  const length = Math.hypot(x, y) || 1;

  return {
    x: cleanZero(x / length),
    y: cleanZero(y / length),
  };
}

export function isExternalKickHit(hit: HitLike, selfBody: unknown): boolean {
  return hit.hasHit && hit.body !== undefined && hit.body !== selfBody;
}

export function getKickLegDirection(rotationAngle: number): Vec2Like {
  const x = Math.sin(rotationAngle);
  const y = -Math.cos(rotationAngle);

  return normalize(x, y);
}

export function getKickImpulseDirection(rotationAngle: number): Vec2Like {
  const legDirection = getKickLegDirection(rotationAngle);

  return {
    x: cleanZero(-legDirection.x),
    y: cleanZero(-legDirection.y),
  };
}

export function getTunedKickImpulseDirection(rotationAngle: number): Vec2Like {
  const raw = getKickImpulseDirection(rotationAngle);
  const minUpward = 0.72;
  const horizontalBoost = 1.18;

  return normalize(raw.x * horizontalBoost, Math.max(minUpward, raw.y));
}

export function clampAngularSpeed(angularSpeed: number, maxMagnitude: number): number {
  if (angularSpeed > maxMagnitude) {
    return maxMagnitude;
  }

  if (angularSpeed < -maxMagnitude) {
    return -maxMagnitude;
  }

  return angularSpeed;
}

export function getKickImpulsePoint(
  _position: Vec2Like,
  rotationAngle: number,
  bodyRadius: number
): Vec2Like {
  const legDirection = getKickLegDirection(rotationAngle);
  const offset = bodyRadius * IMPULSE_POINT_FACTOR;

  return {
    x: legDirection.x * offset,
    y: legDirection.y * offset,
  };
}

export function buildKickProbe(
  position: Vec2Like,
  rotationAngle: number,
  bodyRadius: number,
  probeLength: number
): { direction: Vec2Like; start: Vec2Like; end: Vec2Like } {
  const direction = getKickLegDirection(rotationAngle);
  const offset = bodyRadius + PROBE_EPSILON;

  return {
    direction,
    start: {
      x: position.x + direction.x * offset,
      y: position.y + direction.y * offset,
    },
    end: {
      x: position.x + direction.x * (offset + probeLength),
      y: position.y + direction.y * (offset + probeLength),
    },
  };
}
