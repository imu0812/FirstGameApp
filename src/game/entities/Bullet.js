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
    this.statusEffect = null;
    this.hitTargets = new Set();

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
    this.explosionDamage = config.explosionDamage ?? config.damage;
    this.statusEffect = config.statusEffect ?? null;
    this.hitTargets.clear();

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

  registerHit(enemy) {
    if (this.hitTargets.has(enemy)) {
      return false;
    }

    this.hitTargets.add(enemy);
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

    if (time - this.spawnTime >= this.lifeSpan) {
      if (this.explodeOnExpire && this.explosionRadius > 0) {
        this.scene.handleProjectileExplosion(this);
      }

      this.disableBullet();
    }
  }

  disableBullet() {
    this.hitTargets.clear();
    this.statusEffect = null;
    this.setVelocity(0, 0);
    this.disableBody(true, true);
  }
}


