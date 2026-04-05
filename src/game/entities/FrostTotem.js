import Phaser from 'phaser';

let frostTotemIdSeed = 0;

export class FrostTotem extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'frost_totem_body');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.moves = false;
    this.body.setImmovable(true);
    this.setOrigin(0.5, 0.74);

    this.id = `frost_totem_${frostTotemIdSeed += 1}`;
    this.owner = null;
    this.level = 1;
    this.createdAt = 0;
    this.expireAt = 0;
    this.nextPulseAt = 0;
    this.pulseInterval = 1600;
    this.pulseRadius = 72;
    this.pulseDamage = 0;
    this.statusEffect = null;
    this.shardConfig = null;
    this.baseScale = 1;

    this.deactivate();
  }

  configure(config, x, y, pulseOffset = 0) {
    this.owner = config.owner ?? null;
    this.level = config.level ?? 1;
    this.pulseInterval = config.pulseInterval ?? 1600;
    this.pulseRadius = config.pulseRadius ?? 72;
    this.pulseDamage = config.pulseDamage ?? 0;
    this.statusEffect = config.statusEffect ?? null;
    this.shardConfig = config.shardConfig ?? null;
    this.summonDuration = config.summonDuration ?? 8000;
    this.createdAt = this.scene.time.now;
    this.expireAt = this.createdAt + this.summonDuration;
    this.nextPulseAt = this.createdAt + pulseOffset;

    this.enableBody(true, x, y, true, true);
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.setTexture('frost_totem_body');
    this.baseScale = config.scale ?? 1;
    this.setScale(this.baseScale);
    this.setTint(config.tint ?? 0xffffff);
    this.setAlpha(1);
    this.rotation = 0;
    this.body.reset(x, y);
    return this;
  }

  updateTotem(time, triggerPulse) {
    if (!this.active) {
      return;
    }

    if (time >= this.expireAt) {
      this.deactivate();
      return;
    }

    this.rotation = Math.sin((time + this.createdAt) * 0.0024) * 0.03;
    this.setScale(this.baseScale * (1 + Math.sin(time * 0.005 + this.createdAt * 0.001) * 0.028));

    const remaining = this.expireAt - time;
    if (remaining <= 1400) {
      this.setAlpha(0.52 + Math.abs(Math.sin(time * 0.016)) * 0.4);
    } else {
      this.setAlpha(0.94 + Math.sin(time * 0.004) * 0.06);
    }

    if (time < this.nextPulseAt) {
      return;
    }

    triggerPulse?.(this, time);
    this.nextPulseAt = time + this.pulseInterval;
  }

  deactivate() {
    this.owner = null;
    this.level = 0;
    this.createdAt = 0;
    this.expireAt = 0;
    this.nextPulseAt = 0;
    this.pulseInterval = 1600;
    this.pulseRadius = 72;
    this.pulseDamage = 0;
    this.statusEffect = null;
    this.shardConfig = null;
    this.disableBody(true, true);
    this.setVelocity(0, 0);
  }
}
