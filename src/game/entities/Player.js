import Phaser from 'phaser';

export const PLAYER_SPEED = 220;

const PLAYER_TEXTURE_KEYS = {
  north: 'player_north',
  north_east: 'player_north_east',
  east: 'player_east',
  south_east: 'player_south_east',
  south: 'player_south',
  south_west: 'player_south_west',
  west: 'player_west',
  north_west: 'player_north_west'
};

const PLAYER_FACING_ANGLES = {
  north: -Math.PI / 2,
  north_east: -Math.PI / 4,
  east: 0,
  south_east: Math.PI / 4,
  south: Math.PI / 2,
  south_west: (3 * Math.PI) / 4,
  west: Math.PI,
  north_west: (-3 * Math.PI) / 4
};

const PLAYER_WALK_FRAME_COUNT = 8;
const PLAYER_WALK_FRAME_DURATION = 90;

const PLAYER_DISPLAY_SIZE = {
  width: 68,
  height: 68
};

const PLAYER_WALK_TEXTURE_KEYS = Object.fromEntries(
  Object.keys(PLAYER_TEXTURE_KEYS).map((direction) => [
    direction,
    Array.from({ length: PLAYER_WALK_FRAME_COUNT }, (_, index) => `player_walk_${direction}_${index}`)
  ])
);

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, PLAYER_TEXTURE_KEYS.south);

    this.moveSpeed = PLAYER_SPEED;
    this.maxHealth = 6;
    this.health = this.maxHealth;
    this.shield = 0;
    this.invulnerabilityDuration = 750;
    this.lastDamageTime = -this.invulnerabilityDuration;
    this.lastDamageReport = null;
    this.virtualInput = new Phaser.Math.Vector2(0, 0);
    this.moveDirection = new Phaser.Math.Vector2(0, 0);
    this.facingDirection = 'south';
    this.facingAngle = PLAYER_FACING_ANGLES[this.facingDirection];
    this.walkFrameIndex = 0;
    this.walkFrameElapsed = 0;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setOrigin(0.5, 0.72);
    this.setDisplaySize(PLAYER_DISPLAY_SIZE.width, PLAYER_DISPLAY_SIZE.height);
    this.setCollideWorldBounds(false);
    this.syncBodyToFrame();

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

    this.updateFacingDirection(moveX, moveY);
    this.moveDirection.set(moveX, moveY);

    if (this.moveDirection.lengthSq() > 1) {
      this.moveDirection.normalize();
    }

    this.setVelocity(this.moveDirection.x * this.moveSpeed, this.moveDirection.y * this.moveSpeed);
    this.updateMovementTexture(this.scene.game.loop.delta);
    this.updateInvulnerabilityVisual();
  }

  updateFacingDirection(moveX, moveY) {
    if (Math.abs(moveX) < 0.0001 && Math.abs(moveY) < 0.0001) {
      return;
    }

    const horizontalDirection = moveX > 0 ? 'east' : 'west';
    const verticalDirection = moveY > 0 ? 'south' : 'north';
    const hasHorizontal = Math.abs(moveX) > 0.0001;
    const hasVertical = Math.abs(moveY) > 0.0001;

    if (hasHorizontal && hasVertical) {
      this.setFacingDirection(`${verticalDirection}_${horizontalDirection}`);
      return;
    }

    if (hasHorizontal) {
      this.setFacingDirection(horizontalDirection);
      return;
    }

    this.setFacingDirection(verticalDirection);
  }

  setFacingDirection(direction) {
    if (!PLAYER_TEXTURE_KEYS[direction] || this.facingDirection === direction) {
      return;
    }

    this.facingDirection = direction;
    this.facingAngle = PLAYER_FACING_ANGLES[direction];
    this.walkFrameIndex = 0;
    this.walkFrameElapsed = 0;
    this.applyCurrentTexture();
  }

  updateMovementTexture(delta) {
    if (this.moveDirection.lengthSq() <= 0.0001) {
      this.walkFrameIndex = 0;
      this.walkFrameElapsed = 0;
      this.applyCurrentTexture();
      return;
    }

    this.walkFrameElapsed += delta;

    while (this.walkFrameElapsed >= PLAYER_WALK_FRAME_DURATION) {
      this.walkFrameElapsed -= PLAYER_WALK_FRAME_DURATION;
      this.walkFrameIndex = (this.walkFrameIndex + 1) % PLAYER_WALK_FRAME_COUNT;
    }

    this.applyCurrentTexture();
  }

  applyCurrentTexture() {
    const nextTexture = this.moveDirection.lengthSq() > 0.0001
      ? PLAYER_WALK_TEXTURE_KEYS[this.facingDirection][this.walkFrameIndex]
      : PLAYER_TEXTURE_KEYS[this.facingDirection];

    if (this.texture.key !== nextTexture) {
      this.setTexture(nextTexture);
      this.setRotation(0);
      this.syncBodyToFrame();
    }
  }

  syncBodyToFrame() {
    if (!this.body) {
      return;
    }

    const frameWidth = this.width;
    const frameHeight = this.height;
    const bodyWidth = Math.round(frameWidth * 0.32);
    const bodyHeight = Math.round(frameHeight * 0.22);
    const offsetX = Math.round((frameWidth - bodyWidth) * 0.5);
    const offsetY = Math.round(frameHeight - bodyHeight - frameHeight * 0.1);

    // Keep collisions focused on the lower body so the visual head/weapon area feels natural.
    this.body.setSize(bodyWidth, bodyHeight);
    this.body.setOffset(offsetX, offsetY);
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
    this.facingDirection = 'south';
    this.facingAngle = PLAYER_FACING_ANGLES[this.facingDirection];
    this.walkFrameIndex = 0;
    this.walkFrameElapsed = 0;
    this.applyCurrentTexture();
    this.setAlpha(1);
  }
}