import Phaser from 'phaser';
import { PASSIVE_DEFS, WEAPON_DEFS } from '../data/arsenal.js';
import { BOSS_PHASES, ENEMY_TYPES } from '../data/enemyTypes.js';
import { TEST_MODE_EVENTS } from '../debug/testModeConfig.js';
import { getTestPresetEntries } from '../debug/testPresets.js';

const EXPERIENCE_AMOUNTS = [5, 20, 100, 500, 2000];
const GOLD_AMOUNTS = [10, 50, 250, 1000, 5000];
const ENEMY_COUNTS = [1, 3, 5, 10, 20];

export class TestModePanel {
  constructor(scene) {
    this.scene = scene;
    this.visible = false;
    this.actionButtons = {};
    this.sections = [];
    this.presetEntries = getTestPresetEntries();
    this.selectedPresetIndex = 0;
    this.weaponKeys = Object.keys(WEAPON_DEFS);
    this.passiveKeys = Object.keys(PASSIVE_DEFS);
    this.enemyKeys = Object.keys(ENEMY_TYPES);
    this.bossPhases = BOSS_PHASES.map((phase) => phase.phase);
    this.selectedWeaponIndex = 0;
    this.selectedWeaponLevel = Math.min(1, WEAPON_DEFS[this.weaponKeys[0]]?.maxLevel ?? 1);
    this.selectedPassiveIndex = 0;
    this.selectedPassiveLevel = Math.min(1, PASSIVE_DEFS[this.passiveKeys[0]]?.maxLevel ?? 1);
    this.selectedEnemyIndex = 0;
    this.selectedEnemyCountIndex = 0;
    this.selectedBossPhaseIndex = 0;
    this.selectedExperienceAmountIndex = 0;
    this.selectedGoldAmountIndex = 0;
    this.panelWidth = 332;
    this.panelHeight = 560;
    this.viewportTop = 74;
    this.viewportPadding = 12;
    this.viewportHeight = 0;
    this.scrollOffset = 0;
    this.maxScrollOffset = 0;
    this.draggingScroll = false;
    this.lastDragY = 0;
  }

  create() {
    this.toggleKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKTICK);
    this.scene.game.events.on(TEST_MODE_EVENTS.feedback, this.handleFeedback, this);
    this.scene.input.on('wheel', this.handleWheel, this);
    this.scene.input.on('pointerdown', this.handlePointerDown, this);
    this.scene.input.on('pointermove', this.handlePointerMove, this);
    this.scene.input.on('pointerup', this.handlePointerUp, this);
    this.scene.input.on('pointerupoutside', this.handlePointerUp, this);

    this.createToggleButton();

