export const ENEMY_TYPES = {
  normal: {
    key: 'normal',
    name: 'Wisp Drifter',
    speed: 68,
    maxHealth: 3,
    experienceValue: 1,
    contactDamage: 1,
    tint: 0xff7b72,
    scale: 1,
    healthClass: 'normal',
    bodyRadiusFactor: 0.44
  },
  fast: {
    key: 'fast',
    name: 'Needle Shade',
    speed: 114,
    maxHealth: 1,
    experienceValue: 1,
    contactDamage: 1,
    tint: 0xffd166,
    scale: 0.82,
    healthClass: 'normal',
    bodyRadiusFactor: 0.42
  },
  tank: {
    key: 'tank',
    name: 'Iron Bloom',
    speed: 40,
    maxHealth: 6,
    experienceValue: 3,
    contactDamage: 2,
    tint: 0xa78bfa,
    scale: 1.28,
    healthClass: 'normal',
    bodyRadiusFactor: 0.46
  },
  elite_ranger: {
    key: 'elite_ranger',
    name: 'Star Sniper',
    speed: 58,
    maxHealth: 14,
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
    attackRange: 300,
    projectileSpeed: 190,
    projectileLifeSpan: 2200,
    projectileDamage: 1,
    projectileBodyRadius: 6,
    projectileTint: 0xffb16f,
    projectileScale: 0.95,
    projectileCooldown: 2300,
    telegraphDuration: 520,
    initialShotDelayMin: 900,
    initialShotDelayMax: 1800
  }
};

export const ENEMY_BALANCE = {
  debugHitboxes: false,
  healthScaling: {
    normal: [
      { time: 0, multiplier: 1 },
      { time: 120, multiplier: 1.1 },
      { time: 240, multiplier: 1.35 },
      { time: 360, multiplier: 1.75 },
      { time: 480, multiplier: 2.2 }
    ],
    elite: [
      { time: 0, multiplier: 1 },
      { time: 120, multiplier: 1.22 },
      { time: 240, multiplier: 1.6 },
      { time: 360, multiplier: 2.05 },
      { time: 480, multiplier: 2.6 }
    ],
    boss: [
      { time: 0, multiplier: 1 },
      { time: 150, multiplier: 1.05 },
      { time: 300, multiplier: 1.22 },
      { time: 420, multiplier: 1.4 },
      { time: 540, multiplier: 1.65 }
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
    speed: 68,
    maxHealth: 180,
    experienceValue: 20,
    contactDamage: 2,
    tint: 0x6dd3ff,
    scale: 2.5,
    hitboxRadiusFactor: 0.28,
    dashSpeed: 340,
    dashChargeDuration: 650,
    dashDuration: 700,
    dashCooldown: 5200,
    shockwaveDelay: 520,
    shockwaveRadius: 108,
    shockwaveDamage: 2,
    bulletBurstCooldown: 3600,
    bulletSpeed: 210,
    bulletLifeSpan: 2600,
    bulletDamage: 1,
    bulletCountPerNode: 2,
    bulletHomingStrength: 0,
    bulletNodeDistance: 38,
    initialDashDelay: 1800,
    initialBurstDelay: 2600,
    spawnProtectionMs: 0
  },
  {
    phase: 2,
    spawnAt: 300,
    warningText: 'WARNING\nBoss Stage 2',
    key: 'boss_phase_2',
    name: '星核暴君 II',
    speed: 74,
    maxHealth: 420,
    experienceValue: 26,
    contactDamage: 2,
    tint: 0x82ddff,
    scale: 3.05,
    hitboxRadiusFactor: 0.275,
    dashSpeed: 470,
    dashChargeDuration: 500,
    dashDuration: 760,
    dashCooldown: 3900,
    shockwaveDelay: 460,
    shockwaveRadius: 132,
    shockwaveDamage: 2,
    bulletBurstCooldown: 2200,
    bulletSpeed: 245,
    bulletLifeSpan: 2900,
    bulletDamage: 1,
    bulletCountPerNode: 4,
    bulletHomingStrength: 0,
    bulletNodeDistance: 44,
    initialDashDelay: 900,
    initialBurstDelay: 1500,
    spawnProtectionMs: 1700
  },
  {
    phase: 3,
    spawnAt: 420,
    warningText: 'WARNING\nBoss Stage 3',
    key: 'boss_phase_3',
    name: '星核暴君 III',
    speed: 76,
    maxHealth: 520,
    experienceValue: 36,
    contactDamage: 3,
    tint: 0x9ae5ff,
    scale: 3.05,
    hitboxRadiusFactor: 0.275,
    dashSpeed: 495,
    dashChargeDuration: 480,
    dashDuration: 760,
    dashCooldown: 3800,
    shockwaveDelay: 400,
    shockwaveRadius: 132,
    shockwaveDamage: 3,
    bulletBurstCooldown: 2400,
    bulletSpeed: 255,
    bulletLifeSpan: 3200,
    bulletDamage: 1,
    bulletCountPerNode: 4,
    bulletHomingStrength: 0.032,
    bulletNodeDistance: 44,
    initialDashDelay: 1000,
    initialBurstDelay: 1600,
    spawnProtectionMs: 1200
  }
];

export const DIFFICULTY_STAGES = [
  {
    stage: 1,
    label: 'Stage 1',
    startsAt: 0,
    spawnDelay: 1450,
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
    startsAt: 30,
    spawnDelay: 1320,
    spawnsPerWave: 1,
    weights: {
      normal: 74,
      fast: 22,
      tank: 4,
      elite_ranger: 0
    }
  },
  {
    stage: 3,
    label: 'Stage 3',
    startsAt: 65,
    spawnDelay: 1180,
    spawnsPerWave: 1,
    weights: {
      normal: 64,
      fast: 25,
      tank: 11,
      elite_ranger: 0
    }
  },
  {
    stage: 4,
    label: 'Stage 4',
    startsAt: 105,
    spawnDelay: 1050,
    spawnsPerWave: 2,
    weights: {
      normal: 54,
      fast: 28,
      tank: 15,
      elite_ranger: 3
    }
  },
  {
    stage: 5,
    label: 'Stage 5',
    startsAt: 150,
    spawnDelay: 930,
    spawnsPerWave: 2,
    weights: {
      normal: 45,
      fast: 29,
      tank: 20,
      elite_ranger: 6
    }
  }
];
