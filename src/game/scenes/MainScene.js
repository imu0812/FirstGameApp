import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';
import { Bullet } from '../entities/Bullet.js';
import { BossProjectile } from '../entities/BossProjectile.js';
import { ExperienceGem } from '../entities/ExperienceGem.js';
import { OrbitingBlade } from '../entities/OrbitingBlade.js';
import { Chest } from '../entities/Chest.js';
import { ChestRewardDrop } from '../entities/ChestRewardDrop.js';
import { BOSS_PHASES, DIFFICULTY_STAGES, ENEMY_BALANCE, ENEMY_TYPES } from '../data/enemyTypes.js';
import {
  PASSIVE_DEFS,
  WEAPON_DEFS,
  getPassiveLevelData,
  getWeaponLevelData
} from '../data/arsenal.js';
import { CHEST_SPAWN_CONFIG, CHEST_TYPES, REWARD_TYPES, getChestSpawnCap, getChestSpawnDelay, getChestTypeKey, getGoldRewardAmount, getRewardKey } from '../data/chests.js';

export class MainScene extends Phaser.Scene {
  constructor() {
    super('MainScene');
  }

  create() {
    this.worldSize = { width: 2200, height: 2200 };
    this.basePlayerStats = {
      moveSpeed: 220,
      maxHealth: 6,
      pickupRadius: 0,
      gemPullSpeed: 360
    };

    this.kills = 0;
    this.survivalStartTime = this.time.now;
    this.level = 1;
    this.experience = 0;
    this.experienceToNextLevel = 4;
    this.pendingLevelUps = 0;
    this.isLevelingUp = false;
    this.isGameOver = false;
    this.isPaused = false;
    this.difficultyStages = DIFFICULTY_STAGES;
    this.currentDifficultyStage = this.difficultyStages[0];
    this.knockbackVector = new Phaser.Math.Vector2(0, 0);
    this.lastStatsEmitAt = -100;
    this.statsEmitInterval = 100;
    this.currentUpgradeChoices = [];
    this.weaponTimers = {};
    this.ownedWeapons = {
      arc_bolt: 1
    };
    this.passiveLevels = {};
    this.bossPhases = BOSS_PHASES;
    this.currentBossPhase = 0;
    this.bossSpawnFlags = Object.fromEntries(this.bossPhases.map((phase) => [phase.phase, false]));
    this.bossAlive = false;
    this.stageCleared = false;
    this.pendingBossPhase = null;
    this.bossWarningEvent = null;
    this.gold = 0;
    this.bossSpawnGraceDuration = 6000;
    this.spawnSuppressionStartedAt = null;
    this.totalSpawnSuppressedMs = 0;
    this.normalSpawnResumeAt = 0;
    this.lastChestReward = null;
    this.totalPausedMs = 0;
    this.pauseStartedAt = null;


    this.createArena();

    const spawnX = 0;
    const spawnY = 0;

    this.player = new Player(this, spawnX, spawnY);

    this.createPlayerStatusBar();
    this.recalculateDerivedStats();
    this.bossDashTelegraph = this.add.graphics();
    this.updatePlayerStatusBar();
    this.bossDashTelegraph.setDepth(2);
    this.bossDashTelegraph.setVisible(false);
    this.debugHitboxesEnabled = Boolean(ENEMY_BALANCE.debugHitboxes);
    this.debugHitboxGraphics = this.add.graphics();
    this.debugHitboxGraphics.setDepth(18);
    this.debugHitboxGraphics.setVisible(this.debugHitboxesEnabled);

    this.enemies = this.physics.add.group({
      classType: Enemy,
      maxSize: 220
    });
    this.projectiles = this.physics.add.group({
      classType: Bullet,
      maxSize: 180
    });
    this.experienceGems = this.add.group({
      classType: ExperienceGem,
      maxSize: 420
    });
    this.orbitBlades = this.physics.add.group({
      classType: OrbitingBlade,
      maxSize: 18
    });
    this.chests = this.physics.add.group({
      classType: Chest,
      maxSize: 8
    });
    this.rewardDrops = this.add.group({
      classType: ChestRewardDrop,
      maxSize: 24
    });
    this.magnetizedGems = new Set();
    this.bosses = this.physics.add.group({
      classType: Boss,
      maxSize: 1
    });
    this.bossProjectiles = this.physics.add.group({
      classType: BossProjectile,
      maxSize: 80
    });
    this.gemGrid = new Map();
    this.gemGridCellSize = 96;

    this.physics.add.overlap(
      this.projectiles,
      this.enemies,
      this.handleProjectileHitEnemy,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.orbitBlades,
      this.enemies,
      this.handleOrbitBladeHitEnemy,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.projectiles,
      this.bosses,
      this.handleProjectileHitEnemy,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.orbitBlades,
      this.bosses,
      this.handleOrbitBladeHitEnemy,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.enemies,
      this.handleEnemyHitPlayer,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.bosses,
      this.handleEnemyHitPlayer,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.player,
      this.bossProjectiles,
      this.handleBossProjectileHitPlayer,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.projectiles,
      this.chests,
      this.handleProjectileHitChest,
      undefined,
      this
    );

    this.physics.add.overlap(
      this.orbitBlades,
      this.chests,
      this.handleOrbitBladeHitChest,
      undefined,
      this
    );

    this.game.events.on('virtual-joystick-move', this.handleVirtualJoystick, this);
    this.game.events.on('toggle-pause', this.togglePause, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.refreshSpawnTimer();
    this.refreshChestTimer();
    this.syncWeaponSystems();
    this.emitStats(true);
  }

  update() {
    if (this.isLevelingUp || this.isGameOver || this.isPaused || this.stageCleared) {
      return;
    }

    this.player.update();
    this.updatePlayerStatusBar();
    this.updateArenaBackground();

    this.enemies.children.iterate((enemy) => {
      if (enemy?.active) {
        enemy.update(this.player, this.time.now);
      }
    });

    this.bosses.children.iterate((boss) => {
      if (boss?.active) {
        boss.update(this.player, this.time.now);
      }
    });

    this.updateOrbitWeapons();
    this.updateMagnetizedGems();
    this.updateGemAttraction();
    this.updateRewardDrops();
    if (this.pendingLevelUps > 0 && !this.isLevelingUp && !this.shouldDelayLevelUpMenu()) {
      this.openLevelUpMenu();
      return;
    }
    this.updateSpawnSuppressionState();
    this.updateDifficulty();
    this.updateBossSchedule();
    this.updateDebugHitboxes();
    this.emitStats();
  }

  shutdown() {
    this.game.events.off('virtual-joystick-move', this.handleVirtualJoystick, this);
    this.game.events.off('toggle-pause', this.togglePause, this);
    this.scale.off('resize', this.handleResize, this);
    if (this.spawnChestEvent) {
      this.spawnChestEvent.remove(false);
    }
    this.bossWarningEvent?.remove(false);
    this.hideBossDashTelegraph();
    this.debugHitboxGraphics?.clear();
    this.debugHitboxGraphics?.destroy();
  }


  togglePause(forceState) {
    if (this.isGameOver || this.isLevelingUp) {
      return;
    }

    const nextState = typeof forceState === 'boolean' ? forceState : !this.isPaused;

    if (nextState === this.isPaused) {
      return;
    }

    this.isPaused = nextState;

    if (this.isPaused) {
      this.pauseStartedAt = this.time.now;
      this.time.timeScale = 0;
      this.physics.world.pause();
      this.player.setVelocity(0, 0);
      this.enemies.children.iterate((enemy) => {
        if (enemy?.active) {
          enemy.setVelocity(0, 0);
        }
      });
      this.bosses.children.iterate((boss) => {
        if (boss?.active) {
          boss.setVelocity(0, 0);
        }
      });
    } else {
      if (this.pauseStartedAt !== null) {
        this.totalPausedMs += this.time.now - this.pauseStartedAt;
        this.pauseStartedAt = null;
      }
      this.time.timeScale = 1;
      this.physics.world.resume();
    }

    this.game.events.emit('pause-state-changed', { paused: this.isPaused });
    this.emitStats(true);
  }
  handleVirtualJoystick(input) {
    if (!this.player) {
      return;
    }

    this.player.setVirtualInput(input.x, input.y);
  }
  createPlayerStatusBar() {
    this.playerBarWidth = 46;
    this.playerBarInnerWidth = this.playerBarWidth - 4;
    this.playerBarContainer = this.add.container(this.player.x, this.player.y - 30);
    this.playerBarContainer.setDepth(12);

    this.playerBarBackground = this.add.rectangle(0, 0, this.playerBarWidth, 10, 0x071018, 0.76).setOrigin(0.5);
    this.playerBarHpFill = this.add.rectangle(-this.playerBarInnerWidth / 2, 1.5, this.playerBarInnerWidth, 4.5, 0xff6d72, 1).setOrigin(0, 0.5);
    this.playerBarShieldGlow = this.add.rectangle(0, -2.5, this.playerBarInnerWidth, 3, 0x7ad9ff, 0.18).setOrigin(0.5);
    this.playerBarShieldFill = this.add.rectangle(-this.playerBarInnerWidth / 2, -2.5, this.playerBarInnerWidth, 2.5, 0x79d9ff, 1).setOrigin(0, 0.5);
    this.playerBarFrame = this.add.rectangle(0, 0, this.playerBarWidth, 10).setOrigin(0.5).setStrokeStyle(1, 0xf4fbff, 0.45).setFillStyle(0x000000, 0);

    this.playerBarContainer.add([
      this.playerBarBackground,
      this.playerBarHpFill,
      this.playerBarShieldGlow,
      this.playerBarShieldFill,
      this.playerBarFrame
    ]);
  }

  updatePlayerStatusBar() {
    if (!this.playerBarContainer || !this.player?.active) {
      return;
    }

    this.playerBarContainer.setPosition(this.player.x, this.player.y - 30);

    const hpRatio = Phaser.Math.Clamp(this.player.health / Math.max(1, this.player.maxHealth), 0, 1);
    const shieldRatio = Phaser.Math.Clamp(this.player.shield / Math.max(1, this.player.maxHealth), 0, 1);

    this.playerBarHpFill.width = this.playerBarInnerWidth * hpRatio;
    this.playerBarShieldFill.width = this.playerBarInnerWidth * shieldRatio;

    const hasShield = this.player.shield > 0;
    this.playerBarShieldFill.setVisible(hasShield);
    this.playerBarShieldGlow.setVisible(hasShield);

    if (hasShield) {
      this.playerBarShieldGlow.setAlpha(0.12 + (Math.sin(this.time.now * 0.015) + 1) * 0.06);
    }
  }

  handlePlayerDamageFeedback() {
    const report = this.player?.lastDamageReport;

    if (!report || !this.playerBarContainer) {
      return;
    }

    if (report.hadShield) {
      this.tweens.add({
        targets: this.playerBarShieldFill,
        alpha: 0.25,
        duration: 70,
        yoyo: true,
        repeat: 1
      });

      this.tweens.add({
        targets: this.playerBarShieldGlow,
        alpha: 0.38,
        duration: 120,
        yoyo: true
      });

      if (report.shieldBroken) {
        for (let index = 0; index < 6; index += 1) {
          const shard = this.add.circle(
            this.player.x + Phaser.Math.Between(-6, 6),
            this.player.y - 30 + Phaser.Math.Between(-4, 4),
            Phaser.Math.Between(1, 2),
            0x9ce6ff,
            0.9
          );
          shard.setDepth(13);
          this.tweens.add({
            targets: shard,
            x: shard.x + Phaser.Math.Between(-18, 18),
            y: shard.y + Phaser.Math.Between(-14, 10),
            alpha: 0,
            scaleX: 0.2,
            scaleY: 0.2,
            duration: 260,
            ease: 'Quad.Out',
            onComplete: () => shard.destroy()
          });
        }
      }
    }

    this.updatePlayerStatusBar();
    this.player.lastDamageReport = null;
  }


  createArena() {
    if (!this.textures.exists('arena_floor_tile')) {
      const floorGraphics = this.make.graphics({ x: 0, y: 0, add: false });
      floorGraphics.fillStyle(0x0b1b29, 1);
      floorGraphics.fillRect(0, 0, 160, 160);
      floorGraphics.lineStyle(1, 0x16384f, 0.65);

      for (let offset = 0; offset <= 160; offset += 80) {
        floorGraphics.lineBetween(offset, 0, offset, 160);
        floorGraphics.lineBetween(0, offset, 160, offset);
      }

      floorGraphics.generateTexture('arena_floor_tile', 160, 160);
      floorGraphics.destroy();
    }

    if (!this.textures.exists('arena_star_tile')) {
      const starGraphics = this.make.graphics({ x: 0, y: 0, add: false });
      starGraphics.fillStyle(0x000000, 0);
      starGraphics.fillRect(0, 0, 320, 320);
      starGraphics.fillStyle(0x12324a, 0.8);

      for (let i = 0; i < 14; i += 1) {
        const starX = Phaser.Math.Between(18, 302);
        const starY = Phaser.Math.Between(18, 302);
        const radius = Phaser.Math.Between(2, 5);
        starGraphics.fillCircle(starX, starY, radius);
      }

      starGraphics.generateTexture('arena_star_tile', 320, 320);
      starGraphics.destroy();
    }

    const { width, height } = this.scale.gameSize;
    this.arenaBackground = this.add.tileSprite(0, 0, width, height, 'arena_floor_tile');
    this.arenaBackground.setOrigin(0);
    this.arenaBackground.setScrollFactor(0);
    this.arenaBackground.setDepth(-20);

    this.arenaStars = this.add.tileSprite(0, 0, width, height, 'arena_star_tile');
    this.arenaStars.setOrigin(0);
    this.arenaStars.setScrollFactor(0);
    this.arenaStars.setDepth(-19);
    this.arenaStars.setAlpha(0.95);

    this.scale.on('resize', this.handleResize, this);
    this.handleResize(this.scale.gameSize);
    this.updateArenaBackground();
  }

  handleResize(gameSize) {
    if (!gameSize) {
      return;
    }

    if (this.arenaBackground) {
      this.arenaBackground.setSize(gameSize.width, gameSize.height);
      this.arenaBackground.setDisplaySize(gameSize.width, gameSize.height);
    }

    if (this.arenaStars) {
      this.arenaStars.setSize(gameSize.width, gameSize.height);
      this.arenaStars.setDisplaySize(gameSize.width, gameSize.height);
    }
  }

  updateArenaBackground() {
    if (!this.arenaBackground || !this.arenaStars) {
      return;
    }

    const camera = this.cameras.main;
    this.arenaBackground.tilePositionX = camera.scrollX;
    this.arenaBackground.tilePositionY = camera.scrollY;
    this.arenaStars.tilePositionX = camera.scrollX * 0.35;
    this.arenaStars.tilePositionY = camera.scrollY * 0.35;
  }

  recalculateDerivedStats() {
    const attackPassive = this.getPassiveStats('attack_frequency');
    const damagePassive = this.getPassiveStats('damage_boost');
    const projectilePassive = this.getPassiveStats('projectile_count');
    const movePassive = this.getPassiveStats('move_speed');
    const pickupPassive = this.getPassiveStats('pickup_radius');
    const healthPassive = this.getPassiveStats('max_health');

    this.derivedStats = {
      fireRateMultiplier: (attackPassive.fireRateMultiplier ?? 1) * (projectilePassive.cooldownMultiplier ?? 1),
      damageMultiplier: damagePassive.damageMultiplier ?? 1,
      projectileBonus: projectilePassive.projectileBonus ?? 0,
      projectileSpeedMultiplier: 1 + (projectilePassive.projectileSpeedBonus ?? 0),
      moveSpeedBonus: movePassive.moveSpeedBonus ?? 0,
      pickupRadiusBonus: pickupPassive.pickupRadiusBonus ?? 0,
      maxHealthBonus: healthPassive.maxHealthBonus ?? 0,
      gemPullSpeed: this.basePlayerStats.gemPullSpeed + (pickupPassive.pickupRadiusBonus ?? 0) * 2.1
    };

    const previousMaxHealth = this.player.maxHealth;
    this.player.moveSpeed = this.basePlayerStats.moveSpeed + this.derivedStats.moveSpeedBonus;
    this.player.maxHealth = this.basePlayerStats.maxHealth + this.derivedStats.maxHealthBonus;
    this.player.health = Phaser.Math.Clamp(this.player.health, 0, this.player.maxHealth);

    if (this.player.maxHealth < previousMaxHealth && this.player.health > this.player.maxHealth) {
      this.player.health = this.player.maxHealth;
    }

    this.pickupRadius = this.basePlayerStats.pickupRadius + this.derivedStats.pickupRadiusBonus;
    this.pickupRadiusSq = this.pickupRadius * this.pickupRadius;
    this.autoCollectRadius = 18;
    this.gemUpdateRadius = Math.max(220, this.pickupRadius + 180);
    this.gemUpdateRadiusSq = this.gemUpdateRadius * this.gemUpdateRadius;
  }
  getPassiveStats(key) {
    const level = this.passiveLevels[key] ?? 0;

    if (level <= 0) {
      return {};
    }

    const definition = PASSIVE_DEFS[key];

    if (definition?.stackMode !== 'cumulative') {
      return getPassiveLevelData(key, level);
    }

    const aggregatedStats = {};

    for (let currentLevel = 1; currentLevel <= level; currentLevel += 1) {
      const levelStats = getPassiveLevelData(key, currentLevel);

      Object.entries(levelStats).forEach(([statKey, statValue]) => {
        if (typeof statValue !== 'number') {
          aggregatedStats[statKey] = statValue;
          return;
        }

        if (statKey.endsWith('Multiplier')) {
          aggregatedStats[statKey] = (aggregatedStats[statKey] ?? 1) * statValue;
          return;
        }

        aggregatedStats[statKey] = (aggregatedStats[statKey] ?? 0) + statValue;
      });
    }

    return aggregatedStats;
  }

  getWeaponStats(key) {
    const level = this.ownedWeapons[key];
    const baseStats = getWeaponLevelData(key, level);

    return {
      ...baseStats,
      damage: Math.max(1, Math.round(baseStats.damage * this.derivedStats.damageMultiplier * 100) / 100),
      cooldown: baseStats.cooldown
        ? Math.max(120, Math.floor(baseStats.cooldown * this.derivedStats.fireRateMultiplier))
        : undefined,
      speed: baseStats.speed
        ? Math.round(baseStats.speed * this.derivedStats.projectileSpeedMultiplier * 100) / 100
        : undefined,
      projectiles: (baseStats.projectiles ?? 0) + this.derivedStats.projectileBonus,
      count: (baseStats.count ?? 0) + this.derivedStats.projectileBonus
    };
  }

  showBossDashTelegraph(boss, angle) {
    if (!this.bossDashTelegraph) {
      return;
    }
    const length = 280;
    const halfWidth = 22;
    const startX = boss.x;
    const startY = boss.y;
    const endX = startX + Math.cos(angle) * length;
    const endY = startY + Math.sin(angle) * length;
    const perpX = Math.cos(angle + Math.PI / 2) * halfWidth;
    const perpY = Math.sin(angle + Math.PI / 2) * halfWidth;

    this.bossDashTelegraph.clear();
    this.bossDashTelegraph.fillStyle(0x8fd8ff, 0.18);
    this.bossDashTelegraph.lineStyle(2, 0xdff7ff, 0.65);
    this.bossDashTelegraph.beginPath();
    this.bossDashTelegraph.moveTo(startX + perpX, startY + perpY);
    this.bossDashTelegraph.lineTo(endX + perpX, endY + perpY);
    this.bossDashTelegraph.lineTo(endX - perpX, endY - perpY);
    this.bossDashTelegraph.lineTo(startX - perpX, startY - perpY);
    this.bossDashTelegraph.closePath();
    this.bossDashTelegraph.fillPath();
    this.bossDashTelegraph.strokePath();
    this.bossDashTelegraph.setVisible(true);
  }

  hideBossDashTelegraph() {
    if (!this.bossDashTelegraph) {
      return;
    }

    this.bossDashTelegraph.clear();
    this.bossDashTelegraph.setVisible(false);
  }

  updateDebugHitboxes() {
    if (!this.debugHitboxGraphics) {
      return;
    }

    this.debugHitboxGraphics.clear();

    if (!this.debugHitboxesEnabled) {
      return;
    }

    this.drawBodyHitbox(this.player, 0x7ef9ff);
    this.enemies.children.iterate((enemy) => this.drawBodyHitbox(enemy, enemy?.isElite ? 0xffc266 : 0xff7b72));
    this.bosses.children.iterate((boss) => this.drawBodyHitbox(boss, 0x6dd3ff));
  }

  drawBodyHitbox(target, color) {
    if (!target?.active || !target.body) {
      return;
    }

    const body = target.body;
    const radius = body.halfWidth ?? 0;
    this.debugHitboxGraphics.lineStyle(1, color, 0.95);
    this.debugHitboxGraphics.strokeCircle(body.center.x, body.center.y, radius);
  }

  updateDifficulty() {
    const elapsedSeconds = this.getElapsedTime();
    const targetStage = this.getDifficultyStageForTime(elapsedSeconds);

    if (targetStage.stage === this.currentDifficultyStage.stage) {
      return;
    }

    this.currentDifficultyStage = targetStage;
    this.refreshSpawnTimer();
    this.refreshChestTimer();
    this.emitStats(true);
  }


  updateBossSchedule() {
    if (this.stageCleared || this.pendingBossPhase || this.hasActiveBoss()) {
      return;
    }

    const nextPhase = this.bossPhases.find((phase) => !this.bossSpawnFlags[phase.phase] && this.getElapsedTime() >= phase.spawnAt);
    if (!nextPhase) {
      return;
    }

    this.pendingBossPhase = nextPhase.phase;
    this.game.events.emit('boss-warning', {
      phase: nextPhase.phase,
      text: nextPhase.warningText,
      duration: 1600
    });
    this.bossWarningEvent?.remove(false);
    this.bossWarningEvent = this.time.delayedCall(1600, () => {
      const phaseConfig = this.getBossPhaseConfig(this.pendingBossPhase);
      if (!phaseConfig || this.isGameOver || this.stageCleared || this.hasActiveBoss()) {
        this.pendingBossPhase = null;
        return;
      }

      this.bossSpawnFlags[phaseConfig.phase] = true;
      this.currentBossPhase = phaseConfig.phase;
      this.bossAlive = true;
      this.pendingBossPhase = null;
      this.spawnBoss(phaseConfig);
      this.emitStats(true);
    });
  }

  hasActiveBoss() {
    return this.bosses.countActive(true) > 0;
  }

  getActiveBoss() {
    let activeBoss = null;

    this.bosses.children.iterate((boss) => {
      if (!activeBoss && boss?.active) {
        activeBoss = boss;
      }
    });

    return activeBoss;
  }

  getBossPhaseConfig(phaseNumber) {
    return this.bossPhases.find((phase) => phase.phase === phaseNumber) ?? null;
  }

  spawnBoss(phaseConfig) {
    if (!phaseConfig) {
      return;
    }

    this.beginSpawnSuppression();
    const spawnPoint = this.getBossSpawnPoint();
    const scaledBossConfig = this.buildScaledBossConfig(phaseConfig);
    let boss = this.bosses.getFirstDead(false);

    if (boss) {
      boss.spawn(spawnPoint.x, spawnPoint.y, scaledBossConfig);
    } else {
      boss = new Boss(this, spawnPoint.x, spawnPoint.y, scaledBossConfig);
      this.bosses.add(boss);
    }
  }

  getDifficultyStageForTime(elapsedSeconds) {
    let activeStage = this.difficultyStages[0];

    for (const stage of this.difficultyStages) {
      if (elapsedSeconds >= stage.startsAt) {
        activeStage = stage;
      }
    }

    return activeStage;
  }

  getScalingMultiplier(category, elapsedSeconds = this.getElapsedTime()) {
    const curve = ENEMY_BALANCE.healthScaling[category] ?? ENEMY_BALANCE.healthScaling.normal;

    if (!curve?.length) {
      return 1;
    }

    if (elapsedSeconds <= curve[0].time) {
      return curve[0].multiplier;
    }

    for (let index = 1; index < curve.length; index += 1) {
      const previousPoint = curve[index - 1];
      const nextPoint = curve[index];

      if (elapsedSeconds <= nextPoint.time) {
        const span = Math.max(1, nextPoint.time - previousPoint.time);
        const progress = (elapsedSeconds - previousPoint.time) / span;
        return Phaser.Math.Linear(previousPoint.multiplier, nextPoint.multiplier, progress);
      }
    }

    return curve[curve.length - 1].multiplier;
  }

  buildScaledEnemyConfig(baseConfig) {
    const multiplier = this.getScalingMultiplier(baseConfig.healthClass ?? 'normal');
    const tuning = ENEMY_BALANCE.strengthMultipliers[baseConfig.key] ?? {};
    return {
      ...baseConfig,
      maxHealth: Math.max(baseConfig.maxHealth, Math.round(baseConfig.maxHealth * multiplier * (tuning.health ?? 1))),
      speed: Math.round(baseConfig.speed * (tuning.speed ?? 1)),
      projectileCooldown: baseConfig.projectileCooldown
        ? Math.max(650, Math.round(baseConfig.projectileCooldown * (tuning.projectileCooldown ?? 1)))
        : baseConfig.projectileCooldown
    };
  }

  buildScaledBossConfig(baseConfig) {
    const multiplier = this.getScalingMultiplier('boss');
    const phaseTuning = ENEMY_BALANCE.strengthMultipliers.bossPhase?.[baseConfig.phase] ?? {};
    const displayWidth = 44 * (baseConfig.scale ?? 1);
    return {
      ...baseConfig,
      maxHealth: Math.max(baseConfig.maxHealth, Math.round(baseConfig.maxHealth * multiplier * (phaseTuning.health ?? 1))),
      spawnProtectionMs: phaseTuning.spawnProtectionMs ?? baseConfig.spawnProtectionMs,
      damageTakenMultiplier: phaseTuning.damageTakenMultiplier ?? baseConfig.damageTakenMultiplier ?? 1,
      initialDashDelay: phaseTuning.initialDashDelay ?? baseConfig.initialDashDelay,
      initialBurstDelay: phaseTuning.initialBurstDelay ?? baseConfig.initialBurstDelay,
      shockwaveRadius: baseConfig.phase >= 3
        ? Math.max(baseConfig.shockwaveRadius ?? 0, Math.round(displayWidth * 0.75))
        : (baseConfig.shockwaveRadius ?? Math.round(displayWidth * 0.75))
    };
  }

  countActiveEnemiesByType(typeKey) {
    let count = 0;
    this.enemies.children.iterate((enemy) => {
      if (enemy?.active && enemy.typeKey === typeKey) {
        count += 1;
      }
    });
    return count;
  }

  canSpawnEnemyType(typeKey) {
    if (typeKey !== 'elite_ranger') {
      return true;
    }

    const eliteConfig = ENEMY_BALANCE.eliteRanger;
    if (this.getElapsedTime() < eliteConfig.unlockTime) {
      return false;
    }

    if (this.currentBossPhase < eliteConfig.requireBossPhase) {
      return false;
    }

    return this.countActiveEnemiesByType(typeKey) < eliteConfig.maxActive;
  }

  refreshSpawnTimer() {
    if (this.spawnEnemyEvent) {
      this.spawnEnemyEvent.remove(false);
    }

    this.spawnEnemyEvent = this.time.addEvent({
      delay: this.currentDifficultyStage.spawnDelay,
      callback: this.spawnEnemyWave,
      callbackScope: this,
      loop: true
    });
  }

  refreshChestTimer() {
    if (this.spawnChestEvent) {
      this.spawnChestEvent.remove(false);
    }

    this.scheduleNextChestSpawn();
  }

  scheduleNextChestSpawn() {
    if (this.spawnChestEvent) {
      this.spawnChestEvent.remove(false);
    }

    const delay = getChestSpawnDelay(this.getElapsedTime(), this.currentDifficultyStage.stage);
    this.spawnChestEvent = this.time.delayedCall(delay, this.trySpawnChest, [], this);
  }

  trySpawnChest() {
    if (this.isLevelingUp || this.isGameOver || this.isPaused || this.stageCleared) {
      this.scheduleNextChestSpawn();
      return;
    }

    const activeCap = Math.min(CHEST_SPAWN_CONFIG.maxActive, getChestSpawnCap(this.getElapsedTime()));

    if (this.chests.countActive(true) < activeCap) {
      const chestTypeKey = getChestTypeKey(this.getElapsedTime(), this.currentDifficultyStage.stage);
      this.spawnChest(CHEST_TYPES[chestTypeKey]);
    }

    this.scheduleNextChestSpawn();
  }

  spawnChest(chestType) {
    const spawnDistance = Phaser.Math.Between(CHEST_SPAWN_CONFIG.distanceMin, CHEST_SPAWN_CONFIG.distanceMax);
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
    const x = this.player.x + Math.cos(angle) * spawnDistance;
    const y = this.player.y + Math.sin(angle) * spawnDistance;

    let chest = this.chests.getFirstDead(false);

    if (chest) {
      chest.spawn(x, y, chestType);
      return;
    }

    chest = new Chest(this, x, y, chestType);
    this.chests.add(chest);
  }

  spawnEnemyWave() {
    if (this.isLevelingUp || this.isGameOver || this.stageCleared || this.isSpawnSuppressed()) {
      return;
    }

    const elapsedSeconds = this.getSpawnScalingElapsedTime();
    const timeBonus = Math.min(2, Math.floor(elapsedSeconds / 60));
    const enemiesThisWave = this.currentDifficultyStage.spawnsPerWave + timeBonus;

    for (let index = 0; index < enemiesThisWave; index += 1) {
      this.spawnEnemy();
    }
  }

  spawnEnemy() {
    if (this.isLevelingUp || this.isGameOver || this.hasActiveBoss()) {
      return;
    }

    const spawnDistance = Phaser.Math.Between(320, 460);
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

    const x = this.player.x + Math.cos(angle) * spawnDistance;
    const y = this.player.y + Math.sin(angle) * spawnDistance;

    const enemyType = this.chooseEnemyType();

    if (!enemyType) {
      return;
    }

    const enemyConfig = this.buildScaledEnemyConfig(enemyType);
    let enemy = this.enemies.getFirstDead(false);

    if (enemy) {
      enemy.spawn(x, y, enemyConfig);
      return;
    }

    enemy = new Enemy(this, x, y, enemyConfig);
    this.enemies.add(enemy);
  }

  chooseEnemyType() {
    const availableEntries = Object.entries(this.currentDifficultyStage.weights).filter(([typeKey, weight]) => {
      return weight > 0 && this.canSpawnEnemyType(typeKey);
    });

    if (availableEntries.length === 0) {
      return ENEMY_TYPES.normal;
    }

    const totalWeight = availableEntries.reduce((sum, [, weight]) => sum + weight, 0);
    const roll = Phaser.Math.Between(1, totalWeight);
    let runningTotal = 0;

    for (const [typeKey, weight] of availableEntries) {
      runningTotal += weight;

      if (roll <= runningTotal) {
        return ENEMY_TYPES[typeKey];
      }
    }

    return ENEMY_TYPES[availableEntries[0][0]] ?? ENEMY_TYPES.normal;
  }

  getBossSpawnPoint() {
    const spawnDistance = Phaser.Math.Between(420, 520);
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

    return {
      x: this.player.x + Math.cos(angle) * spawnDistance,
      y: this.player.y + Math.sin(angle) * spawnDistance
    };
  }

  fireBossRandomBullets(boss) {
    const nodeDistance = boss.bulletNodeDistance ?? 38;
    const nodes = [
      { x: -nodeDistance, y: 0 },
      { x: nodeDistance, y: 0 },
      { x: 0, y: -nodeDistance },
      { x: 0, y: nodeDistance }
    ];
    const maxActiveBullets = boss.maxActiveBullets ?? Number.POSITIVE_INFINITY;
    const activeBullets = this.bossProjectiles.countActive(true);

    if (activeBullets >= maxActiveBullets) {
      return;
    }

    const volleyCap = Math.min(
      boss.bulletVolleyCap ?? Number.POSITIVE_INFINITY,
      maxActiveBullets - activeBullets
    );

    if (volleyCap <= 0) {
      return;
    }

    let bulletsSpawned = 0;
    const orderedNodes = Phaser.Utils.Array.Shuffle(nodes.slice());

    orderedNodes.forEach((node) => {
      const remaining = volleyCap - bulletsSpawned;

      if (remaining <= 0) {
        return;
      }

      const bulletsFromNode = Math.min(boss.bulletCountPerNode, remaining);
      const originX = boss.x + node.x;
      const originY = boss.y + node.y;
      const baseAngle = (boss.bulletHomingTurnRate ?? boss.bulletHomingStrength ?? 0) > 0
        ? Phaser.Math.Angle.Between(originX, originY, this.player.x, this.player.y)
        : Phaser.Math.FloatBetween(0, Math.PI * 2);

      for (let index = 0; index < bulletsFromNode; index += 1) {
        const spreadOffset = bulletsFromNode === 1
          ? 0
          : (index - (bulletsFromNode - 1) / 2) * 0.2;
        const angle = baseAngle + spreadOffset + Phaser.Math.FloatBetween(-0.04, 0.04);

        this.spawnBossProjectile({
          x: originX,
          y: originY,
          angle,
          speed: boss.bulletSpeed,
          lifeSpan: boss.bulletLifeSpan,
          damage: boss.bulletDamage,
          homingStrength: boss.bulletHomingStrength ?? 0,
          homingTurnRate: boss.bulletHomingTurnRate ?? boss.bulletHomingStrength ?? 0,
          homingDelayMs: boss.bulletHomingDelayMs ?? 0,
          homingDurationMs: boss.bulletHomingDurationMs ?? boss.bulletLifeSpan,
          target: this.player,
          tint: 0xa6eeff,
          scale: 1,
          bodyRadius: 7
        });

        bulletsSpawned += 1;
      }
    });
  }

  spawnBossProjectile(config) {
    let projectile = this.bossProjectiles.getFirstDead(false);

    if (!projectile) {
      projectile = new BossProjectile(this, config.x, config.y);
      this.bossProjectiles.add(projectile);
    }

    projectile.fire(config);
  }

  fireEliteProjectile(enemy, angle) {
    if (!enemy?.active) {
      return;
    }

    this.spawnBossProjectile({
      x: enemy.x,
      y: enemy.y,
      angle,
      speed: enemy.projectileSpeed,
      lifeSpan: enemy.projectileLifeSpan,
      damage: enemy.projectileDamage,
      homingStrength: 0,
      target: this.player,
      tint: enemy.projectileTint,
      scale: enemy.projectileScale,
      bodyRadius: enemy.projectileBodyRadius
    });
  }
  createShockwaveChargeEffect(x, y, radius, duration = 600) {
    const visibleRadius = Math.max(1, radius);
    const telegraph = this.add.circle(x, y, visibleRadius, 0x000000, 0);
    const pulse = this.add.circle(x, y, Math.max(18, visibleRadius * 0.16), 0x9ae5ff, 0.2);
    telegraph.setDepth(4).setStrokeStyle(4, 0x9ae5ff, 0.26);
    pulse.setDepth(4);
    telegraph.setScale(0.15);
    pulse.setScale(0.45);

    this.tweens.add({
      targets: telegraph,
      scaleX: 1,
      scaleY: 1,
      alpha: 1,
      duration,
      ease: 'Cubic.Out'
    });

    this.tweens.add({
      targets: pulse,
      scaleX: 1.75,
      scaleY: 1.75,
      alpha: 0.06,
      duration,
      ease: 'Sine.Out',
      onComplete: () => {
        pulse.destroy();
        telegraph.destroy();
      }
    });
  }

  triggerBossShockwave(boss) {
    const shockwaveRadius = boss.shockwaveRadius ?? Math.round((boss.displayWidth ?? 0) * 0.75);
    this.createShockwaveEffect(boss.x, boss.y, shockwaveRadius);

    const playerCenterX = this.player.body?.center.x ?? this.player.x;
    const playerCenterY = this.player.body?.center.y ?? this.player.y;
    const dx = playerCenterX - boss.x;
    const dy = playerCenterY - boss.y;
    const distanceSq = dx * dx + dy * dy;
    const playerRadius = this.player.body?.halfWidth ?? 0;
    const damageRadius = shockwaveRadius + playerRadius;

    if (distanceSq <= damageRadius * damageRadius) {
      const tookDamage = this.player.takeDamage(boss.shockwaveDamage, this.time.now);

      if (tookDamage) {
        this.handlePlayerDamageFeedback();
        this.emitStats(true);

        if (this.player.health <= 0) {
          this.triggerGameOver();
        }
      }
    }
  }

  createShockwaveEffect(x, y, radius) {
    const visibleRadius = Math.max(1, radius);
    const startRadius = Math.max(14, visibleRadius * 0.22);
    const endScale = visibleRadius / startRadius;
    const pulse = this.add.circle(x, y, startRadius, 0x9ae5ff, 0.28);
    const ring = this.add.circle(x, y, startRadius, 0x000000, 0);
    pulse.setDepth(4);
    ring.setDepth(5).setStrokeStyle(3, 0xdff7ff, 0.85);

    this.tweens.add({
      targets: [pulse, ring],
      alpha: 0,
      scaleX: endScale,
      scaleY: endScale,
      duration: 280,
      ease: 'Quad.Out',
      onComplete: () => {
        pulse.destroy();
        ring.destroy();
      }
    });

    if (this.debugHitboxesEnabled) {
      const debugRing = this.add.circle(x, y, radius, 0x000000, 0).setDepth(5).setStrokeStyle(1, 0x7ef9ff, 0.55);
      this.tweens.add({
        targets: debugRing,
        alpha: 0,
        duration: 320,
        onComplete: () => debugRing.destroy()
      });
    }
  }

  getProgressTimeMs() {
    const pausedMs = this.totalPausedMs + (this.isPaused && this.pauseStartedAt !== null ? this.time.now - this.pauseStartedAt : 0);
    return Math.max(0, this.time.now - this.survivalStartTime - pausedMs);
  }

  getElapsedTime() {
    return this.getProgressTimeMs() / 1000;
  }

  beginSpawnSuppression(resumeAt = Number.POSITIVE_INFINITY) {
    if (this.spawnSuppressionStartedAt === null) {
      this.spawnSuppressionStartedAt = this.getProgressTimeMs();
    }

    this.normalSpawnResumeAt = resumeAt;
  }

  updateSpawnSuppressionState() {
    if (this.spawnSuppressionStartedAt === null) {
      return;
    }

    const progressTime = this.getProgressTimeMs();
    if (this.hasActiveBoss() || progressTime < this.normalSpawnResumeAt) {
      return;
    }

    this.totalSpawnSuppressedMs += progressTime - this.spawnSuppressionStartedAt;
    this.spawnSuppressionStartedAt = null;
    this.normalSpawnResumeAt = 0;
  }

  isSpawnSuppressed() {
    this.updateSpawnSuppressionState();
    return this.spawnSuppressionStartedAt !== null;
  }

  getSpawnScalingElapsedTime() {
    let suppressedMs = this.totalSpawnSuppressedMs;
    const progressTime = this.getProgressTimeMs();

    if (this.spawnSuppressionStartedAt !== null) {
      suppressedMs += progressTime - this.spawnSuppressionStartedAt;
    }

    return Math.max(0, (progressTime - suppressedMs) / 1000);
  }

  syncWeaponSystems() {
    this.refreshWeaponTimers();
    this.syncOrbitBlades();
  }

  refreshWeaponTimers() {
    Object.values(this.weaponTimers).forEach((timer) => timer.remove(false));
    this.weaponTimers = {};

    Object.entries(this.ownedWeapons).forEach(([weaponKey]) => {
      const definition = WEAPON_DEFS[weaponKey];

      if (!definition || definition.type === 'orbit') {
        return;
      }

      const stats = this.getWeaponStats(weaponKey);

      this.weaponTimers[weaponKey] = this.time.addEvent({
        delay: stats.cooldown,
        callback: () => this.fireWeapon(weaponKey),
        callbackScope: this,
        loop: true
      });
    });
  }

  fireWeapon(weaponKey) {
    if (this.isLevelingUp || this.isGameOver) {
      return;
    }

    if (weaponKey === 'arc_bolt') {
      this.fireArcBolt();
    }

    if (weaponKey === 'comet_lance') {
      this.fireCometLance();
    }

    if (weaponKey === 'nova_bloom') {
      this.fireNovaBloom();
    }
  }

  fireArcBolt() {
    const stats = this.getWeaponStats('arc_bolt');
    const definition = WEAPON_DEFS.arc_bolt;
    const target = this.findNearestEnemy(stats.range);

    if (!target) {
      return;
    }
    const baseAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
    this.spawnProjectileSpread({
      ...stats,
      texture: definition.projectileKey ?? 'bullet',
      scale: (stats.scale ?? 1) * 1.2,
      bodyRadius: 6,
      rotationOffset: 0
    }, baseAngle);
  }

  fireCometLance() {
    const stats = this.getWeaponStats('comet_lance');
    const definition = WEAPON_DEFS.comet_lance;
    const target = this.findNearestEnemy(stats.range);

    if (!target) {
      return;
    }
    const baseAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
    this.spawnProjectileSpread({
      ...stats,
      texture: definition.projectileKey ?? 'lance',
      scale: (stats.scale ?? 1) * 1.2,
      bodyRadius: 8,
      statusEffect: {
        slowMultiplier: stats.slowMultiplier,
        slowDuration: stats.slowDuration,
        freezeDuration: stats.freezeDuration ?? 0
      }
    }, baseAngle);
  }

  fireNovaBloom() {
    const stats = this.getWeaponStats('nova_bloom');
    const definition = WEAPON_DEFS.nova_bloom;
    const target = this.findNearestEnemy(stats.range);

    if (!target) {
      return;
    }
    const baseAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
    this.spawnProjectileSpread({
      ...stats,
      texture: definition.projectileKey ?? 'bomb',
      bodyRadius: 10,
      explosionRadius: stats.radius,
      explosionDamage: stats.damage,
      explodeOnExpire: true,
      explosionTexture: 'nova_bloom_explosion'
    }, baseAngle);
  }

  spawnProjectileSpread(stats, baseAngle) {
    const projectileCount = Math.max(1, stats.projectiles);
    const spread = stats.spread ?? 0;

    for (let index = 0; index < projectileCount; index += 1) {
      const spreadOffset = projectileCount === 1
        ? 0
        : (index - (projectileCount - 1) / 2) * spread;

      this.spawnProjectile({
        x: this.player.x,
        y: this.player.y,
        angle: baseAngle + spreadOffset,
        speed: stats.speed,
        lifeSpan: stats.lifeSpan,
        damage: stats.damage,
        pierce: stats.pierce ?? 0,
        tint: stats.tint,
        scale: stats.scale,
        texture: stats.texture,
        bodyRadius: stats.bodyRadius,
        explosionRadius: stats.explosionRadius,
        explosionDamage: stats.explosionDamage,
        explodeOnExpire: stats.explodeOnExpire,
        explosionTexture: stats.explosionTexture,
        statusEffect: stats.statusEffect
      });
    }
  }

  spawnProjectile(config) {
    const projectile = this.projectiles.get(this.player.x, this.player.y);

    if (!projectile) {
      return;
    }

    projectile.fire(config);
  }

  syncOrbitBlades() {
    const orbitLevel = this.ownedWeapons.halo_disc ?? 0;

    if (orbitLevel <= 0) {
      this.orbitBlades.children.iterate((blade) => blade?.deactivate());
      return;
    }

    const stats = this.getWeaponStats('halo_disc');
    const desiredCount = Math.max(1, Math.min(12, stats.count));
    const activeBlades = [];

    this.orbitBlades.children.iterate((blade) => {
      if (blade?.active) {
        activeBlades.push(blade);
      }
    });

    while (activeBlades.length < desiredCount) {
      let blade = this.orbitBlades.getFirstDead(false);

      if (!blade) {
        blade = new OrbitingBlade(this, this.player.x, this.player.y);
        this.orbitBlades.add(blade);
      }

      blade.configure(stats, this.player.x, this.player.y);
      activeBlades.push(blade);
    }

    this.orbitBlades.children.iterate((blade, index) => {
      if (!blade) {
        return;
      }

      if (index < desiredCount) {
        blade.configure(stats, this.player.x, this.player.y);
      } else {
        blade.deactivate();
      }
    });
  }

  updateOrbitWeapons() {
    const activeBlades = [];

    this.orbitBlades.children.iterate((blade) => {
      if (blade?.active) {
        activeBlades.push(blade);
      }
    });

    const elapsed = this.getElapsedTime();
    activeBlades.forEach((blade, index) => {
      blade.updateOrbit(this.player, index, activeBlades.length, elapsed);
    });
  }

  updateMagnetizedGems() {
    if (!this.player?.active || this.magnetizedGems.size === 0) {
      return;
    }

    const playerX = this.player.body?.center.x ?? this.player.x;
    const playerY = this.player.body?.center.y ?? this.player.y;
    const deltaSeconds = Math.min(0.05, this.game.loop.delta / 1000);
    const magnetBaseSpeed = this.derivedStats.gemPullSpeed * 1.8;

    this.magnetizedGems.forEach((gem) => {
      if (!gem?.active) {
        this.magnetizedGems.delete(gem);
        return;
      }

      if (!gem.isMagnetPullActive()) {
        this.magnetizedGems.delete(gem);
        gem.stopMotion();
        return;
      }

      const dx = playerX - gem.x;
      const dy = playerY - gem.y;
      const distanceSq = dx * dx + dy * dy;
      const collectRadius = Math.max(this.autoCollectRadius, this.player.body?.halfWidth ?? 16) + (gem.collectRadius ?? 0);

      if (distanceSq <= collectRadius * collectRadius) {
        this.handlePlayerCollectGem(this.player, gem);
        return;
      }

      const distance = Math.max(1, Math.sqrt(distanceSq));
      const speed = magnetBaseSpeed * Phaser.Math.Clamp(1.15 + 220 / distance, 1.2, 3.4);
      const step = Math.min(distance, speed * deltaSeconds);
      const directionX = dx / distance;
      const directionY = dy / distance;

      gem.pullVelocity.set(directionX * speed, directionY * speed);
      gem.x += directionX * step;
      gem.y += directionY * step;
      this.refreshGemGridMembership(gem);
    });
  }

  updateGemAttraction() {
    const playerX = this.player.body?.center.x ?? this.player.x;
    const playerY = this.player.body?.center.y ?? this.player.y;
    const pickupRadiusSq = this.pickupRadiusSq;
    const pullSpeed = this.derivedStats.gemPullSpeed;
    const deltaSeconds = Math.min(0.05, this.game.loop.delta / 1000);
    const gemUpdateRadius = this.gemUpdateRadius;
    const gemUpdateRadiusSq = this.gemUpdateRadiusSq;
    const playerCollectRadius = Math.max(this.autoCollectRadius, this.player.body?.halfWidth ?? 16);

    this.forEachNearbyGem(playerX, playerY, gemUpdateRadius, (gem) => {
      if (gem.isMagnetPullActive?.()) {
        return;
      }
      const dx = playerX - gem.x;
      const dy = playerY - gem.y;
      const distanceSq = dx * dx + dy * dy;
      const collectRadius = playerCollectRadius + (gem.collectRadius ?? 0);

      if (distanceSq <= collectRadius * collectRadius) {
        this.handlePlayerCollectGem(this.player, gem);
        return;
      }

      if (distanceSq > gemUpdateRadiusSq) {
        gem.stopMotion();
        return;
      }

      if (pickupRadiusSq > 0 && distanceSq <= pickupRadiusSq) {
        const distance = Math.max(1, Math.sqrt(distanceSq));
        const pullRatio = 1 - distanceSq / pickupRadiusSq;
        const speed = pullSpeed * (0.95 + pullRatio * 1.8);
        gem.pullToward(dx / distance, dy / distance, speed, deltaSeconds);
        this.refreshGemGridMembership(gem);
      } else {
        gem.stopMotion();
      }
    });
  }

  getGemGridKey(x, y) {
    return `${Math.floor(x / this.gemGridCellSize)}:${Math.floor(y / this.gemGridCellSize)}`;
  }

  registerGemInGrid(gem) {
    const key = this.getGemGridKey(gem.x, gem.y);
    let bucket = this.gemGrid.get(key);

    if (!bucket) {
      bucket = new Set();
      this.gemGrid.set(key, bucket);
    }

    bucket.add(gem);
    gem.gridKey = key;
  }

  unregisterGemFromGrid(gem) {
    if (!gem?.gridKey) {
      return;
    }

    const bucket = this.gemGrid.get(gem.gridKey);

    if (bucket) {
      bucket.delete(gem);

      if (bucket.size === 0) {
        this.gemGrid.delete(gem.gridKey);
      }
    }

    gem.gridKey = '';
  }

  refreshGemGridMembership(gem) {
    if (!gem?.active) {
      this.unregisterGemFromGrid(gem);
      return;
    }

    const nextKey = this.getGemGridKey(gem.x, gem.y);

    if (nextKey === gem.gridKey) {
      return;
    }

    this.unregisterGemFromGrid(gem);
    this.registerGemInGrid(gem);
  }

  forEachNearbyGem(centerX, centerY, radius, callback) {
    const minCellX = Math.floor((centerX - radius) / this.gemGridCellSize);
    const maxCellX = Math.floor((centerX + radius) / this.gemGridCellSize);
    const minCellY = Math.floor((centerY - radius) / this.gemGridCellSize);
    const maxCellY = Math.floor((centerY + radius) / this.gemGridCellSize);

    for (let cellX = minCellX; cellX <= maxCellX; cellX += 1) {
      for (let cellY = minCellY; cellY <= maxCellY; cellY += 1) {
        const bucket = this.gemGrid.get(`${cellX}:${cellY}`);

        if (!bucket) {
          continue;
        }

        bucket.forEach((gem) => {
          if (gem?.active) {
            callback(gem);
          }
        });
      }
    }
  }

  findNearestEnemy(maxRange = Number.POSITIVE_INFINITY) {
    let nearestTarget = null;
    let nearestDistanceScore = Number.POSITIVE_INFINITY;
    const playerX = this.player.x;
    const playerY = this.player.y;
    const maxRangeSq = Number.isFinite(maxRange) ? maxRange * maxRange : Number.POSITIVE_INFINITY;

    const inspectTarget = (target, priorityBias = 1) => {
      if (!target?.active) {
        return;
      }

      const dx = target.x - playerX;
      const dy = target.y - playerY;
      const distanceSq = dx * dx + dy * dy;

      if (distanceSq > maxRangeSq) {
        return;
      }

      const score = distanceSq * priorityBias;

      if (score < nearestDistanceScore) {
        nearestDistanceScore = score;
        nearestTarget = target;
      }
    };

    this.bosses.children.iterate((target) => inspectTarget(target, 0.92));
    this.enemies.children.iterate((target) => inspectTarget(target, 1));
    this.chests.children.iterate((target) => inspectTarget(target, 1.35));

    return nearestTarget;
  }
  handleProjectileHitEnemy(projectile, enemy) {
    if (!projectile.active || !enemy.active) {
      return;
    }

    if (!projectile.registerHit(enemy)) {
      return;
    }

    if (projectile.explosionRadius > 0) {
      this.handleProjectileExplosion(projectile);
      projectile.disableBullet();
      this.emitStats(true);
      return;
    }

    const enemyDied = this.damageEnemy(enemy, projectile.damage);

    if (!enemyDied) {
      this.applyProjectileStatus(enemy, projectile);
    }

    if (!projectile.consumePierce()) {
      projectile.disableBullet();
    }

    if (enemyDied) {
      this.emitStats(true);
    }
  }

  applyProjectileStatus(enemy, projectile) {
    if (!enemy?.active || !projectile?.statusEffect) {
      return;
    }

    enemy.applyChill(projectile.statusEffect, this.time.now);
  }

  handleProjectileExplosion(projectile) {
    const radiusSq = projectile.explosionRadius * projectile.explosionRadius;
    let targetDied = false;

    this.createExplosionEffect(projectile.x, projectile.y, projectile.explosionRadius, projectile.explosionTexture);

    const inspectTarget = (target) => {
      if (!target?.active) {
        return;
      }

      const dx = target.x - projectile.x;
      const dy = target.y - projectile.y;
      const distanceSq = dx * dx + dy * dy;

      if (distanceSq <= radiusSq) {
        targetDied = this.damageEnemy(target, projectile.explosionDamage) || targetDied;
      }
    };

    const inspectChest = (chest) => {
      if (!chest?.active) {
        return;
      }

      const dx = chest.x - projectile.x;
      const dy = chest.y - projectile.y;

      if (dx * dx + dy * dy <= radiusSq) {
        this.damageChest(chest);
      }
    };

    this.enemies.children.iterate(inspectTarget);
    this.bosses.children.iterate(inspectTarget);
    this.chests.children.iterate(inspectChest);

    if (targetDied) {
      this.emitStats(true);
    }
  }
  createExplosionEffect(x, y, radius, textureKey = null) {
    if (textureKey && this.textures.exists(textureKey)) {
      const burst = this.add.image(x, y, textureKey);
      burst.setDepth(3);
      burst.setAlpha(0.94);
      burst.setAngle(Phaser.Math.Between(-10, 10));
      burst.setDisplaySize(radius * 1.75, radius * 1.75);

      this.tweens.add({
        targets: burst,
        alpha: 0,
        scaleX: 1.32,
        scaleY: 1.32,
        duration: 260,
        ease: 'Cubic.Out',
        onComplete: () => burst.destroy()
      });
      return;
    }

    const pulse = this.add.circle(x, y, radius * 0.45, 0xffc9b4, 0.4);
    pulse.setDepth(3);

    this.tweens.add({
      targets: pulse,
      alpha: 0,
      scaleX: 1.55,
      scaleY: 1.55,
      duration: 180,
      ease: 'Quad.Out',
      onComplete: () => pulse.destroy()
    });
  }

  handleOrbitBladeHitEnemy(blade, enemy) {
    if (!blade.active || !enemy.active) {
      return;
    }

    if (!blade.canDamage(enemy, this.time.now)) {
      return;
    }

    const enemyDied = this.damageEnemy(enemy, blade.damage);

    if (enemyDied) {
      this.emitStats(true);
    }
  }

  damageEnemy(enemy, damage) {
    const enemyDied = enemy.takeDamage(damage);

    if (!enemyDied) {
      return false;
    }

    if (enemy.isBoss) {
      this.handleBossDefeat(enemy);
      this.kills += 1;
      return true;
    }

    this.spawnExperienceGem(enemy.x, enemy.y, enemy.experienceValue);
    enemy.deactivate();
    this.kills += 1;
    return true;
  }

  handleBossDefeat(boss) {
    let remainingExp = boss.experienceValue;

    while (remainingExp > 0) {
      const value = Math.min(4, remainingExp);
      const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);
      const distance = Phaser.Math.Between(14, 42);
      this.spawnExperienceGem(
        boss.x + Math.cos(angle) * distance,
        boss.y + Math.sin(angle) * distance,
        value
      );
      remainingExp -= value;
    }

    this.hideBossDashTelegraph();
    this.bossAlive = false;
    boss.deactivate();
    this.bossProjectiles.children.iterate((projectile) => projectile?.disableProjectile?.());

    if (this.currentBossPhase >= this.bossPhases.length) {
      this.triggerStageClear();
      return;
    }

    this.normalSpawnResumeAt = this.getProgressTimeMs() + this.bossSpawnGraceDuration;
    this.emitStats(true);
  }

