import * as CANNON from 'cannon-es';

export class PhysicsWorld {
  world: CANNON.World;
  playerMaterial: CANNON.Material;
  groundMaterial: CANNON.Material;

  constructor() {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -25, 0);
    this.world.broadphase = new CANNON.SAPBroadphase(this.world);

    this.playerMaterial = new CANNON.Material('player');
    this.groundMaterial = new CANNON.Material('ground');

    const playerGroundContact = new CANNON.ContactMaterial(
      this.playerMaterial,
      this.groundMaterial,
      {
        friction: 0.9,
        restitution: 0,
        contactEquationRelaxation: 4,
        frictionEquationRelaxation: 4
      }
    );

    this.world.addContactMaterial(playerGroundContact);
  }

  update(delta: number): void {
    // 使用固定时间步长
    this.world.step(1 / 60, delta, 3);
  }
}
