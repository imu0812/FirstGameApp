import Phaser from 'phaser';
import arcBoltIconImage from '../../assets/arc_bolt_icon.svg';
import arcBoltProjectileImage from '../../assets/arc_bolt_projectile_mobile.png';
import cometLanceIconImage from '../../assets/comet_lance_icon.svg';
import cometLanceProjectileImage from '../../assets/comet_lance_projectile_mobile.png';
import chainThunderIconImage from '../../assets/chain_thunder.svg';
import chainThunderProjectileImage from '../../assets/chain_thunder_projectile_mobile.png';
import galeBoomerangIconImage from '../../assets/gale_boomerang.svg';
import galeBoomerangProjectileImage from '../../assets/gale_boomerang_projectile_mobile.png';
import vineTurretIconImage from '../../assets/vine_turret.svg';
import vineTurretProjectileImage from '../../assets/vine_turret_projectile_mobile.png';
import earthspikeLineIconImage from '../../assets/earthspike_line.svg';
import earthspikeLineProjectileImage from '../../assets/earthspike_line_projectile_mobile.png';
import earthspikeLineImpactImage from '../../assets/earthspike_line_impact.png';
import earthspikeLineAftershockImage from '../../assets/earthspike_line_aftershock.png';
import vineSeedProjectileImage from '../../assets/vine_seed_projectile.png';
import vineTurretPoisonBurstImage from '../../assets/vine_turret_poison_burst.png';
import vineTurretSummonLandImage from '../../assets/vine_turret_summon_land.png';
import vineTurretRootBindImage from '../../assets/vine_turret_root_bind.png';
import vineTurretPoisonSplashImage from '../../assets/vine_turret_poison_splash.png';
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
import arcBoltCastAudioOgg from '../../assets/audio/arc_bolt_cast.ogg';
import arcBoltCastAudioMp3 from '../../assets/audio/arc_bolt_cast.mp3';
import arcBoltHitAudioOgg from '../../assets/audio/arc_bolt_hit.ogg';
import arcBoltHitAudioMp3 from '../../assets/audio/arc_bolt_hit.mp3';
import chainThunderCastAudioOgg from '../../assets/audio/chain_thunder_cast.ogg';
import chainThunderCastAudioMp3 from '../../assets/audio/chain_thunder_cast.mp3';
import cometLanceCastAudioOgg from '../../assets/audio/comet_lance_cast.ogg';
import cometLanceCastAudioMp3 from '../../assets/audio/comet_lance_cast.mp3';
import cometLanceHitAudioOgg from '../../assets/audio/comet_lance_hit.ogg';
import cometLanceHitAudioMp3 from '../../assets/audio/comet_lance_hit.mp3';
import flameOrbCastAudioOgg from '../../assets/audio/flame_orb_cast.ogg';
import flameOrbCastAudioMp3 from '../../assets/audio/flame_orb_cast.mp3';
import flameOrbExplodeAudioOgg from '../../assets/audio/flame_orb_explode.ogg';
import flameOrbExplodeAudioMp3 from '../../assets/audio/flame_orb_explode.mp3';
import galeBoomerangReturnHitAudioOgg from '../../assets/audio/gale_boomerang_return_hit.ogg';
import galeBoomerangReturnHitAudioMp3 from '../../assets/audio/gale_boomerang_return_hit.mp3';
import galeBoomerangThrowAudioOgg from '../../assets/audio/gale_boomerang_throw.ogg';
import galeBoomerangThrowAudioMp3 from '../../assets/audio/gale_boomerang_throw.mp3';
import haloDiscHitAudioOgg from '../../assets/audio/halo_disc_hit.ogg';
import haloDiscHitAudioMp3 from '../../assets/audio/halo_disc_hit.mp3';
import novaBloomExplodeAudioOgg from '../../assets/audio/nova_bloom_explode.ogg';
import novaBloomExplodeAudioMp3 from '../../assets/audio/nova_bloom_explode.mp3';
import novaBloomThrowAudioOgg from '../../assets/audio/nova_bloom_throw.ogg';
import novaBloomThrowAudioMp3 from '../../assets/audio/nova_bloom_throw.mp3';
import vineTurretFireAudioOgg from '../../assets/audio/vine_turret_fire.ogg';
import vineTurretFireAudioMp3 from '../../assets/audio/vine_turret_fire.mp3';
import earthspikeLineCastAudioMp3 from '../../assets/audio/earthspike_line_cast.mp3';
import earthspikeLineEruptSegmentAudioMp3 from '../../assets/audio/earthspike_line_erupt_segment.mp3';
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
    this.load.image('gale_boomerang_icon', galeBoomerangIconImage);
    this.load.image('gale_boomerang_projectile', galeBoomerangProjectileImage);
    this.load.image('vine_turret_icon', vineTurretIconImage);
    this.load.image('vine_turret_body', vineTurretIconImage);
    this.load.image('vine_turret_projectile', vineTurretProjectileImage);
    this.load.image('earthspike_line_icon', earthspikeLineIconImage);
    this.load.image('earthspike_line_projectile', earthspikeLineProjectileImage);
    this.load.image('earthspike_line_impact', earthspikeLineImpactImage);
    this.load.image('earthspike_line_aftershock', earthspikeLineAftershockImage);
    this.load.image('vine_seed_projectile', vineSeedProjectileImage);
    this.load.image('vine_turret_poison_burst', vineTurretPoisonBurstImage);
    this.load.image('vine_turret_summon_land', vineTurretSummonLandImage);
    this.load.image('vine_turret_root_bind', vineTurretRootBindImage);
    this.load.image('vine_turret_poison_splash', vineTurretPoisonSplashImage);
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
    this.load.audio('arc_bolt_cast_sfx', [arcBoltCastAudioOgg, arcBoltCastAudioMp3]);
    this.load.audio('arc_bolt_hit_sfx', [arcBoltHitAudioOgg, arcBoltHitAudioMp3]);
    this.load.audio('chain_thunder_cast_sfx', [chainThunderCastAudioOgg, chainThunderCastAudioMp3]);
    this.load.audio('comet_lance_cast_sfx', [cometLanceCastAudioOgg, cometLanceCastAudioMp3]);
    this.load.audio('comet_lance_hit_sfx', [cometLanceHitAudioOgg, cometLanceHitAudioMp3]);
    this.load.audio('flame_orb_cast_sfx', [flameOrbCastAudioOgg, flameOrbCastAudioMp3]);
    this.load.audio('flame_orb_explode_sfx', [flameOrbExplodeAudioOgg, flameOrbExplodeAudioMp3]);
    this.load.audio('gale_boomerang_throw_sfx', [galeBoomerangThrowAudioOgg, galeBoomerangThrowAudioMp3]);
    this.load.audio('gale_boomerang_return_hit_sfx', [galeBoomerangReturnHitAudioOgg, galeBoomerangReturnHitAudioMp3]);
    this.load.audio('halo_disc_hit_sfx', [haloDiscHitAudioOgg, haloDiscHitAudioMp3]);
    this.load.audio('nova_bloom_throw_sfx', [novaBloomThrowAudioOgg, novaBloomThrowAudioMp3]);
    this.load.audio('nova_bloom_explode_sfx', [novaBloomExplodeAudioOgg, novaBloomExplodeAudioMp3]);
    this.load.audio('vine_turret_fire_sfx', [vineTurretFireAudioOgg, vineTurretFireAudioMp3]);
    this.load.audio('earthspike_line_cast_sfx', earthspikeLineCastAudioMp3);
    this.load.audio('earthspike_line_erupt_segment_sfx', earthspikeLineEruptSegmentAudioMp3);
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

    this.createStatusEffectTextures(graphics);
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

  createStatusEffectTextures(graphics) {
    graphics.clear();
    graphics.fillStyle(0x173824, 0.18);
    graphics.fillCircle(10, 10, 9);
    graphics.lineStyle(2, 0x8df08a, 0.95);
    graphics.strokeCircle(10, 10, 7);
    graphics.fillStyle(0xc9ffb0, 0.95);
    graphics.fillCircle(7, 8, 2);
    graphics.fillCircle(12, 6, 2);
    graphics.fillCircle(13, 11, 2);
    graphics.generateTexture('status_poison_icon', 20, 20);

    graphics.clear();
    graphics.lineStyle(3, 0x63d874, 0.34);
    graphics.strokeCircle(24, 24, 16);
    graphics.lineStyle(2, 0xb9ffb1, 0.55);
    graphics.strokeCircle(24, 24, 11);
    graphics.fillStyle(0x8dff9d, 0.32);
    graphics.fillCircle(11, 17, 4);
    graphics.fillCircle(31, 12, 3);
    graphics.fillCircle(36, 28, 4);
    graphics.fillCircle(18, 35, 3);
    graphics.generateTexture('status_poison_ring', 48, 48);

    graphics.clear();
    graphics.fillStyle(0x40170d, 0.18);
    graphics.fillCircle(10, 10, 9);
    graphics.fillStyle(0xff8f52, 0.95);
    graphics.beginPath();
    graphics.moveTo(10, 2);
    graphics.lineTo(14, 8);
    graphics.lineTo(12, 8);
    graphics.lineTo(16, 16);
    graphics.lineTo(9, 11);
    graphics.lineTo(11, 11);
    graphics.lineTo(6, 4);
    graphics.closePath();
    graphics.fillPath();
    graphics.lineStyle(2, 0xffd08a, 0.9);
    graphics.strokePath();
    graphics.generateTexture('status_burn_icon', 20, 20);

    graphics.clear();
    graphics.lineStyle(3, 0xff8a42, 0.34);
    graphics.strokeCircle(24, 24, 15);
    graphics.lineStyle(2, 0xffd278, 0.5);
    graphics.beginPath();
    graphics.moveTo(12, 31);
    graphics.lineTo(17, 18);
    graphics.lineTo(22, 24);
    graphics.lineTo(26, 12);
    graphics.lineTo(31, 20);
    graphics.lineTo(36, 15);
    graphics.strokePath();
    graphics.fillStyle(0xffb15d, 0.34);
    graphics.fillCircle(15, 14, 4);
    graphics.fillCircle(32, 31, 5);
    graphics.fillCircle(24, 36, 3);
    graphics.generateTexture('status_burn_ring', 48, 48);
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