  handleBossProjectileHitPlayer(player, projectile) {
    if (!projectile?.active || this.isLevelingUp || this.isGameOver || this.isPaused) {
      return;
    }

    const tookDamage = player.takeDamage(projectile.damage, this.time.now);
    projectile.disableProjectile();

    if (!tookDamage) {
      return;
    }

    this.handlePlayerDamageFeedback();
    this.emitStats(true);

    if (player.health <= 0) {
      this.triggerGameOver();
    }
  }

  handleEnemyHitPlayer(player, enemy) {
    if (this.isLevelingUp || this.isGameOver) {
      return;
    }

    if (enemy?.isBoss && enemy.state === 'dashing') {
      return;
    }

    const tookDamage = player.takeDamage(enemy.contactDamage, this.time.now);

    if (!tookDamage) {
      return;
    }

    this.handlePlayerDamageFeedback();
    this.knockbackVector.set(player.x - enemy.x, player.y - enemy.y);

    if (this.knockbackVector.lengthSq() > 0) {
      this.knockbackVector.normalize().scale(150);
      player.body.velocity.add(this.knockbackVector);
    }

    this.emitStats(true);

    if (player.health <= 0) {
      this.triggerGameOver();
    }
  }
  handleProjectileHitChest(projectile, chest) {
    if (!projectile?.active || !chest?.active) {
      return;
    }

    if (projectile.explosionRadius > 0) {
      this.handleProjectileExplosion(projectile);
      projectile.disableBullet();
      return;
    }

    this.damageChest(chest);

    if (!projectile.consumePierce()) {
      projectile.disableBullet();
    }
  }

