import { describe, expect, it } from 'vitest';
import { getGrabPair } from '../grabRules';

describe('grabRules', () => {
  it('returns no pair when nobody is trying to grab', () => {
    expect(
      getGrabPair([
        { position: { x: 0, y: 0 }, grabHeld: false },
        { position: { x: 1, y: 0 }, grabHeld: false },
      ])
    ).toBeNull();
  });

  it('returns a pair when one player is holding grab and the other is in range', () => {
    expect(
      getGrabPair([
        { position: { x: 0, y: 0 }, grabHeld: true },
        { position: { x: 1.2, y: 0.2 }, grabHeld: false },
      ])
    ).toEqual({ a: 0, b: 1 });
  });

  it('returns no pair when players are too far apart', () => {
    expect(
      getGrabPair([
        { position: { x: 0, y: 0 }, grabHeld: true },
        { position: { x: 4, y: 0 }, grabHeld: false },
      ])
    ).toBeNull();
  });
});
