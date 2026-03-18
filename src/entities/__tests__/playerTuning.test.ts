import { describe, expect, it } from 'vitest';
import {
  PLAYER_TUNING,
  applyLandingSpinDamping,
  getHorizontalMoveForce,
  getMaxAngularSpeed,
} from '../playerTuning';

describe('playerTuning helpers', () => {
  it('exposes named tuning values instead of burying them in Player', () => {
    expect(PLAYER_TUNING.groundTorque).toBeGreaterThan(0);
    expect(PLAYER_TUNING.kickForce).toBeGreaterThan(PLAYER_TUNING.groundPushForce);
  });

  it('keeps air control weaker than grounded movement', () => {
    expect(getHorizontalMoveForce(true)).toBeGreaterThan(getHorizontalMoveForce(false));
  });

  it('uses separate angular-speed caps for ground and air states', () => {
    expect(getMaxAngularSpeed(true)).toBeGreaterThan(getMaxAngularSpeed(false));
  });

  it('damps landing spin without flipping the rotation direction', () => {
    expect(applyLandingSpinDamping(9)).toBeGreaterThan(0);
    expect(applyLandingSpinDamping(9)).toBeLessThan(9);
    expect(applyLandingSpinDamping(-9)).toBeLessThan(0);
    expect(Math.abs(applyLandingSpinDamping(-9))).toBeLessThan(9);
  });
});