  handleOrbitBladeHitChest(blade, chest) {
    if (!blade?.active || !chest?.active) {
      return;
    }

    if (!blade.canDamage(chest, this.time.now)) {
      return;
    }

    this.damageChest(chest);
  }

  damageChest(chest) {
    if (!chest?.active) {
      return false;
    }

    const opened = chest.registerHit();
    if (!opened) {
      return false;
    }

    const chestType = CHEST_TYPES[chest.typeKey];
    const rewardKey = getRewardKey(chest.typeKey);
    const rewardType = REWARD_TYPES[rewardKey];
    const dropX = chest.x + Phaser.Math.Between(-8, 8);
    const dropY = chest.y + Phaser.Math.Between(-6, 6);

    chest.deactivate();
    this.spawnChestRewardDrop(dropX, dropY, rewardType, chestType);
    this.showChestRewardDropSpawn(dropX, dropY, chestType, rewardType);
    this.emitStats(true);
    return true;
  }

  handlePlayerCollectGem(player, gem) {
    if (this.isGameOver || !gem?.active) {
      return;
    }

    this.unregisterGemFromGrid(gem);
    this.magnetizedGems.delete(gem);
    const value = gem.value;
    gem.collect();
    this.gainExperience(value);
  }

  spawnExperienceGem(x, y, value) {
    let gem = this.experienceGems.getFirstDead(false);

    if (gem) {
      gem.spawn(x, y, value);
      this.registerGemInGrid(gem);
      return;
    }

    gem = new ExperienceGem(this, x, y, value);
    this.experienceGems.add(gem);
    this.registerGemInGrid(gem);
  }

