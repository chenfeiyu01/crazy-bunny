import { describe, expect, it } from 'vitest';
import { getKickAnimationPose } from '../playerAnimation';

describe('player kick animation pose', () => {
  it('winds the kick leg back before the strike snaps outward', () => {
    const windup = getKickAnimationPose(0.04);
    const strike = getKickAnimationPose(0.1);

    expect(windup.kickLegRotation).toBeGreaterThan(0.4);
    expect(windup.kickLegOffsetX).toBeLessThan(0);
    expect(strike.kickLegRotation).toBeLessThan(-0.6);
    expect(strike.kickLegOffsetX).toBeGreaterThan(0.15);
  });

  it('adds readable body compression and release during the kick', () => {
    const windup = getKickAnimationPose(0.04);
    const strike = getKickAnimationPose(0.1);

    expect(windup.torsoScaleX).toBeGreaterThan(1);
    expect(windup.torsoScaleY).toBeLessThan(1);
    expect(strike.torsoScaleX).toBeLessThan(1);
    expect(strike.torsoScaleY).toBeGreaterThan(1);
  });

  it('returns close to neutral after recovery', () => {
    const recover = getKickAnimationPose(0.19);

    expect(recover.kickLegOffsetX).toBeCloseTo(0, 1);
    expect(recover.kickLegRotation).toBeCloseTo(0, 1);
    expect(recover.torsoScaleX).toBeCloseTo(1, 1);
    expect(recover.torsoScaleY).toBeCloseTo(1, 1);
  });
});
