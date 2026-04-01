import Phaser from 'phaser';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bullet');

    this.speed = 420;
    this.lifeSpan = 900;
    this.damage = 1;
    this.pierceRemaining = 0;
    this.explosionRadius = 0;
    this.explodeOnExpire = false;
    this.explosionTexture = null;
    this.chainConfig = null;
    this.boomerangConfig = null;
    this.statusEffect = null;
    this.outboundHitTargets = new Set();
    this.returnHitTargets = new Set();
    this.isReturning = false;
    this.returnStartedAt = 0;
    this.initialAngle = 0;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setActive(false);
    this.setVisible(false);
    this.body.enable = false;
  }

  fire(config) {
    this.setTexture(config.texture ?? 'bullet');
    this.enableBody(true, config.x, config.y, true, true);
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(config.x, config.y);
    this.setVelocity(0, 0);

    this.speed = config.speed;
    this.lifeSpan = config.lifeSpan;
    this.damage = config.damage;
    this.pierceRemaining = config.pierce ?? 0;
    this.explosionRadius = config.explosionRadius ?? 0;
    this.explodeOnExpire = config.explodeOnExpire ?? false;
    this.explosionTexture = config.explosionTexture ?? null;
    this.explosionDamage = config.explosionDamage ?? config.damage;
    this.chainConfig = config.chainConfig ?? null;
    this.boomerangConfig = config.boomerangConfig ?? null;
    this.statusEffect = config.statusEffect ?? null;
    this.outboundHitTargets.clear();
    this.returnHitTargets.clear();
    this.isReturning = false;
    this.returnStartedAt = 0;
    this.initialAngle = config.angle;

    this.setTint(config.tint ?? 0xffffff);
    this.setScale(config.scale ?? 1);
    const bodyRadius = config.bodyRadius ?? 8;
    const bodyDiameter = bodyRadius * 2;
    this.body.setCircle(
      bodyRadius,
      Math.max(0, (this.width - bodyDiameter) / 2),
      Math.max(0, (this.height - bodyDiameter) / 2)
    );

    this.rotation = config.angle + (config.rotationOffset ?? 0);
    this.scene.physics.velocityFromRotation(config.angle, this.speed, this.body.velocity);
    this.spawnTime = this.scene.time.now;
  }

  startReturn(time = this.scene.time.now) {
    if (this.isReturning) {
      return;
    }

    this.isReturning = true;
    this.returnStartedAt = time;
  }

  registerHit(enemy) {
    const hitSet = this.isReturning ? this.returnHitTargets : this.outboundHitTargets;

    if (hitSet.has(enemy)) {
      return false;
    }

    hitSet.add(enemy);
    return true;
  }

  consumePierce() {
    if (this.pierceRemaining <= 0) {
      return false;
    }

    this.pierceRemaining -= 1;
    return true;
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (!this.active) {
      return;
    }

    if (this.boomerangConfig) {
      const outboundDuration = this.boomerangConfig.outboundDuration ?? Math.max(260, Math.floor(this.lifeSpan * 0.45));
      const spinSpeed = this.boomerangConfig.spinSpeed ?? 0.24;
      this.rotation += spinSpeed;

      if (!this.isReturning && time - this.spawnTime >= outboundDuration) {
        this.startReturn(time);
      }

      if (this.isReturning) {
        const player = this.scene.player;

        if (!player?.active) {
          this.disableBullet();
          return;
        }

        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const catchRadius = this.boomerangConfig.catchRadius ?? 26;

        if (dx * dx + dy * dy <= catchRadius * catchRadius) {
          this.disableBullet();
          return;
        }

        const returnSpeed = this.speed * (this.boomerangConfig.returnSpeedMultiplier ?? 1.2);
        const angle = Math.atan2(dy, dx);
        this.scene.physics.velocityFromRotation(angle, returnSpeed, this.body.velocity);
      }
    }

    if (time - this.spawnTime >= this.lifeSpan) {
      if (this.explodeOnExpire && this.explosionRadius > 0) {
        this.scene.handleProjectileExplosion(this);
      }

      this.disableBullet();
    }
  }

  disableBullet() {
    this.outboundHitTargets.clear();
    this.returnHitTargets.clear();
    this.statusEffect = null;
    this.chainConfig = null;
    this.boomerangConfig = null;
    this.explosionTexture = null;
    this.isReturning = false;
    this.returnStartedAt = 0;
    this.setVelocity(0, 0);
    this.disableBody(true, true);
  }
}
