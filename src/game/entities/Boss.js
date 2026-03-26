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
    this.shockwaveTimer = null;

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
    this.bulletBurstCooldown = config.bulletBurstCooldown;
    this.bulletSpeed = config.bulletSpeed;
    this.bulletLifeSpan = config.bulletLifeSpan;
    this.bulletDamage = config.bulletDamage;
    this.bulletCountPerNode = config.bulletCountPerNode;
    this.bulletHomingStrength = config.bulletHomingStrength ?? 0;
    this.bulletNodeDistance = config.bulletNodeDistance ?? 38;
    this.dashAngle = 0;
    this.dashChargeEndAt = 0;
    this.dashEndAt = 0;
    this.nextDashAt = this.scene.time.now + 1800;
    this.nextBurstAt = this.scene.time.now + 2600;
    this.state = 'idle';
    this.slowMultiplier = 1;
    this.slowUntil = 0;

    this.enableBody(true, x, y, true, true);
    this.setActive(true);
    this.setVisible(true);
    this.setPosition(x, y);
    this.setVelocity(0, 0);
    this.setTint(this.baseTint);
    this.setScale(config.scale ?? 1);
    this.updateHitbox();

    return this;
  }

  updateHitbox() {
    const radius = Math.max(20, Math.round(13 * (this.scaleX ?? 1)));
    this.setCircle(radius, this.width * 0.5 - radius, this.height * 0.5 - radius);
  }

  update(player, time) {
    if (!this.active || !player?.active) {
      this.setVelocity(0, 0);
      this.scene.hideBossDashTelegraph();
      return;
    }

    if (time >= this.slowUntil) {
      this.slowMultiplier = 1;
      this.setTint(this.baseTint);
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
    this.nextBurstAt = Math.max(this.nextBurstAt, this.dashEndAt + this.shockwaveDelay + 1000);
    this.shockwaveTimer?.remove(false);
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
      this.setTint(0xbfe8ff);
    }
  }

  takeDamage(amount) {
    this.health -= amount;
    return this.health <= 0;
  }

  deactivate() {
    this.shockwaveTimer?.remove(false);
    this.shockwaveTimer = null;
    this.scene.hideBossDashTelegraph();
    this.state = 'idle';
    this.slowMultiplier = 1;
    this.slowUntil = 0;
    this.dashAngle = 0;
    this.dashChargeEndAt = 0;
    this.dashEndAt = 0;
    this.disableBody(true, true);
    this.setVelocity(0, 0);
    this.setTint(this.baseTint ?? 0xffffff);
  }
}
