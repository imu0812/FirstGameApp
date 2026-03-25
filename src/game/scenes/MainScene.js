import Phaser from 'phaser';
import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Boss } from '../entities/Boss.js';
import { Bullet } from '../entities/Bullet.js';
import { BossProjectile } from '../entities/BossProjectile.js';
import { ExperienceGem } from '../entities/ExperienceGem.js';
import { OrbitingBlade } from '../entities/OrbitingBlade.js';
import { BOSS_TYPE, BOSS_WAVE_CONFIG, DIFFICULTY_STAGES, ENEMY_TYPES } from '../data/enemyTypes.js';
import {
  PASSIVE_DEFS,
  WEAPON_DEFS,
  getPassiveLevelData,
  getWeaponLevelData
} from '../data/arsenal.js';

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
    this.bossConfig = BOSS_TYPE;
    this.nextBossAt = BOSS_WAVE_CONFIG.firstSpawnAt;


    this.createArena();

    const spawnX = 0;
    const spawnY = 0;

    this.player = new Player(this, spawnX, spawnY);

    this.recalculateDerivedStats();
    this.bossDashTelegraph = this.add.graphics();
    this.bossDashTelegraph.setDepth(2);
    this.bossDashTelegraph.setVisible(false);

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

    this.game.events.on('virtual-joystick-move', this.handleVirtualJoystick, this);
    this.game.events.on('toggle-pause', this.togglePause, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);

    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

    this.refreshSpawnTimer();
    this.syncWeaponSystems();
    this.emitStats(true);
  }

  update() {
    if (this.isLevelingUp || this.isGameOver || this.isPaused) {
      return;
    }

    this.player.update();
    this.updateArenaBackground();

    this.enemies.children.iterate((enemy) => {
      if (enemy?.active) {
        enemy.update(this.player);
      }
    });

    this.bosses.children.iterate((boss) => {
      if (boss?.active) {
        boss.update(this.player, this.time.now);
      }
    });

    this.updateOrbitWeapons();
    this.updateGemAttraction();
    this.updateDifficulty();
    this.updateBossSchedule();
    this.emitStats();
  }

  shutdown() {
    this.game.events.off('virtual-joystick-move', this.handleVirtualJoystick, this);
    this.game.events.off('toggle-pause', this.togglePause, this);
    this.scale.off('resize', this.handleResize, this);
    this.hideBossDashTelegraph();
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
    this.time.timeScale = this.isPaused ? 0 : 1;

    if (this.isPaused) {
      this.physics.world.pause();
      this.player.setVelocity(0, 0);
      this.enemies.children.iterate((enemy) => {
        if (enemy?.active) {
          enemy.setVelocity(0, 0);
        }
      });
    } else {
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
  updateDifficulty() {
    const elapsedSeconds = this.getElapsedTime();
    const targetStage = this.getDifficultyStageForTime(elapsedSeconds);

    if (targetStage.stage === this.currentDifficultyStage.stage) {
      return;
    }

    this.currentDifficultyStage = targetStage;
    this.refreshSpawnTimer();
    this.emitStats(true);
  }


  updateBossSchedule() {
    if (this.hasActiveBoss()) {
      return;
    }

    if (this.getElapsedTime() < this.nextBossAt) {
      return;
    }

    this.spawnBoss();
    this.nextBossAt += BOSS_WAVE_CONFIG.interval;
    this.emitStats(true);
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

  spawnBoss() {
    const spawnPoint = this.getBossSpawnPoint();
    let boss = this.bosses.getFirstDead(false);

    if (boss) {
      boss.spawn(spawnPoint.x, spawnPoint.y, this.bossConfig);
    } else {
      boss = new Boss(this, spawnPoint.x, spawnPoint.y, this.bossConfig);
      this.bosses.add(boss);
    }
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
    const nodes = [
      { x: -38, y: 0 },
      { x: 38, y: 0 },
      { x: 0, y: -38 },
      { x: 0, y: 38 }
    ];

    nodes.forEach((node, nodeIndex) => {
      for (let index = 0; index < boss.bulletCountPerNode; index += 1) {
        const angle = Phaser.Math.FloatBetween(0, Math.PI * 2) + nodeIndex * 0.12;
        this.spawnBossProjectile({
          x: boss.x + node.x,
          y: boss.y + node.y,
          angle,
          speed: boss.bulletSpeed,
          lifeSpan: boss.bulletLifeSpan,
          damage: boss.bulletDamage,
          tint: 0xa6eeff,
          scale: 1,
          bodyRadius: 7
        });
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

  triggerBossShockwave(boss) {
    this.createShockwaveEffect(boss.x, boss.y, boss.shockwaveRadius);

    const dx = this.player.x - boss.x;
    const dy = this.player.y - boss.y;
    const distanceSq = dx * dx + dy * dy;

    if (distanceSq <= boss.shockwaveRadius * boss.shockwaveRadius) {
      const tookDamage = this.player.takeDamage(boss.shockwaveDamage, this.time.now);

      if (tookDamage) {
        this.emitStats(true);

        if (this.player.health <= 0) {
          this.triggerGameOver();
        }
      }
    }
  }

  createShockwaveEffect(x, y, radius) {
    const pulse = this.add.circle(x, y, radius * 0.28, 0x9ae5ff, 0.34);
    pulse.setDepth(4);

    this.tweens.add({
      targets: pulse,
      alpha: 0,
      scaleX: 1.95,
      scaleY: 1.95,
      duration: 260,
      ease: 'Quad.Out',
      onComplete: () => pulse.destroy()
    });
  }

  getElapsedTime() {
    return (this.time.now - this.survivalStartTime) / 1000;
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

  spawnEnemyWave() {
    if (this.isLevelingUp || this.isGameOver || this.hasActiveBoss()) {
      return;
    }

    const elapsedSeconds = this.getElapsedTime();
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
    let enemy = this.enemies.getFirstDead(false);

    if (enemy) {
      enemy.spawn(x, y, enemyType);
      return;
    }

    enemy = new Enemy(this, x, y, enemyType);
    this.enemies.add(enemy);
  }

  chooseEnemyType() {
    const { weights } = this.currentDifficultyStage;
    const totalWeight = Object.values(weights).reduce((sum, value) => sum + value, 0);
    const roll = Phaser.Math.Between(1, totalWeight);
    let runningTotal = 0;

    for (const [typeKey, weight] of Object.entries(weights)) {
      runningTotal += weight;

      if (roll <= runningTotal) {
        return ENEMY_TYPES[typeKey];
      }
    }

    return ENEMY_TYPES.normal;
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
    const target = this.findNearestEnemy(stats.range);

    if (!target) {
      return;
    }
    const baseAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
    this.spawnProjectileSpread({
      ...stats,
      texture: 'bullet',
      bodyRadius: 6
    }, baseAngle);
  }

  fireCometLance() {
    const stats = this.getWeaponStats('comet_lance');
    const target = this.findNearestEnemy(stats.range);

    if (!target) {
      return;
    }
    const baseAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
    this.spawnProjectileSpread({
      ...stats,
      texture: 'lance',
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
    const target = this.findNearestEnemy(stats.range);

    if (!target) {
      return;
    }
    const baseAngle = Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y);
    this.spawnProjectileSpread({
      ...stats,
      texture: 'bomb',
      bodyRadius: 10,
      explosionRadius: stats.radius,
      explosionDamage: stats.damage,
      explodeOnExpire: true
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
    let nearestDistanceSq = Number.POSITIVE_INFINITY;
    const playerX = this.player.x;
    const playerY = this.player.y;
    const maxRangeSq = Number.isFinite(maxRange) ? maxRange * maxRange : Number.POSITIVE_INFINITY;

    const inspectTarget = (target) => {
      if (!target?.active) {
        return;
      }

      const dx = target.x - playerX;
      const dy = target.y - playerY;
      const distanceSq = dx * dx + dy * dy;

      if (distanceSq > maxRangeSq) {
        return;
      }

      if (distanceSq < nearestDistanceSq) {
        nearestDistanceSq = distanceSq;
        nearestTarget = target;
      }
    };

    this.bosses.children.iterate(inspectTarget);
    this.enemies.children.iterate(inspectTarget);

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

    this.createExplosionEffect(projectile.x, projectile.y, projectile.explosionRadius);

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

    this.enemies.children.iterate(inspectTarget);
    this.bosses.children.iterate(inspectTarget);

    if (targetDied) {
      this.emitStats(true);
    }
  }
  createExplosionEffect(x, y, radius) {
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
    boss.deactivate();
    this.bossProjectiles.children.iterate((projectile) => projectile?.disableProjectile?.());
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

  handlePlayerCollectGem(player, gem) {
    if (this.isGameOver || !gem?.active) {
      return;
    }

    this.unregisterGemFromGrid(gem);
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

  gainExperience(amount) {
    this.experience += amount;

    while (this.experience >= this.experienceToNextLevel) {
      this.experience -= this.experienceToNextLevel;
      this.level += 1;
      this.pendingLevelUps += 1;
      this.experienceToNextLevel = Math.floor(this.experienceToNextLevel * 1.28) + 2;
    }

    this.emitStats(true);

    if (this.pendingLevelUps > 0 && !this.isLevelingUp) {
      this.openLevelUpMenu();
    }
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
        description: choice.description
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
          description: this.describeWeaponLevel(weaponKey, 1, true)
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
          description: this.describeWeaponLevel(weaponKey, currentLevel + 1, false)
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

    if (this.pendingLevelUps > 0) {
      this.openLevelUpMenu();
    }
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
      kills: this.kills,
      enemies: this.enemies.countActive(true),
      time: this.getElapsedTime(),
      isLevelingUp: this.isLevelingUp,
      isGameOver: this.isGameOver,
      isPaused: this.isPaused,
      boss: activeBoss ? {
        name: activeBoss.name,
        health: activeBoss.health,
        maxHealth: activeBoss.maxHealth
      } : null
    });
  }
}








