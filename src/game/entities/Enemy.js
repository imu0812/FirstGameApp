import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, 'enemy');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.freezeOutline = scene.add.image(x, y, 'ice_shell');
    this.freezeOutline.setVisible(false);
    this.freezeOutline.setAlpha(0.92);
    this.freezeOutline.setDepth(this.depth - 1);

    this.setCircle(14);
    this.body.setAllowGravity(false);

    this.spawn(x, y, config);
  }

  spawn(x, y, config) {
    this.typeKey = config.key;
    this.typeName = config.name;
    this.moveSpeed = config.speed;
    this.maxHealth = config.maxHealth;
    this.health = this.maxHealth;
    this.experienceValue = config.experienceValue;
    this.contactDamage = config.contactDamage;
    this.baseTint = config.tint;
    this.slowMultiplier = 1;
    this.slowUntil = 0;
    this.frozenUntil = 0;

    this.enableBody(true, x, y, true, true);
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.setTint(this.baseTint);
    this.setScale(config.scale ?? 1);

    this.freezeOutline.setPosition(x, y);
    this.freezeOutline.setScale((config.scale ?? 1) * 1.22);
    this.freezeOutline.setVisible(false);

    return this;
  }

  update(player) {
    if (!this.active || !player?.active) {
      this.setVelocity(0, 0);
      this.freezeOutline.setVisible(false);
      return;
    }

    const now = this.scene.time.now;
    this.freezeOutline.setPosition(this.x, this.y);

    if (now < this.frozenUntil) {
      this.setVelocity(0, 0);
      this.setTint(0xbfe8ff);
      this.freezeOutline.setVisible(true);
      return;
    }

    this.freezeOutline.setVisible(false);

    if (now >= this.slowUntil) {
      this.slowMultiplier = 1;
      this.setTint(this.baseTint);
    } else {
      this.setTint(0x8fd8ff);
    }

    this.scene.physics.moveToObject(this, player, this.moveSpeed * this.slowMultiplier);
    this.rotation = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
  }

  applyChill(effect = {}, time = 0) {
    const slowMultiplier = Phaser.Math.Clamp(effect.slowMultiplier ?? 1, 0.2, 1);
    const slowDuration = effect.slowDuration ?? 0;
    const freezeDuration = effect.freezeDuration ?? 0;

    if (slowDuration > 0 && slowMultiplier < this.slowMultiplier) {
      this.slowMultiplier = slowMultiplier;
    }

    if (slowDuration > 0) {
      this.slowUntil = Math.max(this.slowUntil, time + slowDuration);
    }

    if (freezeDuration > 0) {
      this.frozenUntil = Math.max(this.frozenUntil, time + freezeDuration);
      this.setVelocity(0, 0);
      this.setTint(0xbfe8ff);
      this.freezeOutline.setPosition(this.x, this.y);
      this.freezeOutline.setVisible(true);
      return;
    }

    if (slowDuration > 0) {
      this.setTint(0x8fd8ff);
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    return this.health <= 0;
  }

  deactivate() {
    this.disableBody(true, true);
    this.setVelocity(0, 0);
    this.slowMultiplier = 1;
    this.slowUntil = 0;
    this.frozenUntil = 0;
    this.setTint(this.baseTint ?? 0xffffff);
    this.freezeOutline.setVisible(false);
  }

  destroy(fromScene) {
    this.freezeOutline?.destroy();
    super.destroy(fromScene);
  }
}
