import Phaser from 'phaser';

export class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, 'boss');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.poisonAura = scene.add.image(x, y, 'status_poison_ring');
    this.poisonAura.setVisible(false);
    this.poisonAura.setBlendMode(Phaser.BlendModes.ADD);
    this.burnAura = scene.add.image(x, y, 'status_burn_ring');
    this.burnAura.setVisible(false);
    this.burnAura.setBlendMode(Phaser.BlendModes.ADD);
    this.poisonStatusIcon = scene.add.image(x, y, 'status_poison_icon');
    this.poisonStatusIcon.setVisible(false);
    this.poisonStatusIcon.setBlendMode(Phaser.BlendModes.SCREEN);
    this.burnStatusIcon = scene.add.image(x, y, 'status_burn_icon');
    this.burnStatusIcon.setVisible(false);
    this.burnStatusIcon.setBlendMode(Phaser.BlendModes.SCREEN);
    this.poisonAura.setDepth(2.7);
    this.burnAura.setDepth(2.7);
    this.poisonStatusIcon.setDepth(4.8);
    this.burnStatusIcon.setDepth(4.8);

    this.isBoss = true;
    this.body.setAllowGravity(false);

    this.spawn(x, y, config);
  }

  spawn(x, y, config) {
    this.shockwaveTimer?.remove(false);
    this.shockwaveTelegraphTimer?.remove(false);
    this.shockwaveTimer = null;
    this.shockwaveTelegraphTimer = null;

    this.phase = config.phase ?? 1;
    this.name = config.name;
    this.moveSpeed = config.speed;
    this.maxHealth = config.maxHealth;
    this.health = this.maxHealth;
    this.experienceValue = config.experienceValue;
    this.contactDamage = config.contactDamage;
    this.baseTint = config.tint;
    this.dashSpeed = config.dashSpeed;
    this.dashChargeDuration = config.dashChargeDuration;
    this.dashDuration = config.dashDuration;
    this.dashCooldown = config.dashCooldown;
    this.shockwaveDelay = config.shockwaveDelay;
    this.shockwaveRadius = config.shockwaveRadius;
    this.shockwaveDamage = config.shockwaveDamage;
    this.shockwaveChargeDuration = config.shockwaveChargeDuration ?? this.shockwaveDelay;
    this.bulletBurstCooldown = config.bulletBurstCooldown;
    this.bulletSpeed = config.bulletSpeed;
    this.bulletLifeSpan = config.bulletLifeSpan;
    this.bulletDamage = config.bulletDamage;
    this.bulletCountPerNode = config.bulletCountPerNode;
    this.bulletHomingStrength = config.bulletHomingStrength ?? 0;
    this.bulletHomingTurnRate = config.bulletHomingTurnRate ?? this.bulletHomingStrength;
    this.bulletHomingDelayMs = config.bulletHomingDelayMs ?? 0;
    this.bulletHomingDurationMs = config.bulletHomingDurationMs ?? this.bulletLifeSpan;
    this.bulletVolleyCap = config.bulletVolleyCap ?? Number.POSITIVE_INFINITY;
    this.maxActiveBullets = config.maxActiveBullets ?? Number.POSITIVE_INFINITY;
    this.bulletNodeDistance = config.bulletNodeDistance ?? 38;
    this.hitboxRadiusFactor = config.hitboxRadiusFactor ?? 0.28;
    this.spawnProtectionMs = config.spawnProtectionMs ?? 0;
    this.damageTakenMultiplier = config.damageTakenMultiplier ?? 1;
    this.dashAngle = 0;
    this.dashChargeEndAt = 0;
    this.dashEndAt = 0;
    this.nextDashAt = this.scene.time.now + (config.initialDashDelay ?? 1800);
    this.nextBurstAt = this.scene.time.now + (config.initialBurstDelay ?? 2600);
    this.invulnerableUntil = this.scene.time.now + this.spawnProtectionMs;
    this.state = 'idle';
    this.slowMultiplier = 1;
    this.slowUntil = 0;
    this.burnUntil = 0;
    this.burnTickDamage = 0;
    this.burnTickInterval = 500;
    this.burnNextTickAt = 0;
    this.poisonUntil = 0;
    this.poisonTickDamage = 0;
    this.poisonTickInterval = 600;
    this.poisonNextTickAt = 0;
    this.corrosionUntil = 0;
    this.corrosionBonus = 0;

    this.enableBody(true, x, y, true, true);
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.setTint(this.baseTint);
    this.setScale(config.scale ?? 1);
    this.poisonAura.setScale(Math.max(1.22, (config.scale ?? 1) * 1.12));
    this.poisonAura.setVisible(false);
    this.burnAura.setScale(Math.max(1.22, (config.scale ?? 1) * 1.1));
    this.burnAura.setVisible(false);
    this.poisonStatusIcon.setScale(Math.max(1.04, (config.scale ?? 1) * 0.76));
    this.poisonStatusIcon.setVisible(false);
    this.burnStatusIcon.setScale(Math.max(1.04, (config.scale ?? 1) * 0.76));
    this.burnStatusIcon.setVisible(false);
    this.updateHitbox();
    this.shockwaveRadius = config.shockwaveRadius ?? Math.round(this.displayWidth * 0.75);

    return this;
  }

  updateHitbox() {
    const radius = Math.max(18, Math.round(this.displayWidth * this.hitboxRadiusFactor));
    this.setCircle(radius, this.width * 0.5 - radius, this.height * 0.5 - radius);
  }

  update(player, time) {
    if (!this.active || !player?.active) {
      this.setVelocity(0, 0);
      this.scene.hideBossDashTelegraph();
      this.poisonAura.setVisible(false);
      this.burnAura.setVisible(false);
      this.poisonStatusIcon.setVisible(false);
      this.burnStatusIcon.setVisible(false);
      return;
    }

    if (time < this.invulnerableUntil) {
      this.setAlpha(0.72 + Math.sin(time * 0.025) * 0.18);
    } else {
      this.setAlpha(1);
    }

    if (time >= this.burnUntil) {
      this.clearBurn();
    }

    if (time >= this.poisonUntil) {
      this.clearPoison();
    }

    if (time >= this.slowUntil) {
      this.slowMultiplier = 1;
    }

    this.updateStatusVisuals(time);

    if (this.state === 'charging') {
      this.setVelocity(0, 0);
      this.scene.showBossDashTelegraph(this, this.dashAngle);

      if (time >= this.dashChargeEndAt) {
        this.startDashMotion(time);
      }

      return;
    }

    if (this.state === 'dashing') {
      if (time >= this.dashEndAt) {
        this.state = 'idle';
        this.setVelocity(0, 0);
      }

      return;
    }

    this.refreshStatusTint(time);

    if (time >= this.nextDashAt) {
      this.startDashCharge(player, time);
      return;
    }

    if (time >= this.nextBurstAt) {
      this.scene.fireBossRandomBullets(this);
      this.nextBurstAt = time + this.bulletBurstCooldown;
    }

    this.scene.physics.moveToObject(this, player, this.moveSpeed * this.slowMultiplier);
    this.rotation = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
  }

  refreshStatusTint(time = this.scene.time.now) {
    if (time < this.poisonUntil) {
      this.setTint(0x89e56d);
      return;
    }

    if (time < this.burnUntil) {
      this.setTint(0xffad72);
      return;
    }

    if (time < this.slowUntil) {
      this.setTint(0xbfe8ff);
      return;
    }

    this.setTint(this.baseTint);
  }

  updateStatusVisuals(time = this.scene.time.now) {
    const poisonActive = time < this.poisonUntil;
    const burnActive = time < this.burnUntil;
    const baseScale = Math.max(1.04, this.scaleX * 0.76);
    const iconY = this.y - Math.max(34, this.displayHeight * 0.8);

    this.poisonAura.setVisible(poisonActive);
    this.burnAura.setVisible(burnActive);
    this.poisonStatusIcon.setVisible(poisonActive);
    this.burnStatusIcon.setVisible(burnActive);

    if (!poisonActive && !burnActive) {
      return;
    }

    this.poisonAura.setPosition(this.x, this.y);
    this.burnAura.setPosition(this.x, this.y);

    if (poisonActive && burnActive) {
      this.poisonStatusIcon.setPosition(this.x - 11, iconY);
      this.burnStatusIcon.setPosition(this.x + 11, iconY);
    } else if (poisonActive) {
      this.poisonStatusIcon.setPosition(this.x, iconY);
    } else {
      this.burnStatusIcon.setPosition(this.x, iconY);
    }

    if (poisonActive) {
      const poisonPulse = 0.98 + Math.sin(time * 0.013) * 0.1;
      this.poisonAura.setAlpha(0.44 + Math.sin(time * 0.009) * 0.12);
      this.poisonAura.setRotation(time * 0.0011);
      this.poisonAura.setScale(Math.max(1.22, this.scaleX * 1.12) * (1 + Math.sin(time * 0.01) * 0.06));
      this.poisonStatusIcon.setAlpha(0.96 + Math.sin(time * 0.013) * 0.04);
      this.poisonStatusIcon.setScale(baseScale * poisonPulse);
    }

    if (burnActive) {
      const burnPulse = 0.94 + Math.sin(time * 0.02 + 0.7) * 0.1;
      this.burnAura.setAlpha(0.24 + Math.sin(time * 0.018 + 0.6) * 0.08);
      this.burnAura.setRotation(-time * 0.0016);
      this.burnAura.setScale(Math.max(1.08, this.scaleX * 1.02) * (1 + Math.sin(time * 0.017 + 0.4) * 0.05));
      this.burnStatusIcon.setAlpha(0.88 + Math.sin(time * 0.02 + 0.7) * 0.12);
      this.burnStatusIcon.setScale(baseScale * burnPulse);
    }
  }

  startDashCharge(player, time) {
    this.dashAngle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    this.rotation = this.dashAngle;
    this.state = 'charging';
    this.dashChargeEndAt = time + this.dashChargeDuration;
    this.scene.showBossDashTelegraph(this, this.dashAngle);
  }

  startDashMotion(time) {
    this.scene.hideBossDashTelegraph();
    this.state = 'dashing';
    this.dashEndAt = time + this.dashDuration;
    this.nextDashAt = time + this.dashCooldown;
    this.nextBurstAt = Math.max(this.nextBurstAt, this.dashEndAt + this.shockwaveDelay + 900);
    this.shockwaveTelegraphTimer?.remove(false);
    this.shockwaveTimer?.remove(false);
    this.shockwaveTelegraphTimer = this.scene.time.delayedCall(
      this.dashDuration,
      () => {
        if (!this.active) {
          return;
        }

        this.scene.createShockwaveChargeEffect(this.x, this.y, this.shockwaveRadius, this.shockwaveChargeDuration);
      }
    );
    this.shockwaveTimer = this.scene.time.delayedCall(
      this.dashDuration + this.shockwaveDelay,
      () => {
        if (!this.active) {
          return;
        }

        this.scene.triggerBossShockwave(this);
      }
    );
    this.scene.physics.velocityFromRotation(this.dashAngle, this.dashSpeed, this.body.velocity);
  }

  applyChill(effect = {}, time = 0) {
    const slowMultiplier = Phaser.Math.Clamp(effect.slowMultiplier ?? 1, 0.7, 1);
    const slowDuration = effect.slowDuration ?? 0;

    if (slowDuration > 0 && slowMultiplier < this.slowMultiplier) {
      this.slowMultiplier = slowMultiplier;
      this.slowUntil = Math.max(this.slowUntil, time + Math.floor(slowDuration * 0.5));
    }

    this.refreshStatusTint(time);
  }

  applyPoison(effect = {}, time = 0) {
    const poisonDamage = effect.poisonDamage ?? 0;
    const poisonDuration = effect.poisonDuration ?? 0;

    if (poisonDamage <= 0 || poisonDuration <= 0) {
      return;
    }

    this.poisonTickDamage = Math.max(this.poisonTickDamage, poisonDamage);
    this.poisonTickInterval = effect.poisonTickInterval ?? 600;
    this.poisonUntil = Math.max(this.poisonUntil, time + poisonDuration);

    if (this.poisonNextTickAt <= time) {
      this.poisonNextTickAt = time + this.poisonTickInterval;
    }

    this.refreshStatusTint(time);
  }

  consumePoisonTick(time = this.scene.time.now) {
    if (time >= this.poisonUntil) {
      this.clearPoison();
      return 0;
    }

    if (this.poisonTickDamage <= 0 || this.poisonNextTickAt <= 0 || time < this.poisonNextTickAt) {
      return 0;
    }

    this.poisonNextTickAt = time + this.poisonTickInterval;
    return this.poisonTickDamage;
  }

  clearPoison() {
    this.poisonUntil = 0;
    this.poisonTickDamage = 0;
    this.poisonNextTickAt = 0;
    this.corrosionUntil = 0;
    this.corrosionBonus = 0;
  }

  applyBurn(effect = {}, time = 0) {
    const burnDamage = effect.burnDamage ?? 0;
    const burnDuration = effect.burnDuration ?? 0;

    if (burnDamage <= 0 || burnDuration <= 0) {
      return;
    }

    this.burnTickDamage = Math.max(this.burnTickDamage, burnDamage);
    this.burnTickInterval = effect.burnTickInterval ?? 500;
    this.burnUntil = Math.max(this.burnUntil, time + burnDuration);

    if (this.burnNextTickAt <= time) {
      this.burnNextTickAt = time + this.burnTickInterval;
    }

    this.refreshStatusTint(time);
  }

  consumeBurnTick(time = this.scene.time.now) {
    if (time >= this.burnUntil) {
      this.clearBurn();
      return 0;
    }

    if (this.burnTickDamage <= 0 || this.burnNextTickAt <= 0 || time < this.burnNextTickAt) {
      return 0;
    }

    this.burnNextTickAt = time + this.burnTickInterval;
    return this.burnTickDamage;
  }

  clearBurn() {
    this.burnUntil = 0;
    this.burnTickDamage = 0;
    this.burnNextTickAt = 0;
  }

  takeDamage(amount) {
    if (this.scene.time.now < this.invulnerableUntil) {
      return false;
    }

    const corrosionMultiplier = this.scene.time.now < this.corrosionUntil ? 1 + this.corrosionBonus : 1;
    this.health -= amount * this.damageTakenMultiplier * corrosionMultiplier;
    return this.health <= 0;
  }

  deactivate() {
    this.shockwaveTimer?.remove(false);
    this.shockwaveTelegraphTimer?.remove(false);
    this.shockwaveTimer = null;
    this.shockwaveTelegraphTimer = null;
    this.scene.hideBossDashTelegraph();
    this.state = 'idle';
    this.slowMultiplier = 1;
    this.slowUntil = 0;
    this.clearBurn();
    this.clearPoison();
    this.dashAngle = 0;
    this.dashChargeEndAt = 0;
    this.dashEndAt = 0;
    this.invulnerableUntil = 0;
    this.damageTakenMultiplier = 1;
    this.disableBody(true, true);
    this.setVelocity(0, 0);
    this.setTint(this.baseTint ?? 0xffffff);
    this.setAlpha(1);
    this.poisonAura.setVisible(false);
    this.burnAura.setVisible(false);
    this.poisonStatusIcon.setVisible(false);
    this.burnStatusIcon.setVisible(false);
  }

  destroy(fromScene) {
    this.poisonAura?.destroy();
    this.burnAura?.destroy();
    this.poisonStatusIcon?.destroy();
    this.burnStatusIcon?.destroy();
    super.destroy(fromScene);
  }
}
