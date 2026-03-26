import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');

    this.moveSpeed = 220;
    this.maxHealth = 6;
    this.health = this.maxHealth;
    this.shield = 0;
    this.invulnerabilityDuration = 750;
    this.lastDamageTime = -this.invulnerabilityDuration;
    this.lastDamageReport = null;
    this.virtualInput = new Phaser.Math.Vector2(0, 0);
    this.moveDirection = new Phaser.Math.Vector2(0, 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCircle(13, 3, 3);
    this.setCollideWorldBounds(false);

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

  addShield(amount) {
    this.shield = Math.max(0, this.shield + amount);
  }

  takeDamage(amount, time) {
    if (!this.canTakeDamage(time)) {
      return false;
    }

    this.lastDamageTime = time;

    let remainingDamage = Math.max(0, amount);
    let shieldDamage = 0;
    let healthDamage = 0;
    let shieldBroken = false;

    if (this.shield > 0 && remainingDamage > 0) {
      shieldDamage = Math.min(this.shield, remainingDamage);
      this.shield -= shieldDamage;
      remainingDamage -= shieldDamage;
      shieldBroken = shieldDamage > 0 && this.shield <= 0;
    }

    if (remainingDamage > 0) {
      healthDamage = Math.min(this.health, remainingDamage);
      this.health = Math.max(0, this.health - remainingDamage);
    }

    this.lastDamageReport = {
      shieldDamage,
      healthDamage,
      shieldBroken,
      hadShield: shieldDamage > 0,
      healthRemaining: this.health,
      shieldRemaining: this.shield
    };

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
    this.shield = 0;
    this.lastDamageTime = -this.invulnerabilityDuration;
    this.lastDamageReport = null;
    this.virtualInput.set(0, 0);
    this.moveDirection.set(0, 0);
    this.setAlpha(1);
  }
}

