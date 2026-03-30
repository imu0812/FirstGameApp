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
  nova_bloom: {
    key: 'nova_bloom',
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