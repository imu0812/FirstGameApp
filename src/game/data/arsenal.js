export const WEAPON_DEFS = {
  arc_bolt: {
    key: 'arc_bolt',
    iconKey: 'arc_bolt_icon',
    projectileKey: 'arc_bolt_projectile',
    name: '奧術飛矢',
    category: 'weapon',
    type: 'auto',
    maxLevel: 5,
    unlockDescription: '發射會追向最近目標的奧術飛矢。',
    levels: [
      { range: 300, damage: 2, cooldown: 680, projectiles: 1, speed: 430, lifeSpan: 920, spread: 0.08, pierce: 0, tint: 0xffe38b, scale: 1 },
      { range: 315, damage: 3, cooldown: 590, projectiles: 1, speed: 450, lifeSpan: 960, spread: 0.08, pierce: 0, tint: 0xffe38b, scale: 1 },
      { range: 330, damage: 3, cooldown: 530, projectiles: 2, speed: 470, lifeSpan: 1000, spread: 0.16, pierce: 0, tint: 0xfff0a8, scale: 1 },
      { range: 345, damage: 4, cooldown: 470, projectiles: 2, speed: 490, lifeSpan: 1060, spread: 0.18, pierce: 1, tint: 0xfff4bc, scale: 1.05 },
      { range: 360, damage: 5, cooldown: 410, projectiles: 3, speed: 520, lifeSpan: 1120, spread: 0.24, pierce: 1, tint: 0xfff7d0, scale: 1.08 }
    ]
  },
  halo_disc: {
    key: 'halo_disc',
    iconKey: 'halo_disc_icon',
    name: '聖環飛刃',
    category: 'weapon',
    type: 'orbit',
    maxLevel: 5,
    unlockDescription: '召喚環繞角色旋轉的飛盤持續切割敵人。',
    levels: [
      { damage: 2, count: 1, radius: 58, orbitSpeed: 1.7, hitCooldown: 320, tint: 0x7ef9ff, scale: 0.95 },
      { damage: 2, count: 2, radius: 60, orbitSpeed: 1.85, hitCooldown: 300, tint: 0x7ef9ff, scale: 0.98 },
      { damage: 3, count: 2, radius: 64, orbitSpeed: 2.0, hitCooldown: 260, tint: 0x98fbff, scale: 1.02 },
      { damage: 3, count: 3, radius: 68, orbitSpeed: 2.15, hitCooldown: 230, tint: 0xb6ffff, scale: 1.06 },
      { damage: 4, count: 4, radius: 72, orbitSpeed: 2.35, hitCooldown: 210, tint: 0xd8ffff, scale: 1.1 }
    ]
  },
  comet_lance: {
    key: 'comet_lance',
    iconKey: 'comet_lance_icon',
    projectileKey: 'comet_lance_projectile',
    name: '寒霜冰箭',
    category: 'weapon',
    type: 'pierce',
    maxLevel: 5,
    unlockDescription: '射出可穿透敵人的冰槍並附帶緩速。',
    levels: [
      { range: 360, damage: 2, cooldown: 1380, projectiles: 1, speed: 520, lifeSpan: 1160, spread: 0.03, pierce: 1, slowMultiplier: 0.7, slowDuration: 1400, freezeDuration: 0, tint: 0x8ddfff, scale: 1.02 },
      { range: 380, damage: 3, cooldown: 1260, projectiles: 1, speed: 540, lifeSpan: 1200, spread: 0.03, pierce: 1, slowMultiplier: 0.62, slowDuration: 1600, freezeDuration: 0, tint: 0x97e8ff, scale: 1.04 },
      { range: 400, damage: 3, cooldown: 1140, projectiles: 2, speed: 560, lifeSpan: 1240, spread: 0.11, pierce: 2, slowMultiplier: 0.55, slowDuration: 1800, freezeDuration: 0, tint: 0xaeeeff, scale: 1.06 },
      { range: 420, damage: 4, cooldown: 1020, projectiles: 2, speed: 575, lifeSpan: 1280, spread: 0.13, pierce: 2, slowMultiplier: 0.48, slowDuration: 2000, freezeDuration: 900, tint: 0xc5f4ff, scale: 1.08 },
      { range: 440, damage: 5, cooldown: 900, projectiles: 3, speed: 590, lifeSpan: 1320, spread: 0.18, pierce: 3, slowMultiplier: 0.4, slowDuration: 2200, freezeDuration: 1500, tint: 0xe1fbff, scale: 1.12 }
    ]
  },
  flame_orb: {
    key: 'flame_orb',
    iconKey: 'flame_orb_icon',
    projectileKey: 'flame_orb_projectile',
    name: '烈焰火球',
    category: 'weapon',
    type: 'explosive_dot',
    maxLevel: 5,
    unlockDescription: '發射朝前飛行的火球，命中或到達終點時爆炸，並對範圍敵人附加燃燒效果。',
    levels: [
      { range: 320, damage: 3, cooldown: 1500, projectiles: 1, speed: 320, lifeSpan: 1000, spread: 0.04, radius: 64, tint: 0xffb36b, scale: 1, burnDamage: 1, burnDuration: 1800, burnTickInterval: 450 },
      { range: 340, damage: 4, cooldown: 1380, projectiles: 1, speed: 330, lifeSpan: 1040, spread: 0.05, radius: 74, tint: 0xffbf78, scale: 1.02, burnDamage: 1.25, burnDuration: 2200, burnTickInterval: 450 },
      { range: 360, damage: 4, cooldown: 1260, projectiles: 2, speed: 340, lifeSpan: 1080, spread: 0.12, radius: 82, tint: 0xffc988, scale: 1.04, burnDamage: 1.45, burnDuration: 2400, burnTickInterval: 420 },
      { range: 380, damage: 5, cooldown: 1120, projectiles: 2, speed: 350, lifeSpan: 1120, spread: 0.14, radius: 90, tint: 0xffd69b, scale: 1.06, burnDamage: 1.7, burnDuration: 2600, burnTickInterval: 400, groundDuration: 1800, groundTickDamage: 1.2 },
      { range: 400, damage: 6, cooldown: 980, projectiles: 3, speed: 360, lifeSpan: 1160, spread: 0.18, radius: 98, tint: 0xffe5b0, scale: 1.08, burnDamage: 2, burnDuration: 3000, burnTickInterval: 380, groundDuration: 2400, groundTickDamage: 1.8 }
    ]
  },
  chain_thunder: {
    key: 'chain_thunder',
    iconKey: 'chain_thunder_icon',
    projectileKey: 'chain_thunder_projectile',
    name: '連鎖雷擊',
    category: 'weapon',
    type: 'chain',
    maxLevel: 5,
    unlockDescription: '發射一道朝前的雷電能量，命中首個目標後會向附近敵人連鎖彈跳。',
    levels: [
      { range: 320, damage: 2, cooldown: 1500, projectiles: 1, speed: 520, lifeSpan: 760, spread: 0.03, tint: 0xa6f3ff, scale: 1.02, chainCount: 2, chainRange: 250, chainDelay: 65, chainDamageMultiplier: 0.92, branchCount: 0, branchChains: 0 },
      { range: 340, damage: 3, cooldown: 1360, projectiles: 1, speed: 540, lifeSpan: 800, spread: 0.03, tint: 0xb4f7ff, scale: 1.04, chainCount: 3, chainRange: 205, chainDelay: 60, chainDamageMultiplier: 0.93, branchCount: 0, branchChains: 0 },
      { range: 360, damage: 3, cooldown: 1220, projectiles: 2, speed: 560, lifeSpan: 840, spread: 0.1, tint: 0xc4fbff, scale: 1.06, chainCount: 4, chainRange: 220, chainDelay: 55, chainDamageMultiplier: 0.94, branchCount: 0, branchChains: 0 },
      { range: 380, damage: 4, cooldown: 1080, projectiles: 2, speed: 575, lifeSpan: 860, spread: 0.12, tint: 0xd4ffff, scale: 1.08, chainCount: 4, chainRange: 235, chainDelay: 50, chainDamageMultiplier: 0.95, branchCount: 1, branchChains: 2 },
      { range: 400, damage: 5, cooldown: 960, projectiles: 3, speed: 590, lifeSpan: 900, spread: 0.16, tint: 0xe8ffff, scale: 1.1, chainCount: 6, chainRange: 190, chainDelay: 45, chainDamageMultiplier: 0.96, branchCount: 1, branchChains: 3 }
    ]
  },
  gale_boomerang: {
    key: 'gale_boomerang',
    iconKey: 'gale_boomerang_icon',
    projectileKey: 'gale_boomerang_projectile',
    name: '風刃迴旋',
    category: 'weapon',
    type: 'boomerang',
    maxLevel: 5,
    unlockDescription: '投出風刃向前切割，短暫飛行後自動折返；同一路徑可對同一批敵人造成二次命中。',
    levels: [
      { range: 280, damage: 2, cooldown: 1320, projectiles: 1, speed: 340, lifeSpan: 1180, outboundDuration: 470, returnSpeedMultiplier: 1.08, spinSpeed: 0.22, spread: 0.08, pierce: 99, tint: 0xc8fbff, scale: 1.02 },
      { range: 305, damage: 3, cooldown: 1200, projectiles: 1, speed: 355, lifeSpan: 1240, outboundDuration: 500, returnSpeedMultiplier: 1.12, spinSpeed: 0.24, spread: 0.1, pierce: 99, tint: 0xd3ffff, scale: 1.05 },
      { range: 330, damage: 3, cooldown: 1080, projectiles: 2, speed: 370, lifeSpan: 1300, outboundDuration: 520, returnSpeedMultiplier: 1.16, spinSpeed: 0.26, spread: 0.2, pierce: 99, tint: 0xdcffff, scale: 1.08 },
      { range: 350, damage: 4, cooldown: 960, projectiles: 2, speed: 385, lifeSpan: 1340, outboundDuration: 540, returnSpeedMultiplier: 1.2, spinSpeed: 0.28, spread: 0.24, pierce: 99, tint: 0xe7ffff, scale: 1.1, knockbackForce: 120 },
      { range: 370, damage: 5, cooldown: 860, projectiles: 2, speed: 400, lifeSpan: 1400, outboundDuration: 560, returnSpeedMultiplier: 1.24, spinSpeed: 0.3, spread: 0.28, pierce: 99, tint: 0xf2ffff, scale: 1.16, knockbackForce: 160 }
    ]
  },
  nova_bloom: {
    key: 'nova_bloom',
    iconKey: 'nova_bloom_icon',
    projectileKey: 'nova_bloom_projectile',
    name: '新星綻放',
    category: 'weapon',
    type: 'explosive',
    maxLevel: 5,
    unlockDescription: '拋出會爆炸的種子，造成範圍傷害。',
    levels: [
      { range: 300, damage: 3, cooldown: 2100, projectiles: 1, speed: 265, lifeSpan: 1100, spread: 0.04, radius: 60, tint: 0xff9e7a, scale: 0.95 },
      { range: 320, damage: 4, cooldown: 1920, projectiles: 1, speed: 275, lifeSpan: 1140, spread: 0.05, radius: 70, tint: 0xff9e7a, scale: 1 },
      { damage: 4, cooldown: 1760, projectiles: 2, speed: 285, lifeSpan: 1180, spread: 0.12, radius: 78, tint: 0xffb08f, scale: 1.02 },
      { damage: 5, cooldown: 1560, projectiles: 2, speed: 295, lifeSpan: 1220, spread: 0.14, radius: 90, tint: 0xffc2a6, scale: 1.06 },
      { damage: 7, cooldown: 1360, projectiles: 3, speed: 305, lifeSpan: 1260, spread: 0.2, radius: 104, tint: 0xffd7c2, scale: 1.1 }
    ]
  }
};

