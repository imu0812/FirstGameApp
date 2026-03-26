import Phaser from 'phaser';

export class ChestRewardDrop extends Phaser.GameObjects.Image {
  constructor(scene, x, y) {
    super(scene, x, y, 'reward_gold');

    scene.add.existing(this);
    this.setDepth(4.5);
    this.deactivate();
  }

  spawn(x, y, rewardType, chestType) {
    this.rewardKey = rewardType.key;
    this.rewardType = rewardType;
    this.chestTypeKey = chestType.key;
    this.baseY = y;
    this.spawnTime = this.scene.time.now;
    this.floatPhase = Phaser.Math.FloatBetween(0, Math.PI * 2);
    this.collectRadius = 16;
    this.pickupReadyAt = this.scene.time.now + 180;

    const rewardScale = rewardType.key === 'magnet' ? 0.2 : 1.08;

    this.setTexture(rewardType.texture);
    this.setPosition(x, y - 10);
    this.setScale((chestType.openFx?.rewardScale ?? 1) * rewardScale);
    this.setAlpha(0.92);
    this.setAngle(0);
    this.setTint(0xffffff);
    this.setActive(true);
    this.setVisible(true);

    this.scene.tweens.add({
      targets: this,
      y,
      alpha: 1,
      duration: 220,
      ease: 'Back.Out'
    });

    return this;
  }

  updateFloat(time) {
    if (!this.active) {
      return;
    }

    this.setY(this.baseY + Math.sin((time - this.spawnTime) * 0.005 + this.floatPhase) * 2.5);
  }

  collect() {
    this.deactivate();
  }

  deactivate() {
    this.rewardKey = null;
    this.rewardType = null;
    this.chestTypeKey = null;
    this.baseY = 0;
    this.spawnTime = 0;
    this.floatPhase = 0;
    this.pickupReadyAt = 0;
    this.clearTint();
    this.setActive(false);
    this.setVisible(false);
  }
}


