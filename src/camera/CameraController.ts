import * as THREE from 'three';

interface PointLike {
  x: number;
  y: number;
}

interface PlayerSnapshot {
  position: PointLike;
  velocity: PointLike;
}

const CAMERA_TUNING = {
  positionZ: 20,
  spawnLookAhead: 2.8,
  spawnLift: 0.3,
  baseLookAhead: 1.25,
  maxLookAhead: 3.15,
  lookAheadPerSpeed: 0.24,
  verticalLift: 0.45,
  maxFallOffset: 1.8,
  fallOffsetPerSpeed: 0.18,
  fallTriggerSpeed: 3.5,
  horizontalSmoothing: 6.8,
  verticalSmoothing: 5.2,
  minY: -0.8,
  lookAtYOffset: -0.15,
  // Multi-player camera tuning
  minFrustumSize: 15,
  maxFrustumSize: 25,
  playerPadding: 4,
  zoomSmoothing: 3.5,
} as const;

function damp(current: number, target: number, smoothing: number, delta: number): number {
  const alpha = 1 - Math.exp(-smoothing * delta);
  return current + (target - current) * alpha;
}

/**
 * Calculate the center point between multiple players
 */
export function getPlayersCenter(players: PlayerSnapshot[]): PointLike {
  if (players.length === 0) {
    return { x: 0, y: 0 };
  }
  if (players.length === 1) {
    return { x: players[0].position.x, y: players[0].position.y };
  }

  let sumX = 0;
  let sumY = 0;
  for (const player of players) {
    sumX += player.position.x;
    sumY += player.position.y;
  }
  return {
    x: sumX / players.length,
    y: sumY / players.length,
  };
}

/**
 * Calculate the combined velocity direction for look-ahead
 */
export function getCombinedVelocity(players: PlayerSnapshot[]): PointLike {
  if (players.length === 0) {
    return { x: 0, y: 0 };
  }
  if (players.length === 1) {
    return { x: players[0].velocity.x, y: players[0].velocity.y };
  }

  let sumVx = 0;
  let sumVy = 0;
  for (const player of players) {
    sumVx += player.velocity.x;
    sumVy += player.velocity.y;
  }
  return {
    x: sumVx / players.length,
    y: sumVy / players.length,
  };
}

/**
 * Calculate the required frustum size to fit all players with padding
 */
export function getRequiredFrustumSize(
  players: PlayerSnapshot[],
  aspect: number,
  minSize: number = CAMERA_TUNING.minFrustumSize,
  maxSize: number = CAMERA_TUNING.maxFrustumSize,
  padding: number = CAMERA_TUNING.playerPadding
): number {
  if (players.length <= 1) {
    return minSize;
  }

  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const player of players) {
    minX = Math.min(minX, player.position.x);
    maxX = Math.max(maxX, player.position.x);
    minY = Math.min(minY, player.position.y);
    maxY = Math.max(maxY, player.position.y);
  }

  const widthNeeded = (maxX - minX) + padding * 2;
  const heightNeeded = (maxY - minY) + padding * 2;

  // Convert width to frustum size (frustum size is vertical height)
  const widthFrustum = widthNeeded / aspect;

  // Use the larger of width or height requirement
  const required = Math.max(heightNeeded, widthFrustum);

  return Math.max(minSize, Math.min(maxSize, required));
}

export function getCameraTarget(position: PointLike, velocity: PointLike): PointLike {
  const direction = Math.abs(velocity.x) > 0.15 ? Math.sign(velocity.x) : 1;
  const lookAhead = Math.min(
    CAMERA_TUNING.baseLookAhead + Math.abs(velocity.x) * CAMERA_TUNING.lookAheadPerSpeed,
    CAMERA_TUNING.maxLookAhead
  );
  const fallSpeed = Math.max(0, -velocity.y - CAMERA_TUNING.fallTriggerSpeed);
  const fallOffset = Math.min(
    CAMERA_TUNING.maxFallOffset,
    fallSpeed * CAMERA_TUNING.fallOffsetPerSpeed
  );

  return {
    x: position.x + lookAhead * direction,
    y: Math.max(position.y + CAMERA_TUNING.verticalLift - fallOffset, CAMERA_TUNING.minY),
  };
}

