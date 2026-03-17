export class InputController {
  forward: boolean = false;
  backward: boolean = false;
  left: boolean = false;
  right: boolean = false;
  private jumpPressed: boolean = false;  // 当前帧是否按下
  private jumpConsumed: boolean = false; // 是否已被消费
  private spaceHeld: boolean = false;    // 空格是否被按住

  // 获取跳跃输入（只能获取一次，松开后重置）
  get jump(): boolean {
    if (this.jumpPressed && !this.jumpConsumed) {
      this.jumpPressed = false;
      this.jumpConsumed = true;
      return true;
    }
    return false;
  }

  constructor() {
    this.setupKeyboardControls();
  }

  private setupKeyboardControls(): void {
    window.addEventListener('keydown', (event) => {
      if (event.code === 'Space') {
        // 只有从"未按住"变成"按住"时才触发
        if (!this.spaceHeld) {
          this.jumpPressed = true;
          this.jumpConsumed = false;
          this.spaceHeld = true;
        }
        event.preventDefault();
      } else {
        this.handleKey(event.code, true);
      }
    });

    window.addEventListener('keyup', (event) => {
      if (event.code === 'Space') {
        this.spaceHeld = false;
      } else {
        this.handleKey(event.code, false);
      }
    });
  }

  private handleKey(code: string, pressed: boolean): void {
    switch (code) {
      case 'KeyW':
      case 'ArrowUp':
        this.forward = pressed;
        break;
      case 'KeyS':
      case 'ArrowDown':
        this.backward = pressed;
        break;
      case 'KeyA':
      case 'ArrowLeft':
        this.left = pressed;
        break;
      case 'KeyD':
      case 'ArrowRight':
        this.right = pressed;
        break;
    }
  }
}
