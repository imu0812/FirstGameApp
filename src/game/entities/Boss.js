import Phaser from 'phaser';

export class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, 'boss');

    scene.add.existing(this);
    scene.physics.add.existing(this);

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

    this.enableBody(true, x, y, true, true);
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.setTint(this.baseTint);
    this.setScale(config.scale ?? 1);
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

    if (time >= this.slowUntil) {
      this.slowMultiplier = 1;
    }

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

    this.health -= amount * this.damageTakenMultiplier;
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
    this.dashAngle = 0;
    this.dashChargeEndAt = 0;
    this.dashEndAt = 0;
    this.invulnerableUntil = 0;
    this.damageTakenMultiplier = 1;
    this.disableBody(true, true);
    this.setVelocity(0, 0);
    this.setTint(this.baseTint ?? 0xffffff);
    this.setAlpha(1);
  }
}
