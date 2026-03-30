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
  }

  updateStats(stats) {
    const expRatio = Phaser.Math.Clamp(stats.experience / stats.experienceToNextLevel, 0, 1);

    this.levelBadge.setText(`Lv ${stats.level}`);
    this.infoText.setText(`${stats.difficultyLabel}\n${stats.time.toFixed(1)}s  金 ${stats.gold ?? 0}`);
    this.expBarFill.width = this.expBarWidth * expRatio;
    this.isPaused = stats.isPaused ?? this.isPaused;

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
    this.levelUpPanel.setSize(Math.min(gameSize.width - 32, 320), Math.min(gameSize.height - 48, 388)).setPosition(gameSize.width / 2, gameSize.height / 2);
    this.levelUpTitle.setPosition(gameSize.width / 2, gameSize.height / 2 - 138);
    this.levelUpTitle.setFontSize(isTallMobile ? '24px' : '28px');
    this.optionButtons.forEach((button, index) => {
      button.container.setPosition(gameSize.width / 2, gameSize.height / 2 - 52 + index * 92);
      button.background.width = Math.min(gameSize.width - 52, 280);
      button.background.height = 82;
    });

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
    this.levelUpPanel = this.add.rectangle(this.scale.width / 2, this.scale.height / 2, 320, 388, 0x091824, 0.96).setStrokeStyle(3, 0x75f2b7, 0.45).setScrollFactor(0).setVisible(false);
    this.levelUpTitle = this.add.text(this.scale.width / 2, this.scale.height / 2 - 138, 'Choose an Upgrade', {
      fontFamily: 'Trebuchet MS',
      fontSize: '24px',
      color: '#f5e6a8'
    }).setOrigin(0.5).setScrollFactor(0).setVisible(false);

    this.optionButtons = [0, 1, 2].map((index) => this.createOptionButton(index));
  }

  createOptionButton(index) {
    const container = this.add.container(this.scale.width / 2, this.scale.height / 2 - 52 + index * 92);
    container.setScrollFactor(0).setVisible(false);

    const background = this.add.rectangle(0, 0, 280, 82, 0x102839, 1).setStrokeStyle(2, 0x6dd3ff, 0.38).setInteractive({ useHandCursor: true });
    const iconFrame = this.add.rectangle(-105, 0, 52, 52, 0x0c2130, 0.96).setStrokeStyle(2, 0x6dd3ff, 0.28).setVisible(false);
    const icon = this.add.image(-105, 0, 'arc_bolt_icon').setVisible(false);
    const title = this.add.text(-126, -22, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    const description = this.add.text(-126, 10, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '12px',
      color: '#b8cfdb',
      wordWrap: { width: 220 },
      lineSpacing: 3
    }).setOrigin(0, 0.5);

    background.on('pointerover', () => background.setFillStyle(0x15354a, 1));
    background.on('pointerout', () => background.setFillStyle(0x102839, 1));
    background.on('pointerdown', () => {
      if (!background.upgradeId) {
        return;
      }

      const mainScene = this.scene.get('MainScene');
      mainScene.applyUpgrade(background.upgradeId);
    });

    container.add([background, iconFrame, icon, title, description]);
    return { container, background, iconFrame, icon, title, description };
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
    this.levelUpTitle.setText(`Level ${data.level} Reached`);
    this.levelUpBackdrop.setVisible(true);
    this.levelUpPanel.setVisible(true);
    this.levelUpTitle.setVisible(true);

    this.optionButtons.forEach((button, index) => {
      const choice = data.choices[index];
      button.background.upgradeId = choice.id;
      button.title.setText(choice.title);
      button.description.setText(choice.description);
      if (choice.iconKey && this.textures.exists(choice.iconKey)) {
        button.icon.setTexture(choice.iconKey);
        button.icon.setDisplaySize(42, 42);
        button.icon.setVisible(true);
        button.iconFrame.setVisible(true);
        button.title.setPosition(-72, -22);
        button.description.setPosition(-72, 10);
        button.description.setWordWrapWidth(166);
      } else {
        button.icon.setVisible(false);
        button.iconFrame.setVisible(false);
        button.title.setPosition(-126, -22);
        button.description.setPosition(-126, 10);
        button.description.setWordWrapWidth(220);
      }
      button.container.setVisible(true);
    });
  }

  hideLevelUpMenu() {
    this.levelUpBackdrop.setVisible(false);
    this.levelUpPanel.setVisible(false);
    this.levelUpTitle.setVisible(false);

    this.optionButtons.forEach((button) => {
      button.background.upgradeId = null;
      button.icon.setVisible(false);
      button.iconFrame.setVisible(false);
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
    this.warningText.setVisible(false);
    this.gameOverTitle.setText('Game Over');
    this.gameOverBackdrop.setVisible(false);
    this.gameOverPanel.setVisible(false);
    this.gameOverTitle.setVisible(false);
    this.gameOverStats.setVisible(false);
    this.restartButton.setVisible(false);
  }
}


