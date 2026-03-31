import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { MainScene } from './scenes/MainScene.js';
import { UIScene } from './scenes/UIScene.js';

export const gameConfig = {
  type: Phaser.AUTO,
  parent: 'app',
  width: 360,
  height: 640,
  resolution: Math.min(window.devicePixelRatio || 1, 2),
  backgroundColor: '#06111d',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  render: {
    antialias: true,
    roundPixels: false
  },
  scene: [BootScene, MainScene, UIScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    expandParent: true
  }
};
