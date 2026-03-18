import * as CANNON from 'cannon-es';
import { describe, expect, it } from 'vitest';
import {
  buildKickProbe,
  clampAngularSpeed,
  getKickImpulsePoint,
  getKickImpulseDirection,
  getKickLegDirection,
  getTunedKickImpulseDirection,
  isExternalKickHit,
} from '../kickPhysics';

describe('kickPhysics helpers', () => {
  it('treats self-hit raycasts as invalid kick contacts', () => {
    const selfBody = { id: 'player' };

    expect(isExternalKickHit({ hasHit: false }, selfBody)).toBe(false);
    expect(isExternalKickHit({ hasHit: true, body: selfBody }, selfBody)).toBe(false);
    expect(isExternalKickHit({ hasHit: true, body: { id: 'ground' } }, selfBody)).toBe(true);
  });

  it('kicks straight upward when the rabbit is upright', () => {
    expect(getKickImpulseDirection(0)).toEqual({ x: 0, y: 1 });
  });

  it('points the leg down-left when the rabbit leans to the right', () => {
    const leg = getKickLegDirection(-Math.PI / 4);

    expect(leg.x).toBeCloseTo(-Math.SQRT1_2, 6);
    expect(leg.y).toBeCloseTo(-Math.SQRT1_2, 6);
  });

  it('kicks up-right when the rabbit leans to the right', () => {
    const impulse = getKickImpulseDirection(-Math.PI / 4);

    expect(impulse.x).toBeCloseTo(Math.SQRT1_2, 6);
    expect(impulse.y).toBeCloseTo(Math.SQRT1_2, 6);
  });

  it('biases very sideways kicks upward so launches stay playable', () => {
    const impulse = getTunedKickImpulseDirection(-Math.PI / 2);

    expect(impulse.x).toBeGreaterThan(0.7);
    expect(impulse.y).toBeGreaterThan(0.5);
  });

  it('adds extra forward carry for shallow forward-lean kicks', () => {
    const raw = getKickImpulseDirection(-Math.PI / 6);
    const tuned = getTunedKickImpulseDirection(-Math.PI / 6);

    expect(tuned.x).toBeGreaterThan(raw.x);
    expect(tuned.y).toBeGreaterThan(0.55);
  });

  it('starts the kick probe just outside the body so the ray does not begin inside the player', () => {
    const probe = buildKickProbe({ x: 0, y: 0 }, 0, 0.8, 0.5);

    expect(probe.direction).toEqual({ x: 0, y: -1 });
    expect(probe.start.x).toBeCloseTo(0, 6);
    expect(probe.start.y).toBeCloseTo(-0.82, 6);
    expect(probe.end.y).toBeCloseTo(-1.32, 6);
  });

  it('returns a body-relative kick impulse point on the leg side', () => {
    const point = getKickImpulsePoint({ x: 10, y: 5 }, -Math.PI / 4, 0.8);

    expect(point.x).toBeLessThan(0);
    expect(point.y).toBeLessThan(0);
    expect(point.x).toBeCloseTo(-Math.SQRT1_2 * 0.72, 6);
    expect(point.y).toBeCloseTo(-Math.SQRT1_2 * 0.72, 6);
  });

  it('keeps kick torque consistent regardless of absolute world position', () => {
    const angle = -Math.PI / 4;
    const force = 31;

    const simulateKickSpin = (x: number): number => {
      const body = new CANNON.Body({
        mass: 2,
        shape: new CANNON.Sphere(0.8),
        position: new CANNON.Vec3(x, 5, 0),
      });
      const impulseDirection = getTunedKickImpulseDirection(angle);
      const impulsePoint = getKickImpulsePoint({ x, y: 5 }, angle, 0.8);

      body.applyImpulse(
        new CANNON.Vec3(impulseDirection.x * force, impulseDirection.y * force, 0),
        new CANNON.Vec3(impulsePoint.x, impulsePoint.y, 0)
      );

      return body.angularVelocity.z;
    };

    expect(simulateKickSpin(0)).toBeCloseTo(simulateKickSpin(20), 6);
  });

  it('clamps angular speed without changing direction', () => {
    expect(clampAngularSpeed(9, 6)).toBe(6);
    expect(clampAngularSpeed(-9, 6)).toBe(-6);
    expect(clampAngularSpeed(4, 6)).toBe(4);
  });
});
