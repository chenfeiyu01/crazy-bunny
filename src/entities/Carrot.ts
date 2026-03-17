import * as THREE from 'three';
import { PhysicsWorld } from '../physics/PhysicsWorld';

export class Carrot {
  mesh: THREE.Group;
  position: THREE.Vector3;
  private rotationSpeed: number = 2;
  private bobSpeed: number = 3;
  private bobAmount: number = 0.2;
  private time: number = Math.random() * Math.PI * 2;

  constructor(scene: THREE.Scene, _physics: PhysicsWorld, x: number, y: number, z: number) {
    this.position = new THREE.Vector3(x, y, z);
    this.mesh = new THREE.Group();

    // 胡萝卜身体 - 圆锥形
    const bodyGeometry = new THREE.ConeGeometry(0.2, 0.8, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6600,
      roughness: 0.6
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI;
    body.position.y = 0;
    this.mesh.add(body);

    // 胡萝卜叶子
    const leafGeometry = new THREE.ConeGeometry(0.08, 0.3, 4);
    const leafMaterial = new THREE.MeshStandardMaterial({
      color: 0x228B22,
      roughness: 0.8
    });

    for (let i = 0; i < 3; i++) {
      const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
      leaf.position.set(
        Math.sin(i * (Math.PI * 2 / 3)) * 0.1,
        0.5,
        Math.cos(i * (Math.PI * 2 / 3)) * 0.1
      );
      leaf.rotation.z = (Math.random() - 0.5) * 0.5;
      this.mesh.add(leaf);
    }

    this.mesh.position.set(x, y, z);
    this.mesh.castShadow = true;

    scene.add(this.mesh);
  }

  update(delta: number): void {
    this.time += delta;

    // 旋转动画
    this.mesh.rotation.y += this.rotationSpeed * delta;

    // 上下浮动
    this.mesh.position.y = this.position.y + Math.sin(this.time * this.bobSpeed) * this.bobAmount;
  }

  collect(): void {
    // 移除胡萝卜
    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
  }
}
