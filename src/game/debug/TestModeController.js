import { BOSS_PHASES, ENEMY_TYPES } from '../data/enemyTypes.js';
import { PASSIVE_DEFS, WEAPON_DEFS } from '../data/arsenal.js';
import { TEST_MODE_EVENTS } from './testModeConfig.js';
import { TEST_PRESETS } from './testPresets.js';

export class TestModeController {
  constructor(scene) {
    this.scene = scene;
  }

  attach() {
    this.scene.game.events.on(TEST_MODE_EVENTS.command, this.handleCommand, this);
  }

  detach() {
    this.scene.game.events.off(TEST_MODE_EVENTS.command, this.handleCommand, this);
  }

  handleCommand(command) {
    if (!command?.type) {
      return;
    }

    const blockReason = this.scene.getTestActionBlockReason?.(command.type);
    if (blockReason) {
      this.scene.game.events.emit(TEST_MODE_EVENTS.feedback, {
        level: 'warning',
        text: blockReason
      });
      return;
    }

    switch (command.type) {
      case 'set-weapon-level':
        if (WEAPON_DEFS[command.key]) {
          this.scene.setWeaponLevel(command.key, command.level);
        }
        break;
      case 'set-passive-level':
        if (PASSIVE_DEFS[command.key]) {
          this.scene.setPassiveLevel(command.key, command.level);
        }
        break;
      case 'spawn-test-enemy':
        if (ENEMY_TYPES[command.enemyType]) {
          this.scene.spawnTestEnemy(command.enemyType, command.count);
        }
        break;
      case 'spawn-boss-phase':
        if (BOSS_PHASES.some((phase) => phase.phase === command.phase)) {
          this.scene.spawnBossPhase(command.phase);
        }
        break;
      case 'clear-test-enemies':
        this.scene.clearTestEnemies();
        break;
      case 'clear-all-enemies':
        this.scene.clearAllEnemies();
        break;
      case 'grant-test-experience':
        this.scene.grantTestExperience(command.amount);
        break;
      case 'grant-test-gold':
        this.scene.grantTestGold(command.amount);
        break;
      case 'reset-test-state':
        this.scene.resetTestState();
        break;
      case 'apply-preset':
        if (TEST_PRESETS[command.name]) {
          this.scene.applyTestPreset(TEST_PRESETS[command.name]);
          this.scene.game.events.emit(TEST_MODE_EVENTS.feedback, {
            level: 'info',
            text: `已套用預設：${TEST_PRESETS[command.name].name}`
          });
        }
        break;
      default:
        break;
    }
  }
}