/**
 * Get camera target for multiple players with dynamic framing
 */
export function getMultiPlayerCameraTarget(
  players: PlayerSnapshot[],
  aspect: number
): { target: PointLike; frustumSize: number } {
  const center = getPlayersCenter(players);
  const velocity = getCombinedVelocity(players);
  const baseTarget = getCameraTarget(center, velocity);
  const frustumSize = getRequiredFrustumSize(players, aspect);

  return { target: baseTarget, frustumSize };
}

export class CameraController {
  private anchor = new THREE.Vector2();
  private currentFrustumSize: number = CAMERA_TUNING.minFrustumSize;
  private aspect: number = 1;

  constructor(private readonly camera: THREE.OrthographicCamera) {}

  reset(x: number, y: number): void {
    this.anchor.set(x + CAMERA_TUNING.spawnLookAhead, y + CAMERA_TUNING.spawnLift);
    this.currentFrustumSize = CAMERA_TUNING.minFrustumSize;
    this.syncCamera();
  }

  /**
   * Update camera for single player (backward compatibility)
   */
  update(position: PointLike, velocity: PointLike, delta: number): void;

  /**
   * Update camera for multiple players
   */
  update(players: PlayerSnapshot[], delta: number): void;

  update(positionOrPlayers: PointLike | PlayerSnapshot[], velocityOrDelta: PointLike | number, delta?: number): void {
    if (Array.isArray(positionOrPlayers)) {
      // Multi-player mode
      const players = positionOrPlayers;
      const d = velocityOrDelta as number;
      this.updateMultiPlayer(players, d);
    } else {
      // Single-player mode (backward compatibility)
      const position = positionOrPlayers;
      const velocity = velocityOrDelta as PointLike;
      const d = delta as number;
      this.updateSinglePlayer(position, velocity, d);
    }
  }

  private updateSinglePlayer(position: PointLike, velocity: PointLike, delta: number): void {
    const target = getCameraTarget(position, velocity);
    this.anchor.x = damp(this.anchor.x, target.x, CAMERA_TUNING.horizontalSmoothing, delta);
    this.anchor.y = damp(this.anchor.y, target.y, CAMERA_TUNING.verticalSmoothing, delta);
    this.currentFrustumSize = damp(
      this.currentFrustumSize,
      CAMERA_TUNING.minFrustumSize,
      CAMERA_TUNING.zoomSmoothing,
      delta
    );
    this.syncCamera();
  }

  private updateMultiPlayer(players: PlayerSnapshot[], delta: number): void {
    const { target, frustumSize } = getMultiPlayerCameraTarget(players, this.aspect);
    this.anchor.x = damp(this.anchor.x, target.x, CAMERA_TUNING.horizontalSmoothing, delta);
    this.anchor.y = damp(this.anchor.y, target.y, CAMERA_TUNING.verticalSmoothing, delta);
    this.currentFrustumSize = damp(
      this.currentFrustumSize,
      frustumSize,
      CAMERA_TUNING.zoomSmoothing,
      delta
    );
    this.syncCamera();
  }

  private syncCamera(): void {
    this.camera.position.set(this.anchor.x, this.anchor.y, CAMERA_TUNING.positionZ);
    this.camera.lookAt(this.anchor.x, this.anchor.y + CAMERA_TUNING.lookAtYOffset, 0);

    // Update orthographic frustum
    const halfHeight = this.currentFrustumSize / 2;
    const halfWidth = halfHeight * this.aspect;
    this.camera.left = -halfWidth;
    this.camera.right = halfWidth;
    this.camera.top = halfHeight;
    this.camera.bottom = -halfHeight;
    this.camera.updateProjectionMatrix();
  }

  /**
   * Update the aspect ratio (call on window resize)
   */
  setAspect(aspect: number): void {
    this.aspect = aspect;
    this.syncCamera();
  }
}
