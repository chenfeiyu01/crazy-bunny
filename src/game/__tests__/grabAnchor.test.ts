import { describe, expect, it } from 'vitest';
import { getGrabAnchorTarget } from '../grabAnchor';

describe('grabAnchor', () => {
  it('returns no anchor when player is not holding grab', () => {
    expect(
      getGrabAnchorTarget(
        { x: 0, y: 1 },
        false,
        [{ x: 0.3, y: -0.2, bodyIndex: 0 }]
      )
    ).toBeNull();
  });

  it('selects the nearest reachable hit when grab is held', () => {
    expect(
      getGrabAnchorTarget(
        { x: 0, y: 1 },
        true,
        [
          { x: 0.8, y: 0.4, bodyIndex: 1 },
          { x: 0.1, y: 0.2, bodyIndex: 0 },
        ]
      )
    ).toEqual({ x: 0.1, y: 0.2, bodyIndex: 0 });
  });

  it('returns no anchor when all hits are out of range', () => {
    expect(
      getGrabAnchorTarget(
        { x: 0, y: 1 },
        true,
        [{ x: 5, y: 5, bodyIndex: 0 }],
        1.5
      )
    ).toBeNull();
  });
});
