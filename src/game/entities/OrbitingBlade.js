import Phaser from 'phaser';

export class OrbitingBlade extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'orbit_blade');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.hitTracker = new Map();
    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.moves = false;
    this.deactivate();
  }

  configure(config, x, y) {
    this.damage = config.damage;
    this.radius = config.radius;
    this.orbitSpeed = config.orbitSpeed;
    this.hitCooldown = config.hitCooldown;

    this.enableBody(true, x, y, true, true);
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.setTint(config.tint);
    this.setScale(config.scale ?? 1);

    const bodyRadius = 12 * (config.scale ?? 1);
    this.body.setCircle(bodyRadius);
    this.body.setOffset(this.width * 0.5 - bodyRadius, this.height * 0.5 - bodyRadius);
    this.body.moves = false;
    this.body.setImmovable(true);
    this.body.reset(x, y);

    return this;
  }

  updateOrbit(player, index, total, elapsedSeconds) {
    if (!this.active || !player?.active) {
      return;
    }

    const angle = elapsedSeconds * this.orbitSpeed + index * ((Math.PI * 2) / Math.max(1, total));
    const nextX = player.x + Math.cos(angle) * this.radius;
    const nextY = player.y + Math.sin(angle) * this.radius;

    this.setPosition(nextX, nextY);
    this.body.reset(nextX, nextY);
    this.rotation = angle + Math.PI / 2;
  }

  canDamage(enemy, time) {
    const lastHitAt = this.hitTracker.get(enemy) ?? -Infinity;

    if (time - lastHitAt < this.hitCooldown) {
      return false;
    }

    this.hitTracker.set(enemy, time);
    return true;
  }

  deactivate() {
    this.hitTracker.clear();
    this.setVelocity(0, 0);
    this.disableBody(true, true);
  }
}
