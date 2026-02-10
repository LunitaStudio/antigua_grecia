class CombatScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CombatScene' });
    }

    init(data) {
        this.player = data.player;
        this.question = data.question;
        this.onCombatEnd = data.onCombatEnd;
        this.stats = data.stats;

        this.combatSystem = new CombatSystem(this);
        this.combatSystem.init(this.player, this.question);
    }

    create() {
        const { width, height } = this.cameras.main;

        this.ui = {
            width,
            height,
            colors: {
                bg: 0x0f1724,
                panel: 0x1f2c3f,
                border: 0x4d6480,
                player: 0x3498db,
                enemy: 0xe74c3c,
                accent: 0xf39c12
            },
            barWidth: 260,
            menuStartY: 458
        };
        this.combatArtResetTimer = null;
        this.combatArtDefaultKey = 'combat_art_base';

        this.createBackground();
        this.createTopCards();
        this.createLogPanel();

        this.selectedIndex = 0;
        this.menuOptions = [];
        this.menuEnabled = true;
        this.createVerticalMenu();

        this.setupKeyboardInput();
        this.updateUI();
    }

    createBackground() {
        const { width, height, colors } = this.ui;

        this.add.rectangle(width / 2, height / 2, width, height, colors.bg, 0.98).setDepth(0);
        this.createCombatArtLayer();

        // Título pequeño opcional (puede comentarse para más espacio)
        // this.add.text(width / 2, 15, '⚔️ Combate Filosófico', {
        //     fontSize: '16px',
        //     color: '#f4d03f',
        //     fontStyle: 'bold'
        // }).setOrigin(0.5).setDepth(20);
    }

    createCombatArtLayer() {
        const { width, height } = this.ui;

        this.combatArtImage = this.add.image(width / 2, height / 2, this.combatArtDefaultKey).setDepth(2);
        this.fitCombatArtToScreen(this.combatArtDefaultKey);

        // Oscurecer MÍNIMO para que se vea bien el arte (estilo Pokemon)
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.05).setDepth(3);
    }

    fitCombatArtToScreen(textureKey) {
        const source = this.textures.get(textureKey).getSourceImage();
        if (!source) return;

        const scale = Math.max(this.ui.width / source.width, this.ui.height / source.height);
        this.combatArtImage.setScale(scale);
    }

    setCombatArt(textureKey, holdMs = 900) {
        if (!this.textures.exists(textureKey)) return;

        if (this.combatArtResetTimer) {
            this.combatArtResetTimer.remove();
            this.combatArtResetTimer = null;
        }

        this.combatArtImage.setTexture(textureKey);
        this.fitCombatArtToScreen(textureKey);

        if (textureKey !== this.combatArtDefaultKey && holdMs > 0) {
            this.combatArtResetTimer = this.time.delayedCall(holdMs, () => {
                this.resetCombatArt();
            });
        }
    }

    resetCombatArt() {
        this.combatArtImage.setTexture(this.combatArtDefaultKey);
        this.fitCombatArtToScreen(this.combatArtDefaultKey);
        this.combatArtResetTimer = null;
    }

    createTopCards() {
        const { width, height, colors } = this.ui;

        // === SÓCRATES - ARRIBA IZQUIERDA ===
        const enemyCardX = 20;
        const enemyCardY = 30;
        const enemyCardWidth = 220;
        const enemyCardHeight = 52;

        this.add.rectangle(enemyCardX, enemyCardY, enemyCardWidth, enemyCardHeight, colors.panel, 0.90)
            .setOrigin(0, 0)
            .setStrokeStyle(2, colors.border)
            .setDepth(30);

        this.add.text(enemyCardX + 12, enemyCardY + 8, 'SÓCRATES', {
            fontSize: '16px',
            color: '#ffc5bf',
            fontStyle: 'bold'
        }).setDepth(35);

        this.intensityBarBg = this.add.rectangle(enemyCardX + 12, enemyCardY + 30, 196, 10, 0x0b1018, 1)
            .setOrigin(0, 0)
            .setDepth(32);
        this.intensityBar = this.add.rectangle(enemyCardX + 12, enemyCardY + 30, 196, 10, colors.enemy, 1)
            .setOrigin(0, 0)
            .setDepth(33);
        this.intensityText = this.add.text(enemyCardX + 110, enemyCardY + 35, '', {
            fontSize: '10px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(35);

        // === CHREMES - ABAJO DERECHA ===
        const playerCardWidth = 240;
        const playerCardHeight = 54;
        const playerCardX = width - playerCardWidth - 20;
        const playerCardY = height - 200;

        this.add.rectangle(playerCardX, playerCardY, playerCardWidth, playerCardHeight, colors.panel, 0.90)
            .setOrigin(0, 0)
            .setStrokeStyle(2, colors.border)
            .setDepth(30);

        this.add.text(playerCardX + 12, playerCardY + 8, 'CHREMES', {
            fontSize: '16px',
            color: '#a9d6ff',
            fontStyle: 'bold'
        }).setDepth(35);

        this.patienceBarBg = this.add.rectangle(playerCardX + 12, playerCardY + 32, 216, 10, 0x0b1018, 1)
            .setOrigin(0, 0)
            .setDepth(32);
        this.patienceBar = this.add.rectangle(playerCardX + 12, playerCardY + 32, 216, 10, colors.player, 1)
            .setOrigin(0, 0)
            .setDepth(33);
        this.patienceText = this.add.text(playerCardX + 120, playerCardY + 37, '', {
            fontSize: '10px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(35);
    }

    createLogPanel() {
        const { width, height, colors } = this.ui;

        // === PANEL INFERIOR ESTILO POKEMON ===
        const panelHeight = 140;
        const panelY = height - panelHeight;

        // Fondo del panel completo
        this.logBox = this.add.rectangle(0, panelY, width, panelHeight, colors.panel, 0.92)
            .setOrigin(0, 0)
            .setStrokeStyle(3, colors.border, 1)
            .setDepth(40);

        // === LADO IZQUIERDO: Texto/Pregunta ===
        const textBoxWidth = width * 0.52;
        const textBoxX = 16;
        const textBoxY = panelY + 12;

        // Caja de texto
        this.add.rectangle(textBoxX, textBoxY, textBoxWidth, panelHeight - 24, 0x1a2332, 0.6)
            .setOrigin(0, 0)
            .setStrokeStyle(2, colors.border)
            .setDepth(41);

        // Indicador de turno pequeño
        this.turnIndicator = this.add.text(textBoxX + 12, textBoxY + 8, '', {
            fontSize: '12px',
            color: '#f39c12',
            fontStyle: 'bold'
        }).setDepth(45);

        // Texto de la pregunta/log
        this.combatLogText = this.add.text(textBoxX + 12, textBoxY + 28, '', {
            fontSize: '14px',
            color: '#ffffff',
            lineSpacing: 4,
            wordWrap: { width: textBoxWidth - 24 }
        }).setDepth(45);

        // Guardar coordenadas para el menú (lado derecho)
        this.menuAreaX = textBoxX + textBoxWidth + 12;
        this.menuAreaY = panelY + 12;
        this.menuAreaWidth = width - this.menuAreaX - 16;
        this.menuAreaHeight = panelHeight - 24;
    }

    setupKeyboardInput() {
        this.cursors = this.input.keyboard.createCursorKeys();
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        this.numberKeys = {
            one: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
            two: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
            three: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
            four: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR)
        };
    }

    update() {
        const state = this.combatSystem.getState();
        if (!state.isPlayerTurn) return;

        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.moveSelection(-1);
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
            this.moveSelection(1);
        }

        if (Phaser.Input.Keyboard.JustDown(this.enterKey) || Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.confirmSelection();
        }

        if (Phaser.Input.Keyboard.JustDown(this.numberKeys.one)) this.selectOption(0);
        if (Phaser.Input.Keyboard.JustDown(this.numberKeys.two)) this.selectOption(1);
        if (Phaser.Input.Keyboard.JustDown(this.numberKeys.three)) this.selectOption(2);
        if (Phaser.Input.Keyboard.JustDown(this.numberKeys.four)) this.selectOption(3);
    }

    buildActions(state) {
        const actions = [
            { text: 'REBATIR', action: 'rebatir', color: 0x3498db },
            { text: 'DIVAGAR', action: 'divagar', color: 0x95a5a6 }
        ];

        if (state.player.amphoras > 0) {
            actions.push({
                text: `ARROJAR ANFORA (${state.player.amphoras})`,
                action: 'amphora',
                color: 0xe67e22
            });
        }

        actions.push({ text: 'HUIR', action: 'flee', color: 0x27ae60 });
        return actions;
    }

    createVerticalMenu() {
        const { colors } = this.ui;
        const state = this.combatSystem.getState();
        const allOptions = this.buildActions(state);

        // Usar el área del menú en el lado derecho del panel inferior
        const menuX = this.menuAreaX;
        const menuY = this.menuAreaY;
        const menuWidth = this.menuAreaWidth;
        const optionHeight = 26;
        const optionSpacing = 3;

        // Fondo del menú
        this.menuBox = this.add.rectangle(
            menuX,
            menuY,
            menuWidth,
            this.menuAreaHeight,
            0x1a2332,
            0.6
        ).setOrigin(0, 0).setDepth(50);
        this.menuBox.setStrokeStyle(2, colors.border);

        // Selector
        this.menuSelector = this.add.rectangle(
            menuX + 6,
            menuY + 6,
            menuWidth - 12,
            optionHeight,
            colors.accent,
            0.35
        ).setOrigin(0, 0).setDepth(55);
        this.menuSelector.setStrokeStyle(2, colors.accent);

        this.menuOptions = [];

        allOptions.forEach((option, index) => {
            const optY = menuY + 6 + (index * (optionHeight + optionSpacing));

            // Número
            const numberText = this.add.text(menuX + 12, optY + optionHeight / 2, `${index + 1}.`, {
                fontSize: '12px',
                color: '#95a5a6',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5).setDepth(60);

            // Indicador de color
            const qualityIndicator = this.add.rectangle(
                menuX + 32,
                optY + optionHeight / 2,
                8,
                8,
                option.color
            ).setDepth(60);

            // Texto de la opción
            const optionText = this.add.text(menuX + 46, optY + optionHeight / 2, option.text, {
                fontSize: '12px',
                color: '#ecf0f1',
                wordWrap: { width: menuWidth - 56 }
            }).setOrigin(0, 0.5).setDepth(60);

            // Área interactiva
            const hitArea = this.add.rectangle(
                menuX + menuWidth / 2,
                optY + optionHeight / 2,
                menuWidth - 12,
                optionHeight,
                0xffffff,
                0
            ).setDepth(58);
            hitArea.setInteractive({ useHandCursor: true });

            hitArea.on('pointerover', () => {
                if (!this.menuEnabled) return;
                this.selectedIndex = index;
                this.updateSelector();
            });

            hitArea.on('pointerdown', () => {
                if (!this.menuEnabled) return;
                this.selectedIndex = index;
                this.confirmSelection();
            });

            this.menuOptions.push({
                option,
                numberText,
                qualityIndicator,
                optionText,
                hitArea,
                y: optY
            });
        });

        this.updateSelector();
    }

    recreateMenu(enabled = true) {
        if (this.menuBox) this.menuBox.destroy();
        if (this.menuSelector) this.menuSelector.destroy();

        this.menuOptions.forEach(opt => {
            if (opt.numberText) opt.numberText.destroy();
            if (opt.qualityIndicator) opt.qualityIndicator.destroy();
            if (opt.optionText) opt.optionText.destroy();
            if (opt.hitArea) opt.hitArea.destroy();
        });
        this.menuOptions = [];

        this.selectedIndex = 0;
        this.createVerticalMenu();
        this.setMenuEnabled(enabled);
    }

    updateSelector() {
        if (this.menuOptions[this.selectedIndex]) {
            const optionHeight = 26;
            const optionSpacing = 3;
            this.menuSelector.y = this.menuAreaY + 6 + (this.selectedIndex * (optionHeight + optionSpacing));
        }
    }

    moveSelection(direction) {
        this.selectedIndex += direction;

        if (this.selectedIndex < 0) {
            this.selectedIndex = this.menuOptions.length - 1;
        } else if (this.selectedIndex >= this.menuOptions.length) {
            this.selectedIndex = 0;
        }

        this.updateSelector();
    }

    selectOption(index) {
        if (index >= 0 && index < this.menuOptions.length) {
            this.selectedIndex = index;
            this.updateSelector();
            this.confirmSelection();
        }
    }

    confirmSelection() {
        const state = this.combatSystem.getState();
        if (!state.isPlayerTurn) return;

        const selected = this.menuOptions[this.selectedIndex];
        if (!selected) return;

        this.handlePlayerAction(selected.option);
    }

    playPlayerActionCue(action, result) {
        // Hook para futuro: pseudo-animaciones por accion.
        if (action === 'amphora') {
            this.setCombatArt('combat_art_throw', 1100);
            return;
        }

        if (action === 'rebatir' && result.success) {
            this.setCombatArt('combat_art_rebatir', 950);
            return;
        }

        if (action === 'divagar' && result.success) {
            this.setCombatArt('combat_art_rebatir', 800);
            return;
        }

        if (action === 'flee') {
            this.setCombatArt('combat_art_throw_alt', 800);
        }
    }

    playSocratesActionCue() {
        // Hook para futuro: pseudo-animaciones de ataque de Socrates.
        this.setCombatArt('combat_art_throw_alt', 850);
    }

    showCombatFeedback(message, color) {
        const { width } = this.cameras.main;

        const feedback = this.add.text(
            width / 2,
            196,
            message.split('\n')[0],
            {
                fontSize: '13px',
                color: '#ffffff',
                backgroundColor: Phaser.Display.Color.IntegerToColor(color).rgba,
                padding: { x: 8, y: 4 }
            }
        );
        feedback.setOrigin(0.5);
        feedback.setDepth(70);

        this.tweens.add({
            targets: feedback,
            alpha: 0,
            duration: 1000,
            onComplete: () => feedback.destroy()
        });
    }

    handlePlayerAction(option) {
        const state = this.combatSystem.getState();
        if (!state.isPlayerTurn) return;

        this.setMenuEnabled(false);

        const result = this.combatSystem.executePlayerAction(option);
        if (result.invalidAction) {
            this.showCombatFeedback(result.message, 0xe74c3c);
            this.setMenuEnabled(true);
            return;
        }

        this.combatSystem.combatLog.push(result.message);
        this.playPlayerActionCue(option.action, result);

        const feedbackColor = result.outcome === 'victory'
            ? 0x27ae60
            : result.outcome === 'defeat'
                ? 0xe74c3c
                : option.action === 'amphora'
                    ? 0xe67e22
                    : 0x3498db;

        this.showCombatFeedback(result.message, feedbackColor);
        this.updateUI();

        const usedAmphora = option.action === 'amphora';
        if (usedAmphora) {
            this.recreateMenu(false);
        }

        if (result.combatEnded) {
            this.time.delayedCall(1800, () => this.endCombat(result.outcome));
            return;
        }

        if (result.skipEnemyTurn) {
            this.combatSystem.isPlayerTurn = true;
            this.updateUI();
            this.setMenuEnabled(true);
            return;
        }

        this.combatSystem.isPlayerTurn = false;
        this.updateUI();

        this.time.delayedCall(1300, () => {
            const enemyResult = this.combatSystem.executeSocratesAction();
            this.combatSystem.combatLog.push(enemyResult.message);
            this.playSocratesActionCue();

            this.showCombatFeedback(enemyResult.message, 0xe74c3c);
            this.updateUI();

            if (enemyResult.combatEnded) {
                this.time.delayedCall(1800, () => this.endCombat(enemyResult.outcome));
            } else {
                this.combatSystem.isPlayerTurn = true;
                this.updateUI();
                this.setMenuEnabled(true);
            }
        });
    }

    updateUI() {
        const state = this.combatSystem.getState();

        // Actualizar barra de Sócrates (196px de ancho máximo)
        const intensityPercent = Phaser.Math.Clamp(state.socrates.intensity / state.socrates.maxIntensity, 0, 1);
        this.intensityBar.width = 196 * intensityPercent;
        this.intensityText.setText(`${Math.max(0, state.socrates.intensity)}/${state.socrates.maxIntensity}`);

        if (intensityPercent > 0.5) {
            this.intensityBar.setFillStyle(0xe74c3c);
        } else if (intensityPercent > 0.25) {
            this.intensityBar.setFillStyle(0xf39c12);
        } else {
            this.intensityBar.setFillStyle(0x95a5a6);
        }

        // Actualizar barra de Chremes (216px de ancho máximo)
        const patiencePercent = Phaser.Math.Clamp(state.player.patience / state.player.maxPatience, 0, 1);
        this.patienceBar.width = 216 * patiencePercent;
        this.patienceText.setText(`${Math.max(0, state.player.patience)}/${state.player.maxPatience}`);

        if (patiencePercent > 0.6) {
            this.patienceBar.setFillStyle(0x27ae60);
        } else if (patiencePercent > 0.3) {
            this.patienceBar.setFillStyle(0xf39c12);
        } else {
            this.patienceBar.setFillStyle(0xe74c3c);
        }

        // Indicador de turno
        if (state.isPlayerTurn) {
            this.turnIndicator.setText('▶ Tu turno');
            this.turnIndicator.setColor('#3498db');
        } else {
            this.turnIndicator.setText('Turno de Sócrates...');
            this.turnIndicator.setColor('#e74c3c');
        }

        // Log de combate (últimas 3 líneas, más compacto)
        const recentLog = state.combatLog
            .slice(-3)
            .map(line => line.replace(/\n+/g, ' ').trim())
            .join('\n');
        this.combatLogText.setText(recentLog);
    }

    setMenuEnabled(enabled) {
        this.menuEnabled = enabled;

        this.menuOptions.forEach(opt => {
            if (enabled) {
                opt.hitArea.setInteractive({ useHandCursor: true });
            } else {
                opt.hitArea.disableInteractive();
            }
        });

        if (this.menuSelector) {
            this.menuSelector.setAlpha(enabled ? 1 : 0.3);
        }
    }

    endCombat(outcome) {
        const { width, height } = this.cameras.main;

        let resultText = '';
        let resultColor = '';

        if (outcome === 'victory') {
            resultText = 'VICTORIA\n\nSocrates se retira a reflexionar...';
            resultColor = '#27ae60';
            this.setCombatArt('combat_art_ko', 0);
        } else if (outcome === 'fled') {
            resultText = 'ESCAPASTE\n\nSocrates se queda filosofando solo.';
            resultColor = '#f39c12';
            this.setCombatArt(this.combatArtDefaultKey, 0);
        } else {
            resultText = 'DERROTA\n\nPerdiste toda tu paciencia...';
            resultColor = '#e74c3c';
            this.setCombatArt('combat_art_defeat', 0);
        }

        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.72).setDepth(200);

        const result = this.add.text(width / 2, height / 2 - 30, resultText, {
            fontSize: '30px',
            color: resultColor,
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setDepth(201);

        result.setAlpha(0);
        this.tweens.add({
            targets: result,
            alpha: 1,
            duration: 800
        });

        this.add.text(
            width / 2,
            height / 2 + 60,
            'Click para continuar',
            { fontSize: '16px', color: '#bdc3c7' }
        ).setOrigin(0.5).setDepth(201);

        this.input.once('pointerdown', () => {
            if (this.onCombatEnd) {
                this.onCombatEnd(outcome);
            }
            this.scene.stop();
        });
    }
}
