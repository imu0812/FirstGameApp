import Phaser from 'phaser';
import arcBoltIconImage from '../../assets/arc_bolt.png';
import arcBoltProjectileImage from '../../assets/arc_bolt_projectile_16x32.png';
import rewardMagnetImage from '../../assets/reward_magnet.png';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.image('arc_bolt_icon', arcBoltIconImage);
    this.load.image('arc_bolt_projectile_source', arcBoltProjectileImage);
    this.load.image('reward_magnet', rewardMagnetImage);
  }

  create() {
    this.createArcBoltProjectileTexture();
    this.createTextures();
    this.scene.start('MainScene');
    this.scene.launch('UIScene');
  }

  createArcBoltProjectileTexture() {
    const sourceImage = this.textures.get('arc_bolt_projectile_source').getSourceImage();
    const canvasTexture = this.textures.createCanvas('arc_bolt_projectile', 32, 32);
    const context = canvasTexture.getContext();

    context.clearRect(0, 0, 32, 32);
    context.save();
    context.translate(16, 16);
    context.rotate(Math.PI / 2);
    context.drawImage(sourceImage, -sourceImage.width / 2, -sourceImage.height / 2);
    context.restore();
    canvasTexture.refresh();
  }

  createTextures() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });

    graphics.clear();
    graphics.fillStyle(0x7ef9ff, 1);
    graphics.fillCircle(16, 16, 16);
    graphics.lineStyle(3, 0xffffff, 0.85);
    graphics.strokeCircle(16, 16, 16);
    graphics.generateTexture('player', 32, 32);

    graphics.clear();
    graphics.fillStyle(0xff7b72, 1);
    graphics.fillCircle(14, 14, 14);
    graphics.lineStyle(2, 0x5e1010, 0.9);
    graphics.strokeCircle(14, 14, 14);
    graphics.generateTexture('enemy', 28, 28);

    graphics.clear();
    graphics.fillStyle(0xff9d5c, 1);
    graphics.fillCircle(16, 16, 14);
    graphics.lineStyle(3, 0xfff0c8, 0.85);
    graphics.strokeCircle(16, 16, 14);
    graphics.lineStyle(2, 0x6a2d0e, 0.9);
    graphics.strokeLineShape(new Phaser.Geom.Line(9, 23, 23, 9));
    graphics.generateTexture('elite_ranger', 32, 32);

    graphics.clear();
    graphics.fillStyle(0x78d6ff, 1);
    graphics.fillCircle(22, 22, 20);
    graphics.lineStyle(4, 0xeafaff, 0.85);
    graphics.strokeCircle(22, 22, 20);
    graphics.fillStyle(0x15374c, 0.35);
    graphics.fillCircle(16, 16, 6);
    graphics.generateTexture('boss', 44, 44);

    graphics.clear();
    graphics.fillStyle(0xffe38b, 1);
    graphics.fillRect(0, 0, 18, 6);
    graphics.generateTexture('bullet', 18, 6);

    graphics.clear();
    graphics.fillStyle(0x9ae5ff, 1);
    graphics.fillCircle(7, 7, 7);
    graphics.lineStyle(2, 0xeefbff, 0.9);
    graphics.strokeCircle(7, 7, 7);
    graphics.generateTexture('boss_bullet', 14, 14);

    graphics.clear();
    graphics.fillStyle(0x75f2b7, 1);
    graphics.fillCircle(10, 10, 10);
    graphics.fillStyle(0xc8fff0, 0.95);
    graphics.fillCircle(8, 8, 4);
    graphics.lineStyle(2, 0x1a7b59, 0.9);
    graphics.strokeCircle(10, 10, 10);
    graphics.generateTexture('gem', 20, 20);

    graphics.clear();
    graphics.fillStyle(0x7ef9ff, 1);
    graphics.fillTriangle(12, 0, 24, 12, 12, 24);
    graphics.fillTriangle(0, 12, 12, 0, 12, 24);
    graphics.generateTexture('orbit_blade', 24, 24);

    graphics.clear();
    graphics.fillStyle(0x8dd1ff, 1);
    graphics.fillRect(0, 0, 26, 8);
    graphics.lineStyle(2, 0xe1f5ff, 0.85);
    graphics.strokeRect(0, 0, 26, 8);
    graphics.generateTexture('lance', 26, 8);

    graphics.clear();
    graphics.fillStyle(0xff9e7a, 1);
    graphics.fillCircle(12, 12, 12);
    graphics.fillStyle(0xffd8ca, 0.8);
    graphics.fillCircle(9, 9, 4);
    graphics.generateTexture('bomb', 24, 24);

    graphics.clear();
    graphics.lineStyle(2, 0xdff7ff, 0.9);
    graphics.strokeCircle(18, 18, 16);
    graphics.lineStyle(3, 0x96e7ff, 0.75);
    graphics.beginPath();
    graphics.moveTo(18, 1);
    graphics.lineTo(22, 7);
    graphics.lineTo(28, 5);
    graphics.lineTo(31, 11);
    graphics.lineTo(35, 18);
    graphics.lineTo(31, 24);
    graphics.lineTo(33, 31);
    graphics.lineTo(27, 34);
    graphics.lineTo(22, 35);
    graphics.lineTo(18, 31);
    graphics.lineTo(13, 35);
    graphics.lineTo(8, 34);
    graphics.lineTo(3, 31);
    graphics.lineTo(5, 24);
    graphics.lineTo(1, 18);
    graphics.lineTo(5, 11);
    graphics.lineTo(8, 5);
    graphics.lineTo(14, 7);
    graphics.closePath();
    graphics.strokePath();
    graphics.generateTexture('ice_shell', 36, 36);

    this.createRewardPotionTexture(graphics);
    this.createRewardGoldTexture(graphics);
    if (!this.textures.exists('reward_magnet')) {
      this.createRewardMagnetTexture(graphics);
    }

    this.createChestTexture(graphics, 'chest_bronze', 0x8c5520, 0xdca35f, 0x321506);
    this.createChestTexture(graphics, 'chest_silver', 0x6f869a, 0xdcecff, 0x2f4252);
    this.createChestTexture(graphics, 'chest_gold', 0xb98518, 0xffe18c, 0x5a3400);

    graphics.destroy();
  }

  createRewardPotionTexture(graphics) {
    graphics.clear();
    graphics.fillStyle(0x2b1016, 0.22);
    graphics.fillEllipse(18, 30, 18, 6);
    graphics.fillStyle(0xff5f7d, 1);
    graphics.fillRoundedRect(9, 9, 18, 18, 5);
    graphics.fillStyle(0xffd6df, 0.98);
    graphics.fillRect(13, 4, 10, 8);
    graphics.fillStyle(0xff8ea4, 0.9);
    graphics.fillRect(11, 12, 14, 9);
    graphics.lineStyle(2, 0xffffff, 0.4);
    graphics.strokeRoundedRect(9, 9, 18, 18, 5);
    graphics.generateTexture('reward_potion', 36, 36);
  }

  createRewardGoldTexture(graphics) {
    graphics.clear();
    graphics.fillStyle(0x473100, 0.24);
    graphics.fillEllipse(18, 30, 18, 6);
    graphics.fillStyle(0xffd24a, 1);
    graphics.fillCircle(18, 18, 11);
    graphics.fillStyle(0xffef9a, 0.95);
    graphics.fillCircle(14, 13, 4);
    graphics.lineStyle(2, 0x9c6800, 0.95);
    graphics.strokeCircle(18, 18, 11);
    graphics.lineStyle(2, 0xfff6c8, 0.7);
    graphics.strokeCircle(18, 18, 6);
    graphics.generateTexture('reward_gold', 36, 36);
  }

  createRewardMagnetTexture(graphics) {
    graphics.clear();
    graphics.fillStyle(0x103040, 0.2);
    graphics.fillEllipse(18, 30, 20, 6);
    graphics.lineStyle(6, 0xff6a6a, 1);
    graphics.beginPath();
    graphics.moveTo(10, 10);
    graphics.lineTo(10, 23);
    graphics.lineTo(16, 23);
    graphics.lineTo(16, 10);
    graphics.strokePath();
    graphics.lineStyle(6, 0x75d8ff, 1);
    graphics.beginPath();
    graphics.moveTo(26, 10);
    graphics.lineTo(26, 23);
    graphics.lineTo(20, 23);
    graphics.lineTo(20, 10);
    graphics.strokePath();
    graphics.lineStyle(3, 0xeefbff, 0.95);
    graphics.strokeCircle(10, 8, 3);
    graphics.strokeCircle(26, 8, 3);
    graphics.generateTexture('reward_magnet', 36, 36);
  }

  createChestTexture(graphics, key, bodyColor, trimColor, shadowColor) {
    graphics.clear();
    graphics.fillStyle(shadowColor, 0.9);
    graphics.fillRoundedRect(4, 10, 28, 20, 5);
    graphics.fillStyle(bodyColor, 1);
    graphics.fillRoundedRect(3, 8, 28, 20, 5);
    graphics.fillStyle(trimColor, 0.95);
    graphics.fillRect(3, 14, 28, 4);
    graphics.fillRect(14, 8, 6, 20);
    graphics.fillStyle(0xfaf4dc, 0.95);
    graphics.fillRect(14, 16, 6, 5);
    graphics.lineStyle(2, 0xffffff, 0.28);
    graphics.strokeRoundedRect(3, 8, 28, 20, 5);
    graphics.generateTexture(key, 36, 36);
  }
}

