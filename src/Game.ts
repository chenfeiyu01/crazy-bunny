import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { PhysicsWorld } from './physics/PhysicsWorld';
import { Player } from './entities/Player';
import { Ground } from './entities/Ground';
import { Carrot } from './entities/Carrot';
import { ExitPortal } from './entities/ExitPortal';
import { MultiInputController } from './controls/MultiInputController';
import { CameraController } from './camera/CameraController';
import { LEVELS } from './levels/levelData';
import { hasReachedExit } from './levels/levelGoals';
import { getLevelClearOutcome, normalizeLevelIndex } from './levels/levelProgression';
import { LevelDefinition, LevelPlatformDefinition, LevelCarrotDefinition } from './levels/types';
import { createGamePhase, transitionGamePhase, type GamePhase } from './game/gameState';
import { formatCarrotSummary, getClearPresentation, getFailMessage } from './game/feedback';
import { getGrabPair } from './game/grabRules';
import { getGrabAnchorTarget } from './game/grabAnchor';
import { getCoopSpawnPositions } from './game/coopSpawn';
import { PLAYER_TUNING } from './entities/playerTuning';

export class Game {
  private scene: THREE.Scene;
  private camera: THREE.OrthographicCamera;
  private renderer: THREE.WebGLRenderer;
  private cameraController: CameraController;
  private physics: PhysicsWorld;
  private players: Player[] = [];
  private grabConstraint: CANNON.DistanceConstraint | null = null;
  private anchorConstraints: Array<CANNON.PointToPointConstraint | null> = [null, null];
  private grounds: Ground[] = [];
  private carrots: Carrot[] = [];
  private exitPortal: ExitPortal | null = null;
  private input: MultiInputController;
  private clock: THREE.Clock;
  private levels: LevelDefinition[] = LEVELS;
  private currentLevelIndex: number = 0;
  private carrotCount: number = 0;
  private totalCarrots: number = 0;
  private gameTime: number = 0;
  private phase: GamePhase = createGamePhase();
  private pendingNextLevelIndex: number | null = null;
  private aspect: number = 1;
  private readonly carrotCounterEl = document.getElementById('carrot-counter') as HTMLElement;
  private readonly timerEl = document.getElementById('timer') as HTMLElement;
  private readonly levelIndicatorEl = document.getElementById('level-indicator') as HTMLElement;
  private readonly levelNameEl = document.getElementById('level-name') as HTMLElement;
  private readonly winScreenEl = document.getElementById('win-screen') as HTMLElement;
  private readonly winTitleEl = document.getElementById('win-title') as HTMLElement;
  private readonly winMessageEl = document.getElementById('win-message') as HTMLElement;
  private readonly winTimeEl = document.getElementById('win-time') as HTMLElement;
  private readonly winActionEl = document.getElementById('win-action') as HTMLButtonElement;
  private readonly loseScreenEl = document.getElementById('lose-screen') as HTMLElement;
  private readonly loseMessageEl = document.getElementById('lose-message') as HTMLElement;
  private readonly loseActionEl = document.getElementById('lose-action') as HTMLButtonElement;

  constructor(container: HTMLElement) {
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();

    this.aspect = window.innerWidth / window.innerHeight;
    const frustumSize = 15;
    this.camera = new THREE.OrthographicCamera(
      (-frustumSize * this.aspect) / 2,
      (frustumSize * this.aspect) / 2,
      frustumSize / 2,
      -frustumSize / 2,
      0.1,
      100
    );
    this.camera.position.set(0, 0, 20);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    this.cameraController = new CameraController(this.camera);
    this.cameraController.setAspect(this.aspect);
    this.physics = new PhysicsWorld();
    this.input = new MultiInputController();

    this.setupLighting();
    this.setupBackground();

    // Create two players with different colors
    this.players = [
      new Player(this.scene, this.physics, 0),
      new Player(this.scene, this.physics, 1),
    ];
    this.players.forEach((player) => this.scene.add(player.mesh));

    this.bindUi();
    this.loadLevel(0);

    window.addEventListener('resize', this.onResize.bind(this));
    window.addEventListener('keydown', this.handleGlobalKeydown.bind(this));
  }

