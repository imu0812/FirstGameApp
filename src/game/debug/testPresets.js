export const TEST_PRESETS = {
  weapon_arc_bolt_max: {
    name: '單武器滿等 Arc Bolt',
    description: '用 Arc Bolt 滿等驗證單武器表現。',
    resetBeforeApply: true,
    weapons: {
      arc_bolt: 5
    }
  },
  passive_damage_boost_max: {
    name: '單被動滿等增傷',
    description: '用傷害加成滿等驗證單被動效果。',
    resetBeforeApply: true,
    passives: {
      damage_boost: 5
    }
  },
  enemy_swarm_fast: {
    name: '高速怪群壓力測試',
    description: '生成一批高速怪物，進行小怪壓力測試。',
    clearTestEnemiesBeforeApply: true,
    spawnEnemy: {
      type: 'fast',
      count: 20
    }
  },
  boss_phase_2_check: {
    name: 'Boss 第 2 階段驗證',
    description: '在隔離情境下驗證 Boss 第 2 階段。',
    clearTestEnemiesBeforeApply: true,
    bossPhase: 2
  },
  clean_reset: {
    name: '清場重置',
    description: '清除測試生成物並將場景重置為乾淨狀態。',
    resetBeforeApply: true
  },
  restore_default_loadout: {
    name: '還原預設配置',
    description: '重置為開局預設配置與乾淨場景。',
    resetBeforeApply: true,
    weapons: {
      arc_bolt: 1,
      halo_disc: 0,
      comet_lance: 0,
      flame_orb: 0,
      chain_thunder: 0,
      gale_boomerang: 0,
      vine_turret: 0,
      earthspike_line: 0,
      nova_bloom: 0
    },
    passives: {
      attack_frequency: 0,
      damage_boost: 0,
      projectile_count: 0,
      move_speed: 0,
      pickup_radius: 0,
      max_health: 0
    }
  },
  high_level_smoke: {
    name: '高等級快速驗證',
    description: '快速套用高等級武器、被動、經驗值與金幣進行驗證。',
    resetBeforeApply: true,
    weapons: {
      arc_bolt: 5,
      halo_disc: 4,
      comet_lance: 4
    },
    passives: {
      attack_frequency: 4,
      damage_boost: 4,
      projectile_count: 3,
      move_speed: 3
    },
    grantExp: 1200,
    grantGold: 1000,
    spawnEnemy: {
      type: 'tank',
      count: 5
    }
  }
};

export function getTestPresetEntries() {
  return Object.entries(TEST_PRESETS).map(([key, preset]) => ({
    key,
    ...preset
  }));
}
