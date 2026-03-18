import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsWorld } from '../physics/PhysicsWorld';
import { PlayerInput } from '../controls/MultiInputController';
import { getKickAnimationPose } from './playerAnimation';
import {
  buildKickProbe,
  isExternalKickHit,
  clampAngularSpeed,
  getKickImpulsePoint,
  getTunedKickImpulseDirection,
} from './kickPhysics';
import {
  PLAYER_TUNING,
  applyLandingSpinDamping,
  getAngularDamping,
  getHorizontalMoveForce,
  getLinearDamping,
  getMaxAngularSpeed,
} from './playerTuning';

interface KickContact {
  impulseDirection: {
    x: number;
    y: number;
  };
  impulsePoint: {
    x: number;
    y: number;
  };
}

/** Color scheme for a player */
interface PlayerColors {
  fur: number;
  belly: number;
  limb: number;
  accent: number;
}

/** Default player 1 colors (cream/brown bunny) */
const PLAYER_1_COLORS: PlayerColors = {
  fur: 0xf3f0df,
  belly: 0xfff6ea,
  limb: 0xe8dfc9,
  accent: 0xffa6b8,
};

/** Player 2 colors (orange/ginger bunny) */
const PLAYER_2_COLORS: PlayerColors = {
  fur: 0xf5c896,
  belly: 0xffe4c4,
  limb: 0xe8b87a,
  accent: 0xff7b54,
};

export class Player {
  mesh: THREE.Group;
  body: CANNON.Body;
  private visualRoot: THREE.Group;
  private torsoGroup: THREE.Group;
  private headGroup: THREE.Group;
  private earLeft: THREE.Mesh;
  private earRight: THREE.Mesh;
  private kickLegRoot: THREE.Group;
  private supportLegRoot: THREE.Group;
  private physicsWorld: PhysicsWorld;
  private readonly EAR_LEFT_BASE_ROTATION = 0.18;
  private readonly EAR_RIGHT_BASE_ROTATION = -0.14;
  private kickCooldownTimer: number = 0;
  private kickBufferTimer: number = 0;
  private legExtended: boolean = false;
  private legAnimationTime: number = 0;
  private grounded: boolean = false;
  private playerIndex: number;

  constructor(_scene: THREE.Scene, physics: PhysicsWorld, playerIndex: number = 0) {
    this.physicsWorld = physics;
    this.playerIndex = playerIndex;
    this.mesh = new THREE.Group();
    this.visualRoot = new THREE.Group();
    this.torsoGroup = new THREE.Group();
    this.headGroup = new THREE.Group();
    this.kickLegRoot = new THREE.Group();
    this.supportLegRoot = new THREE.Group();
    this.earLeft = new THREE.Mesh();
    this.earRight = new THREE.Mesh();

    this.mesh.add(this.visualRoot);
    this.buildVisualRig();

    const shape = new CANNON.Sphere(PLAYER_TUNING.bodyRadius);
    this.body = new CANNON.Body({
      mass: 2,
      shape,
      position: new CANNON.Vec3(0, 3, PLAYER_TUNING.fixedZ),
      material: physics.playerMaterial,
      linearDamping: PLAYER_TUNING.airLinearDamping,
      angularDamping: PLAYER_TUNING.airAngularDamping,
    });
    this.body.allowSleep = false;

    physics.world.addBody(this.body);
  }

  private getColors(): PlayerColors {
    return this.playerIndex === 1 ? PLAYER_2_COLORS : PLAYER_1_COLORS;
  }

