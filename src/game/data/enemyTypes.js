export const ENEMY_TYPES = {
  normal: {
    key: 'normal',
    name: 'Wisp Drifter',
    speed: 70,
    maxHealth: 3,
    experienceValue: 1,
    contactDamage: 1,
    tint: 0xff7b72,
    scale: 1,
    healthClass: 'normal',
    bodyRadiusFactor: 0.44,
    visual: {
      texturePrefix: 'slime',
      walkTexturePrefix: 'slime_walk',
      walkFrameCount: 8,
      walkFrameDuration: 90,
      displaySize: 28,
      deathTexture: 'slime_dead',
      deathFadeDuration: 1700,
      useTint: false
    }
  },
  fast: {
    key: 'fast',
    name: 'Needle Shade',
    speed: 118,
    maxHealth: 2,
    experienceValue: 1,
    contactDamage: 1,
    tint: 0xffd166,
    scale: 0.82,
    healthClass: 'normal',
    bodyRadiusFactor: 0.42,
    visual: {
      texturePrefix: 'bat',
      walkTexturePrefix: 'bat_walk',
      walkFrameCount: 6,
      walkFrameDuration: 80,
      displaySize: 42,
      deathTexture: 'bat_dead',
      deathFadeDuration: 1200,
      useTint: false
    }
  },
  tank: {
    key: 'tank',
    name: 'Iron Bloom',
    speed: 42,
    maxHealth: 7,
    experienceValue: 3,
    contactDamage: 2,
    tint: 0xa78bfa,
    scale: 1.28,
    healthClass: 'normal',
    bodyRadiusFactor: 0.46,
    visual: {
      texturePrefix: 'goblin',
      walkTexturePrefix: 'goblin_walk',
      walkFrameCount: 7,
      walkFrameDuration: 100,
      displaySize: 44,
      deathTexture: 'goblin_dead',
      deathFadeDuration: 1500,
      useTint: false
    }
  },
  elite_ranger: {
    key: 'elite_ranger',
    name: 'Star Sniper',
    speed: 60,
    maxHealth: 18,
    experienceValue: 6,
    contactDamage: 2,
    tint: 0xff9d5c,
    scale: 1.18,
    isElite: true,
    isRanged: true,
    healthClass: 'elite',
    bodyRadiusFactor: 0.45,
    preferredRange: 220,
    minRange: 130,
    attackRange: 320,
    projectileSpeed: 200,
    projectileLifeSpan: 2300,
    projectileDamage: 1,
    projectileBodyRadius: 6,
    projectileTint: 0xffb16f,
    projectileScale: 0.95,
    projectileCooldown: 1950,
    telegraphDuration: 500,
    initialShotDelayMin: 850,
    initialShotDelayMax: 1650
  }
};

export const ENEMY_BALANCE = {
  debugHitboxes: false,
  pauseControl: {
    freezeStageTime: true
  },
  strengthMultipliers: {
    normal: { health: 1.18, speed: 1.04 },
    fast: { health: 1.4, speed: 1.05 },
    tank: { health: 1.32, speed: 1.06 },
    elite_ranger: { health: 1.45, speed: 1.08, projectileCooldown: 0.86 },
    bossPhase: {
      1: { health: 1.08, spawnProtectionMs: 0, damageTakenMultiplier: 1, initialDashDelay: 1650, initialBurstDelay: 2350 },
      2: { health: 1.45, spawnProtectionMs: 2200, damageTakenMultiplier: 0.78, initialDashDelay: 420, initialBurstDelay: 760 },
      3: { health: 1.65, spawnProtectionMs: 2000, damageTakenMultiplier: 0.72, initialDashDelay: 460, initialBurstDelay: 820 }
    }
  },
  healthScaling: {
    normal: [
      { time: 0, multiplier: 1 },
      { time: 120, multiplier: 1.18 },
      { time: 240, multiplier: 1.55 },
      { time: 360, multiplier: 2.05 },
      { time: 480, multiplier: 2.7 }
    ],
    elite: [
      { time: 0, multiplier: 1 },
      { time: 120, multiplier: 1.3 },
      { time: 240, multiplier: 1.82 },
      { time: 360, multiplier: 2.45 },
      { time: 480, multiplier: 3.15 }
    ],
    boss: [
      { time: 0, multiplier: 1 },
      { time: 150, multiplier: 1.14 },
      { time: 300, multiplier: 1.42 },
      { time: 420, multiplier: 1.82 },
      { time: 540, multiplier: 2.18 }
    ]
  },
  eliteRanger: {
    unlockTime: 135,
    requireBossPhase: 1,
    maxActive: 2
  }
};

