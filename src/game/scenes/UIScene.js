import Phaser from 'phaser';

export class UIScene extends Phaser.Scene {
  constructor() {
    super('UIScene');
  }

  create() {
    this.joystickPointerId = null;
    this.joystickMaxDistance = 30;
    this.joystickActivationRadius = 78;
    this.isPaused = false;

    this.pauseKeys = this.input.keyboard.addKeys({
      pause: Phaser.Input.Keyboard.KeyCodes.P,
      escape: Phaser.Input.Keyboard.KeyCodes.ESC
    });
    this.levelUpRefreshCost = 50;
    this.currentGold = 0;

    this.expBarBackground = this.add.rectangle(12, 8, this.scale.width - 24, 8, 0x07131d, 0.88).setOrigin(0, 0).setScrollFactor(0);
    this.expBarFill = this.add.rectangle(12, 8, 0, 8, 0x75f2b7, 1).setOrigin(0, 0).setScrollFactor(0);
    this.expBarFrame = this.add.rectangle(12, 8, this.scale.width - 24, 8).setOrigin(0, 0).setStrokeStyle(1, 0xd5fff0, 0.5).setFillStyle(0x000000, 0).setScrollFactor(0);

    this.levelBadge = this.add.text(14, 19, 'Lv 1', {
      fontFamily: 'Trebuchet MS',
      fontSize: '14px',
      color: '#f5e6a8',
      stroke: '#10212c',
      strokeThickness: 3
    }).setScrollFactor(0);

    this.infoBackdrop = this.add.rectangle(10, 36, 128, 48, 0x05111a, 0.34).setOrigin(0).setScrollFactor(0);
    this.infoText = this.add.text(16, 41, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '13px',
      color: '#eff7fb',
      lineSpacing: 5,
      stroke: '#081019',
      strokeThickness: 3
    }).setScrollFactor(0);

    this.createBossBar();

    this.helpText = this.add.text(12, this.scale.height - 10, 'Move: WASD / Arrows / Touch', {
      fontFamily: 'Trebuchet MS',
      fontSize: '11px',
      color: '#b6c9d6'
    }).setOrigin(0, 1).setScrollFactor(0);

    this.createPauseButton();
    this.createVirtualJoystick();
    this.createPauseMenu();
    this.createLevelUpMenu();
    this.createGameOverMenu();
    this.createBossWarning();
    this.createObjectiveIndicator();

    this.input.addPointer(2);
    this.input.on('pointerdown', this.handlePointerDown, this);
    this.input.on('pointermove', this.handlePointerMove, this);
    this.input.on('pointerup', this.handlePointerUp, this);
    this.input.on('pointerupoutside', this.handlePointerUp, this);

    this.scale.on('resize', this.handleResize, this);
    this.game.events.on('game-stats', this.updateStats, this);
    this.game.events.on('pause-state-changed', this.setPauseState, this);
    this.game.events.on('level-up-opened', this.showLevelUpMenu, this);
    this.game.events.on('level-up-closed', this.hideLevelUpMenu, this);
    this.game.events.on('game-over', this.showGameOverMenu, this);
    this.game.events.on('stage-clear', this.showStageClearMenu, this);
    this.game.events.on('boss-warning', this.showBossWarning, this);
    this.game.events.on('game-reset', this.resetOverlays, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);

