import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsWorld } from '../physics/PhysicsWorld';

export class Ground {
  mesh: THREE.Mesh;
  body: CANNON.Body;

  constructor(
    scene: THREE.Scene,
    physics: PhysicsWorld,
    x: number,
    y: number,
    z: number,
    width: number,
    height: number,
    depth: number,
    color: number,
    rotationX: number = 0
  ) {
    // 创建视觉模型
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({
      color: color,
      roughness: 0.7,
      metalness: 0.1
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.set(x, y, z);
    this.mesh.rotation.x = rotationX;
    this.mesh.receiveShadow = true;
    this.mesh.castShadow = true;
    scene.add(this.mesh);

    // 创建物理体
    const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
    this.body = new CANNON.Body({
      mass: 0, // 静态物体
      shape: shape,
      position: new CANNON.Vec3(x, y, z),
      material: physics.groundMaterial
    });

    // 应用旋转
    if (rotationX !== 0) {
      const quaternion = new CANNON.Quaternion();
      quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), rotationX);
      this.body.quaternion.copy(quaternion);
    }

    physics.world.addBody(this.body);
  }
}
