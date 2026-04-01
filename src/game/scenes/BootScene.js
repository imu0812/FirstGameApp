import Phaser from 'phaser';
import arcBoltIconImage from '../../assets/arc_bolt_icon.svg';
import arcBoltProjectileImage from '../../assets/arc_bolt_projectile_mobile.png';
import cometLanceIconImage from '../../assets/comet_lance_icon.svg';
import cometLanceProjectileImage from '../../assets/comet_lance_projectile_mobile.png';
import chainThunderIconImage from '../../assets/chain_thunder.svg';
import chainThunderProjectileImage from '../../assets/chain_thunder_projectile_mobile.png';
import haloDiscIconImage from '../../assets/halo_disc.svg';
import haloDiscProjectileImage from '../../assets/halo_disc_projectile_mobile.png';
import novaBloomIconImage from '../../assets/nova_bloom.svg';
import novaBloomProjectileImage from '../../assets/nova_bloom_projectile_mobile.png';
import novaBloomExplosionImage from '../../assets/nova_bloom_explosion.png';
import flameOrbIconImage from '../../assets/flame_orb.svg';
import flameOrbProjectileImage from '../../assets/flame_orb_projectile_mobile.png';
import flameOrbExplosionImage from '../../assets/flame_orb_explosion.png';
import flameOrbGroundFireImage from '../../assets/flame_orb_ground_fire.png';
import passiveMaxHealthIcon from '../../assets/passive_max_health.svg';
import passivePickupRadiusIcon from '../../assets/passive_pickup_radius.svg';
import passiveMoveSpeedIcon from '../../assets/passive_move_speed.svg';
import passiveProjectileCountIcon from '../../assets/passive_projectile_count.svg';
import passiveDamageBoostIcon from '../../assets/passive_damage_boost.svg';
import passiveAttackFrequencyIcon from '../../assets/passive_attack_frequency.svg';
import rewardMagnetImage from '../../assets/reward_magnet.png';
export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.image('arc_bolt_icon', arcBoltIconImage);
    this.load.image('arc_bolt_projectile', arcBoltProjectileImage);
    this.load.image('comet_lance_icon', cometLanceIconImage);
    this.load.image('comet_lance_projectile', cometLanceProjectileImage);
    this.load.image('chain_thunder_icon', chainThunderIconImage);
    this.load.image('chain_thunder_projectile', chainThunderProjectileImage);
    this.load.image('halo_disc_icon', haloDiscIconImage);
    this.load.image('orbit_blade', haloDiscProjectileImage);
    this.load.image('nova_bloom_icon', novaBloomIconImage);
    this.load.image('nova_bloom_projectile', novaBloomProjectileImage);
    this.load.image('nova_bloom_explosion', novaBloomExplosionImage);
    this.load.image('flame_orb_icon', flameOrbIconImage);
    this.load.image('flame_orb_projectile', flameOrbProjectileImage);
    this.load.image('flame_orb_explosion', flameOrbExplosionImage);
    this.load.image('flame_orb_ground_fire', flameOrbGroundFireImage);
    this.load.image('passive_attack_frequency', passiveAttackFrequencyIcon);
    this.load.image('passive_damage_boost', passiveDamageBoostIcon);
    this.load.image('passive_projectile_count', passiveProjectileCountIcon);
    this.load.image('passive_move_speed', passiveMoveSpeedIcon);
    this.load.image('passive_pickup_radius', passivePickupRadiusIcon);
    this.load.image('passive_max_health', passiveMaxHealthIcon);
    this.load.image('reward_magnet', rewardMagnetImage);
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
    graphics.fillStyle(0x8dd1ff, 1);
    graphics.fillRect(0, 0, 26, 8);
    graphics.lineStyle(2, 0xe1f5ff, 0.85);
    graphics.strokeRect(0, 0, 26, 8);
    graphics.generateTexture('lance', 26, 8);

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

