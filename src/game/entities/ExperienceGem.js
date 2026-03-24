import Phaser from 'phaser';

export class ExperienceGem extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, value = 1) {
    super(scene, x, y, 'gem');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.baseRadius = 10;
    this.setCircle(this.baseRadius);
    this.setImmovable(true);
    this.body.setAllowGravity(false);

    this.spawn(x, y, value);
  }

  spawn(x, y, value = 1) {
    this.enableBody(true, x, y, true, true);
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.setGemValue(value);
    return this;
  }

  setGemValue(value) {
    this.value = value;

    const scale = Phaser.Math.Clamp(1 + Math.log2(Math.max(1, value)) * 0.12, 1, 1.7);
    const alpha = Phaser.Math.Clamp(0.9 + Math.log2(Math.max(1, value)) * 0.03, 0.9, 1);
    const radius = Math.round(this.baseRadius * scale);

    this.setScale(scale);
    this.setAlpha(alpha);
    this.body.setCircle(radius, this.width * 0.5 - radius, this.height * 0.5 - radius);
  }

  addValue(amount) {
    this.setGemValue(this.value + amount);
  }

  collect() {
    this.setVelocity(0, 0);
    this.disableBody(true, true);
  }
}