    this.background = this.scene.add.rectangle(0, 0, this.panelWidth, this.panelHeight, 0x08131d, 0.96)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x7ce7ff, 0.35);
    this.title = this.scene.add.text(14, 10, '測試模式', {
      fontFamily: 'Trebuchet MS',
      fontSize: '16px',
      color: '#f3efe0'
    });
    this.hint = this.scene.add.text(14, 30, '可在面板內上下捲動，點擊區塊標題可收合。', {
      fontFamily: 'Trebuchet MS',
      fontSize: '10px',
      color: '#8eb3c5',
      wordWrap: { width: this.panelWidth - 28 }
    });
    this.feedbackText = this.scene.add.text(14, 54, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '10px',
      color: '#f0c98a',
      wordWrap: { width: this.panelWidth - 28 }
    });

    this.viewportFrame = this.scene.add.rectangle(
      this.viewportPadding,
      this.viewportTop,
      this.panelWidth - this.viewportPadding * 2,
      this.panelHeight - this.viewportTop - 12,
      0x0b1a25,
      0.52
    ).setOrigin(0, 0).setStrokeStyle(1, 0x6dd3ff, 0.2);

    this.contentContainer = this.scene.add.container(this.viewportPadding, this.viewportTop);
    this.contentContainer.setScrollFactor(0);

    this.container = this.scene.add.container(0, 0, [
      this.background,
      this.title,
      this.hint,
      this.feedbackText,
      this.viewportFrame,
      this.contentContainer
    ]);
    this.container.setDepth(40);
    this.container.setScrollFactor(0);
    this.container.setVisible(false);

    this.maskGraphics = this.scene.add.graphics();
    this.maskGraphics.setDepth(39);
    this.maskGraphics.setVisible(false);
    this.contentContainer.setMask(this.maskGraphics.createGeometryMask());

    this.buildSections();
    this.syncSelections();
    this.refreshActionAvailability();
    this.handleResize(this.scene.scale.gameSize);
  }

  buildSections() {
    const presetSection = this.createSection('預設組合', true, 0x17384e);
    this.presetValue = this.createSelectorRow(presetSection.body, 0, '預設組合', () => this.shiftPreset(-1), () => this.shiftPreset(1));
    this.actionButtons.applyPreset = this.createActionButton(presetSection.body, 52, 0x1a4a3c, '套用預設', () => {
      const preset = this.presetEntries[this.selectedPresetIndex];
      this.emitCommand({
        type: 'apply-preset',
        name: preset.key
      });
    });
    presetSection.bodyHeight = 94;

    const gearSection = this.createSection('武器 / 被動', true, 0x153b4d);
    this.weaponKeyValue = this.createSelectorRow(gearSection.body, 0, '武器', () => this.shiftWeapon(-1), () => this.shiftWeapon(1));
    this.weaponLevelValue = this.createSelectorRow(gearSection.body, 36, '武器等級', () => this.shiftWeaponLevel(-1), () => this.shiftWeaponLevel(1));
    this.actionButtons.applyWeapon = this.createActionButton(gearSection.body, 88, 0x16384d, '套用武器', () => {
      this.emitCommand({
        type: 'set-weapon-level',
        key: this.weaponKeys[this.selectedWeaponIndex],
        level: this.selectedWeaponLevel
      });
    });
    this.passiveKeyValue = this.createSelectorRow(gearSection.body, 134, '被動', () => this.shiftPassive(-1), () => this.shiftPassive(1));
    this.passiveLevelValue = this.createSelectorRow(gearSection.body, 170, '被動等級', () => this.shiftPassiveLevel(-1), () => this.shiftPassiveLevel(1));
    this.actionButtons.applyPassive = this.createActionButton(gearSection.body, 222, 0x16384d, '套用被動', () => {
      this.emitCommand({
        type: 'set-passive-level',
        key: this.passiveKeys[this.selectedPassiveIndex],
        level: this.selectedPassiveLevel
      });
    });
    gearSection.bodyHeight = 264;

    const combatSection = this.createSection('怪物 / Boss', false, 0x17384e);
    this.enemyTypeValue = this.createSelectorRow(combatSection.body, 0, '怪物', () => this.shiftEnemy(-1), () => this.shiftEnemy(1));
    this.enemyCountValue = this.createSelectorRow(combatSection.body, 36, '怪物數量', () => this.shiftEnemyCount(-1), () => this.shiftEnemyCount(1));
    this.actionButtons.spawnEnemy = this.createActionButton(combatSection.body, 88, 0x16384d, '生成怪物', () => {
      this.emitCommand({
        type: 'spawn-test-enemy',
        enemyType: this.enemyKeys[this.selectedEnemyIndex],
        count: ENEMY_COUNTS[this.selectedEnemyCountIndex]
      });
    });
    this.bossPhaseValue = this.createSelectorRow(combatSection.body, 134, 'Boss 階段', () => this.shiftBossPhase(-1), () => this.shiftBossPhase(1));
    this.actionButtons.spawnBoss = this.createActionButton(combatSection.body, 186, 0x184257, '生成 Boss', () => {
      this.emitCommand({
        type: 'spawn-boss-phase',
        phase: this.bossPhases[this.selectedBossPhaseIndex]
      });
    });
    combatSection.bodyHeight = 228;

    const resourcesSection = this.createSection('資源', false, 0x17384e);
    this.experienceValue = this.createSelectorRow(resourcesSection.body, 0, '經驗值數量', () => this.shiftExperienceAmount(-1), () => this.shiftExperienceAmount(1));
    this.actionButtons.giveExp = this.createActionButton(resourcesSection.body, 52, 0x184257, '給予經驗值', () => {
      this.emitCommand({
        type: 'grant-test-experience',
        amount: EXPERIENCE_AMOUNTS[this.selectedExperienceAmountIndex]
      });
    });
    this.goldValue = this.createSelectorRow(resourcesSection.body, 98, '金幣數量', () => this.shiftGoldAmount(-1), () => this.shiftGoldAmount(1));
    this.actionButtons.giveGold = this.createActionButton(resourcesSection.body, 150, 0x184257, '給予金幣', () => {
      this.emitCommand({
        type: 'grant-test-gold',
        amount: GOLD_AMOUNTS[this.selectedGoldAmountIndex]
      });
    });
    resourcesSection.bodyHeight = 192;

    const cleanupSection = this.createSection('清理', false, 0x4a261f);
    this.actionButtons.clearTest = this.createActionButton(cleanupSection.body, 0, 0x4c3a18, '清除測試生成物', () => {
      this.emitCommand({ type: 'clear-test-enemies' });
    });
    this.actionButtons.clearAll = this.createActionButton(cleanupSection.body, 46, 0x5a2a26, '清除全部', () => {
      this.emitCommand({ type: 'clear-all-enemies' });
    });
    this.actionButtons.resetTest = this.createActionButton(cleanupSection.body, 92, 0x61301f, '重置測試', () => {
      this.emitCommand({ type: 'reset-test-state' });
    });
    cleanupSection.bodyHeight = 134;

    this.relayoutSections();
  }

  createSection(title, expanded, fillColor) {
    const section = {
      title,
      expanded,
      fillColor,
      container: this.scene.add.container(0, 0),
      headerBackground: this.scene.add.rectangle(0, 0, this.panelWidth - this.viewportPadding * 2, 30, fillColor, 1)
        .setOrigin(0, 0)
        .setStrokeStyle(1, 0x7ce7ff, 0.18)
        .setInteractive({ useHandCursor: true }),
      headerLabel: this.scene.add.text(10, 8, title, {
        fontFamily: 'Trebuchet MS',
        fontSize: '12px',
        color: '#f3efe0'
      }),
      headerChevron: this.scene.add.text(this.panelWidth - this.viewportPadding * 2 - 18, 7, expanded ? '-' : '+', {
        fontFamily: 'Trebuchet MS',
        fontSize: '14px',
        color: '#dff7ff'
      }).setOrigin(0.5, 0),
      body: this.scene.add.container(0, 34),
      bodyHeight: 0
    };

    section.headerBackground.on('pointerdown', () => this.toggleSection(section));
    section.headerBackground.on('pointerover', () => section.headerBackground.setAlpha(0.92));
    section.headerBackground.on('pointerout', () => section.headerBackground.setAlpha(1));

    section.container.add([section.headerBackground, section.headerLabel, section.headerChevron, section.body]);
    this.contentContainer.add(section.container);
    this.sections.push(section);
    return section;
  }

  createToggleButton() {
    const background = this.scene.add.rectangle(0, 0, 54, 28, 0x102839, 0.96)
      .setStrokeStyle(2, 0x7ce7ff, 0.34)
      .setInteractive({ useHandCursor: true });
    const label = this.scene.add.text(0, 0, '測試', {
      fontFamily: 'Trebuchet MS',
      fontSize: '12px',
      color: '#f3efe0'
    }).setOrigin(0.5);

    background.on('pointerdown', () => this.setVisible(!this.visible));
    background.on('pointerover', () => background.setFillStyle(0x15354a, 1));
    background.on('pointerout', () => background.setFillStyle(0x102839, 0.96));

    this.toggleButton = this.scene.add.container(0, 0, [background, label]);
    this.toggleButton.setDepth(41);
    this.toggleButton.setScrollFactor(0);
  }

  createSelectorRow(parent, y, labelText, onPrev, onNext) {
    const label = this.scene.add.text(0, y, labelText, {
      fontFamily: 'Trebuchet MS',
      fontSize: '11px',
      color: '#8eb3c5'
    });
    const valueBackground = this.scene.add.rectangle(90, y + 12, 138, 26, 0x0e2231, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x6dd3ff, 0.24);
    const value = this.scene.add.text(98, y + 17, '', {
      fontFamily: 'Trebuchet MS',
      fontSize: '11px',
      color: '#eff7fb',
      wordWrap: { width: 122 }
    });

    parent.add([label, valueBackground, value]);
    this.createStepperButton(parent, 236, y + 12, '-', onPrev);
    this.createStepperButton(parent, 274, y + 12, '+', onNext);
    return value;
  }

  createStepperButton(parent, x, y, labelText, onClick) {
    const background = this.scene.add.rectangle(x, y, 32, 26, 0x17384e, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x7ce7ff, 0.28)
      .setInteractive({ useHandCursor: true });
    const label = this.scene.add.text(x + 16, y + 13, labelText, {
      fontFamily: 'Trebuchet MS',
      fontSize: '15px',
      color: '#ffffff'
    }).setOrigin(0.5);

    background.on('pointerdown', onClick);
    background.on('pointerover', () => background.setFillStyle(0x1d4a67, 1));
    background.on('pointerout', () => background.setFillStyle(0x17384e, 1));
    parent.add([background, label]);
  }

  createActionButton(parent, y, fillColor, labelText, onClick) {
    const background = this.scene.add.rectangle(0, y, this.panelWidth - this.viewportPadding * 2, 34, fillColor, 1)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x7ce7ff, 0.22)
      .setInteractive({ useHandCursor: true });
    const label = this.scene.add.text((this.panelWidth - this.viewportPadding * 2) / 2, y + 17, labelText, {
      fontFamily: 'Trebuchet MS',
      fontSize: '12px',
      color: '#ffffff'
    }).setOrigin(0.5);

    background.on('pointerdown', () => {
      if (background.disabled) {
        return;
      }

      onClick();
    });
    background.on('pointerover', () => {
      if (!background.disabled) {
        background.setAlpha(0.92);
      }
    });
    background.on('pointerout', () => background.setAlpha(1));
    parent.add([background, label]);
    return { background, label };
  }

  toggleSection(section) {
    section.expanded = !section.expanded;
    section.headerChevron.setText(section.expanded ? '-' : '+');
    section.body.setVisible(section.expanded);
    this.relayoutSections();
  }

  relayoutSections() {
    let y = 0;

    this.sections.forEach((section) => {
      section.container.setPosition(0, y);
      section.body.setVisible(section.expanded);
      y += 34 + (section.expanded ? section.bodyHeight : 0) + 10;
    });

    this.contentHeight = Math.max(0, y);
    this.maxScrollOffset = Math.max(0, this.contentHeight - this.viewportHeight);
    this.scrollOffset = Phaser.Math.Clamp(this.scrollOffset, 0, this.maxScrollOffset);
    this.updateScrollPosition();
  }

  updateScrollPosition() {
    this.contentContainer.setY(this.viewportTop - this.scrollOffset);
  }

  scrollBy(delta) {
    this.scrollOffset = Phaser.Math.Clamp(this.scrollOffset + delta, 0, this.maxScrollOffset);
    this.updateScrollPosition();
  }

  shiftPreset(direction) {
    this.selectedPresetIndex = Phaser.Math.Wrap(this.selectedPresetIndex + direction, 0, this.presetEntries.length);
    this.syncSelections();
  }

  shiftWeapon(direction) {
    this.selectedWeaponIndex = Phaser.Math.Wrap(this.selectedWeaponIndex + direction, 0, this.weaponKeys.length);
    this.selectedWeaponLevel = Phaser.Math.Clamp(
      this.selectedWeaponLevel,
      0,
      WEAPON_DEFS[this.weaponKeys[this.selectedWeaponIndex]].maxLevel
    );
    this.syncSelections();
  }

  shiftWeaponLevel(direction) {
    const maxLevel = WEAPON_DEFS[this.weaponKeys[this.selectedWeaponIndex]].maxLevel;
    this.selectedWeaponLevel = Phaser.Math.Wrap(this.selectedWeaponLevel + direction, 0, maxLevel + 1);
    this.syncSelections();
  }

  shiftPassive(direction) {
    this.selectedPassiveIndex = Phaser.Math.Wrap(this.selectedPassiveIndex + direction, 0, this.passiveKeys.length);
    this.selectedPassiveLevel = Phaser.Math.Clamp(
      this.selectedPassiveLevel,
      0,
      PASSIVE_DEFS[this.passiveKeys[this.selectedPassiveIndex]].maxLevel
    );
    this.syncSelections();
  }

  shiftPassiveLevel(direction) {
    const maxLevel = PASSIVE_DEFS[this.passiveKeys[this.selectedPassiveIndex]].maxLevel;
    this.selectedPassiveLevel = Phaser.Math.Wrap(this.selectedPassiveLevel + direction, 0, maxLevel + 1);
    this.syncSelections();
  }

  shiftEnemy(direction) {
    this.selectedEnemyIndex = Phaser.Math.Wrap(this.selectedEnemyIndex + direction, 0, this.enemyKeys.length);
    this.syncSelections();
  }

  shiftEnemyCount(direction) {
    this.selectedEnemyCountIndex = Phaser.Math.Wrap(this.selectedEnemyCountIndex + direction, 0, ENEMY_COUNTS.length);
    this.syncSelections();
  }

  shiftBossPhase(direction) {
    this.selectedBossPhaseIndex = Phaser.Math.Wrap(this.selectedBossPhaseIndex + direction, 0, this.bossPhases.length);
    this.syncSelections();
  }

  shiftExperienceAmount(direction) {
    this.selectedExperienceAmountIndex = Phaser.Math.Wrap(
      this.selectedExperienceAmountIndex + direction,
      0,
      EXPERIENCE_AMOUNTS.length
    );
    this.syncSelections();
  }

  shiftGoldAmount(direction) {
    this.selectedGoldAmountIndex = Phaser.Math.Wrap(this.selectedGoldAmountIndex + direction, 0, GOLD_AMOUNTS.length);
    this.syncSelections();
  }

  syncSelections() {
    this.presetValue.setText(this.presetEntries[this.selectedPresetIndex]?.name ?? '');
    this.weaponKeyValue.setText(this.weaponKeys[this.selectedWeaponIndex]);
    this.weaponLevelValue.setText(`Lv ${this.selectedWeaponLevel}`);
    this.passiveKeyValue.setText(this.passiveKeys[this.selectedPassiveIndex]);
    this.passiveLevelValue.setText(`Lv ${this.selectedPassiveLevel}`);
    this.enemyTypeValue.setText(this.enemyKeys[this.selectedEnemyIndex]);
    this.enemyCountValue.setText(String(ENEMY_COUNTS[this.selectedEnemyCountIndex]));
    this.bossPhaseValue.setText(`Phase ${this.bossPhases[this.selectedBossPhaseIndex]}`);
    this.experienceValue.setText(String(EXPERIENCE_AMOUNTS[this.selectedExperienceAmountIndex]));
    this.goldValue.setText(String(GOLD_AMOUNTS[this.selectedGoldAmountIndex]));
  }

  update() {
    if (this.toggleKey && Phaser.Input.Keyboard.JustDown(this.toggleKey)) {
      this.setVisible(!this.visible);
    }

    this.refreshActionAvailability();
  }

  handleResize(gameSize) {
    this.panelHeight = Phaser.Math.Clamp(gameSize.height - 86, 360, 620);
    this.viewportHeight = Math.max(180, this.panelHeight - this.viewportTop - 14);

    this.toggleButton?.setPosition(gameSize.width - 92, 68);
    this.container?.setPosition(Math.max(8, gameSize.width - this.panelWidth - 8), 66);
    this.background?.setSize(this.panelWidth, this.panelHeight);
    this.viewportFrame?.setSize(this.panelWidth - this.viewportPadding * 2, this.viewportHeight);

    this.maskGraphics.clear();
    this.maskGraphics.fillStyle(0xffffff, 1);
    this.maskGraphics.fillRect(
      this.container.x + this.viewportPadding,
      this.container.y + this.viewportTop,
      this.panelWidth - this.viewportPadding * 2,
      this.viewportHeight
    );

    this.relayoutSections();
  }

  setVisible(visible) {
    this.visible = visible;
    this.container?.setVisible(visible);
    this.maskGraphics?.setVisible(visible);
    if (!visible) {
      this.feedbackText?.setText('');
      this.draggingScroll = false;
    }
  }

  isPointerInsideViewport(pointer) {
    if (!this.visible || !this.container) {
      return false;
    }

    const left = this.container.x + this.viewportPadding;
    const top = this.container.y + this.viewportTop;
    const right = left + this.panelWidth - this.viewportPadding * 2;
    const bottom = top + this.viewportHeight;

    return pointer.x >= left && pointer.x <= right && pointer.y >= top && pointer.y <= bottom;
  }

  handlePointerDown(pointer) {
    if (!this.isPointerInsideViewport(pointer)) {
      return;
    }

    this.draggingScroll = true;
    this.lastDragY = pointer.y;
  }

  handlePointerMove(pointer) {
    if (!this.draggingScroll) {
      return;
    }

    const delta = this.lastDragY - pointer.y;
    this.lastDragY = pointer.y;
    this.scrollBy(delta);
  }

  handlePointerUp() {
    this.draggingScroll = false;
  }

  handleWheel(pointer, _gameObjects, _deltaX, deltaY) {
    if (!this.isPointerInsideViewport(pointer)) {
      return;
    }

    this.scrollBy(deltaY * 0.35);
  }

  refreshActionAvailability() {
    const blockedByOverlay = this.scene.isPaused || this.scene.levelUpBackdrop?.visible || this.scene.gameOverBackdrop?.visible;
    this.setButtonEnabled(this.actionButtons.applyPreset, !blockedByOverlay);
    this.setButtonEnabled(this.actionButtons.applyWeapon, !this.scene.levelUpBackdrop?.visible && !this.scene.gameOverBackdrop?.visible);
    this.setButtonEnabled(this.actionButtons.applyPassive, !this.scene.levelUpBackdrop?.visible && !this.scene.gameOverBackdrop?.visible);
    this.setButtonEnabled(this.actionButtons.spawnBoss, !blockedByOverlay);
    this.setButtonEnabled(this.actionButtons.spawnEnemy, !this.scene.gameOverBackdrop?.visible);
    this.setButtonEnabled(this.actionButtons.giveExp, !this.scene.levelUpBackdrop?.visible && !this.scene.gameOverBackdrop?.visible);
    this.setButtonEnabled(this.actionButtons.giveGold, !this.scene.levelUpBackdrop?.visible && !this.scene.gameOverBackdrop?.visible);
    this.setButtonEnabled(this.actionButtons.clearTest, true);
    this.setButtonEnabled(this.actionButtons.clearAll, true);
    this.setButtonEnabled(this.actionButtons.resetTest, !this.scene.gameOverBackdrop?.visible);
  }

  setButtonEnabled(button, enabled) {
    if (!button?.background || !button?.label) {
      return;
    }

    button.background.disabled = !enabled;
    button.background.setFillStyle(enabled ? button.background.fillColor : 0x2b2f33, 1);
    button.background.setStrokeStyle(1, enabled ? 0x7ce7ff : 0x6f7a82, enabled ? 0.22 : 0.18);
    button.label.setAlpha(enabled ? 1 : 0.58);
  }

  handleFeedback(payload) {
    this.feedbackText?.setText(payload?.text ?? '');
  }

  emitCommand(command) {
    this.scene.game.events.emit(TEST_MODE_EVENTS.command, command);
  }

  destroy() {
    this.toggleKey?.destroy();
    this.scene.game.events.off(TEST_MODE_EVENTS.feedback, this.handleFeedback, this);
    this.scene.input.off('wheel', this.handleWheel, this);
    this.scene.input.off('pointerdown', this.handlePointerDown, this);
    this.scene.input.off('pointermove', this.handlePointerMove, this);
    this.scene.input.off('pointerup', this.handlePointerUp, this);
    this.scene.input.off('pointerupoutside', this.handlePointerUp, this);
    this.toggleButton?.destroy(true);
    this.toggleButton = null;
    this.maskGraphics?.destroy();
    this.maskGraphics = null;
    this.container?.destroy(true);
    this.container = null;
  }
}
