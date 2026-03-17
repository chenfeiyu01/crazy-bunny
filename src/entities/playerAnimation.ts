export interface KickAnimationPose {
  kickLegRotation: number;
  kickLegOffsetX: number;
  kickLegOffsetY: number;
  supportLegRotation: number;
  supportLegOffsetY: number;
  torsoRotation: number;
  torsoScaleX: number;
  torsoScaleY: number;
  headOffsetY: number;
  earSwing: number;
}

interface PoseKeyframe {
  time: number;
  pose: KickAnimationPose;
}

const NEUTRAL_POSE: KickAnimationPose = {
  kickLegRotation: 0,
  kickLegOffsetX: 0,
  kickLegOffsetY: 0,
  supportLegRotation: 0,
  supportLegOffsetY: 0,
  torsoRotation: 0,
  torsoScaleX: 1,
  torsoScaleY: 1,
  headOffsetY: 0,
  earSwing: 0,
};

const KEYFRAMES: PoseKeyframe[] = [
  {
    time: 0,
    pose: NEUTRAL_POSE,
  },
  {
    time: 0.05,
    pose: {
      kickLegRotation: 0.95,
      kickLegOffsetX: -0.18,
      kickLegOffsetY: 0.08,
      supportLegRotation: -0.08,
      supportLegOffsetY: 0.03,
      torsoRotation: -0.08,
      torsoScaleX: 1.08,
      torsoScaleY: 0.92,
      headOffsetY: -0.03,
      earSwing: -0.16,
    },
  },
  {
    time: 0.11,
    pose: {
      kickLegRotation: -1.12,
      kickLegOffsetX: 0.26,
      kickLegOffsetY: -0.02,
      supportLegRotation: 0.28,
      supportLegOffsetY: -0.02,
      torsoRotation: 0.09,
      torsoScaleX: 0.94,
      torsoScaleY: 1.08,
      headOffsetY: 0.05,
      earSwing: 0.18,
    },
  },
  {
    time: 0.19,
    pose: {
      kickLegRotation: 0,
      kickLegOffsetX: 0,
      kickLegOffsetY: 0,
      supportLegRotation: 0,
      supportLegOffsetY: 0,
      torsoRotation: 0,
      torsoScaleX: 1,
      torsoScaleY: 1,
      headOffsetY: 0,
      earSwing: 0,
    },
  },
];

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function interpolatePose(from: KickAnimationPose, to: KickAnimationPose, t: number): KickAnimationPose {
  return {
    kickLegRotation: lerp(from.kickLegRotation, to.kickLegRotation, t),
    kickLegOffsetX: lerp(from.kickLegOffsetX, to.kickLegOffsetX, t),
    kickLegOffsetY: lerp(from.kickLegOffsetY, to.kickLegOffsetY, t),
    supportLegRotation: lerp(from.supportLegRotation, to.supportLegRotation, t),
    supportLegOffsetY: lerp(from.supportLegOffsetY, to.supportLegOffsetY, t),
    torsoRotation: lerp(from.torsoRotation, to.torsoRotation, t),
    torsoScaleX: lerp(from.torsoScaleX, to.torsoScaleX, t),
    torsoScaleY: lerp(from.torsoScaleY, to.torsoScaleY, t),
    headOffsetY: lerp(from.headOffsetY, to.headOffsetY, t),
    earSwing: lerp(from.earSwing, to.earSwing, t),
  };
}

export function getKickAnimationPose(time: number): KickAnimationPose {
  if (time <= KEYFRAMES[0].time) {
    return { ...KEYFRAMES[0].pose };
  }

  for (let index = 0; index < KEYFRAMES.length - 1; index++) {
    const current = KEYFRAMES[index];
    const next = KEYFRAMES[index + 1];

    if (time <= next.time) {
      const span = next.time - current.time || 1;
      const progress = (time - current.time) / span;
      return interpolatePose(current.pose, next.pose, progress);
    }
  }

  return { ...NEUTRAL_POSE };
}
