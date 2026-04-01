import Phaser from 'phaser';

export class VineTurret extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'vine_turret_body');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.moves = false;
    this.body.setImmovable(true);
    this.setOrigin(0.5, 0.78);
    this.baseScale = 1;

    this.deactivate();
  }

  configure(config, x, y, shotOffset = 0) {
    this.range = config.range;
    this.fireCooldown = config.cooldown;
    this.projectileSpeed = config.projectileSpeed;
    this.projectileLifeSpan = config.projectileLifeSpan;
    this.projectileDamage = config.projectileDamage;
    this.projectileTint = config.projectileTint;
    this.projectileScale = config.projectileScale ?? 1;
    this.projectileBodyRadius = config.projectileBodyRadius ?? 7;
    this.projectileTexture = config.projectileTexture ?? 'vine_turret_projectile';
    this.statusEffect = config.statusEffect ?? null;
    this.explosionRadius = config.explosionRadius ?? 0;
    this.explosionDamage = config.explosionDamage ?? config.projectileDamage;
    this.summonDuration = config.summonDuration ?? 24000;

    this.enableBody(true, x, y, true, true);
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.setTexture('vine_turret_body');
    this.baseScale = config.scale ?? 1;
    this.setScale(this.baseScale);
    this.setTint(config.tint ?? 0xffffff);
    this.setFlipX(false);
    this.rotation = 0;
    this.body.reset(x, y);
    this.setAlpha(1);
    this.expireAt = this.scene.time.now + this.summonDuration;
    this.nextShotAt = this.scene.time.now + shotOffset;
    return this;
  }

  updateTurret(player, time, targetResolver, fireFn) {
    if (!this.active || !player?.active) {
      return;
    }

    if (time >= this.expireAt) {
      this.deactivate();
      return;
    }

    const target = targetResolver(this.x, this.y, this.range);

    // Keep the turret rooted in place while letting the upper silhouette feel directional.
    this.rotation = 0;

    if (target?.active) {
      this.setFlipX(target.x < this.x);
    }

    const remaining = this.expireAt - time;
    if (remaining <= 1200) {
      this.setAlpha(0.6 + 0.35 * Math.abs(Math.sin(time * 0.02)));
    } else {
      this.setAlpha(1);
    }

    if (time < this.nextShotAt || !target?.active) {
      return;
    }

    this.scene.tweens.killTweensOf(this);
    this.setScale(this.baseScale * 1.06, this.baseScale * 0.94);
    this.scene.tweens.add({
      targets: this,
      scaleX: this.baseScale,
      scaleY: this.baseScale,
      duration: 110,
      ease: 'Quad.Out'
    });

    fireFn(this, target);
    this.nextShotAt = time + this.fireCooldown;
  }

  deactivate() {
    this.nextShotAt = 0;
    this.expireAt = 0;
    this.disableBody(true, true);
    this.setVelocity(0, 0);
  }
}
