import Phaser from 'phaser';

export class BossProjectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_bullet');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.damage = 1;
    this.lifeSpan = 2400;
    this.spawnTime = 0;
    this.speed = 0;
    this.homingStrength = 0;
    this.homingTurnRate = 0;
    this.homingDelayMs = 0;
    this.homingDurationMs = 0;
    this.homingStartsAt = 0;
    this.homingEndsAt = 0;
    this.target = null;

    this.setActive(false);
    this.setVisible(false);
    this.body.enable = false;
    this.body.setAllowGravity(false);
  }

  fire(config) {
    this.enableBody(true, config.x, config.y, true, true);
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(config.x, config.y);
    this.setVelocity(0, 0);
    this.setTint(config.tint ?? 0x9ae5ff);
    this.setScale(config.scale ?? 1);
    this.body.setCircle(config.bodyRadius ?? 7);

    this.damage = config.damage ?? 1;
    this.lifeSpan = config.lifeSpan ?? 2400;
    this.speed = config.speed ?? 220;
    this.homingStrength = config.homingStrength ?? 0;
    this.homingTurnRate = config.homingTurnRate ?? this.homingStrength;
    this.homingDelayMs = config.homingDelayMs ?? 0;
    this.homingDurationMs = config.homingDurationMs ?? this.lifeSpan;
    this.target = config.target ?? null;
    this.spawnTime = this.scene.time.now;
    this.homingStartsAt = this.spawnTime + this.homingDelayMs;
    this.homingEndsAt = this.homingStartsAt + this.homingDurationMs;
    this.rotation = config.angle;
    this.scene.physics.velocityFromRotation(config.angle, this.speed, this.body.velocity);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (!this.active) {
      return;
    }

    if (
      this.homingTurnRate > 0
      && this.target?.active
      && time >= this.homingStartsAt
      && time <= this.homingEndsAt
    ) {
      const desiredAngle = Phaser.Math.Angle.Between(this.x, this.y, this.target.x, this.target.y);
      const currentAngle = this.body.velocity.lengthSq() > 0 ? this.body.velocity.angle() : this.rotation;
      const maxTurnStep = this.homingTurnRate * (delta / 1000);
      const nextAngle = Phaser.Math.Angle.RotateTo(currentAngle, desiredAngle, maxTurnStep);
      this.rotation = nextAngle;
      this.scene.physics.velocityFromRotation(nextAngle, this.speed, this.body.velocity);
    }

    if (time - this.spawnTime >= this.lifeSpan) {
      this.disableProjectile();
    }
  }

  disableProjectile() {
    this.target = null;
    this.homingStrength = 0;
    this.homingTurnRate = 0;
    this.homingDelayMs = 0;
    this.homingDurationMs = 0;
    this.homingStartsAt = 0;
    this.homingEndsAt = 0;
    this.speed = 0;
    this.setVelocity(0, 0);
    this.disableBody(true, true);
  }
}