  spawnChestRewardDrop(x, y, rewardType, chestType) {
    let drop = this.rewardDrops.getFirstDead(false);

    if (!drop) {
      drop = new ChestRewardDrop(this, x, y);
      this.rewardDrops.add(drop);
    }

    drop.spawn(x, y, rewardType, chestType);
    return drop;
  }

  updateRewardDrops() {
    if (!this.player?.active) {
      return;
    }

    const playerX = this.player.x;
    const playerY = this.player.y;
    const pickupRadius = (this.player.body?.halfWidth ?? 16) + 12;

    this.rewardDrops.children.iterate((drop) => {
      if (!drop?.active) {
        return;
      }

      drop.updateFloat(this.time.now);

      if (this.time.now < (drop.pickupReadyAt ?? 0)) {
        return;
      }

      const dx = playerX - drop.x;
      const dy = playerY - drop.y;
      const collectRadius = pickupRadius + (drop.collectRadius ?? 0);

      if (dx * dx + dy * dy <= collectRadius * collectRadius) {
        this.handlePlayerCollectRewardDrop(drop);
      }
    });
  }

  handlePlayerCollectRewardDrop(drop) {
    if (!drop?.active || this.isGameOver) {
      return;
    }

    const rewardType = drop.rewardType;
    const result = this.applyChestReward(drop.chestTypeKey, drop.rewardKey);
    const x = drop.x;
    const y = drop.y;

    drop.collect();
    this.showChestRewardPickup(x, y, rewardType, result);
    this.emitStats(true);
  }