export const PASSIVE_DEFS = {
  attack_frequency: {
    key: 'attack_frequency',
    iconKey: 'passive_attack_frequency',
    name: '攻速提升',
    category: 'passive',
    maxLevel: 5,
    unlockDescription: '降低所有武器的攻擊間隔。',
    levels: [
      { fireRateMultiplier: 0.9 },
      { fireRateMultiplier: 0.82 },
      { fireRateMultiplier: 0.75 },
      { fireRateMultiplier: 0.69 },
      { fireRateMultiplier: 0.64 }
    ]
  },
  damage_boost: {
    key: 'damage_boost',
    iconKey: 'passive_damage_boost',
    name: '傷害強化',
    category: 'passive',
    maxLevel: 5,
    unlockDescription: '提高所有攻擊造成的傷害。',
    levels: [
      { damageMultiplier: 1.2 },
      { damageMultiplier: 1.38 },
      { damageMultiplier: 1.58 },
      { damageMultiplier: 1.8 },
      { damageMultiplier: 2.05 }
    ]
  },
  projectile_count: {
    key: 'projectile_count',
    iconKey: 'passive_projectile_count',
    name: '投射增幅',
    category: 'passive',
    stackMode: 'cumulative',
    maxLevel: 5,
    unlockDescription: '增加額外投射物與彈道強化效果。',
    levels: [
      { projectileBonus: 1 },
      { cooldownMultiplier: 0.92 },
      { projectileBonus: 1 },
      { projectileSpeedBonus: 0.25 },
      { projectileBonus: 1 }
    ]
  },
  move_speed: {
    key: 'move_speed',
    iconKey: 'passive_move_speed',
    name: '移動速度',
    category: 'passive',
    maxLevel: 5,
    unlockDescription: '提升角色的移動靈活度。',
    levels: [
      { moveSpeedBonus: 20 },
      { moveSpeedBonus: 40 },
      { moveSpeedBonus: 65 },
      { moveSpeedBonus: 90 },
      { moveSpeedBonus: 120 }
    ]
  },
  pickup_radius: {
    key: 'pickup_radius',
    iconKey: 'passive_pickup_radius',
    name: '拾取範圍',
    category: 'passive',
    maxLevel: 5,
    unlockDescription: '擴大經驗與掉落物的吸附距離。',
    levels: [
      { pickupRadiusBonus: 40 },
      { pickupRadiusBonus: 80 },
      { pickupRadiusBonus: 130 },
      { pickupRadiusBonus: 190 },
      { pickupRadiusBonus: 260 }
    ]
  },
  max_health: {
    key: 'max_health',
    iconKey: 'passive_max_health',
    name: '最大生命',
    category: 'passive',
    maxLevel: 5,
    unlockDescription: '提高生命上限並立即回復部分生命。',
    levels: [
      { maxHealthBonus: 1, healOnGain: 1 },
      { maxHealthBonus: 2, healOnGain: 1 },
      { maxHealthBonus: 3, healOnGain: 2 },
      { maxHealthBonus: 4, healOnGain: 2 },
      { maxHealthBonus: 5, healOnGain: 3 }
    ]
  }
};

export function getWeaponLevelData(key, level) {
  return WEAPON_DEFS[key].levels[level - 1];
}

export function getPassiveLevelData(key, level) {
  return PASSIVE_DEFS[key].levels[level - 1];
}