import { clampAngularSpeed } from './kickPhysics';

export const PLAYER_TUNING = {
  fixedZ: 0,
  bodyRadius: 0.8,
  groundTorque: 17,
  groundPushForce: 8.5,
  airPushForce: 2.6,
  kickForce: 31,
  kickCooldown: 0.18,
  kickBufferTime: 0.22,
  kickProbeLength: 0.82,
  kickProbeSpread: 0.28,
  maxAirAngularSpeed: 5.8,
  maxGroundAngularSpeed: 8,
  landingSpinDamping: 0.55,
  groundLinearDamping: 0.1,
  airLinearDamping: 0.04,
  groundAngularDamping: 0.18,
  airAngularDamping: 0.08,
  kickAnimationDuration: 0.19,
} as const;

export function getHorizontalMoveForce(grounded: boolean): number {
  return grounded ? PLAYER_TUNING.groundPushForce : PLAYER_TUNING.airPushForce;
}

export function getLinearDamping(grounded: boolean): number {
  return grounded ? PLAYER_TUNING.groundLinearDamping : PLAYER_TUNING.airLinearDamping;
}

export function getAngularDamping(grounded: boolean): number {
  return grounded ? PLAYER_TUNING.groundAngularDamping : PLAYER_TUNING.airAngularDamping;
}

export function getMaxAngularSpeed(grounded: boolean): number {
  return grounded ? PLAYER_TUNING.maxGroundAngularSpeed : PLAYER_TUNING.maxAirAngularSpeed;
}

export function applyLandingSpinDamping(angularSpeed: number): number {
  return clampAngularSpeed(
    angularSpeed * PLAYER_TUNING.landingSpinDamping,
    PLAYER_TUNING.maxGroundAngularSpeed
  );
}