    this.handleResize(this.scale.gameSize);
    this.updateStats({
      level: 1,
      difficultyStage: 1,
      difficultyLabel: 'Stage 1',
      experience: 0,
      experienceToNextLevel: 5,
      health: 6,
      maxHealth: 6,
      time: 0,
      gold: 0,
      shield: 0,
      isPaused: false
    });
  }

  update() {
    if (Phaser.Input.Keyboard.JustDown(this.pauseKeys.pause) || Phaser.Input.Keyboard.JustDown(this.pauseKeys.escape)) {
      this.togglePause();
    }

    this.updateObjectiveIndicator();
  }

  updateStats(stats) {
    const expRatio = Phaser.Math.Clamp(stats.experience / stats.experienceToNextLevel, 0, 1);

    this.levelBadge.setText(`Lv ${stats.level}`);
    this.infoText.setText(`${stats.difficultyLabel}\n${stats.time.toFixed(1)}s  金 ${stats.gold ?? 0}`);
    this.expBarFill.width = this.expBarWidth * expRatio;
    this.currentGold = stats.gold ?? 0;
    this.isPaused = stats.isPaused ?? this.isPaused;
    this.updateRefreshButtonState();

    if (stats.boss) {
      const bossRatio = Phaser.Math.Clamp(stats.boss.health / stats.boss.maxHealth, 0, 1);
      this.bossBarTitle.setText(stats.boss.name);
      this.bossBarFill.width = this.bossBarWidth * bossRatio;
      this.bossBarTitle.setVisible(true);
      this.bossBarBackground.setVisible(true);
      this.bossBarFill.setVisible(true);
      this.bossBarFrame.setVisible(true);
    } else {
      this.bossBarTitle.setVisible(false);
      this.bossBarBackground.setVisible(false);
      this.bossBarFill.setVisible(false);
      this.bossBarFrame.setVisible(false);
    }
  }

  handleResize(gameSize) {
    const isTallMobile = gameSize.width <= 420;
    const isShortLandscape = gameSize.height < 520;
    const joystickY = isShortLandscape ? gameSize.height - 74 : gameSize.height - 86;

    this.expBarWidth = gameSize.width - 24;
    this.expBarBackground.setSize(this.expBarWidth, 8).setPosition(12, 8);
    this.expBarFill.setPosition(12, 8);
    this.expBarFrame.setSize(this.expBarWidth, 8).setPosition(12, 8);
    this.levelBadge.setPosition(14, 19).setFontSize(isTallMobile ? '14px' : '15px');

    this.infoBackdrop.setPosition(10, 36).setSize(isTallMobile ? 126 : 136, 48);
    this.infoText.setPosition(16, 41).setFontSize(isTallMobile ? '13px' : '14px');

    this.helpText.setPosition(12, gameSize.height - 10);
    this.helpText.setFontSize(isTallMobile ? '11px' : '12px');

    this.pauseButton.setPosition(gameSize.width - 34, 30);
    this.pauseButtonBackground.setSize(46, 46);

    this.bossBarWidth = Math.min(gameSize.width - 84, 232);
    this.bossBarTitle.setPosition(gameSize.width / 2, 18);
    this.bossBarBackground.setPosition(gameSize.width / 2, 54).setSize(this.bossBarWidth, 10);
    this.bossBarFill.setPosition(gameSize.width / 2 - this.bossBarWidth / 2, 54);
    this.bossBarFrame.setPosition(gameSize.width / 2, 54).setSize(this.bossBarWidth, 10);

    this.warningText.setPosition(gameSize.width / 2, gameSize.height * 0.28);

    this.joystickBasePosition = new Phaser.Math.Vector2(gameSize.width / 2, joystickY);
    this.joystickBase.setPosition(this.joystickBasePosition.x, this.joystickBasePosition.y);
    this.joystickThumb.setPosition(this.joystickBasePosition.x, this.joystickBasePosition.y);
    this.joystickBase.setScale(isTallMobile ? 1 : 1.08);
    this.joystickThumb.setScale(isTallMobile ? 1 : 1.08);

    this.pauseBackdrop.setSize(gameSize.width, gameSize.height);
    this.pausePanel.setSize(Math.min(gameSize.width - 40, 300), 204).setPosition(gameSize.width / 2, gameSize.height / 2);
    this.pauseTitle.setPosition(gameSize.width / 2, gameSize.height / 2 - 52);
    this.pauseHint.setPosition(gameSize.width / 2, gameSize.height / 2 - 10);
    this.resumeButton.setPosition(gameSize.width / 2, gameSize.height / 2 + 52);

    this.levelUpBackdrop.setSize(gameSize.width, gameSize.height);
    this.levelUpPanel.setSize(Math.min(gameSize.width - 28, 324), Math.min(gameSize.height - 32, isShortLandscape ? 500 : 520)).setPosition(gameSize.width / 2, gameSize.height / 2);
    this.levelUpTitle.setPosition(gameSize.width / 2, gameSize.height / 2 - 188);
    this.levelUpTitle.setFontSize(isTallMobile ? '23px' : '27px');
    this.optionButtons.forEach((button, index) => {
      button.container.setPosition(gameSize.width / 2, gameSize.height / 2 - 100 + index * 100);
      button.background.width = Math.min(gameSize.width - 46, 286);
      button.background.height = isShortLandscape ? 92 : 96;
    });
    this.refreshButton.setPosition(gameSize.width / 2, gameSize.height / 2 + (isShortLandscape ? 188 : 196));

    this.gameOverBackdrop.setSize(gameSize.width, gameSize.height);
    this.gameOverPanel.setSize(Math.min(gameSize.width - 34, 320), Math.min(gameSize.height - 80, 300)).setPosition(gameSize.width / 2, gameSize.height / 2);
    this.gameOverTitle.setPosition(gameSize.width / 2, gameSize.height / 2 - 92);
    this.gameOverTitle.setFontSize(isTallMobile ? '30px' : '34px');
    this.gameOverStats.setPosition(gameSize.width / 2, gameSize.height / 2 - 14);
    this.restartButton.setPosition(gameSize.width / 2, gameSize.height / 2 + 84);

    this.releaseJoystick();
  }

  shutdown() {
    this.scale.off('resize', this.handleResize, this);
    this.input.off('pointerdown', this.handlePointerDown, this);
    this.input.off('pointermove', this.handlePointerMove, this);
    this.input.off('pointerup', this.handlePointerUp, this);
    this.input.off('pointerupoutside', this.handlePointerUp, this);
    this.game.events.off('game-stats', this.updateStats, this);
    this.game.events.off('pause-state-changed', this.setPauseState, this);
    this.game.events.off('level-up-opened', this.showLevelUpMenu, this);
    this.game.events.off('level-up-closed', this.hideLevelUpMenu, this);
    this.game.events.off('game-over', this.showGameOverMenu, this);
    this.game.events.off('stage-clear', this.showStageClearMenu, this);
    this.game.events.off('boss-warning', this.showBossWarning, this);
    this.game.events.off('game-reset', this.resetOverlays, this);
  }

  createBossBar() {
    this.bossBarWidth = 220;
    this.bossBarTitle = this.add.text(this.scale.width / 2, 18, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '14px',
      color: '#dff7ff'
    }).setOrigin(0.5, 0).setScrollFactor(0).setVisible(false);

    this.bossBarBackground = this.add.rectangle(this.scale.width / 2, 54, this.bossBarWidth, 10, 0x26131b, 0.92).setOrigin(0.5, 0).setScrollFactor(0).setVisible(false);
    this.bossBarFill = this.add.rectangle(this.scale.width / 2 - this.bossBarWidth / 2, 54, this.bossBarWidth, 10, 0x6dd3ff, 1).setOrigin(0, 0).setScrollFactor(0).setVisible(false);
    this.bossBarFrame = this.add.rectangle(this.scale.width / 2, 54, this.bossBarWidth, 10).setOrigin(0.5, 0).setStrokeStyle(1, 0xe2fbff, 0.4).setFillStyle(0x000000, 0).setScrollFactor(0).setVisible(false);
  }

  createPauseButton() {
    this.pauseButtonBackground = this.add.rectangle(0, 0, 46, 46, 0x102839, 0.92).setStrokeStyle(2, 0x6dd3ff, 0.38).setInteractive({ useHandCursor: true });
    const pauseLabel = this.add.text(0, -1, 'II', {
      fontFamily: 'Trebuchet MS',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.pauseButtonBackground.on('pointerdown', () => this.togglePause());
    this.pauseButtonBackground.on('pointerover', () => this.pauseButtonBackground.setFillStyle(0x17384e, 1));
    this.pauseButtonBackground.on('pointerout', () => this.pauseButtonBackground.setFillStyle(0x102839, 0.92));

    this.pauseButton = this.add.container(0, 0, [this.pauseButtonBackground, pauseLabel]);
    this.pauseButton.setScrollFactor(0);
  }

  createVirtualJoystick() {
    this.joystickBase = this.add.circle(this.scale.width / 2, this.scale.height - 86, 52, 0x0c2535, 0.24).setStrokeStyle(2, 0x88d5ef, 0.35).setScrollFactor(0);
    this.joystickThumb = this.add.circle(this.scale.width / 2, this.scale.height - 86, 24, 0x88d5ef, 0.32).setStrokeStyle(2, 0xe2fbff, 0.45).setScrollFactor(0);
  }

  createPauseMenu() {
    this.pauseBackdrop = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x02070d, 0.76).setOrigin(0).setScrollFactor(0).setVisible(false);
    this.pausePanel = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 300, 204, 0x091824, 0.98).setStrokeStyle(3, 0x9ae5ff, 0.4).setScrollFactor(0).setVisible(false);
    this.pauseTitle = this.add.text(this.scale.width / 2, this.scale.height / 2 - 52, '已暫停', {
      fontFamily: 'Trebuchet MS',
      fontSize: '28px',
      color: '#f3efe0'
    }).setOrigin(0.5).setScrollFactor(0).setVisible(false);
    this.pauseHint = this.add.text(this.scale.width / 2, this.scale.height / 2 - 10, '點擊下方按鈕或按 P / Esc 繼續', {
      fontFamily: 'Trebuchet MS',
      fontSize: '14px',
      color: '#b8cfdb',
      align: 'center'
    }).setOrigin(0.5).setScrollFactor(0).setVisible(false);

    const resumeBackground = this.add.rectangle(0, 0, 180, 48, 0x17384e, 1).setStrokeStyle(2, 0x9ae5ff, 0.45).setInteractive({ useHandCursor: true });
    const resumeLabel = this.add.text(0, 0, '繼續遊戲', {
      fontFamily: 'Trebuchet MS',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    resumeBackground.on('pointerdown', () => this.togglePause(false));
    resumeBackground.on('pointerover', () => resumeBackground.setFillStyle(0x1d4a67, 1));
    resumeBackground.on('pointerout', () => resumeBackground.setFillStyle(0x17384e, 1));

    this.resumeButton = this.add.container(this.scale.width / 2, this.scale.height / 2 + 52, [resumeBackground, resumeLabel]);
    this.resumeButton.setScrollFactor(0).setVisible(false);
  }

  togglePause(forceState) {
    if (this.gameOverBackdrop.visible || this.levelUpBackdrop.visible) {
      return;
    }

    this.game.events.emit('toggle-pause', forceState);
  }

  setPauseState(data) {
    this.isPaused = data.paused;
    this.releaseJoystick();
    this.pauseBackdrop.setVisible(this.isPaused);
    this.pausePanel.setVisible(this.isPaused);
    this.pauseTitle.setVisible(this.isPaused);
    this.pauseHint.setVisible(this.isPaused);
    this.resumeButton.setVisible(this.isPaused);
  }

  handlePointerDown(pointer) {
    if (this.isPaused || this.levelUpBackdrop.visible || this.gameOverBackdrop.visible) {
      return;
    }

    if (this.joystickPointerId !== null) {
      return;
    }

    if (!this.isPointerInJoystickZone(pointer)) {
      return;
    }

    this.joystickPointerId = pointer.id;
    this.updateJoystick(pointer);
  }

  handlePointerMove(pointer) {
    if (pointer.id !== this.joystickPointerId || this.isPaused) {
      return;
    }

    this.updateJoystick(pointer);
  }

  handlePointerUp(pointer) {
    if (pointer.id !== this.joystickPointerId) {
      return;
    }

    this.releaseJoystick();
  }

  isPointerInJoystickZone(pointer) {
    return Phaser.Math.Distance.Between(pointer.x, pointer.y, this.joystickBasePosition.x, this.joystickBasePosition.y) <= this.joystickActivationRadius;
  }

  updateJoystick(pointer) {
    const dx = pointer.x - this.joystickBasePosition.x;
    const dy = pointer.y - this.joystickBasePosition.y;
    const vector = new Phaser.Math.Vector2(dx, dy);

    if (vector.length() > this.joystickMaxDistance) {
      vector.setLength(this.joystickMaxDistance);
    }

    this.joystickThumb.setPosition(this.joystickBasePosition.x + vector.x, this.joystickBasePosition.y + vector.y);
    this.game.events.emit('virtual-joystick-move', {
      x: Phaser.Math.Clamp(vector.x / this.joystickMaxDistance, -1, 1),
      y: Phaser.Math.Clamp(vector.y / this.joystickMaxDistance, -1, 1)
    });
  }

  releaseJoystick() {
    if (!this.joystickBasePosition) {
      return;
    }

    this.joystickPointerId = null;
    this.joystickThumb.setPosition(this.joystickBasePosition.x, this.joystickBasePosition.y);
    this.game.events.emit('virtual-joystick-move', { x: 0, y: 0 });
  }

  createLevelUpMenu() {
    this.levelUpBackdrop = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x02070d, 0.72).setOrigin(0).setScrollFactor(0).setVisible(false);
    this.levelUpPanel = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 324, 510, 0x091824, 0.96).setStrokeStyle(3, 0x75f2b7, 0.45).setScrollFactor(0).setVisible(false);
    this.levelUpTitle = this.add.text(this.scale.width / 2, this.scale.height / 2 - 188, 'Choose an Upgrade', {
      fontFamily: 'Trebuchet MS',
      fontSize: '24px',
      color: '#f5e6a8'
    }).setOrigin(0.5).setScrollFactor(0).setVisible(false);

    this.optionButtons = [0, 1, 2].map((index) => this.createOptionButton(index));
    this.createRefreshButton();
  }

  createOptionButton(index) {
    const container = this.add.container(this.scale.width / 2, this.scale.height / 2 - 100 + index * 100);
    container.setScrollFactor(0).setVisible(false);

    const background = this.add.rectangle(0, 0, 286, 96, 0x102839, 1).setStrokeStyle(2, 0x6dd3ff, 0.38).setInteractive({ useHandCursor: true });
    const iconFrame = this.add.rectangle(-104, 0, 50, 50, 0x0c2130, 0.96).setStrokeStyle(2, 0x6dd3ff, 0.28).setVisible(false);
    const icon = this.add.image(-104, 0, 'arc_bolt_icon').setVisible(false);
    const title = this.add.text(-124, -34, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    const starBackdrop = this.add.text(-124, -18, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '11px',
      color: '#6d7d89',
      stroke: '#132432',
      strokeThickness: 2
    }).setOrigin(0, 0.5);
    const stars = this.add.text(-124, -18, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '11px',
      color: '#f6d97a',
      stroke: '#47320c',
      strokeThickness: 2
    }).setOrigin(0, 0.5);
    const description = this.add.text(-124, -4, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '9px',
      color: '#b8cfdb',
      wordWrap: { width: 218 },
      lineSpacing: 1
    }).setOrigin(0, 0);
    description.setFixedSize(220, 58);

    background.on('pointerover', () => background.setFillStyle(0x15354a, 1));
    background.on('pointerout', () => background.setFillStyle(0x102839, 1));
    background.on('pointerdown', () => {
      if (!background.upgradeId) {
        return;
      }

      const mainScene = this.scene.get('MainScene');
      mainScene.applyUpgrade(background.upgradeId);
    });

    container.add([background, iconFrame, icon, title, starBackdrop, stars, description]);
    return { container, background, iconFrame, icon, title, starBackdrop, stars, description };
  }
  createRefreshButton() {
    const background = this.add.rectangle(0, 0, 236, 52, 0x17402c, 1).setStrokeStyle(2, 0x8ff0af, 0.42).setInteractive({ useHandCursor: true });
    const label = this.add.text(0, -8, '刷新  -50G', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);
    const detail = this.add.text(0, 12, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '11px',
      color: '#cde8d8'
    }).setOrigin(0.5);

    background.on('pointerover', () => {
      if (!background.disabled) {
        background.setFillStyle(0x1b563a, 1);
      }
    });
    background.on('pointerout', () => this.updateRefreshButtonState());
    background.on('pointerdown', () => {
      if (background.disabled) {
        return;
      }

      const mainScene = this.scene.get('MainScene');
      mainScene.refreshLevelUpChoices?.(this.levelUpRefreshCost);
    });

    this.refreshButton = this.add.container(this.scale.width / 2, this.scale.height / 2 + 186, [background, label, detail]);
    this.refreshButton.setScrollFactor(0).setVisible(false);
    this.refreshButtonBackground = background;
    this.refreshButtonLabel = label;
    this.refreshButtonDetail = detail;
  }

  updateRefreshButtonState() {
    if (!this.refreshButtonBackground || !this.refreshButtonLabel || !this.refreshButtonDetail) {
      return;
    }

    const enabled = this.levelUpBackdrop?.visible && (this.currentGold ?? 0) >= this.levelUpRefreshCost;
    this.refreshButtonBackground.disabled = !enabled;
    this.refreshButtonBackground.setFillStyle(enabled ? 0x17402c : 0x2b2f33, 1);
    this.refreshButtonBackground.setStrokeStyle(2, enabled ? 0x8ff0af : 0x6f7a82, enabled ? 0.42 : 0.3);
    this.refreshButtonLabel.setAlpha(enabled ? 1 : 0.6);
    this.refreshButtonDetail.setAlpha(enabled ? 0.92 : 0.6);
    this.refreshButtonDetail.setText(enabled ? 'Spend gold to reroll all 3 choices' : 'Need 50 gold to reroll');
  }

  createObjectiveIndicator() {
    this.objectiveIndicatorArrow = this.add.triangle(0, 0, -9, -8, 10, 0, -9, 8, 0xffd36c, 0.96).setScrollFactor(0).setVisible(false);
    this.objectiveIndicatorDot = this.add.circle(0, 0, 3, 0xffffff, 0.9).setScrollFactor(0).setVisible(false);
  }

  updateObjectiveIndicator() {
    if (!this.objectiveIndicatorArrow || this.levelUpBackdrop?.visible || this.gameOverBackdrop?.visible || this.isPaused) {
      this.hideObjectiveIndicator();
      return;
    }

    const mainScene = this.scene.get('MainScene');
    const player = mainScene?.player;
    const camera = mainScene?.cameras?.main;

    if (!mainScene || !player?.active || !camera) {
      this.hideObjectiveIndicator();
      return;
    }

    let nearestTarget = null;
    let nearestDistanceSq = Number.POSITIVE_INFINITY;
    const checkTarget = (target, type) => {
      if (!target?.active) {
        return;
      }

      const dx = target.x - player.x;
      const dy = target.y - player.y;
      const distanceSq = dx * dx + dy * dy;

      if (distanceSq < nearestDistanceSq) {
        nearestDistanceSq = distanceSq;
        nearestTarget = { target, type, dx, dy };
      }
    };

    mainScene.rewardDrops?.children?.iterate((drop) => checkTarget(drop, 'drop'));
    mainScene.chests?.children?.iterate((chest) => checkTarget(chest, 'chest'));

    if (!nearestTarget) {
      this.hideObjectiveIndicator();
      return;
    }

    const worldView = camera.worldView;
    if (worldView.contains(nearestTarget.target.x, nearestTarget.target.y) && nearestDistanceSq < 180 * 180) {
      this.hideObjectiveIndicator();
      return;
    }

    const playerScreenX = player.x - worldView.x;
    const playerScreenY = player.y - worldView.y;
    const angle = Math.atan2(nearestTarget.dy, nearestTarget.dx);
    const radius = 42;
    const indicatorX = playerScreenX + Math.cos(angle) * radius;
    const indicatorY = playerScreenY + Math.sin(angle) * radius;
    const pulse = 0.92 + Math.sin(this.time.now * 0.015) * 0.08;
    const color = nearestTarget.type === 'drop' ? 0x7ce7ff : 0xffd36c;

    this.objectiveIndicatorArrow.setPosition(indicatorX, indicatorY).setRotation(angle).setFillStyle(color, 0.96).setScale(pulse).setVisible(true);
    this.objectiveIndicatorDot.setPosition(indicatorX - Math.cos(angle) * 11, indicatorY - Math.sin(angle) * 11).setFillStyle(color, 0.95).setVisible(true);
  }

  hideObjectiveIndicator() {
    this.objectiveIndicatorArrow?.setVisible(false);
    this.objectiveIndicatorDot?.setVisible(false);
  }
  createBossWarning() {
    this.warningText = this.add.text(this.scale.width / 2, this.scale.height * 0.28, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '34px',
      color: '#ffe28f',
      align: 'center',
      stroke: '#4d1400',
      strokeThickness: 6
    }).setOrigin(0.5).setScrollFactor(0).setDepth(30).setVisible(false);
  }

  createGameOverMenu() {
    this.gameOverBackdrop = this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x02070d, 0.78).setOrigin(0).setScrollFactor(0).setVisible(false);
    this.gameOverPanel = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 320, 300, 0x091824, 0.98).setStrokeStyle(3, 0xff7b72, 0.5).setScrollFactor(0).setVisible(false);
    this.gameOverTitle = this.add.text(this.scale.width / 2, this.scale.height / 2 - 92, 'Game Over', {
      fontFamily: 'Trebuchet MS',
      fontSize: '30px',
      color: '#ffd1cb'
    }).setOrigin(0.5).setScrollFactor(0).setVisible(false);
    this.gameOverStats = this.add.text(this.scale.width / 2, this.scale.height / 2 - 14, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#f3efe0',
      align: 'center',
      lineSpacing: 8
    }).setOrigin(0.5).setScrollFactor(0).setVisible(false);

    const buttonBackground = this.add.rectangle(0, 0, 200, 52, 0x17384e, 1).setStrokeStyle(2, 0x9ae5ff, 0.45).setInteractive({ useHandCursor: true });
    const buttonLabel = this.add.text(0, 0, 'Restart Run', {
      fontFamily: 'Trebuchet MS',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    buttonBackground.on('pointerover', () => buttonBackground.setFillStyle(0x1d4a67, 1));
    buttonBackground.on('pointerout', () => buttonBackground.setFillStyle(0x17384e, 1));
    buttonBackground.on('pointerdown', () => {
      const mainScene = this.scene.get('MainScene');
      mainScene.restartRun();
    });

    this.restartButton = this.add.container(this.scale.width / 2, this.scale.height / 2 + 84, [buttonBackground, buttonLabel]);
    this.restartButton.setScrollFactor(0).setVisible(false);
  }

  showBossWarning(data) {
    this.warningText.setText(data.text ?? 'WARNING');
    this.warningText.setAlpha(1);
    this.warningText.setScale(0.8);
    this.warningText.setVisible(true);
    this.tweens.killTweensOf(this.warningText);
    this.tweens.add({
      targets: this.warningText,
      alpha: 0,
      scaleX: 1.08,
      scaleY: 1.08,
      duration: data.duration ?? 1600,
      ease: 'Sine.Out',
      onComplete: () => this.warningText.setVisible(false)
    });
  }

  showLevelUpMenu(data) {
    this.setPauseState({ paused: false });
    this.levelUpRefreshCost = data.refreshCost ?? this.levelUpRefreshCost;
    this.levelUpTitle.setText(`Level ${data.level} Reached`);
    this.levelUpBackdrop.setVisible(true);
    this.levelUpPanel.setVisible(true);
    this.levelUpTitle.setVisible(true);
    this.refreshButton.setVisible(true);
    this.updateRefreshButtonState();

    this.optionButtons.forEach((button, index) => {
      const choice = data.choices[index];

      if (!choice) {
        button.background.upgradeId = null;
        button.icon.setVisible(false);
        button.iconFrame.setVisible(false);
        button.starBackdrop.setText('');
        button.stars.setText('');
        button.container.setVisible(false);
        return;
      }

      button.background.upgradeId = choice.id;
      button.title.setText(choice.displayTitle ?? choice.title);
      const filledStars = Math.max(0, Math.min(choice.nextLevel ?? 1, choice.maxLevel ?? 1));
      const maxStars = Math.max(choice.maxLevel ?? filledStars, filledStars);
      button.starBackdrop.setText(String.fromCharCode(0x2606).repeat(maxStars));
      button.stars.setText(String.fromCharCode(0x2605).repeat(filledStars));
      button.description.setText(choice.description);

      if (choice.iconKey && this.textures.exists(choice.iconKey)) {
        button.icon.setTexture(choice.iconKey);
        button.icon.setDisplaySize(34, 34);
        button.icon.setVisible(true);
        button.iconFrame.setVisible(true);
        button.title.setPosition(-72, -34);
        button.starBackdrop.setPosition(-72, -18);
        button.stars.setPosition(-72, -18);
        button.description.setPosition(-72, -4);
        button.description.setFontSize(8);
        button.description.setLineSpacing(1);
        button.description.setWordWrapWidth(166);
        button.description.setFixedSize(166, 58);
      } else {
        button.icon.setVisible(false);
        button.iconFrame.setVisible(false);
        button.title.setPosition(-126, -34);
        button.starBackdrop.setPosition(-126, -18);
        button.stars.setPosition(-126, -18);
        button.description.setPosition(-126, -4);
        button.description.setFontSize(9);
        button.description.setLineSpacing(1);
        button.description.setWordWrapWidth(220);
        button.description.setFixedSize(220, 58);
      }

      button.container.setVisible(true);
    });
  }
  hideLevelUpMenu() {
    this.levelUpBackdrop.setVisible(false);
    this.levelUpPanel.setVisible(false);
    this.levelUpTitle.setVisible(false);
    this.refreshButton.setVisible(false);

    this.optionButtons.forEach((button) => {
      button.background.upgradeId = null;
      button.icon.setVisible(false);
      button.iconFrame.setVisible(false);
      button.starBackdrop.setText('');
      button.stars.setText('');
      button.container.setVisible(false);
    });
  }

  showGameOverMenu(stats) {
    this.hideLevelUpMenu();
    this.setPauseState({ paused: false });
    this.releaseJoystick();
    this.gameOverTitle.setText('Game Over');
    this.gameOverStats.setText(`Survived: ${stats.time.toFixed(1)}s\nLevel: ${stats.level}\nKills: ${stats.kills}`);
    this.gameOverBackdrop.setVisible(true);
    this.gameOverPanel.setVisible(true);
    this.gameOverTitle.setVisible(true);
    this.gameOverStats.setVisible(true);
    this.restartButton.setVisible(true);
  }

  showStageClearMenu(stats) {
    this.hideLevelUpMenu();
    this.setPauseState({ paused: false });
    this.releaseJoystick();
    this.gameOverTitle.setText('Stage Clear');
    this.gameOverStats.setText(`Victory Time: ${stats.time.toFixed(1)}s\nLevel: ${stats.level}\nKills: ${stats.kills}\nGold: ${stats.gold}`);
    this.gameOverBackdrop.setVisible(true);
    this.gameOverPanel.setVisible(true);
    this.gameOverTitle.setVisible(true);
    this.gameOverStats.setVisible(true);
    this.restartButton.setVisible(true);
  }

  resetOverlays() {
    this.hideLevelUpMenu();
    this.setPauseState({ paused: false });
    this.releaseJoystick();
    this.hideObjectiveIndicator();
    this.warningText.setVisible(false);
    this.gameOverTitle.setText('Game Over');
    this.gameOverBackdrop.setVisible(false);
    this.gameOverPanel.setVisible(false);
    this.gameOverTitle.setVisible(false);
    this.gameOverStats.setVisible(false);
    this.restartButton.setVisible(false);
    this.updateStats({
      level: 1,
      difficultyStage: 1,
      difficultyLabel: 'Stage 1',
      experience: 0,
      experienceToNextLevel: 5,
      health: 6,
      maxHealth: 6,
      time: 0,
      gold: 0,
      shield: 0,
      isPaused: false,
      boss: null
    });
  }
}



