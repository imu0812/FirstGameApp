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
  frost_totem: {
    key: 'frost_totem',
    iconKey: 'frost_totem_icon',
    projectileKey: 'frost_totem_body',
    name: '冰晶圖騰',
    category: 'weapon',
    type: 'summon_totem',
    maxLevel: 5,
    unlockDescription: '在場上豎立冰晶圖騰，週期性脈衝減速敵人，並可額外發射冰晶碎片。',
    levels: [
      { cooldown: 7200, damage: 0, summonCount: 1, summonDuration: 8000, pulseInterval: 1600, pulseRadius: 72, slowMultiplier: 0.8, slowDuration: 1700, freezeBuildup: 32, freezeDuration: 420, tint: 0xa9efff, scale: 0.96, pulseScale: 1.1, shardCount: 0, shardDamage: 0, shardSpeed: 350, shardLifeSpan: 880, shardTexture: 'frost_totem_shard_placeholder', shardTint: 0xd7f9ff, shardScale: 0.74, shardBodyRadius: 6, shardRange: 240 },
      { cooldown: 7000, damage: 0, summonCount: 1, summonDuration: 8000, pulseInterval: 1600, pulseRadius: 92, slowMultiplier: 0.76, slowDuration: 1800, freezeBuildup: 40, freezeDuration: 520, tint: 0xb8f4ff, scale: 0.98, pulseScale: 1.22, shardCount: 0, shardDamage: 0, shardSpeed: 360, shardLifeSpan: 920, shardTexture: 'frost_totem_shard_placeholder', shardTint: 0xe0fbff, shardScale: 0.76, shardBodyRadius: 6, shardRange: 255 },
      { cooldown: 6600, damage: 1, summonCount: 1, summonDuration: 8200, pulseInterval: 1600, pulseRadius: 92, slowMultiplier: 0.76, slowDuration: 1900, freezeBuildup: 50, freezeDuration: 620, tint: 0xc6f8ff, scale: 1, pulseScale: 1.28, shardCount: 3, shardDamage: 2, shardSpeed: 380, shardLifeSpan: 980, shardTexture: 'frost_totem_shard_placeholder', shardTint: 0xe6fdff, shardScale: 0.8, shardBodyRadius: 6, shardRange: 270 },
      { cooldown: 6200, damage: 1, summonCount: 1, summonDuration: 8400, pulseInterval: 1600, pulseRadius: 96, slowMultiplier: 0.72, slowDuration: 2000, freezeBuildup: 72, freezeDuration: 980, tint: 0xd6fbff, scale: 1.02, pulseScale: 1.34, shardCount: 4, shardDamage: 2.5, shardSpeed: 420, shardLifeSpan: 1080, shardTexture: 'frost_totem_shard_placeholder', shardTint: 0xf2ffff, shardScale: 0.84, shardBodyRadius: 6, shardRange: 285 },
      { cooldown: 6200, damage: 1.5, summonCount: 2, summonDuration: 8600, pulseInterval: 1600, pulseRadius: 100, slowMultiplier: 0.72, slowDuration: 2200, freezeBuildup: 84, freezeDuration: 1100, tint: 0xebffff, scale: 1.04, pulseScale: 1.4, shardCount: 4, shardDamage: 3, shardSpeed: 440, shardLifeSpan: 1140, shardTexture: 'frost_totem_shard_placeholder', shardTint: 0xffffff, shardScale: 0.88, shardBodyRadius: 6, shardRange: 300 }
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
      { range: 310, damage: 2, cooldown: 1320, projectiles: 1, speed: 340, lifeSpan: 1180, outboundDuration: 470, returnSpeedMultiplier: 1.08, spinSpeed: 0.22, spread: 0.08, pierce: 99, tint: 0xc8fbff, scale: 1.02 },
      { range: 335, damage: 3, cooldown: 1200, projectiles: 1, speed: 355, lifeSpan: 1240, outboundDuration: 500, returnSpeedMultiplier: 1.12, spinSpeed: 0.24, spread: 0.1, pierce: 99, tint: 0xd3ffff, scale: 1.05 },
      { range: 360, damage: 3, cooldown: 1080, projectiles: 2, speed: 370, lifeSpan: 1300, outboundDuration: 520, returnSpeedMultiplier: 1.16, spinSpeed: 0.26, spread: 0.2, pierce: 99, tint: 0xdcffff, scale: 1.08 },
      { range: 380, damage: 4, cooldown: 960, projectiles: 2, speed: 385, lifeSpan: 1340, outboundDuration: 540, returnSpeedMultiplier: 1.2, spinSpeed: 0.28, spread: 0.24, pierce: 99, tint: 0xe7ffff, scale: 1.1, knockbackForce: 120 },
      { range: 410, damage: 5, cooldown: 860, projectiles: 2, speed: 400, lifeSpan: 1400, outboundDuration: 560, returnSpeedMultiplier: 1.24, spinSpeed: 0.3, spread: 0.28, pierce: 99, tint: 0xf2ffff, scale: 1.16, knockbackForce: 160 }
    ]
  },
  vine_turret: {
    key: 'vine_turret',
    iconKey: 'vine_turret_icon',
    projectileKey: 'vine_turret_projectile',
    name: '毒藤砲台',
    category: 'weapon',
    type: 'summon_turret',
    maxLevel: 5,
    unlockDescription: '在玩家附近召喚毒藤砲台，固定節奏朝前發射毒種子，擅長佔點與補持續火力。',
    levels: [
      { range: 320, damage: 3, cooldown: 980, summonCount: 1, summonDuration: 22000, projectileSpeed: 284, projectileLifeSpan: 1300, projectileScale: 1.05, tint: 0xc3ffd2, projectileTint: 0x9cff85, scale: 0.9, poisonDamage: 0.6, poisonDuration: 2200, poisonTickInterval: 600, corrosionBonus: 0.08, corrosionDuration: 2200, bossPoisonMultiplier: 0.7 },
      { range: 338, damage: 4, cooldown: 860, summonCount: 2, summonDuration: 23500, projectileSpeed: 296, projectileLifeSpan: 1360, projectileScale: 1.08, tint: 0xcfffdc, projectileTint: 0x9eff7f, scale: 0.93, poisonDamage: 0.9, poisonDuration: 2400, poisonTickInterval: 560, corrosionBonus: 0.1, corrosionDuration: 2400, bossPoisonMultiplier: 0.7 },
      { range: 352, damage: 4, cooldown: 790, summonCount: 2, summonDuration: 24800, projectileSpeed: 308, projectileLifeSpan: 1400, projectileScale: 1.1, tint: 0xd8ffe4, projectileTint: 0xa7ff86, scale: 0.95, poisonDamage: 1.6, poisonDuration: 2800, poisonTickInterval: 520, corrosionBonus: 0.12, corrosionDuration: 2800, bossPoisonMultiplier: 0.7 },
      { range: 368, damage: 5, cooldown: 720, summonCount: 3, summonDuration: 26200, projectileSpeed: 320, projectileLifeSpan: 1440, projectileScale: 1.12, tint: 0xe2ffeb, projectileTint: 0xb1ff8f, scale: 0.98, poisonDamage: 2.1, poisonDuration: 3200, poisonTickInterval: 500, corrosionBonus: 0.15, corrosionDuration: 3200, bossPoisonMultiplier: 0.7 },
      { range: 384, damage: 6, cooldown: 660, summonCount: 3, summonDuration: 27800, projectileSpeed: 334, projectileLifeSpan: 1500, projectileScale: 1.16, tint: 0xeefff2, projectileTint: 0xbaff96, scale: 1.02, poisonDamage: 2.8, poisonDuration: 3600, poisonTickInterval: 460, corrosionBonus: 0.18, corrosionDuration: 3600, bossPoisonMultiplier: 0.7, splashRadius: 64, splashDamage: 4.5, rootDuration: 1000 }
    ]
  },
  earthspike_line: {
    key: 'earthspike_line',
    iconKey: 'earthspike_line_icon',
    projectileKey: 'earthspike_line_projectile',
    name: '地脈尖刺',
    category: 'weapon',
    type: 'ground_line',
    maxLevel: 5,
    unlockDescription: '地面依序冒出尖刺，形成直線封鎖區，適合卡窄道與打衝臉怪群。',
    levels: [
      { segments: 4, damage: 3, width: 58, range: 220, cooldown: 3760, telegraphLeadTime: 260, segmentDelay: 190, spikeDuration: 360, hitCooldown: 220, aftershock: false },
      { segments: 5, damage: 3, width: 60, range: 250, cooldown: 3640, telegraphLeadTime: 250, segmentDelay: 182, spikeDuration: 370, hitCooldown: 220, aftershock: false },
      { segments: 5, damage: 4, width: 66, range: 270, cooldown: 3500, telegraphLeadTime: 240, segmentDelay: 174, spikeDuration: 380, hitCooldown: 210, aftershock: false },
      { segments: 6, damage: 4, width: 68, range: 290, cooldown: 3380, telegraphLeadTime: 230, segmentDelay: 168, spikeDuration: 400, hitCooldown: 210, aftershock: true, aftershockDelay: 320, aftershockDamageMultiplier: 0.55 },
      { segments: 7, damage: 6, width: 72, range: 340, cooldown: 3260, telegraphLeadTime: 220, segmentDelay: 160, spikeDuration: 420, hitCooldown: 200, aftershock: true, aftershockDelay: 300, aftershockDamageMultiplier: 0.65, finisherBurst: true }
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
