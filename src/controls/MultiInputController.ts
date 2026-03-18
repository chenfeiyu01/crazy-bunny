/**
 * Input interface for a single player
 */
export interface PlayerInput {
  left: boolean;
  right: boolean;
  jump: boolean;
  grabHeld: boolean;
}

/**
 * Single player input state - implements PlayerInput
 */
class PlayerInputState implements PlayerInput {
  left: boolean = false;
  right: boolean = false;
  grabHeld: boolean = false;
  private jumpPressed: boolean = false;
  private jumpConsumed: boolean = false;
  private jumpHeld: boolean = false;

  get jump(): boolean {
    if (this.jumpPressed && !this.jumpConsumed) {
      this.jumpPressed = false;
      this.jumpConsumed = true;
      return true;
    }
    return false;
  }

  pressJump(): void {
    if (!this.jumpHeld) {
      this.jumpPressed = true;
      this.jumpConsumed = false;
      this.jumpHeld = true;
    }
  }

  releaseJump(): void {
    this.jumpHeld = false;
  }

  pressGrab(): void {
    this.grabHeld = true;
  }

  releaseGrab(): void {
    this.grabHeld = false;
  }

  reset(): void {
    this.left = false;
    this.right = false;
    this.grabHeld = false;
    this.jumpPressed = false;
    this.jumpConsumed = false;
    this.jumpHeld = false;
  }
}

/**
 * Manages input for two players in local co-op.
 * Player 1: A/D + Space
 * Player 2: Arrow Left/Right + Enter or Right Shift
 */
export class MultiInputController {
  readonly player1: PlayerInput;
  readonly player2: PlayerInput;
  private p1State: PlayerInputState;
  private p2State: PlayerInputState;

  constructor() {
    this.p1State = new PlayerInputState();
    this.p2State = new PlayerInputState();
    this.player1 = this.p1State;
    this.player2 = this.p2State;
    this.setupKeyboardControls();
  }

  reset(): void {
    this.p1State.reset();
    this.p2State.reset();
  }

  private setupKeyboardControls(): void {
    window.addEventListener('keydown', (event) => {
      // Player 1 controls: A/D + Space
      switch (event.code) {
        case 'KeyA':
          this.p1State.left = true;
          event.preventDefault();
          break;
        case 'KeyD':
          this.p1State.right = true;
          event.preventDefault();
          break;
        case 'Space':
          this.p1State.pressJump();
          event.preventDefault();
          break;
        case 'KeyW':
          this.p1State.pressGrab();
          event.preventDefault();
          break;
      }

      // Player 2 controls: Arrow Left/Right + Enter/Right Shift
      switch (event.code) {
        case 'ArrowLeft':
          this.p2State.left = true;
          event.preventDefault();
          break;
        case 'ArrowRight':
          this.p2State.right = true;
          event.preventDefault();
          break;
        case 'Enter':
        case 'ShiftRight':
          this.p2State.pressJump();
          event.preventDefault();
          break;
        case 'ArrowUp':
          this.p2State.pressGrab();
          event.preventDefault();
          break;
      }
    });

    window.addEventListener('keyup', (event) => {
      // Player 1 key release
      switch (event.code) {
        case 'KeyA':
          this.p1State.left = false;
          break;
        case 'KeyD':
          this.p1State.right = false;
          break;
        case 'Space':
          this.p1State.releaseJump();
          break;
        case 'KeyW':
          this.p1State.releaseGrab();
          break;
      }

      // Player 2 key release
      switch (event.code) {
        case 'ArrowLeft':
          this.p2State.left = false;
          break;
        case 'ArrowRight':
          this.p2State.right = false;
          break;
        case 'Enter':
        case 'ShiftRight':
          this.p2State.releaseJump();
          break;
        case 'ArrowUp':
          this.p2State.releaseGrab();
          break;
      }
    });
  }
}
