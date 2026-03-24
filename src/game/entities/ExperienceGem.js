import Phaser from 'phaser';

export class ExperienceGem extends Phaser.GameObjects.Image {
  constructor(scene, x, y, value = 1) {
    super(scene, x, y, 'gem');

    scene.add.existing(this);

    this.baseRadius = 10;
    this.collectRadius = this.baseRadius;
    this.pullVelocity = new Phaser.Math.Vector2(0, 0);

    this.spawn(x, y, value);
  }

  spawn(x, y, value = 1) {
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.stopMotion();
    this.setGemValue(value);
    return this;
  }

  setGemValue(value) {
    this.value = value;

    const scale = Phaser.Math.Clamp(1 + Math.log2(Math.max(1, value)) * 0.12, 1, 1.7);
    const alpha = Phaser.Math.Clamp(0.9 + Math.log2(Math.max(1, value)) * 0.03, 0.9, 1);

    this.setScale(scale);
    this.setAlpha(alpha);
    this.collectRadius = Math.round(this.baseRadius * scale);
  }

  addValue(amount) {
    this.setGemValue(this.value + amount);
  }

  pullToward(directionX, directionY, speed, deltaSeconds) {
    this.pullVelocity.set(directionX * speed, directionY * speed);
    this.x += this.pullVelocity.x * deltaSeconds;
    this.y += this.pullVelocity.y * deltaSeconds;
  }

  stopMotion() {
    this.pullVelocity.set(0, 0);
  }

  collect() {
    this.stopMotion();
    this.setActive(false);
    this.setVisible(false);
  }
}
