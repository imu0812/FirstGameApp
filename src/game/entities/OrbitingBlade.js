import Phaser from 'phaser';

export class OrbitingBlade extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'orbit_blade');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.hitTracker = new Map();
    this.body.setAllowGravity(false);
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
    this.body.setCircle(12 * (config.scale ?? 1));

    return this;
  }

  updateOrbit(player, index, total, elapsedSeconds) {
    if (!this.active || !player?.active) {
      return;
    }

    const angle = elapsedSeconds * this.orbitSpeed + index * ((Math.PI * 2) / total);
    this.setPosition(
      player.x + Math.cos(angle) * this.radius,
      player.y + Math.sin(angle) * this.radius
    );
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
