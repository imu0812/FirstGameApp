import Phaser from 'phaser';

export class BossProjectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'boss_bullet');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.damage = 1;
    this.lifeSpan = 2400;
    this.spawnTime = 0;

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
    this.spawnTime = this.scene.time.now;
    this.rotation = config.angle;
    this.scene.physics.velocityFromRotation(config.angle, config.speed, this.body.velocity);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    if (!this.active) {
      return;
    }

    if (time - this.spawnTime >= this.lifeSpan) {
      this.disableProjectile();
    }
  }

  disableProjectile() {
    this.setVelocity(0, 0);
    this.disableBody(true, true);
  }
}
