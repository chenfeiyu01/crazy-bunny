import * as THREE from 'three';

export class ExitPortal {
  mesh: THREE.Group;
  position: THREE.Vector3;
  radius: number;
  private swirl: THREE.Mesh;
  private time: number = Math.random() * Math.PI * 2;

  constructor(scene: THREE.Scene, x: number, y: number, z: number, radius: number = 1.1) {
    this.position = new THREE.Vector3(x, y, z);
    this.radius = radius;
    this.mesh = new THREE.Group();

    const outerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.72, 0.16, 18, 42),
      new THREE.MeshStandardMaterial({
        color: 0xf6c94c,
        emissive: 0x7a5800,
        roughness: 0.25,
        metalness: 0.2,
      })
    );
    outerRing.castShadow = true;
    this.mesh.add(outerRing);

    const innerRing = new THREE.Mesh(
      new THREE.TorusGeometry(0.46, 0.08, 18, 32),
      new THREE.MeshStandardMaterial({
        color: 0x73ffd6,
        emissive: 0x148569,
        roughness: 0.2,
        metalness: 0.15,
      })
    );
    innerRing.rotation.z = Math.PI / 6;
    this.mesh.add(innerRing);

    this.swirl = new THREE.Mesh(
      new THREE.CircleGeometry(0.48, 32),
      new THREE.MeshStandardMaterial({
        color: 0xdafdf1,
        emissive: 0x4bbf9a,
        transparent: true,
        opacity: 0.72,
        roughness: 0.1,
      })
    );
    this.swirl.position.z = -0.06;
    this.mesh.add(this.swirl);

    this.mesh.position.copy(this.position);
    scene.add(this.mesh);
  }

  update(delta: number): void {
    this.time += delta;
    this.mesh.rotation.z += delta * 1.6;
    this.swirl.scale.setScalar(0.9 + Math.sin(this.time * 3.2) * 0.08);
    this.mesh.position.y = this.position.y + Math.sin(this.time * 2.4) * 0.08;
  }

  destroy(): void {
    if (this.mesh.parent) {
      this.mesh.parent.remove(this.mesh);
    }
  }
}