  private buildVisualRig(): void {
    const colors = this.getColors();
    const furMaterial = new THREE.MeshStandardMaterial({
      color: colors.fur,
      roughness: 0.92,
    });
    const bellyMaterial = new THREE.MeshStandardMaterial({
      color: colors.belly,
      roughness: 0.9,
    });
    const limbMaterial = new THREE.MeshStandardMaterial({
      color: colors.limb,
      roughness: 0.95,
    });
    const accentMaterial = new THREE.MeshStandardMaterial({
      color: colors.accent,
      roughness: 0.8,
    });
    const eyeMaterial = new THREE.MeshStandardMaterial({ color: 0x111111 });

    this.visualRoot.position.set(0, -0.02, 0);

    const hip = new THREE.Mesh(new THREE.SphereGeometry(0.58, 24, 24), furMaterial);
    hip.position.set(0, -0.12, 0);
    hip.castShadow = true;
    this.torsoGroup.add(hip);

    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.46, 0.62, 6, 14), furMaterial);
    torso.position.set(0.02, 0.2, 0);
    torso.castShadow = true;
    this.torsoGroup.add(torso);

    const belly = new THREE.Mesh(new THREE.SphereGeometry(0.34, 20, 20), bellyMaterial);
    belly.position.set(0.03, 0.03, 0.34);
    belly.scale.set(0.95, 1.15, 0.45);
    belly.castShadow = true;
    this.torsoGroup.add(belly);

    const tail = new THREE.Mesh(new THREE.SphereGeometry(0.15, 18, 18), bellyMaterial);
    tail.position.set(-0.42, -0.08, -0.14);
    tail.castShadow = true;
    this.torsoGroup.add(tail);

    const shoulder = new THREE.Mesh(new THREE.SphereGeometry(0.18, 16, 16), furMaterial);
    shoulder.position.set(0.25, 0.43, 0.12);
    shoulder.castShadow = true;
    this.torsoGroup.add(shoulder);

    const paw = new THREE.Mesh(new THREE.CapsuleGeometry(0.08, 0.26, 4, 8), limbMaterial);
    paw.position.set(0.33, 0.06, 0.18);
    paw.rotation.z = -0.45;
    paw.castShadow = true;
    this.torsoGroup.add(paw);

    this.torsoGroup.position.set(0, -0.03, 0);
    this.visualRoot.add(this.torsoGroup);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.48, 24, 24), furMaterial);
    head.castShadow = true;
    this.headGroup.add(head);

    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.18, 18, 18), bellyMaterial);
    cheek.position.set(0.18, -0.08, 0.3);
    cheek.scale.set(1.15, 0.95, 0.8);
    cheek.castShadow = true;
    this.headGroup.add(cheek);

    this.earLeft = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.6, 4, 10), furMaterial);
    this.earLeft.position.set(-0.12, 0.58, -0.04);
    this.earLeft.rotation.z = this.EAR_LEFT_BASE_ROTATION;
    this.earLeft.castShadow = true;
    this.headGroup.add(this.earLeft);

    this.earRight = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.6, 4, 10), furMaterial);
    this.earRight.position.set(0.15, 0.58, 0.02);
    this.earRight.rotation.z = this.EAR_RIGHT_BASE_ROTATION;
    this.earRight.castShadow = true;
    this.headGroup.add(this.earRight);

    const eyeLeft = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 14), eyeMaterial);
    eyeLeft.position.set(-0.12, 0.06, 0.42);
    this.headGroup.add(eyeLeft);

    const eyeRight = new THREE.Mesh(new THREE.SphereGeometry(0.09, 14, 14), eyeMaterial);
    eyeRight.position.set(0.12, 0.03, 0.42);
    this.headGroup.add(eyeRight);

    const nose = new THREE.Mesh(new THREE.SphereGeometry(0.06, 14, 14), accentMaterial);
    nose.position.set(0.18, -0.08, 0.45);
    this.headGroup.add(nose);

    const mouth = new THREE.Mesh(new THREE.CapsuleGeometry(0.03, 0.14, 3, 6), eyeMaterial);
    mouth.position.set(0.18, -0.2, 0.42);
    mouth.rotation.z = -0.25;
    this.headGroup.add(mouth);

    this.headGroup.position.set(0.04, 0.72, 0.02);
    this.visualRoot.add(this.headGroup);

    const supportThigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.38, 4, 8), limbMaterial);
    supportThigh.position.set(0, -0.28, -0.02);
    supportThigh.castShadow = true;
    this.supportLegRoot.add(supportThigh);

    const supportFoot = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 16), accentMaterial);
    supportFoot.position.set(0.04, -0.58, 0.08);
    supportFoot.scale.set(1.4, 0.7, 1);
    supportFoot.castShadow = true;
    this.supportLegRoot.add(supportFoot);

    this.supportLegRoot.position.set(-0.16, -0.74, -0.05);
    this.visualRoot.add(this.supportLegRoot);

    const kickThigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 0.42, 4, 10), limbMaterial);
    kickThigh.position.set(0, -0.32, 0.02);
    kickThigh.castShadow = true;
    this.kickLegRoot.add(kickThigh);

    const kickFoot = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 16), accentMaterial);
    kickFoot.position.set(0.06, -0.62, 0.12);
    kickFoot.scale.set(1.7, 0.72, 1.05);
    kickFoot.castShadow = true;
    this.kickLegRoot.add(kickFoot);

    this.kickLegRoot.position.set(0.18, -0.7, 0.05);
    this.visualRoot.add(this.kickLegRoot);
  }

  private getBodyRotationAngle(): number {
    return 2 * Math.atan2(this.body.quaternion.z, this.body.quaternion.w);
  }

  private hasGroundContact(): boolean {
    const probeLength = 0.3;
    const directions = [
      new CANNON.Vec3(0, -1, 0),
      new CANNON.Vec3(-0.4, -1, 0),
      new CANNON.Vec3(0.4, -1, 0),
    ];

    for (const dir of directions) {
      const length = Math.hypot(dir.x, dir.y) || 1;
      const normalX = dir.x / length;
      const normalY = dir.y / length;
      const start = new CANNON.Vec3(
        this.body.position.x + normalX * (PLAYER_TUNING.bodyRadius + 0.02),
        this.body.position.y + normalY * (PLAYER_TUNING.bodyRadius + 0.02),
        PLAYER_TUNING.fixedZ
      );
      const end = new CANNON.Vec3(
        start.x + normalX * probeLength,
        start.y + normalY * probeLength,
        PLAYER_TUNING.fixedZ
      );
      const result = new CANNON.RaycastResult();

      this.physicsWorld.world.raycastClosest(start, end, {}, result);

      if (isExternalKickHit(result, this.body)) {
        return true;
      }
    }

    return false;
  }

  private updateMovementState(delta: number): void {
    const wasGrounded = this.grounded;
    this.grounded = this.hasGroundContact();

    this.body.linearDamping = getLinearDamping(this.grounded);
    this.body.angularDamping = getAngularDamping(this.grounded);

    if (this.grounded && !wasGrounded) {
      this.body.angularVelocity.z = applyLandingSpinDamping(this.body.angularVelocity.z);
    } else {
      this.body.angularVelocity.z = clampAngularSpeed(
        this.body.angularVelocity.z,
        getMaxAngularSpeed(this.grounded)
      );
    }

    if (this.kickCooldownTimer > 0) {
      this.kickCooldownTimer = Math.max(0, this.kickCooldownTimer - delta);
    }

    if (this.kickBufferTimer > 0) {
      this.kickBufferTimer = Math.max(0, this.kickBufferTimer - delta);
    }
  }

  private detectKickContact(): KickContact | null {
    const bodyAngle = this.getBodyRotationAngle();
    const probeOffsets = [0, -PLAYER_TUNING.kickProbeSpread, PLAYER_TUNING.kickProbeSpread];
    let bestDistance = Number.POSITIVE_INFINITY;
    let hasContact = false;

    for (const angleOffset of probeOffsets) {
      const probe = buildKickProbe(
        { x: this.body.position.x, y: this.body.position.y },
        bodyAngle + angleOffset,
        PLAYER_TUNING.bodyRadius,
        PLAYER_TUNING.kickProbeLength
      );
      const start = new CANNON.Vec3(probe.start.x, probe.start.y, PLAYER_TUNING.fixedZ);
      const end = new CANNON.Vec3(probe.end.x, probe.end.y, PLAYER_TUNING.fixedZ);

      const result = new CANNON.RaycastResult();
      this.physicsWorld.world.raycastClosest(start, end, {}, result);

      if (isExternalKickHit(result, this.body) && result.distance >= 0 && result.distance < bestDistance) {
        bestDistance = result.distance;
        hasContact = true;
      }
    }

    if (!hasContact) {
      return null;
    }

    return {
      impulseDirection: getTunedKickImpulseDirection(bodyAngle),
      impulsePoint: getKickImpulsePoint(
        { x: this.body.position.x, y: this.body.position.y },
        bodyAngle,
        PLAYER_TUNING.bodyRadius
      ),
    };
  }

  private kick(): void {
    if (this.kickCooldownTimer > 0) {
      return;
    }

    const contact = this.detectKickContact();

    if (!contact) {
      return;
    }

    const impulse = new CANNON.Vec3(
      contact.impulseDirection.x * PLAYER_TUNING.kickForce,
      contact.impulseDirection.y * PLAYER_TUNING.kickForce,
      0
    );

    this.body.angularVelocity.z = clampAngularSpeed(
      this.body.angularVelocity.z * 0.75,
      PLAYER_TUNING.maxAirAngularSpeed
    );
    this.body.wakeUp();
    this.body.applyImpulse(
      impulse,
      new CANNON.Vec3(contact.impulsePoint.x, contact.impulsePoint.y, PLAYER_TUNING.fixedZ)
    );

    this.kickCooldownTimer = PLAYER_TUNING.kickCooldown;
    this.kickBufferTimer = 0;
    this.legExtended = true;
    this.legAnimationTime = 0;
  }

  private updateLegAnimation(delta: number): void {
    if (this.legExtended) {
      this.legAnimationTime += delta;
      if (this.legAnimationTime >= PLAYER_TUNING.kickAnimationDuration) {
        this.legExtended = false;
      }
    }

    const pose = this.legExtended
      ? getKickAnimationPose(this.legAnimationTime)
      : getKickAnimationPose(Number.POSITIVE_INFINITY);

    this.torsoGroup.rotation.z = pose.torsoRotation;
    this.torsoGroup.scale.set(pose.torsoScaleX, pose.torsoScaleY, 1);

    this.headGroup.position.set(0.04, 0.72 + pose.headOffsetY, 0.02);
    this.earLeft.rotation.z = this.EAR_LEFT_BASE_ROTATION + pose.earSwing;
    this.earRight.rotation.z = this.EAR_RIGHT_BASE_ROTATION + pose.earSwing * 0.8;

    this.supportLegRoot.position.set(-0.16, -0.74 + pose.supportLegOffsetY, -0.05);
    this.supportLegRoot.rotation.z = pose.supportLegRotation;

    this.kickLegRoot.position.set(0.18 + pose.kickLegOffsetX, -0.7 + pose.kickLegOffsetY, 0.05);
    this.kickLegRoot.rotation.z = pose.kickLegRotation;
  }

  applyInput(input: PlayerInput, delta: number): void {
    this.updateMovementState(delta);

    let moveX = 0;
    if (input.left) moveX = -1;
    if (input.right) moveX = 1;

    if (moveX !== 0) {
      if (this.grounded) {
        this.body.applyTorque(new CANNON.Vec3(0, 0, -moveX * PLAYER_TUNING.groundTorque));
      }
      this.body.applyForce(
        new CANNON.Vec3(
          moveX * getHorizontalMoveForce(this.grounded),
          0,
          0
        )
      );
    }

    if (input.jump) {
      this.kickBufferTimer = PLAYER_TUNING.kickBufferTime;
    }

    if (this.kickBufferTimer > 0) {
      this.kick();
    }
  }

  syncVisual(delta: number): void {
    this.updateLegAnimation(delta);

    this.body.position.z = PLAYER_TUNING.fixedZ;
    this.body.velocity.z = 0;

    this.mesh.position.set(this.body.position.x, this.body.position.y, PLAYER_TUNING.fixedZ);
    this.mesh.quaternion.set(0, 0, this.body.quaternion.z, this.body.quaternion.w);
  }

  resetTo(x: number, y: number): void {
    this.body.position.set(x, y, PLAYER_TUNING.fixedZ);
    this.body.velocity.set(0, 0, 0);
    this.body.angularVelocity.set(0, 0, 0);
    this.body.force.set(0, 0, 0);
    this.body.torque.set(0, 0, 0);
    this.body.quaternion.set(0, 0, 0, 1);
    this.body.linearDamping = PLAYER_TUNING.airLinearDamping;
    this.body.angularDamping = PLAYER_TUNING.airAngularDamping;
    this.kickCooldownTimer = 0;
    this.kickBufferTimer = 0;
    this.legExtended = false;
    this.legAnimationTime = 0;
    this.grounded = false;
    this.body.wakeUp();

    this.mesh.position.set(x, y, PLAYER_TUNING.fixedZ);
    this.mesh.quaternion.set(0, 0, 0, 1);
    this.updateLegAnimation(0);
  }
}
