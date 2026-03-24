import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  create() {
    this.createTextures();
    this.scene.start('MainScene');
    this.scene.launch('UIScene');
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
    graphics.fillStyle(0xffe38b, 1);
    graphics.fillRect(0, 0, 18, 6);
    graphics.generateTexture('bullet', 18, 6);

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

    graphics.destroy();
  }
}
