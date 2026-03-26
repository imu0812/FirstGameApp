export const REWARD_TYPES = {
  potion: {
    key: 'potion',
    name: '藥水瓶',
    texture: 'reward_potion',
    weight: 1,
    tint: 0xff7f96
  },
  gold: {
    key: 'gold',
    name: '金幣',
    texture: 'reward_gold',
    weight: 1,
    tint: 0xffd86b
  },
  magnet: {
    key: 'magnet',
    name: 'U 型磁鐵',
    texture: 'reward_magnet',
    weight: 1,
    tint: 0x8ee8ff
  }
};

const DEFAULT_REWARD_POOL = Object.values(REWARD_TYPES).map((reward) => ({
  key: reward.key,
  weight: reward.weight
}));

export const CHEST_TYPES = {
  bronze: {
    key: 'bronze',
    name: '銅寶箱',
    texture: 'chest_bronze',
    scale: 1,
    hitsToOpen: 1,
    rewardPool: DEFAULT_REWARD_POOL,
    rewards: {
      potion: { heal: 1, shieldOnFull: 1 },
      gold: { base: 12, timeScale: 0.14, stageScale: 3 },
      magnet: { radius: 220 }
    },
    openFx: { color: 0xd8a85a, radius: 42, rewardScale: 1 }
  },
  silver: {
    key: 'silver',
    name: '銀寶箱',
    texture: 'chest_silver',
    scale: 1.04,
    hitsToOpen: 2,
    rewardPool: DEFAULT_REWARD_POOL,
    rewards: {
      potion: { heal: 3, shieldOnFull: 2 },
      gold: { base: 26, timeScale: 0.22, stageScale: 5 },
      magnet: { radius: 380 }
    },
    openFx: { color: 0xdcecff, radius: 56, rewardScale: 1.1 }
  },
  gold: {
    key: 'gold',
    name: '金寶箱',
    texture: 'chest_gold',
    scale: 1.1,
    hitsToOpen: 3,
    rewardPool: DEFAULT_REWARD_POOL,
    rewards: {
      potion: { fullHeal: true, shieldOnFull: 4 },
      gold: { base: 54, timeScale: 0.34, stageScale: 9 },
      magnet: { radius: Number.POSITIVE_INFINITY }
    },
    openFx: { color: 0xffde72, radius: 80, rewardScale: 1.28 }
  }
};

export const CHEST_SPAWN_CONFIG = {
  maxActive: 3,
  distanceMin: 220,
  distanceMax: 420,
  baseDelay: 28000,
  minDelay: 16000
};

export function pickWeightedKey(entries, randomValue = Math.random()) {
  const totalWeight = entries.reduce((sum, entry) => sum + entry.weight, 0);
  let threshold = randomValue * totalWeight;

  for (const entry of entries) {
    threshold -= entry.weight;

    if (threshold <= 0) {
      return entry.key;
    }
  }

  return entries[entries.length - 1].key;
}

export function getChestTypeKey(elapsedSeconds, difficultyStage) {
  const entries = [
    { key: 'bronze', weight: 58 },
    { key: 'silver', weight: 30 },
    { key: 'gold', weight: 12 }
  ];

  if (elapsedSeconds >= 180 || difficultyStage >= 5) {
    entries.find((entry) => entry.key === 'gold').weight += 10;
    entries.find((entry) => entry.key === 'bronze').weight -= 8;
  } else if (elapsedSeconds >= 90 || difficultyStage >= 3) {
    entries.find((entry) => entry.key === 'silver').weight += 8;
    entries.find((entry) => entry.key === 'bronze').weight -= 6;
  }

  return pickWeightedKey(entries);
}

export function getChestSpawnDelay(elapsedSeconds, difficultyStage) {
  const timeReduction = Math.min(9000, Math.floor(elapsedSeconds / 45) * 2200);
  const stageReduction = Math.min(3000, Math.max(0, difficultyStage - 1) * 450);
  return Math.max(CHEST_SPAWN_CONFIG.minDelay, CHEST_SPAWN_CONFIG.baseDelay - timeReduction - stageReduction);
}

export function getChestSpawnCap(elapsedSeconds) {
  if (elapsedSeconds >= 210) {
    return 3;
  }

  if (elapsedSeconds >= 90) {
    return 2;
  }

  return 1;
}

export function getRewardKey(chestTypeKey) {
  return pickWeightedKey(CHEST_TYPES[chestTypeKey].rewardPool);
}

export function getGoldRewardAmount(chestTypeKey, elapsedSeconds, difficultyStage) {
  const reward = CHEST_TYPES[chestTypeKey].rewards.gold;
  return Math.max(
    reward.base,
    Math.round(reward.base + elapsedSeconds * reward.timeScale + difficultyStage * reward.stageScale)
  );
}

