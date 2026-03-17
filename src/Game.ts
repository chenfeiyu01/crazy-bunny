import * as THREE from 'three';
import { PhysicsWorld } from './physics/PhysicsWorld';
import { Player } from './entities/Player';
import { Ground } from './entities/Ground';
import { Carrot } from './entities/Carrot';
import { InputController } from './controls/InputController';

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private physics: PhysicsWorld;
  private player: Player;
  private grounds: Ground[] = [];
  private carrots: Carrot[] = [];
  private input: InputController;
  private clock: THREE.Clock;
  private carrotCount: number = 0;
  private totalCarrots: number = 0;
  private gameTime: number = 0;
  private isGameOver: boolean = false;

  constructor(_container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    // 创建正交相机（2D 横版）
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 15;
    this.camera = new THREE.OrthographicCamera(
      -frustumSize * aspect / 2,
      frustumSize * aspect / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      100
    );
    this.camera.position.set(0, 0, 20);
    this.camera.lookAt(0, 0, 0);

    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    _container.appendChild(this.renderer.domElement);

    // 创建物理世界
    this.physics = new PhysicsWorld();

    // 创建输入控制器
    this.input = new InputController();

    // 初始化场景
    this.setupLighting();
    this.setupBackground();
    this.createLevel();
    this.totalCarrots = this.carrots.length;

    // 创建玩家
    this.player = new Player(this.scene, this.physics);
    this.scene.add(this.player.mesh);
    this.updateHUD();

    // 窗口大小调整
    window.addEventListener('resize', this.onResize.bind(this));

    // 重新开始按键
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'r') {
        location.reload();
      }
    });
  }

  private setupLighting(): void {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    // 主方向光（太阳）
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 10, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
  }

  private setupBackground(): void {
    // 渐变背景
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 512;
    const ctx = canvas.getContext('2d')!;
    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#87CEEB');   // 天蓝色
    gradient.addColorStop(0.5, '#98D8C8'); // 薄荷绿
    gradient.addColorStop(1, '#7CB342');   // 草地绿
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2, 512);

    const texture = new THREE.CanvasTexture(canvas);
    this.scene.background = texture;
  }

  private createLevel(): void {
    // 开场教学：长跑道 + 第一次轻松蹬腿
    this.createPlatform(0, -2, 0, 14, 2, 3, 0x4CAF50);
    this.createCarrot(4, 1.6, 0);

    // 第一个低风险跳跃
    this.createPlatform(12, -1.2, 0, 4.5, 1, 3, 0x2196F3);
    this.createCarrot(12, 1.3, 0);

    // 第二段：需要快速恢复控制后再来一脚
    this.createPlatform(18.5, -0.1, 0, 4.2, 1, 3, 0xFF9800);
    this.createCarrot(18.5, 2.4, 0);
    this.createPlatform(25.2, 1.1, 0, 4.2, 1, 3, 0xFFB74D);
    this.createCarrot(25.2, 3.7, 0);

    // 中段缓冲平台：给一次稳定落地和节奏恢复
    this.createPlatform(32.8, -0.6, 0, 5.4, 1, 3, 0x8BC34A);
    this.createCarrot(32.8, 2.1, 0);

    // 终段组合：短平台连跳后落到终点
    this.createPlatform(40.2, 0.2, 0, 3.8, 1, 3, 0xE91E63);
    this.createPlatform(46.2, 1.7, 0, 3.5, 1, 3, 0x00BCD4);
    this.createCarrot(46.2, 4.1, 0);

    // 终点平台：宽一点，保证最后收束体验
    this.createPlatform(53.5, 1.1, 0, 10.5, 1.6, 3, 0xFFD54F);
    this.createCarrot(53.5, 4.1, 0);
  }

  private createPlatform(x: number, y: number, z: number, w: number, h: number, d: number, color: number): void {
    const ground = new Ground(this.scene, this.physics, x, y, z, w, h, d, color);
    this.grounds.push(ground);
  }

  private createCarrot(x: number, y: number, z: number): void {
    const carrot = new Carrot(this.scene, this.physics, x, y, z);
    this.carrots.push(carrot);
  }

  private onResize(): void {
    const aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 15;

    this.camera.left = -frustumSize * aspect / 2;
    this.camera.right = frustumSize * aspect / 2;
    this.camera.top = frustumSize / 2;
    this.camera.bottom = -frustumSize / 2;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private updateCamera(): void {
    // 相机水平跟随玩家，Y 轴保持固定范围
    const targetX = this.player.mesh.position.x;
    const targetY = Math.max(this.player.mesh.position.y, 0);

    this.camera.position.x += (targetX - this.camera.position.x) * 0.1;
    this.camera.position.y += (targetY - this.camera.position.y) * 0.05;

    this.camera.lookAt(this.camera.position.x, this.camera.position.y, 0);
  }

  private checkCarrotCollision(): void {
    const playerPos = this.player.body.position;
    const playerRadius = 0.8;

    for (let i = this.carrots.length - 1; i >= 0; i--) {
      const carrot = this.carrots[i];
      const dx = playerPos.x - carrot.position.x;
      const dy = playerPos.y - carrot.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < playerRadius + 0.5) {
        carrot.collect();
        this.carrots.splice(i, 1);
        this.carrotCount++;
        this.updateHUD();

        if (this.carrotCount >= this.totalCarrots) {
          this.win();
        }
      }
    }
  }

  private checkFall(): void {
    if (this.player.mesh.position.y < -18 && !this.isGameOver) {
      this.lose();
    }
  }

  private updateHUD(): void {
    document.getElementById('carrot-counter')!.textContent = `${this.carrotCount} / ${this.totalCarrots}`;
    document.getElementById('timer')!.textContent = this.gameTime.toFixed(1);
  }

  private win(): void {
    this.isGameOver = true;
    document.getElementById('win-time')!.textContent = this.gameTime.toFixed(1);
    document.getElementById('win-screen')!.style.display = 'flex';
  }

  private lose(): void {
    this.isGameOver = true;
    document.getElementById('lose-screen')!.style.display = 'flex';
  }

  private update(): void {
    if (this.isGameOver) return;

    const delta = this.clock.getDelta();
    this.gameTime += delta;

    // 先处理输入，再推进物理，减少蹬腿延迟
    this.player.applyInput(this.input, delta);
    this.physics.update(delta);
    this.player.syncVisual(delta);

    // 更新胡萝卜动画
    this.carrots.forEach(carrot => carrot.update(delta));

    // 更新相机
    this.updateCamera();

    // 检测碰撞
    this.checkCarrotCollision();
    this.checkFall();

    // 更新 HUD
    this.updateHUD();
  }

  private render(): void {
    this.renderer.render(this.scene, this.camera);
  }

  private gameLoop(): void {
    requestAnimationFrame(() => this.gameLoop());
    this.update();
    this.render();
  }

  start(): void {
    this.gameLoop();
  }
}
