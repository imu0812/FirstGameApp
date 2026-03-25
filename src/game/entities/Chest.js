import Phaser from 'phaser';

export class Chest extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, chestType) {
    super(scene, x, y, chestType?.texture ?? 'chest_bronze');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.setDepth(1.5);

    this.deactivate();

    if (chestType) {
      this.spawn(x, y, chestType);
    }
  }

  spawn(x, y, chestType) {
    this.typeKey = chestType.key;
    this.chestType = chestType;
    this.maxHits = chestType.hitsToOpen ?? 1;
    this.hitsRemaining = this.maxHits;
    this.enableBody(true, x, y, true, true);
    this.setActive(true);
    this.setVisible(true);
    this.setTexture(chestType.texture);
    this.setPosition(x, y);
    this.setScale(chestType.scale ?? 1);
    this.setAngle(0);
    this.clearTint();
    this.setAlpha(1);
    this.body.setCircle(14);
    this.body.setOffset(this.width * 0.5 - 14, this.height * 0.5 - 14);
    return this;
  }

  registerHit() {
    if (!this.active) {
      return false;
    }

    this.hitsRemaining = Math.max(0, this.hitsRemaining - 1);
    this.setTintFill(0xffffff);
    this.scene.time.delayedCall(80, () => {
      if (this.active) {
        this.clearTint();
      }
    });

    if (this.hitsRemaining <= 0) {
      return true;
    }

    this.setAlpha(Phaser.Math.Clamp(0.7 + (this.hitsRemaining / this.maxHits) * 0.3, 0.72, 1));
    return false;
  }

  deactivate() {
    this.chestType = null;
    this.typeKey = null;
    this.maxHits = 0;
    this.hitsRemaining = 0;
    this.clearTint();
    this.setAlpha(1);
    this.disableBody(true, true);
  }
}