  private bindUi(): void {
    this.winActionEl.addEventListener('click', () => {
      if (this.pendingNextLevelIndex !== null) {
        this.loadLevel(this.pendingNextLevelIndex);
        return;
      }

      this.loadLevel(0);
    });

    this.loseActionEl.addEventListener('click', () => {
      this.restartCurrentLevel();
    });
  }

  private handleGlobalKeydown(event: KeyboardEvent): void {
    if (event.key.toLowerCase() === 'r') {
      this.restartCurrentLevel();
      event.preventDefault();
      return;
    }

    // Use Space for advancing screens (since Enter is now P2's kick)
    if (event.code === 'Space' && this.pendingNextLevelIndex !== null) {
      this.loadLevel(this.pendingNextLevelIndex);
      event.preventDefault();
      return;
    }

    if (
      event.code === 'Space' &&
      this.phase === 'cleared' &&
      this.pendingNextLevelIndex === null &&
      this.winScreenEl.style.display === 'flex'
    ) {
      this.loadLevel(0);
      event.preventDefault();
    }
  }

  private setupLighting(): void {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.64);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.82);
    directionalLight.position.set(5, 10, 10);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    this.scene.add(directionalLight);
  }

  private setupBackground(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 2;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      return;
    }

    const gradient = ctx.createLinearGradient(0, 0, 0, 512);
    gradient.addColorStop(0, '#a9ddf5');
    gradient.addColorStop(0.55, '#bfe3d0');
    gradient.addColorStop(1, '#a8d27e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 2, 512);

    this.scene.background = new THREE.CanvasTexture(canvas);
  }

  private loadLevel(index: number): void {
    this.clearOverlays();
    this.clearLevel();
    this.input.reset();

    this.currentLevelIndex = normalizeLevelIndex(index, this.levels.length);
    const level = this.levels[this.currentLevelIndex];

    this.spawnLevel(level);

    // Reset both players at the spawn point with a small offset between them
    const spawnPositions = getCoopSpawnPositions(level.spawn, PLAYER_TUNING.bodyRadius);
    this.players.forEach((player, i) => {
      player.resetTo(spawnPositions[i].x, spawnPositions[i].y);
    });

    this.cameraController.reset(level.spawn.x, level.spawn.y);

    this.carrotCount = 0;
    this.totalCarrots = this.carrots.length;
    this.gameTime = 0;
    this.phase = transitionGamePhase(this.phase, 'load-level');
    this.pendingNextLevelIndex = null;
    this.updateHUD();
    this.clock.getDelta();
  }

  private spawnLevel(level: LevelDefinition): void {
    level.platforms.forEach((platform) => this.createPlatform(platform));
    level.carrots.forEach((carrot) => this.createCarrot(carrot));
    this.exitPortal = new ExitPortal(this.scene, level.exit.x, level.exit.y, level.exit.z);
  }

  private clearLevel(): void {
    this.clearGrabConstraint();
    this.grounds.forEach((ground) => ground.destroy());
    this.grounds = [];

    this.carrots.forEach((carrot) => carrot.destroy());
    this.carrots = [];

    this.exitPortal?.destroy();
    this.exitPortal = null;
  }

  private createPlatform(platform: LevelPlatformDefinition): void {
    const ground = new Ground(
      this.scene,
      this.physics,
      platform.x,
      platform.y,
      platform.z,
      platform.width,
      platform.height,
      platform.depth,
      platform.color,
      platform.rotationZ ?? 0
    );
    this.grounds.push(ground);
  }

  private createCarrot(carrot: LevelCarrotDefinition): void {
    this.carrots.push(new Carrot(this.scene, this.physics, carrot.x, carrot.y, carrot.z));
  }

  private restartCurrentLevel(): void {
    this.phase = transitionGamePhase(this.phase, 'begin-respawn');
    this.loadLevel(this.currentLevelIndex);
  }

  private clearGrabConstraint(): void {
    if (!this.grabConstraint) {
      return;
    }

    this.physics.world.removeConstraint(this.grabConstraint);
    this.grabConstraint = null;
  }

  private clearAnchorConstraint(index: number): void {
    const constraint = this.anchorConstraints[index];
    if (!constraint) {
      return;
    }

    this.physics.world.removeConstraint(constraint);
    this.anchorConstraints[index] = null;
  }

  private clearAllAnchorConstraints(): void {
    this.anchorConstraints.forEach((_, index) => this.clearAnchorConstraint(index));
  }

  private getGroundGrabTarget(player: Player, grabHeld: boolean): { bodyIndex: number; x: number; y: number } | null {
    const directions = [
      new CANNON.Vec3(0, -1, 0),
      new CANNON.Vec3(-0.8, -0.4, 0),
      new CANNON.Vec3(0.8, -0.4, 0),
      new CANNON.Vec3(-1, 0, 0),
      new CANNON.Vec3(1, 0, 0),
    ];
    const candidates: Array<{ bodyIndex: number; x: number; y: number }> = [];

    for (const direction of directions) {
      const length = Math.hypot(direction.x, direction.y) || 1;
      const normalX = direction.x / length;
      const normalY = direction.y / length;
      const start = new CANNON.Vec3(player.body.position.x, player.body.position.y, 0);
      const end = new CANNON.Vec3(
        start.x + normalX * 1.8,
        start.y + normalY * 1.8,
        0
      );
      const result = new CANNON.RaycastResult();

      this.physics.world.raycastClosest(start, end, {}, result);

      if (!result.hasHit || !result.body) {
        continue;
      }

      const bodyIndex = this.grounds.findIndex((ground) => ground.body === result.body);
      if (bodyIndex === -1) {
        continue;
      }

      candidates.push({
        bodyIndex,
        x: result.hitPointWorld.x,
        y: result.hitPointWorld.y,
      });
    }

    return getGrabAnchorTarget(
      { x: player.body.position.x, y: player.body.position.y },
      grabHeld,
      candidates
    );
  }

  private syncAnchorConstraint(index: number, target: { bodyIndex: number; x: number; y: number } | null): void {
    if (!target) {
      this.clearAnchorConstraint(index);
      return;
    }

    if (this.anchorConstraints[index]) {
      return;
    }

    const player = this.players[index];
    const ground = this.grounds[target.bodyIndex];
    const playerPivot = new CANNON.Vec3(0, 0, 0);
    const worldAnchor = new CANNON.Vec3(target.x, target.y, 0);
    const groundPivot = new CANNON.Vec3();
    ground.body.pointToLocalFrame(worldAnchor, groundPivot);

    this.anchorConstraints[index] = new CANNON.PointToPointConstraint(
      player.body,
      playerPivot,
      ground.body,
      groundPivot,
      1e6
    );
    this.physics.world.addConstraint(this.anchorConstraints[index]!);
  }

  private updateGrabConstraint(): void {
    const inputs = [this.input.player1, this.input.player2];
    const pair = getGrabPair(
      this.players.map((player, index) => ({
        position: { x: player.body.position.x, y: player.body.position.y },
        grabHeld: inputs[index].grabHeld,
      }))
    );

    if (pair) {
      this.clearAllAnchorConstraints();
      if (!this.grabConstraint) {
        this.grabConstraint = new CANNON.DistanceConstraint(
          this.players[pair.a].body,
          this.players[pair.b].body,
          1.05,
          1e6
        );
        this.physics.world.addConstraint(this.grabConstraint);
      }
      return;
    }

    this.clearGrabConstraint();
    this.players.forEach((player, index) => {
      this.syncAnchorConstraint(index, this.getGroundGrabTarget(player, inputs[index].grabHeld));
    });
  }

  private onResize(): void {
    this.aspect = window.innerWidth / window.innerHeight;
    this.cameraController.setAspect(this.aspect);
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  private checkCarrotCollision(): void {
    const playerRadius = 0.8;

    for (let index = this.carrots.length - 1; index >= 0; index--) {
      const carrot = this.carrots[index];

      // Check if any player collects the carrot
      for (const player of this.players) {
        const playerPos = player.body.position;
        const dx = playerPos.x - carrot.position.x;
        const dy = playerPos.y - carrot.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < playerRadius + 0.5) {
          carrot.collect();
          this.carrots.splice(index, 1);
          this.carrotCount++;
          this.updateHUD();
          break; // Carrot is collected, no need to check other players
        }
      }
    }
  }

  private checkExitCollision(): void {
    if (!this.exitPortal || this.phase !== 'playing') {
      return;
    }

    // Both players must reach the exit for co-op clear
    const allPlayersAtExit = this.players.every((player) => {
      const playerPos = player.body.position;
      return hasReachedExit(
        { x: playerPos.x, y: playerPos.y },
        { x: this.exitPortal!.position.x, y: this.exitPortal!.position.y },
        this.exitPortal!.radius
      );
    });

    if (allPlayersAtExit) {
      this.handleLevelClear();
    }
  }

  private checkFall(): void {
    const level = this.levels[this.currentLevelIndex];

    // If either player falls, the whole team fails
    const anyPlayerFell = this.players.some(
      (player) => player.mesh.position.y < level.fallLimit
    );

    if (anyPlayerFell && this.phase === 'playing') {
      this.lose();
    }
  }

  private updateHUD(): void {
    const level = this.levels[this.currentLevelIndex];
    this.carrotCounterEl.textContent = formatCarrotSummary(this.carrotCount, this.totalCarrots);
    this.timerEl.textContent = this.gameTime.toFixed(1);
    this.levelIndicatorEl.textContent = `第 ${this.currentLevelIndex + 1} / ${this.levels.length} 关`;
    this.levelNameEl.textContent = level.name;
  }

  private handleLevelClear(): void {
    this.phase = transitionGamePhase(this.phase, 'clear');
    this.winTimeEl.textContent = this.gameTime.toFixed(1);

    const outcome = getLevelClearOutcome(this.currentLevelIndex, this.levels.length);
    const presentation = getClearPresentation(
      outcome.type === 'complete',
      this.carrotCount,
      this.totalCarrots
    );
    if (outcome.type === 'next') {
      this.pendingNextLevelIndex = outcome.nextLevelIndex;
    } else {
      this.pendingNextLevelIndex = null;
    }

    this.winTitleEl.textContent = presentation.title;
    this.winMessageEl.textContent = presentation.message;
    this.winActionEl.textContent = presentation.actionLabel;
    this.winScreenEl.style.display = 'flex';
  }

  private lose(): void {
    this.phase = transitionGamePhase(this.phase, 'fail');
    this.pendingNextLevelIndex = null;
    this.loseMessageEl.textContent = getFailMessage(this.currentLevelIndex);
    this.loseScreenEl.style.display = 'flex';
  }

  private clearOverlays(): void {
    this.winScreenEl.style.display = 'none';
    this.loseScreenEl.style.display = 'none';
  }

  private update(): void {
    const delta = Math.min(this.clock.getDelta(), 0.05);

    if (this.phase !== 'playing') {
      return;
    }

    this.gameTime += delta;

    // Apply input to both players
    const inputs = [this.input.player1, this.input.player2];
    this.players.forEach((player, i) => {
      player.applyInput(inputs[i], delta);
    });

    this.updateGrabConstraint();
    this.physics.update(delta);

    // Sync visuals for both players
    this.players.forEach((player) => player.syncVisual(delta));

    this.carrots.forEach((carrot) => carrot.update(delta));
    this.exitPortal?.update(delta);

    // Update camera with all player snapshots
    const playerSnapshots = this.players.map((player) => ({
      position: { x: player.body.position.x, y: player.body.position.y },
      velocity: { x: player.body.velocity.x, y: player.body.velocity.y },
    }));
    this.cameraController.update(playerSnapshots, delta);

    this.checkCarrotCollision();
    this.checkExitCollision();
    this.checkFall();
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
