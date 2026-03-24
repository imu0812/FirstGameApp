import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');

    this.moveSpeed = 220;
    this.maxHealth = 6;
    this.health = this.maxHealth;
    this.invulnerabilityDuration = 750;
    this.lastDamageTime = -this.invulnerabilityDuration;
    this.virtualInput = new Phaser.Math.Vector2(0, 0);
    this.moveDirection = new Phaser.Math.Vector2(0, 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCircle(16);
    this.setCollideWorldBounds(true);

    this.controls = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      altUp: Phaser.Input.Keyboard.KeyCodes.UP,
      altDown: Phaser.Input.Keyboard.KeyCodes.DOWN,
      altLeft: Phaser.Input.Keyboard.KeyCodes.LEFT,
      altRight: Phaser.Input.Keyboard.KeyCodes.RIGHT
    });
  }

  update() {
    let moveX = 0;
    let moveY = 0;

    if (this.controls.left.isDown || this.controls.altLeft.isDown) {
      moveX -= 1;
    }

    if (this.controls.right.isDown || this.controls.altRight.isDown) {
      moveX += 1;
    }

    if (this.controls.up.isDown || this.controls.altUp.isDown) {
      moveY -= 1;
    }

    if (this.controls.down.isDown || this.controls.altDown.isDown) {
      moveY += 1;
    }

    moveX = Phaser.Math.Clamp(moveX + this.virtualInput.x, -1, 1);
    moveY = Phaser.Math.Clamp(moveY + this.virtualInput.y, -1, 1);

    this.moveDirection.set(moveX, moveY);

    if (this.moveDirection.lengthSq() > 1) {
      this.moveDirection.normalize();
    }

    this.setVelocity(this.moveDirection.x * this.moveSpeed, this.moveDirection.y * this.moveSpeed);

    if (this.moveDirection.lengthSq() > 0.0001) {
      this.rotation = this.moveDirection.angle();
    }

    this.updateInvulnerabilityVisual();
  }

  setVirtualInput(x, y) {
    this.virtualInput.set(x, y);
  }

  canTakeDamage(time) {
    return time - this.lastDamageTime >= this.invulnerabilityDuration;
  }

  takeDamage(amount, time) {
    if (!this.canTakeDamage(time)) {
      return false;
    }

    this.health = Math.max(0, this.health - amount);
    this.lastDamageTime = time;
    this.updateInvulnerabilityVisual();
    return true;
  }

  updateInvulnerabilityVisual() {
    if (this.scene.time.now - this.lastDamageTime < this.invulnerabilityDuration) {
      this.setAlpha(0.45);
      return;
    }

    this.setAlpha(1);
  }

  resetState(x, y) {
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.health = this.maxHealth;
    this.lastDamageTime = -this.invulnerabilityDuration;
    this.virtualInput.set(0, 0);
    this.moveDirection.set(0, 0);
    this.setAlpha(1);
  }
}
