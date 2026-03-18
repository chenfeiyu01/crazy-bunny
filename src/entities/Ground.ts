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
    rotationZ: number = 0
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
    this.mesh.rotation.z = rotationZ;
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
    if (rotationZ !== 0) {
      const quaternion = new CANNON.Quaternion();
      quaternion.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), rotationZ);
      this.body.quaternion.copy(quaternion);
    }

    physics.world.addBody(this.body);
  }

  destroy(): void {
    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }

    if (this.body.world) {
      this.body.world.removeBody(this.body);
    }
  }
}
