import Phaser from 'phaser';

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, config?.isRanged ? 'elite_ranger' : 'enemy');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.freezeOutline = scene.add.image(x, y, 'ice_shell');
    this.freezeOutline.setVisible(false);
    this.freezeOutline.setAlpha(0.92);
    this.freezeOutline.setBlendMode(Phaser.BlendModes.SCREEN);
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
    this.rootBindVisual = scene.add.image(x, y, 'vine_turret_root_bind');
    this.rootBindVisual.setVisible(false);
    this.rootBindVisual.setBlendMode(Phaser.BlendModes.SCREEN);
    this.freezeOutline.setDepth(2.6);
    this.poisonAura.setDepth(2.7);
    this.burnAura.setDepth(2.7);
    this.rootBindVisual.setDepth(2.85);
    this.poisonStatusIcon.setDepth(4.6);
    this.burnStatusIcon.setDepth(4.6);

    this.body.setAllowGravity(false);

    this.spawn(x, y, config);
  }

  spawn(x, y, config) {
    this.typeKey = config.key;
    this.typeName = config.name;
    this.isElite = Boolean(config.isElite);
    this.isRanged = Boolean(config.isRanged);
    this.moveSpeed = config.speed;
    this.maxHealth = config.maxHealth;
    this.health = this.maxHealth;
    this.experienceValue = config.experienceValue;
    this.contactDamage = config.contactDamage;
    this.baseTint = config.tint;
    this.bodyRadiusFactor = config.bodyRadiusFactor ?? 0.44;
    this.slowMultiplier = 1;
    this.slowUntil = 0;
    this.frozenUntil = 0;
    this.freezeBuildup = 0;
    this.freezeBuildupDecayDelay = 0;
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
    this.rootUntil = 0;
    this.preferredRange = config.preferredRange ?? 0;
    this.minRange = config.minRange ?? 0;
    this.attackRange = config.attackRange ?? 0;
    this.projectileSpeed = config.projectileSpeed ?? 0;
    this.projectileLifeSpan = config.projectileLifeSpan ?? 0;
    this.projectileDamage = config.projectileDamage ?? 0;
    this.projectileBodyRadius = config.projectileBodyRadius ?? 6;
    this.projectileTint = config.projectileTint ?? 0xffffff;
    this.projectileScale = config.projectileScale ?? 1;
    this.projectileCooldown = config.projectileCooldown ?? 0;
    this.telegraphDuration = config.telegraphDuration ?? 0;
    this.initialShotDelayMin = config.initialShotDelayMin ?? 800;
    this.initialShotDelayMax = config.initialShotDelayMax ?? 1400;
    this.nextShotAt = this.scene.time.now + Phaser.Math.Between(this.initialShotDelayMin, this.initialShotDelayMax);
    this.windupUntil = 0;
    this.windupFlash = false;

    this.enableBody(true, x, y, true, true);
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.setTexture(this.isRanged ? 'elite_ranger' : 'enemy');
    this.setTint(this.baseTint);
    this.setScale(config.scale ?? 1);
    this.updateHitbox();

    this.freezeOutline.setPosition(x, y);
    this.freezeOutline.setScale((config.scale ?? 1) * 1.22);
    this.freezeOutline.setVisible(false);
    this.poisonAura.setScale(Math.max(1.08, (config.scale ?? 1) * 1.26));
    this.poisonAura.setVisible(false);
    this.burnAura.setScale(Math.max(1.08, (config.scale ?? 1) * 1.24));
    this.burnAura.setVisible(false);
    this.rootBindVisual.setScale(Math.max(0.98, (config.scale ?? 1) * 1.08));
    this.rootBindVisual.setVisible(false);
    this.poisonStatusIcon.setScale(Math.max(0.94, (config.scale ?? 1) * 0.9));
    this.poisonStatusIcon.setVisible(false);
    this.burnStatusIcon.setScale(Math.max(0.94, (config.scale ?? 1) * 0.9));
    this.burnStatusIcon.setVisible(false);

    return this;
  }

  updateHitbox() {
    const radius = Math.max(10, Math.round(this.displayWidth * this.bodyRadiusFactor));
    this.setCircle(radius, this.width * 0.5 - radius, this.height * 0.5 - radius);
  }

  update(player, time = this.scene.time.now) {
    if (!this.active || !player?.active) {
      this.setVelocity(0, 0);
      this.freezeOutline.setVisible(false);
      this.poisonAura.setVisible(false);
      this.burnAura.setVisible(false);
      this.rootBindVisual.setVisible(false);
      this.poisonStatusIcon.setVisible(false);
      this.burnStatusIcon.setVisible(false);
      return;
    }

    this.freezeOutline.setPosition(this.x, this.y);
    this.updateStatusVisuals(time);

    if (time < this.frozenUntil) {
      this.setVelocity(0, 0);
      this.setTint(0xbfe8ff);
      this.freezeOutline.setVisible(true);
      return;
    }

    this.freezeOutline.setVisible(false);

    if (time >= this.burnUntil) {
      this.clearBurn();
    }

    if (time >= this.poisonUntil) {
      this.clearPoison();
    }

    if (time >= this.slowUntil) {
      this.slowMultiplier = 1;
    }

    if (this.freezeBuildup > 0 && time >= this.freezeBuildupDecayDelay && time >= this.frozenUntil) {
      this.freezeBuildup = Math.max(0, this.freezeBuildup - (this.isElite ? 0.08 : 0.11) * (time - this.freezeBuildupDecayDelay));
      this.freezeBuildupDecayDelay = time;
    }

    this.refreshStatusTint(time);

    if (time < this.rootUntil) {
      this.setVelocity(0, 0);
      return;
    }

    if (this.isRanged) {
      this.updateRangedBehavior(player, time);
      return;
    }

    this.scene.physics.moveToObject(this, player, this.moveSpeed * this.slowMultiplier);
    this.rotation = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
  }

  refreshStatusTint(time = this.scene.time.now) {
    if (time < this.frozenUntil) {
      this.setTint(0xbfe8ff);
      return;
    }

    if (time < this.poisonUntil) {
      this.setTint(0x89e56d);
      return;
    }

    if (time < this.burnUntil) {
      this.setTint(0xffa463);
      return;
    }

    if (time < this.slowUntil) {
      this.setTint(0x8fd8ff);
      return;
    }

    this.setTint(this.baseTint);
  }

  updateStatusVisuals(time = this.scene.time.now) {
    const poisonActive = time < this.poisonUntil;
    const burnActive = time < this.burnUntil;
    const rootActive = time < this.rootUntil;
    const baseScale = Math.max(0.94, this.scaleX * 0.9);
    const iconY = this.y - Math.max(24, this.displayHeight * 0.82);

    this.poisonAura.setVisible(poisonActive);
    this.burnAura.setVisible(burnActive);
    this.rootBindVisual.setVisible(rootActive);
    this.poisonStatusIcon.setVisible(poisonActive);
    this.burnStatusIcon.setVisible(burnActive);

    if (!poisonActive && !burnActive && !rootActive) {
      return;
    }

    this.poisonAura.setPosition(this.x, this.y);
    this.burnAura.setPosition(this.x, this.y);
    this.rootBindVisual.setPosition(this.x, this.y + Math.max(6, this.displayHeight * 0.08));

    if (poisonActive && burnActive) {
      this.poisonStatusIcon.setPosition(this.x - 9, iconY);
      this.burnStatusIcon.setPosition(this.x + 9, iconY);
    } else if (poisonActive) {
      this.poisonStatusIcon.setPosition(this.x, iconY);
    } else {
      this.burnStatusIcon.setPosition(this.x, iconY);
    }

    if (poisonActive) {
      const poisonPulse = 0.98 + Math.sin(time * 0.013) * 0.1;
      this.poisonAura.setAlpha(0.48 + Math.sin(time * 0.009) * 0.12);
      this.poisonAura.setRotation(time * 0.0012);
      this.poisonAura.setScale(Math.max(1.08, this.scaleX * 1.26) * (1 + Math.sin(time * 0.01) * 0.06));
      this.poisonStatusIcon.setAlpha(0.96 + Math.sin(time * 0.013) * 0.04);
      this.poisonStatusIcon.setScale(baseScale * poisonPulse);
    }

    if (burnActive) {
      const burnPulse = 0.94 + Math.sin(time * 0.02 + 0.7) * 0.1;
      this.burnAura.setAlpha(0.26 + Math.sin(time * 0.018 + 0.6) * 0.08);
      this.burnAura.setRotation(-time * 0.0018);
      this.burnAura.setScale(Math.max(0.92, this.scaleX * 1.08) * (1 + Math.sin(time * 0.017 + 0.4) * 0.05));
      this.burnStatusIcon.setAlpha(0.88 + Math.sin(time * 0.02 + 0.7) * 0.12);
      this.burnStatusIcon.setScale(baseScale * burnPulse);
    }

    if (rootActive) {
      const bindPulse = 0.96 + Math.sin(time * 0.018 + 1.1) * 0.05;
      this.rootBindVisual.setAlpha(0.72 + Math.sin(time * 0.014) * 0.12);
      this.rootBindVisual.setRotation(Math.sin(time * 0.003) * 0.04);
      this.rootBindVisual.setScale(Math.max(0.9, this.scaleX * 1.04) * bindPulse);
    }
  }

  updateRangedBehavior(player, time) {
    const angleToPlayer = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    this.rotation = angleToPlayer;

    if (this.windupUntil > 0) {
      this.setVelocity(0, 0);
      this.setTint(this.windupFlash ? 0xfff2b8 : 0xffc47a);
      this.windupFlash = !this.windupFlash;

      if (time >= this.windupUntil) {
        this.windupUntil = 0;
        this.windupFlash = false;
        this.refreshStatusTint(time);
        this.scene.fireEliteProjectile(this, angleToPlayer);
        this.nextShotAt = time + this.projectileCooldown;
      }

      return;
    }

    if (distance <= this.attackRange && time >= this.nextShotAt) {
      this.windupUntil = time + this.telegraphDuration;
      this.setVelocity(0, 0);
      this.setTint(0xfff2b8);
      return;
    }

    if (distance > this.preferredRange) {
      this.scene.physics.moveToObject(this, player, this.moveSpeed * this.slowMultiplier);
      return;
    }

    if (distance < this.minRange) {
      this.scene.physics.velocityFromRotation(angleToPlayer + Math.PI, this.moveSpeed * 0.9 * this.slowMultiplier, this.body.velocity);
      return;
    }

    this.setVelocity(0, 0);
  }

  applyChill(effect = {}, time = 0) {
    const slowMultiplier = Phaser.Math.Clamp(effect.slowMultiplier ?? 1, 0.2, 1);
    const slowDuration = effect.slowDuration ?? 0;
    const freezeDuration = effect.freezeDuration ?? 0;
    const freezeBuildup = effect.freezeBuildup ?? 0;

    if (slowDuration > 0 && slowMultiplier < this.slowMultiplier) {
      this.slowMultiplier = slowMultiplier;
    }

    if (slowDuration > 0) {
      this.slowUntil = Math.max(this.slowUntil, time + slowDuration);
    }

    if (freezeDuration > 0) {
      let appliedFreezeDuration = freezeDuration;

      if (freezeBuildup > 0) {
        const buildupMultiplier = this.isElite ? 0.72 : 1;
        const threshold = this.isElite ? 140 : 100;
        this.freezeBuildup = Math.min(threshold, this.freezeBuildup + freezeBuildup * buildupMultiplier);
        this.freezeBuildupDecayDelay = time + 900;

        if (this.freezeBuildup >= threshold) {
          appliedFreezeDuration = this.isElite ? Math.floor(freezeDuration * 0.58) : freezeDuration;
          this.freezeBuildup = this.isElite ? 46 : 0;
        } else {
          appliedFreezeDuration = 0;
        }
      }

      if (appliedFreezeDuration > 0) {
        this.frozenUntil = Math.max(this.frozenUntil, time + appliedFreezeDuration);
        this.setVelocity(0, 0);
        this.setTint(0xbfe8ff);
        this.freezeOutline.setPosition(this.x, this.y);
        this.freezeOutline.setVisible(true);
        return;
      }
    }

    this.refreshStatusTint(time);
  }

  applyRoot(effect = {}, time = 0) {
    const rootDuration = effect.rootDuration ?? 0;

    if (rootDuration <= 0) {
      return;
    }

    this.rootUntil = Math.max(this.rootUntil, time + rootDuration);
    this.setVelocity(0, 0);
    this.refreshStatusTint(time);
  }

  applyPoison(effect = {}, time = 0) {
    const poisonDamage = effect.poisonDamage ?? 0;
    const poisonDuration = effect.poisonDuration ?? 0;
    const corrosionBonus = effect.corrosionBonus ?? 0;
    const corrosionDuration = effect.corrosionDuration ?? poisonDuration;
    if (poisonDamage <= 0 || poisonDuration <= 0) {
      return;
    }
    this.poisonTickDamage = Math.max(this.poisonTickDamage, poisonDamage);
    this.poisonTickInterval = effect.poisonTickInterval ?? 600;
    this.poisonUntil = Math.max(this.poisonUntil, time + poisonDuration);
    if (this.poisonNextTickAt <= time) {
      this.poisonNextTickAt = time + this.poisonTickInterval;
    }
    if (corrosionBonus > 0 && corrosionDuration > 0) {
      this.corrosionBonus = Math.max(this.corrosionBonus, corrosionBonus);
      this.corrosionUntil = Math.max(this.corrosionUntil, time + corrosionDuration);
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
    const corrosionMultiplier = this.scene.time.now < this.corrosionUntil ? 1 + this.corrosionBonus : 1;
    this.health -= amount * corrosionMultiplier;
    return this.health <= 0;
  }

  deactivate() {
    this.disableBody(true, true);
    this.setVelocity(0, 0);
    this.slowMultiplier = 1;
    this.slowUntil = 0;
    this.frozenUntil = 0;
    this.freezeBuildup = 0;
    this.freezeBuildupDecayDelay = 0;
    this.clearBurn();
    this.clearPoison();
    this.corrosionUntil = 0;
    this.corrosionBonus = 0;
    this.rootUntil = 0;
    this.windupUntil = 0;
    this.windupFlash = false;
    this.setTint(this.baseTint ?? 0xffffff);
    this.freezeOutline.setVisible(false);
    this.poisonAura.setVisible(false);
    this.burnAura.setVisible(false);
    this.rootBindVisual.setVisible(false);
    this.poisonStatusIcon.setVisible(false);
    this.burnStatusIcon.setVisible(false);
  }

  destroy(fromScene) {
    this.freezeOutline?.destroy();
    this.poisonAura?.destroy();
    this.burnAura?.destroy();
    this.rootBindVisual?.destroy();
    this.poisonStatusIcon?.destroy();
    this.burnStatusIcon?.destroy();
    super.destroy(fromScene);
  }
}
