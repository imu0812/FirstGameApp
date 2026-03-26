export const ENEMY_TYPES = {
  normal: {
    key: 'normal',
    name: 'Wisp Drifter',
    speed: 72,
    maxHealth: 3,
    experienceValue: 1,
    contactDamage: 1,
    tint: 0xff7b72,
    scale: 1
  },
  fast: {
    key: 'fast',
    name: 'Needle Shade',
    speed: 122,
    maxHealth: 1,
    experienceValue: 1,
    contactDamage: 1,
    tint: 0xffd166,
    scale: 0.82
  },
  tank: {
    key: 'tank',
    name: 'Iron Bloom',
    speed: 44,
    maxHealth: 6,
    experienceValue: 3,
    contactDamage: 2,
    tint: 0xa78bfa,
    scale: 1.28
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
    bulletNodeDistance: 38
  },
  {
    phase: 2,
    spawnAt: 300,
    warningText: 'WARNING\nBoss Stage 2',
    key: 'boss_phase_2',
    name: '星核暴君 II',
    speed: 72,
    maxHealth: 250,
    experienceValue: 26,
    contactDamage: 2,
    tint: 0x82ddff,
    scale: 2.9,
    dashSpeed: 420,
    dashChargeDuration: 560,
    dashDuration: 720,
    dashCooldown: 4600,
    shockwaveDelay: 480,
    shockwaveRadius: 126,
    shockwaveDamage: 2,
    bulletBurstCooldown: 3000,
    bulletSpeed: 235,
    bulletLifeSpan: 2800,
    bulletDamage: 1,
    bulletCountPerNode: 3,
    bulletHomingStrength: 0,
    bulletNodeDistance: 42
  },
  {
    phase: 3,
    spawnAt: 420,
    warningText: 'WARNING\nBoss Stage 3',
    key: 'boss_phase_3',
    name: '星核暴君 III',
    speed: 74,
    maxHealth: 320,
    experienceValue: 36,
    contactDamage: 3,
    tint: 0x9ae5ff,
    scale: 2.9,
    dashSpeed: 450,
    dashChargeDuration: 520,
    dashDuration: 760,
    dashCooldown: 4200,
    shockwaveDelay: 420,
    shockwaveRadius: 126,
    shockwaveDamage: 3,
    bulletBurstCooldown: 2800,
    bulletSpeed: 245,
    bulletLifeSpan: 3200,
    bulletDamage: 1,
    bulletCountPerNode: 3,
    bulletHomingStrength: 0.032,
    bulletNodeDistance: 42
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
      normal: 85,
      fast: 15,
      tank: 0
    }
  },
  {
    stage: 2,
    label: 'Stage 2',
    startsAt: 30,
    spawnDelay: 1280,
    spawnsPerWave: 1,
    weights: {
      normal: 72,
      fast: 24,
      tank: 4
    }
  },
  {
    stage: 3,
    label: 'Stage 3',
    startsAt: 65,
    spawnDelay: 1150,
    spawnsPerWave: 1,
    weights: {
      normal: 62,
      fast: 26,
      tank: 12
    }
  },
  {
    stage: 4,
    label: 'Stage 4',
    startsAt: 105,
    spawnDelay: 1020,
    spawnsPerWave: 2,
    weights: {
      normal: 52,
      fast: 30,
      tank: 18
    }
  },
  {
    stage: 5,
    label: 'Stage 5',
    startsAt: 150,
    spawnDelay: 900,
    spawnsPerWave: 2,
    weights: {
      normal: 42,
      fast: 34,
      tank: 24
    }
  }
];