  applyChestReward(chestTypeKey, rewardKey) {
    const chestType = CHEST_TYPES[chestTypeKey];

    if (rewardKey === 'potion') {
      const potionReward = chestType.rewards.potion;
      const missingHealth = this.player.maxHealth - this.player.health;

      if (potionReward.fullHeal) {
        if (missingHealth > 0) {
          this.player.health = this.player.maxHealth;
          return { amount: missingHealth, suffix: '生命', mode: 'heal' };
        }

        const shieldAmount = potionReward.shieldOnFull ?? 0;
        this.player.addShield(shieldAmount);
        return { amount: shieldAmount, suffix: '護盾', mode: 'shield' };
      }

      if (missingHealth > 0) {
        const healAmount = Math.min(missingHealth, potionReward.heal ?? 0);
        this.player.health += healAmount;
        return { amount: healAmount, suffix: '生命', mode: 'heal' };
      }

      const shieldAmount = potionReward.shieldOnFull ?? 0;
      this.player.addShield(shieldAmount);
      return { amount: shieldAmount, suffix: '護盾', mode: 'shield' };
    }

    if (rewardKey === 'gold') {
      const goldAmount = getGoldRewardAmount(chestType.key, this.getElapsedTime(), this.currentDifficultyStage.stage);
      this.gold += goldAmount;
      return { amount: goldAmount, suffix: '金幣', mode: 'gold' };
    }

    const magnetRadius = chestType.rewards.magnet.radius;
    const collectedExp = this.collectExperienceByMagnet(magnetRadius);
    return { amount: collectedExp, suffix: '經驗', mode: 'magnet' };
  }

