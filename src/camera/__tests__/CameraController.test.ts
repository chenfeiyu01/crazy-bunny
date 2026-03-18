import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import {
  CameraController,
  getCameraTarget,
  getPlayersCenter,
  getCombinedVelocity,
  getRequiredFrustumSize,
  getMultiPlayerCameraTarget,
} from '../CameraController';

describe('CameraController', () => {
  it('looks ahead more when the rabbit is moving forward quickly', () => {
    const target = getCameraTarget({ x: 4, y: 1.5 }, { x: 8, y: 0 });

    expect(target.x).toBeGreaterThan(6.8);
  });

  it('stays closer when horizontal speed is almost zero', () => {
    const stationary = getCameraTarget({ x: 4, y: 1.5 }, { x: 0.15, y: 0 });
    const moving = getCameraTarget({ x: 4, y: 1.5 }, { x: 8, y: 0 });

    expect(stationary.x).toBeLessThan(moving.x);
    expect(stationary.x).toBeGreaterThan(4.5);
  });

  it('drops the framing during falls so the landing zone stays visible', () => {
    const stable = getCameraTarget({ x: 0, y: 4 }, { x: 0, y: 0 });
    const falling = getCameraTarget({ x: 0, y: 4 }, { x: 0, y: -12 });

    expect(falling.y).toBeLessThan(stable.y);
  });

  it('resets the camera to the spawn anchor immediately', () => {
    const camera = new THREE.OrthographicCamera(-10, 10, 10, -10, 0.1, 100);
    const controller = new CameraController(camera);

    controller.reset(-6, 2.4);

    expect(camera.position.x).toBeCloseTo(-3.2, 6);
    expect(camera.position.y).toBeCloseTo(2.7, 6);
  });
});

describe('getPlayersCenter', () => {
  it('returns origin for empty array', () => {
    const center = getPlayersCenter([]);
    expect(center.x).toBe(0);
    expect(center.y).toBe(0);
  });

  it('returns player position for single player', () => {
    const center = getPlayersCenter([{ position: { x: 5, y: 3 }, velocity: { x: 0, y: 0 } }]);
    expect(center.x).toBe(5);
    expect(center.y).toBe(3);
  });

  it('returns midpoint for two players', () => {
    const center = getPlayersCenter([
      { position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } },
      { position: { x: 10, y: 4 }, velocity: { x: 0, y: 0 } },
    ]);
    expect(center.x).toBe(5);
    expect(center.y).toBe(2);
  });

  it('returns centroid for three players', () => {
    const center = getPlayersCenter([
      { position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } },
      { position: { x: 6, y: 0 }, velocity: { x: 0, y: 0 } },
      { position: { x: 3, y: 6 }, velocity: { x: 0, y: 0 } },
    ]);
    expect(center.x).toBe(3);
    expect(center.y).toBe(2);
  });
});

describe('getCombinedVelocity', () => {
  it('returns zero velocity for empty array', () => {
    const vel = getCombinedVelocity([]);
    expect(vel.x).toBe(0);
    expect(vel.y).toBe(0);
  });

  it('returns player velocity for single player', () => {
    const vel = getCombinedVelocity([{ position: { x: 0, y: 0 }, velocity: { x: 5, y: -3 } }]);
    expect(vel.x).toBe(5);
    expect(vel.y).toBe(-3);
  });

  it('returns average velocity for two players', () => {
    const vel = getCombinedVelocity([
      { position: { x: 0, y: 0 }, velocity: { x: 4, y: 2 } },
      { position: { x: 0, y: 0 }, velocity: { x: -2, y: 6 } },
    ]);
    expect(vel.x).toBe(1);
    expect(vel.y).toBe(4);
  });
});

describe('getRequiredFrustumSize', () => {
  const minSize = 15;
  const maxSize = 25;
  const padding = 4;
  const aspect = 16 / 9;

  it('returns min size for single player', () => {
    const size = getRequiredFrustumSize(
      [{ position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } }],
      aspect,
      minSize,
      maxSize,
      padding
    );
    expect(size).toBe(minSize);
  });

  it('returns min size for empty array', () => {
    const size = getRequiredFrustumSize([], aspect, minSize, maxSize, padding);
    expect(size).toBe(minSize);
  });

  it('scales up when players are far apart horizontally', () => {
    const size = getRequiredFrustumSize(
      [
        { position: { x: -10, y: 0 }, velocity: { x: 0, y: 0 } },
        { position: { x: 10, y: 0 }, velocity: { x: 0, y: 0 } },
      ],
      aspect,
      minSize,
      maxSize,
      padding
    );
    // Distance is 20, plus padding 8 = 28 width needed
    // At 16:9, that's ~15.75 frustum height
    expect(size).toBeGreaterThan(minSize);
  });

  it('scales up when players are far apart vertically', () => {
    const size = getRequiredFrustumSize(
      [
        { position: { x: 0, y: -8 }, velocity: { x: 0, y: 0 } },
        { position: { x: 0, y: 8 }, velocity: { x: 0, y: 0 } },
      ],
      aspect,
      minSize,
      maxSize,
      padding
    );
    // Distance is 16, plus padding 8 = 24 height needed
    expect(size).toBe(24);
  });

  it('caps at max size', () => {
    const size = getRequiredFrustumSize(
      [
        { position: { x: -100, y: 0 }, velocity: { x: 0, y: 0 } },
        { position: { x: 100, y: 0 }, velocity: { x: 0, y: 0 } },
      ],
      aspect,
      minSize,
      maxSize,
      padding
    );
    expect(size).toBe(maxSize);
  });
});

describe('getMultiPlayerCameraTarget', () => {
  const aspect = 16 / 9;

  it('returns center and min frustum for close players', () => {
    const result = getMultiPlayerCameraTarget(
      [
        { position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 } },
        { position: { x: 1, y: 0 }, velocity: { x: 0, y: 0 } },
      ],
      aspect
    );
    expect(result.target.x).toBeCloseTo(0.5 + 1.25); // center + baseLookAhead
    expect(result.frustumSize).toBe(15); // min frustum
  });

  it('includes look-ahead based on average velocity', () => {
    const result = getMultiPlayerCameraTarget(
      [
        { position: { x: 0, y: 0 }, velocity: { x: 10, y: 0 } },
        { position: { x: 0, y: 0 }, velocity: { x: 10, y: 0 } },
      ],
      aspect
    );
    // Both moving right at speed 10, so look ahead should be significant
    expect(result.target.x).toBeGreaterThan(3);
  });
});
