import { describe, expect, it } from 'vitest';
import * as THREE from 'three';
import { Player } from '../Player';
import { InputController } from '../../controls/InputController';
import { Ground } from '../Ground';
import { PhysicsWorld } from '../../physics/PhysicsWorld';

describe('Player movement control', () => {
  it('does not add rolling torque while airborne', () => {
    const scene = new THREE.Scene();
    const physics = new PhysicsWorld();
    const player = new Player(scene, physics);

    player.body.position.set(0, 8, 0);
    player.body.torque.set(0, 0, 0);
    player.body.force.set(0, 0, 0);

    player.applyInput(
      {
        left: false,
        right: true,
        jump: false,
      } as unknown as InputController,
      1 / 60
    );

    expect(player.body.torque.z).toBe(0);
  });

  it('still adds rolling torque while touching the ground', () => {
    const scene = new THREE.Scene();
    const physics = new PhysicsWorld();
    const player = new Player(scene, physics);

    new Ground(scene, physics, 0, -2, 0, 10, 2, 3, 0x4caf50);
    player.body.position.set(0, -0.2, 0);
    player.body.torque.set(0, 0, 0);

    player.applyInput(
      {
        left: false,
        right: true,
        jump: false,
      } as unknown as InputController,
      1 / 60
    );

    expect(player.body.torque.z).toBeLessThan(0);
  });
});