  collectExperienceByMagnet(radius) {
    const targetedGems = [];

    if (!Number.isFinite(radius)) {
      this.experienceGems.children.iterate((gem) => {
        if (gem?.active) {
          targetedGems.push(gem);
        }
      });
    } else {
      this.forEachNearbyGem(this.player.x, this.player.y, radius, (gem) => {
        const dx = this.player.x - gem.x;
        const dy = this.player.y - gem.y;

        if (dx * dx + dy * dy <= radius * radius) {
          targetedGems.push(gem);
        }
      });
    }

    let attractedExp = 0;

    targetedGems.forEach((gem) => {
      if (!gem?.active) {
        return;
      }

      attractedExp += gem.value ?? 0;
      gem.startMagnetPull(4.6);
      this.magnetizedGems.add(gem);
    });

    return attractedExp;
  }

  showChestRewardDropSpawn(x, y, chestType, rewardType) {
    const fx = chestType.openFx;
    const pulse = this.add.circle(x, y, fx.radius * 0.42, fx.color, 0.35);
    pulse.setDepth(5);

    this.tweens.add({
      targets: pulse,
      alpha: 0,
      scaleX: 2.2 * fx.rewardScale,
      scaleY: 2.2 * fx.rewardScale,
      duration: chestType.key === 'gold' ? 360 : 240,
      ease: 'Quad.Out',
      onComplete: () => pulse.destroy()
    });

    if (chestType.key === 'gold') {
      const ring = this.add.circle(x, y, fx.radius * 0.72, fx.color, 0.16);
      ring.setDepth(5);
      this.tweens.add({
        targets: ring,
        alpha: 0,
        scaleX: 2.6,
        scaleY: 2.6,
        duration: 520,
        ease: 'Sine.Out',
        onComplete: () => ring.destroy()
      });
      this.cameras.main.shake(120, 0.0032);
    }

    const text = this.add.text(x, y - 24, `${chestType.name}\n掉落：${rewardType.name}`, {
      fontFamily: 'Trebuchet MS',
      fontSize: chestType.key === 'gold' ? '17px' : '14px',
      align: 'center',
      color: '#fff6dc',
      stroke: '#1d0e03',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(6);

    this.tweens.add({
      targets: text,
      y: text.y - 22,
      alpha: 0,
      duration: chestType.key === 'gold' ? 1100 : 800,
      ease: 'Sine.Out',
      onComplete: () => text.destroy()
    });

    this.lastChestReward = {
      chestType: chestType.name,
      rewardKey: rewardType.key,
      rewardName: rewardType.name,
      amount: 0
    };
  }

  showChestRewardPickup(x, y, rewardType, rewardResult) {
    const color = rewardResult.mode === 'heal'
      ? '#ffd2da'
      : rewardResult.mode === 'shield'
        ? '#bfefff'
        : rewardResult.mode === 'gold'
          ? '#ffe39a'
          : '#bdf7ff';

    const detail = rewardResult.mode === 'magnet'
      ? `${rewardType.name} 吸收 ${rewardResult.amount} ${rewardResult.suffix}`
      : `${rewardType.name} +${rewardResult.amount} ${rewardResult.suffix}`;

    const text = this.add.text(x, y - 18, detail, {
      fontFamily: 'Trebuchet MS',
      fontSize: '14px',
      color,
      align: 'center',
      stroke: '#10202b',
      strokeThickness: 3
    }).setOrigin(0.5).setDepth(6);

    this.tweens.add({
      targets: text,
      y: text.y - 24,
      alpha: 0,
      duration: 760,
      ease: 'Sine.Out',
      onComplete: () => text.destroy()
    });
  }

  gainExperience(amount) {
    this.experience += amount;

    while (this.experience >= this.experienceToNextLevel) {
      this.experience -= this.experienceToNextLevel;
      this.level += 1;
      this.pendingLevelUps += 1;
      this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.28) + 2;
    }

    this.emitStats(true);

    if (this.pendingLevelUps > 0 && !this.isLevelingUp && !this.shouldDelayLevelUpMenu()) {
      this.openLevelUpMenu();
    }
  }

  shouldDelayLevelUpMenu() {
    let hasMagnetizedGem = false;

    this.magnetizedGems.forEach((gem) => {
      if (gem?.active && gem.isMagnetPullActive?.()) {
        hasMagnetizedGem = true;
      } else if (!gem?.active) {
        this.magnetizedGems.delete(gem);
      }
    });

    return hasMagnetizedGem;
  }

  openLevelUpMenu() {
    if (this.isGameOver) {
      return;
    }

    this.isPaused = false;
    this.game.events.emit('pause-state-changed', { paused: false });
    this.currentUpgradeChoices = this.getUpgradeChoices();
    this.isLevelingUp = true;
    this.physics.world.pause();
    this.player.setVelocity(0, 0);

    this.enemies.children.iterate((enemy) => {
      if (enemy?.active) {
        enemy.setVelocity(0, 0);
      }
    });

    this.game.events.emit('level-up-opened', {
      level: this.level,
      choices: this.currentUpgradeChoices.map((choice) => ({
        id: choice.id,
        title: choice.title,
        description: choice.description,
        iconKey: choice.iconKey ?? null
      }))
    });

    this.emitStats(true);
    this.scene.pause();
  }

  getUpgradeChoices() {
    const pool = this.buildUpgradePool();
    Phaser.Utils.Array.Shuffle(pool);
    return pool.slice(0, Math.min(3, pool.length));
  }

  buildUpgradePool() {
    const upgrades = [];

    Object.entries(WEAPON_DEFS).forEach(([weaponKey, def]) => {
      const currentLevel = this.ownedWeapons[weaponKey] ?? 0;

      if (currentLevel === 0) {
        upgrades.push({
          id: `weapon:${weaponKey}:1`,
          kind: 'weapon',
          key: weaponKey,
          nextLevel: 1,
          title: `新武器：${def.name}`,
          description: this.describeWeaponLevel(weaponKey, 1, true),
          iconKey: def.iconKey ?? null
        });
        return;
      }

      if (currentLevel < def.maxLevel) {
        upgrades.push({
          id: `weapon:${weaponKey}:${currentLevel + 1}`,
          kind: 'weapon',
          key: weaponKey,
          nextLevel: currentLevel + 1,
          title: `${def.name} 等級 ${currentLevel + 1}`,
          description: this.describeWeaponLevel(weaponKey, currentLevel + 1, false),
          iconKey: def.iconKey ?? null
        });
      }
    });

    Object.entries(PASSIVE_DEFS).forEach(([passiveKey, def]) => {
      const currentLevel = this.passiveLevels[passiveKey] ?? 0;

      if (currentLevel < def.maxLevel) {
        upgrades.push({
          id: `passive:${passiveKey}:${currentLevel + 1}`,
          kind: 'passive',
          key: passiveKey,
          nextLevel: currentLevel + 1,
          title: `${def.name} 等級 ${currentLevel + 1}`,
          description: this.describePassiveLevel(passiveKey, currentLevel + 1)
        });
      }
    });

    return upgrades;
  }

  describeWeaponLevel(key, level, isUnlock) {
    const def = WEAPON_DEFS[key];
    const stats = getWeaponLevelData(key, level);
    const intro = isUnlock ? `${def.unlockDescription} ` : '';

    if (def.type === 'auto') {
      return `${intro}傷害 ${stats.damage}｜射程 ${stats.range}｜飛矢 ${stats.projectiles}`;
    }

    if (def.type === 'orbit') {
      return `${intro}飛刃 ${stats.count}｜傷害 ${stats.damage}｜半徑 ${stats.radius}`;
    }

    if (def.type === 'pierce') {
      const slowPercent = Math.round((1 - stats.slowMultiplier) * 100);
      const freezeText = stats.freezeDuration > 0 ? `，冰凍 ${Math.round(stats.freezeDuration / 100) / 10} 秒` : '';
      return `${intro}傷害 ${stats.damage}｜緩速 ${slowPercent}%｜冰箭 ${stats.projectiles}${freezeText}`;
    }

    return `${intro}傷害 ${stats.damage}｜爆炸 ${stats.radius}｜種子 ${stats.projectiles}`;
  }

  describePassiveLevel(key, level) {
    const stats = getPassiveLevelData(key, level);

    if (key === 'attack_frequency') {
      return `本級效果：攻擊間隔 -${100 - Math.round(stats.fireRateMultiplier * 100)}%。`;
    }

    if (key === 'damage_boost') {
      return `本級效果：傷害 +${Math.round((stats.damageMultiplier - 1) * 100)}%。`;
    }

    if (key === 'projectile_count') {
      const effects = [];

      if (stats.projectileBonus) {
        effects.push(`獲得 +${stats.projectileBonus} 投射物`);
      }

      if (stats.cooldownMultiplier) {
        effects.push(`攻擊間隔 -${Math.round((1 - stats.cooldownMultiplier) * 100)}%`);
      }

      if (stats.projectileSpeedBonus) {
        effects.push(`投射速度 +${Math.round(stats.projectileSpeedBonus * 100)}%`);
      }

      return `本級效果：${effects.join('，')}。`;
    }

    if (key === 'move_speed') {
      return `本級效果：移速 +${stats.moveSpeedBonus}。`;
    }

    if (key === 'pickup_radius') {
      return `本級效果：拾取範圍 +${stats.pickupRadiusBonus}。`;
    }

    return `本級效果：生命上限 +${stats.maxHealthBonus}，回復 ${stats.healOnGain}。`;
  }

  applyUpgrade(upgradeId) {
    const upgrade = this.currentUpgradeChoices.find((choice) => choice.id === upgradeId);

    if (!upgrade) {
      return;
    }

    if (upgrade.kind === 'weapon') {
      this.ownedWeapons[upgrade.key] = upgrade.nextLevel;
      this.syncWeaponSystems();
    }

    if (upgrade.kind === 'passive') {
      const previousMaxHealth = this.player.maxHealth;
      this.passiveLevels[upgrade.key] = upgrade.nextLevel;
      this.recalculateDerivedStats();

      if (upgrade.key === 'max_health') {
        const passiveStats = getPassiveLevelData(upgrade.key, upgrade.nextLevel);
        const healthGain = this.player.maxHealth - previousMaxHealth;
        const healAmount = (passiveStats.healOnGain ?? 0) + Math.max(0, healthGain);
        this.player.health = Math.min(this.player.maxHealth, this.player.health + healAmount);
      }

      this.syncWeaponSystems();
    }

    this.pendingLevelUps = Math.max(0, this.pendingLevelUps - 1);
    this.currentUpgradeChoices = [];
    this.isLevelingUp = false;
    this.physics.world.resume();
    this.scene.resume();
    this.game.events.emit('level-up-closed');
    this.emitStats(true);

    if (this.pendingLevelUps > 0 && !this.shouldDelayLevelUpMenu()) {
      this.openLevelUpMenu();
    }
  }

  triggerStageClear() {
    if (this.stageCleared) {
      return;
    }
    this.stageCleared = true;
    this.isPaused = false;
    this.bossAlive = false;
    this.pendingBossPhase = null;
    this.bossWarningEvent?.remove(false);
    this.bossWarningEvent = null;
    this.spawnEnemyEvent?.remove(false);
    this.spawnChestEvent?.remove(false);
    this.hideBossDashTelegraph();
    this.bossProjectiles.children.iterate((projectile) => projectile?.disableProjectile?.());
    this.physics.world.pause();
    this.player.setVelocity(0, 0);
    this.game.events.emit('level-up-closed');
    this.game.events.emit('stage-clear', {
      time: this.getElapsedTime(),
      level: this.level,
      kills: this.kills,
      gold: this.gold,
      bossPhase: this.currentBossPhase
    });
    this.emitStats(true);
    this.scene.pause();
  }

  triggerGameOver() {
    this.isPaused = false;
    this.isGameOver = true;
    this.player.setVelocity(0, 0);
    this.physics.world.pause();
    this.game.events.emit('level-up-closed');
    this.game.events.emit('game-over', {
      time: this.getElapsedTime(),
      level: this.level,
      kills: this.kills
    });
    this.emitStats(true);
    this.scene.pause();
  }

  restartRun() {
    this.isPaused = false;
    this.isGameOver = false;
    this.stageCleared = false;
    this.bossAlive = false;
    this.pendingBossPhase = null;
    this.currentBossPhase = 0;
    this.bossSpawnFlags = Object.fromEntries(this.bossPhases.map((phase) => [phase.phase, false]));
    this.normalSpawnResumeAt = 0;
    this.spawnSuppressionStartedAt = null;
    this.totalSpawnSuppressedMs = 0;
    this.bossWarningEvent?.remove(false);
    this.bossWarningEvent = null;
    this.bossProjectiles.children.iterate((projectile) => projectile?.disableProjectile?.());
    const activeBoss = this.getActiveBoss();
    activeBoss?.deactivate?.();
    this.time.timeScale = 1;
    this.physics.world.resume();
    this.game.events.emit('pause-state-changed', { paused: false });
    this.game.events.emit('level-up-closed');
    this.game.events.emit('game-reset');
    this.scene.restart();
  }

  emitStats(force = false) {
    const now = this.time.now;

    if (!force && now - this.lastStatsEmitAt < this.statsEmitInterval) {
      return;
    }

    this.lastStatsEmitAt = now;

    const activeBoss = this.getActiveBoss();

    this.game.events.emit('game-stats', {
      level: this.level,
      difficultyStage: this.currentDifficultyStage.stage,
      difficultyLabel: this.currentDifficultyStage.label,
      experience: this.experience,
      experienceToNextLevel: this.experienceToNextLevel,
      health: this.player.health,
      maxHealth: this.player.maxHealth,
      shield: this.player.shield,
      gold: this.gold,
      kills: this.kills,
      enemies: this.enemies.countActive(true),
      time: this.getElapsedTime(),
      isLevelingUp: this.isLevelingUp,
      isGameOver: this.isGameOver,
      stageCleared: this.stageCleared,
      currentBossPhase: this.currentBossPhase,
      isPaused: this.isPaused,
      boss: activeBoss ? {
        name: activeBoss.name,
        health: activeBoss.health,
        maxHealth: activeBoss.maxHealth
      } : null
    });
  }
}

















