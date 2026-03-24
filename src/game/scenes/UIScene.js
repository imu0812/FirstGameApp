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

    this.panel = this.add.rectangle(12, 12, 244, 170, 0x04101a, 0.82).setOrigin(0);
    this.panel.setStrokeStyle(2, 0x6dd3ff, 0.4);
    this.panel.setScrollFactor(0);

    this.titleText = this.add
      .text(24, 18, 'STARFALL SURVIVOR', {
        fontFamily: 'Trebuchet MS',
        fontSize: '14px',
        color: '#f5e6a8'
      })
      .setScrollFactor(0);

    this.statsText = this.add
      .text(24, 42, '', {
        fontFamily: 'Trebuchet MS',
        fontSize: '13px',
        color: '#f3efe0',
        lineSpacing: 6
      })
      .setScrollFactor(0);

    this.healthLabel = this.add
      .text(24, 126, 'HP', {
        fontFamily: 'Trebuchet MS',
        fontSize: '12px',
        color: '#f3b7b2'
      })
      .setScrollFactor(0);

    this.healthBarBackground = this.add
      .rectangle(54, 130, 168, 10, 0x341012, 1)
      .setOrigin(0, 0.5)
      .setScrollFactor(0);

    this.healthBarFill = this.add
      .rectangle(54, 130, 168, 10, 0xff7b72, 1)
      .setOrigin(0, 0.5)
      .setScrollFactor(0);

    this.healthBarFrame = this.add
      .rectangle(54, 130, 168, 10)
      .setOrigin(0, 0.5)
      .setStrokeStyle(2, 0xffc2bb, 0.45)
      .setFillStyle(0x000000, 0)
      .setScrollFactor(0);

    this.expBarBackground = this.add
      .rectangle(24, 148, 198, 10, 0x0d2434, 1)
      .setOrigin(0, 0)
      .setScrollFactor(0);

    this.expBarFill = this.add
      .rectangle(24, 148, 0, 10, 0x75f2b7, 1)
      .setOrigin(0, 0)
      .setScrollFactor(0);

    this.expBarFrame = this.add
      .rectangle(24, 148, 198, 10)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0xbceee0, 0.5)
      .setFillStyle(0x000000, 0)
      .setScrollFactor(0);

    this.createBossBar();

    this.helpText = this.add
      .text(12, this.scale.height - 10, 'Move: WASD / Arrows / Touch', {
        fontFamily: 'Trebuchet MS',
        fontSize: '11px',
        color: '#b6c9d6'
      })
      .setOrigin(0, 1)
      .setScrollFactor(0);

    this.createPauseButton();
    this.createVirtualJoystick();
    this.createPauseMenu();
    this.createLevelUpMenu();
    this.createGameOverMenu();

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
    const hpRatio = Phaser.Math.Clamp(stats.health / stats.maxHealth, 0, 1);

    this.statsText.setText(
      `Lv ${stats.level}  ${stats.difficultyLabel}\nTime ${stats.time.toFixed(1)}s\nEXP ${stats.experience} / ${stats.experienceToNextLevel}`
    );

    this.expBarFill.width = 198 * expRatio;
    this.healthBarFill.width = 168 * hpRatio;
    this.isPaused = stats.isPaused ?? this.isPaused;

    if (stats.boss) {
      const bossRatio = Phaser.Math.Clamp(stats.boss.health / stats.boss.maxHealth, 0, 1);
      this.bossBarTitle.setText(stats.boss.name);
      this.bossBarFill.width = 220 * bossRatio;
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
    const hudScale = isTallMobile ? 1 : 1.08;
    const panelX = isTallMobile ? 10 : 14;
    const panelY = isTallMobile ? 10 : 14;
    const joystickY = isShortLandscape ? gameSize.height - 74 : gameSize.height - 86;
    const pauseButtonX = gameSize.width - (isTallMobile ? 36 : 40);
    const pauseButtonY = isTallMobile ? 28 : 32;

    this.panel.setScale(hudScale).setPosition(panelX, panelY);
    this.titleText.setScale(hudScale).setPosition(panelX + 12, panelY + 6);
    this.statsText.setScale(hudScale).setPosition(panelX + 12, panelY + 30);
    this.healthLabel.setScale(hudScale).setPosition(panelX + 12, panelY + 114);

    this.healthBarBackground.setScale(hudScale).setPosition(panelX + 42, panelY + 118);
    this.healthBarFill.setScale(hudScale).setPosition(panelX + 42, panelY + 118);
    this.healthBarFrame.setScale(hudScale).setPosition(panelX + 42, panelY + 118);
    this.expBarBackground.setScale(hudScale).setPosition(panelX + 12, panelY + 136);
    this.expBarFill.setScale(hudScale).setPosition(panelX + 12, panelY + 136);
    this.expBarFrame.setScale(hudScale).setPosition(panelX + 12, panelY + 136);

    this.helpText.setPosition(12, gameSize.height - 10);
    this.helpText.setFontSize(isTallMobile ? '11px' : '12px');

    this.pauseButton.setPosition(pauseButtonX, pauseButtonY);

    this.bossBarTitle.setPosition(gameSize.width / 2, isTallMobile ? 10 : 14);
    this.bossBarBackground.setPosition(gameSize.width / 2, isTallMobile ? 30 : 34);
    this.bossBarFill.setPosition(gameSize.width / 2 - 110, isTallMobile ? 30 : 34);
    this.bossBarFrame.setPosition(gameSize.width / 2, isTallMobile ? 30 : 34);
    this.pauseButtonBackground.setSize(isTallMobile ? 42 : 46, isTallMobile ? 42 : 46);

    this.joystickBasePosition = new Phaser.Math.Vector2(gameSize.width / 2, joystickY);
    this.joystickBase.setPosition(this.joystickBasePosition.x, this.joystickBasePosition.y);
    this.joystickThumb.setPosition(this.joystickBasePosition.x, this.joystickBasePosition.y);
    this.joystickBase.setScale(isTallMobile ? 1 : 1.08);
    this.joystickThumb.setScale(isTallMobile ? 1 : 1.08);

    this.pauseBackdrop.setSize(gameSize.width, gameSize.height);
    this.pausePanel
      .setSize(Math.min(gameSize.width - 40, 300), 204)
      .setPosition(gameSize.width / 2, gameSize.height / 2);
    this.pauseTitle.setPosition(gameSize.width / 2, gameSize.height / 2 - 52);
    this.pauseHint.setPosition(gameSize.width / 2, gameSize.height / 2 - 10);
    this.resumeButton.setPosition(gameSize.width / 2, gameSize.height / 2 + 52);

    this.levelUpBackdrop.setSize(gameSize.width, gameSize.height);
    this.levelUpPanel
      .setSize(Math.min(gameSize.width - 32, 320), Math.min(gameSize.height - 48, 388))
      .setPosition(gameSize.width / 2, gameSize.height / 2);
    this.levelUpTitle.setPosition(gameSize.width / 2, gameSize.height / 2 - 138);
    this.levelUpTitle.setFontSize(isTallMobile ? '24px' : '28px');
    this.optionButtons.forEach((button, index) => {
      button.container.setPosition(gameSize.width / 2, gameSize.height / 2 - 52 + index * 92);
      button.background.width = Math.min(gameSize.width - 52, 280);
      button.background.height = 82;
    });

    this.gameOverBackdrop.setSize(gameSize.width, gameSize.height);
    this.gameOverPanel
      .setSize(Math.min(gameSize.width - 34, 320), Math.min(gameSize.height - 80, 300))
      .setPosition(gameSize.width / 2, gameSize.height / 2);
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
    this.game.events.off('game-reset', this.resetOverlays, this);
  }


  createBossBar() {
    this.bossBarTitle = this.add
      .text(this.scale.width / 2, 16, '', {
        fontFamily: 'Trebuchet MS',
        fontSize: '14px',
        color: '#dff7ff'
      })
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setVisible(false);

    this.bossBarBackground = this.add
      .rectangle(this.scale.width / 2, 38, 220, 12, 0x26131b, 0.95)
      .setOrigin(0.5, 0)
      .setScrollFactor(0)
      .setVisible(false);

    this.bossBarFill = this.add
      .rectangle(this.scale.width / 2 - 110, 38, 220, 12, 0x6dd3ff, 1)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setVisible(false);

    this.bossBarFrame = this.add
      .rectangle(this.scale.width / 2, 38, 220, 12)
      .setOrigin(0.5, 0)
      .setStrokeStyle(2, 0xe2fbff, 0.4)
      .setFillStyle(0x000000, 0)
      .setScrollFactor(0)
      .setVisible(false);
  }
  createPauseButton() {
    this.pauseButtonBackground = this.add
      .rectangle(0, 0, 42, 42, 0x102839, 0.92)
      .setStrokeStyle(2, 0x6dd3ff, 0.38)
      .setInteractive({ useHandCursor: true });

    const pauseLabel = this.add
      .text(0, -1, 'II', {
        fontFamily: 'Trebuchet MS',
        fontSize: '20px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    this.pauseButtonBackground.on('pointerdown', () => this.togglePause());
    this.pauseButtonBackground.on('pointerover', () => this.pauseButtonBackground.setFillStyle(0x17384e, 1));
    this.pauseButtonBackground.on('pointerout', () => this.pauseButtonBackground.setFillStyle(0x102839, 0.92));

    this.pauseButton = this.add.container(0, 0, [this.pauseButtonBackground, pauseLabel]);
    this.pauseButton.setScrollFactor(0);
  }

  createVirtualJoystick() {
    this.joystickBase = this.add
      .circle(this.scale.width / 2, this.scale.height - 86, 52, 0x0c2535, 0.24)
      .setStrokeStyle(2, 0x88d5ef, 0.35)
      .setScrollFactor(0);

    this.joystickThumb = this.add
      .circle(this.scale.width / 2, this.scale.height - 86, 24, 0x88d5ef, 0.32)
      .setStrokeStyle(2, 0xe2fbff, 0.45)
      .setScrollFactor(0);
  }

  createPauseMenu() {
    this.pauseBackdrop = this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x02070d, 0.76)
      .setOrigin(0)
      .setScrollFactor(0)
      .setVisible(false);

    this.pausePanel = this.add
      .rectangle(this.scale.width / 2, this.scale.height / 2, 300, 204, 0x091824, 0.98)
      .setStrokeStyle(3, 0x9ae5ff, 0.4)
      .setScrollFactor(0)
      .setVisible(false);

    this.pauseTitle = this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 52, '已暫停', {
        fontFamily: 'Trebuchet MS',
        fontSize: '28px',
        color: '#f3efe0'
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setVisible(false);

    this.pauseHint = this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 10, '點擊下方按鈕或按 P / Esc 繼續', {
        fontFamily: 'Trebuchet MS',
        fontSize: '14px',
        color: '#b8cfdb',
        align: 'center'
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setVisible(false);

    const resumeBackground = this.add
      .rectangle(0, 0, 180, 48, 0x17384e, 1)
      .setStrokeStyle(2, 0x9ae5ff, 0.45)
      .setInteractive({ useHandCursor: true });

    const resumeLabel = this.add
      .text(0, 0, '繼續遊戲', {
        fontFamily: 'Trebuchet MS',
        fontSize: '20px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    resumeBackground.on('pointerdown', () => this.togglePause(false));
    resumeBackground.on('pointerover', () => resumeBackground.setFillStyle(0x1d4a67, 1));
    resumeBackground.on('pointerout', () => resumeBackground.setFillStyle(0x17384e, 1));

    this.resumeButton = this.add.container(
      this.scale.width / 2,
      this.scale.height / 2 + 52,
      [resumeBackground, resumeLabel]
    );
    this.resumeButton.setScrollFactor(0);
    this.resumeButton.setVisible(false);
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
    return Phaser.Math.Distance.Between(
      pointer.x,
      pointer.y,
      this.joystickBasePosition.x,
      this.joystickBasePosition.y
    ) <= this.joystickActivationRadius;
  }

  updateJoystick(pointer) {
    const dx = pointer.x - this.joystickBasePosition.x;
    const dy = pointer.y - this.joystickBasePosition.y;
    const vector = new Phaser.Math.Vector2(dx, dy);

    if (vector.length() > this.joystickMaxDistance) {
      vector.setLength(this.joystickMaxDistance);
    }

    this.joystickThumb.setPosition(
      this.joystickBasePosition.x + vector.x,
      this.joystickBasePosition.y + vector.y
    );

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
    this.levelUpBackdrop = this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x02070d, 0.72)
      .setOrigin(0)
      .setScrollFactor(0)
      .setVisible(false);

    this.levelUpPanel = this.add
      .rectangle(this.scale.width / 2, this.scale.height / 2, 320, 388, 0x091824, 0.96)
      .setStrokeStyle(3, 0x75f2b7, 0.45)
      .setScrollFactor(0)
      .setVisible(false);

    this.levelUpTitle = this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 138, 'Choose an Upgrade', {
        fontFamily: 'Trebuchet MS',
        fontSize: '24px',
        color: '#f5e6a8'
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setVisible(false);

    this.optionButtons = [0, 1, 2].map((index) => this.createOptionButton(index));
  }

  createOptionButton(index) {
    const container = this.add.container(
      this.scale.width / 2,
      this.scale.height / 2 - 52 + index * 92
    );
    container.setScrollFactor(0);
    container.setVisible(false);

    const background = this.add
      .rectangle(0, 0, 280, 82, 0x102839, 1)
      .setStrokeStyle(2, 0x6dd3ff, 0.38)
      .setInteractive({ useHandCursor: true });

    const title = this.add
      .text(-126, -22, '', {
        fontFamily: 'Trebuchet MS',
        fontSize: '18px',
        color: '#ffffff'
      })
      .setOrigin(0, 0.5);

    const description = this.add
      .text(-126, 10, '', {
        fontFamily: 'Trebuchet MS',
        fontSize: '12px',
        color: '#b8cfdb',
        wordWrap: { width: 220 },
        lineSpacing: 3
      })
      .setOrigin(0, 0.5);

    background.on('pointerover', () => {
      background.setFillStyle(0x15354a, 1);
    });

    background.on('pointerout', () => {
      background.setFillStyle(0x102839, 1);
    });

    background.on('pointerdown', () => {
      if (!background.upgradeId) {
        return;
      }

      const mainScene = this.scene.get('MainScene');
      mainScene.applyUpgrade(background.upgradeId);
    });

    container.add([background, title, description]);

    return {
      container,
      background,
      title,
      description
    };
  }

  createGameOverMenu() {
    this.gameOverBackdrop = this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0x02070d, 0.78)
      .setOrigin(0)
      .setScrollFactor(0)
      .setVisible(false);

    this.gameOverPanel = this.add
      .rectangle(this.scale.width / 2, this.scale.height / 2, 320, 300, 0x091824, 0.98)
      .setStrokeStyle(3, 0xff7b72, 0.5)
      .setScrollFactor(0)
      .setVisible(false);

    this.gameOverTitle = this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 92, 'Game Over', {
        fontFamily: 'Trebuchet MS',
        fontSize: '30px',
        color: '#ffd1cb'
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setVisible(false);

    this.gameOverStats = this.add
      .text(this.scale.width / 2, this.scale.height / 2 - 14, '', {
        fontFamily: 'Trebuchet MS',
        fontSize: '18px',
        color: '#f3efe0',
        align: 'center',
        lineSpacing: 8
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setVisible(false);

    const buttonBackground = this.add
      .rectangle(0, 0, 200, 52, 0x17384e, 1)
      .setStrokeStyle(2, 0x9ae5ff, 0.45)
      .setInteractive({ useHandCursor: true });

    const buttonLabel = this.add
      .text(0, 0, 'Restart Run', {
        fontFamily: 'Trebuchet MS',
        fontSize: '20px',
        color: '#ffffff'
      })
      .setOrigin(0.5);

    buttonBackground.on('pointerover', () => {
      buttonBackground.setFillStyle(0x1d4a67, 1);
    });

    buttonBackground.on('pointerout', () => {
      buttonBackground.setFillStyle(0x17384e, 1);
    });

    buttonBackground.on('pointerdown', () => {
      const mainScene = this.scene.get('MainScene');
      mainScene.restartRun();
    });

    this.restartButton = this.add.container(
      this.scale.width / 2,
      this.scale.height / 2 + 84,
      [buttonBackground, buttonLabel]
    );
    this.restartButton.setScrollFactor(0);
    this.restartButton.setVisible(false);
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
      button.container.setVisible(true);
    });
  }

  hideLevelUpMenu() {
    this.levelUpBackdrop.setVisible(false);
    this.levelUpPanel.setVisible(false);
    this.levelUpTitle.setVisible(false);

    this.optionButtons.forEach((button) => {
      button.background.upgradeId = null;
      button.container.setVisible(false);
    });
  }

  showGameOverMenu(stats) {
    this.hideLevelUpMenu();
    this.setPauseState({ paused: false });
    this.releaseJoystick();
    this.gameOverStats.setText(
      `Survived: ${stats.time.toFixed(1)}s\nLevel: ${stats.level}\nKills: ${stats.kills}`
    );
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
    this.gameOverBackdrop.setVisible(false);
    this.gameOverPanel.setVisible(false);
    this.gameOverTitle.setVisible(false);
    this.gameOverStats.setVisible(false);
    this.restartButton.setVisible(false);
  }
}