export const BOSS_PHASES = [
  {
    phase: 1,
    spawnAt: 150,
    warningText: 'WARNING\nBoss Stage 1',
    key: 'boss_phase_1',
    name: '星核暴君 I',
    speed: 70,
    maxHealth: 210,
    experienceValue: 20,
    contactDamage: 2,
    tint: 0x6dd3ff,
    scale: 2.5,
    hitboxRadiusFactor: 0.42,
    dashSpeed: 350,
    dashChargeDuration: 620,
    dashDuration: 700,
    dashCooldown: 5000,
    shockwaveDelay: 500,
    shockwaveRadius: 92,
    shockwaveDamage: 2,
    bulletBurstCooldown: 3400,
    bulletSpeed: 220,
    bulletLifeSpan: 2600,
    bulletDamage: 1,
    bulletCountPerNode: 2,
    bulletHomingStrength: 0,
    bulletNodeDistance: 38,
    initialDashDelay: 1750,
    initialBurstDelay: 2500,
    spawnProtectionMs: 0,
    damageTakenMultiplier: 1
  },
  {
    phase: 2,
    spawnAt: 300,
    warningText: 'WARNING\nBoss Stage 2',
    key: 'boss_phase_2',
    name: '星核暴君 II',
    speed: 80,
    maxHealth: 520,
    experienceValue: 26,
    contactDamage: 2,
    tint: 0x82ddff,
    scale: 3.12,
    hitboxRadiusFactor: 0.42,
    dashSpeed: 520,
    dashChargeDuration: 470,
    dashDuration: 760,
    dashCooldown: 3500,
    shockwaveDelay: 900,
    shockwaveRadius: 324,
    shockwaveChargeDuration: 900,
    shockwaveDamage: 2,
    bulletBurstCooldown: 1750,
    bulletSpeed: 265,
    bulletLifeSpan: 3000,
    bulletDamage: 1,
    bulletCountPerNode: 4,
    bulletHomingStrength: 0,
    bulletNodeDistance: 46,
    initialDashDelay: 520,
    initialBurstDelay: 900,
    spawnProtectionMs: 2200,
    damageTakenMultiplier: 0.78
  },
  {
    phase: 3,
    spawnAt: 420,
    warningText: 'WARNING\nBoss Stage 3',
    key: 'boss_phase_3',
    name: '星核暴君 III',
    speed: 82,
    maxHealth: 620,
    experienceValue: 36,
    contactDamage: 3,
    tint: 0x9ae5ff,
    scale: 3.12,
    hitboxRadiusFactor: 0.42,
    dashSpeed: 540,
    dashChargeDuration: 450,
    dashDuration: 760,
    dashCooldown: 3300,
    shockwaveDelay: 900,
    shockwaveRadius: 324,
    shockwaveChargeDuration: 900,
    shockwaveDamage: 3,
    bulletBurstCooldown: 2000,
    bulletSpeed: 215,
    bulletLifeSpan: 3400,
    bulletDamage: 1,
    bulletCountPerNode: 4,
    bulletHomingStrength: 0,
    bulletHomingTurnRate: 1.5,
    bulletHomingDelayMs: 260,
    bulletHomingDurationMs: 900,
    bulletVolleyCap: 12,
    maxActiveBullets: 16,
    bulletNodeDistance: 46,
    initialDashDelay: 560,
    initialBurstDelay: 920,
    spawnProtectionMs: 2000,
    damageTakenMultiplier: 0.72
  }
];

export const DIFFICULTY_STAGES = [
  {
    stage: 1,
    label: 'Stage 1',
    startsAt: 0,
    spawnDelay: 1400,
    spawnsPerWave: 1,
    weights: {
      normal: 86,
      fast: 14,
      tank: 0,
      elite_ranger: 0
    }
  },
  {
    stage: 2,
    label: 'Stage 2',
    startsAt: 60,
    spawnDelay: 1260,
    spawnsPerWave: 1,
    weights: {
      normal: 72,
      fast: 24,
      tank: 4,
      elite_ranger: 0
    }
  },
  {
    stage: 3,
    label: 'Stage 3',
    startsAt: 95,
    spawnDelay: 1110,
    spawnsPerWave: 1,
    weights: {
      normal: 61,
      fast: 27,
      tank: 12,
      elite_ranger: 0
    }
  },
  {
    stage: 4,
    label: 'Stage 4',
    startsAt: 135,
    spawnDelay: 960,
    spawnsPerWave: 2,
    weights: {
      normal: 50,
      fast: 27,
      tank: 18,
      elite_ranger: 5
    }
  },
  {
    stage: 5,
    label: 'Stage 5',
    startsAt: 180,
    spawnDelay: 840,
    spawnsPerWave: 2,
    weights: {
      normal: 40,
      fast: 28,
      tank: 24,
      elite_ranger: 8
    }
  }
];
