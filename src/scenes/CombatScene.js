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
            barWidth: 220
        };

        this.createBackground();
        this.createTopCards();
        this.createQuestionPanel();
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
        this.add.rectangle(width / 2, 40, width - 28, 56, colors.panel, 0.95)
            .setStrokeStyle(2, colors.border)
            .setDepth(10);

        this.add.text(width / 2, 40, 'COMBATE FILOSOFICO', {
            fontSize: '30px',
            color: '#f4d03f',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(20);
    }

    createTopCards() {
        const { width, colors, barWidth } = this.ui;

        // Socrates card
        this.add.rectangle(140, 130, 250, 135, colors.panel, 0.92)
            .setStrokeStyle(2, colors.border)
            .setDepth(30);
        this.add.sprite(80, 108, 'oldman', 0).setScale(3.2).setDepth(35);
        this.add.text(138, 90, 'SOCRATES', {
            fontSize: '16px',
            color: '#ffc5bf',
            fontStyle: 'bold'
        }).setDepth(35);
        this.intensityBarBg = this.add.rectangle(30, 142, barWidth, 14, 0x0b1018, 1).setOrigin(0, 0).setDepth(32);
        this.intensityBar = this.add.rectangle(30, 142, barWidth, 14, colors.enemy, 1).setOrigin(0, 0).setDepth(33);
        this.intensityText = this.add.text(140, 149, '', {
            fontSize: '12px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(35);

        // Player card
        this.add.rectangle(width - 140, 130, 250, 135, colors.panel, 0.92)
            .setStrokeStyle(2, colors.border)
            .setDepth(30);
        this.add.sprite(width - 200, 108, 'boy', 0).setScale(3.2).setDepth(35);
        this.add.text(width - 142, 90, 'ALFARERO', {
            fontSize: '16px',
            color: '#a9d6ff',
            fontStyle: 'bold'
        }).setDepth(35);
        this.patienceBarBg = this.add.rectangle(width - 250, 142, barWidth, 14, 0x0b1018, 1).setOrigin(0, 0).setDepth(32);
        this.patienceBar = this.add.rectangle(width - 250, 142, barWidth, 14, colors.player, 1).setOrigin(0, 0).setDepth(33);
        this.patienceText = this.add.text(width - 140, 149, '', {
            fontSize: '12px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(35);
    }

    createQuestionPanel() {
        const { width, colors } = this.ui;

        this.questionBox = this.add.rectangle(
            width / 2,
            230,
            width - 60,
            80,
            colors.panel,
            0.95
        ).setDepth(40);
        this.questionBox.setStrokeStyle(2, colors.accent);

        this.questionText = this.add.text(
            width / 2,
            230,
            '',
            {
                fontSize: '15px',
                color: '#ecf0f1',
                fontStyle: 'italic',
                align: 'center',
                wordWrap: { width: width - 110 }
            }
        ).setOrigin(0.5).setDepth(41);
    }

    createLogPanel() {
        const { width, colors } = this.ui;

        this.logBox = this.add.rectangle(width / 2, 330, width - 60, 140, colors.panel, 0.95)
            .setStrokeStyle(2, colors.border)
            .setDepth(40);

        this.add.text(44, 270, 'LOG DE COMBATE', {
            fontSize: '13px',
            color: '#d6e4f0',
            fontStyle: 'bold'
        }).setDepth(41);

        this.combatLogText = this.add.text(44, 292, '', {
            fontSize: '14px',
            color: '#ffffff',
            lineSpacing: 4,
            wordWrap: { width: width - 92 }
        }).setDepth(41);

        this.turnIndicator = this.add.text(width / 2, 392, '', {
            fontSize: '15px',
            color: '#f39c12',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(45);
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

    createVerticalMenu() {
        const { width, colors } = this.ui;
        const state = this.combatSystem.getState();

        const layer2Options = state.question.layer2.options;
        const allOptions = [...layer2Options];

        if (this.player.amphoras > 0) {
            allOptions.push({
                text: `Tirar Anfora (${this.player.amphoras})`,
                action: 'amphora',
                color: 0xe67e22
            });
        }

        allOptions.push({
            text: 'Huir',
            action: 'flee',
            color: 0x95a5a6
        });

        const menuX = 60;
        const menuY = 430;
        const menuWidth = width - 120;
        const optionHeight = 34;
        const optionSpacing = 6;
        const menuHeight = (optionHeight + optionSpacing) * allOptions.length + 18;

        this.menuBox = this.add.rectangle(
            width / 2,
            menuY + menuHeight / 2,
            menuWidth,
            menuHeight,
            colors.panel,
            0.96
        ).setDepth(50);
        this.menuBox.setStrokeStyle(2, colors.border);

        this.menuSelector = this.add.rectangle(
            width / 2,
            menuY + 9 + optionHeight / 2,
            menuWidth - 10,
            optionHeight,
            colors.accent,
            0.32
        ).setDepth(55);
        this.menuSelector.setStrokeStyle(2, colors.accent);

        this.menuOptions = [];

        allOptions.forEach((option, index) => {
            const y = menuY + 9 + (index * (optionHeight + optionSpacing)) + optionHeight / 2;

            let qualityColor;
            if (option.color) {
                qualityColor = option.color;
            } else if (option.quality === 'good') {
                qualityColor = 0x27ae60;
            } else if (option.quality === 'regular') {
                qualityColor = 0xf39c12;
            } else {
                qualityColor = 0x3498db;
            }

            const numberText = this.add.text(menuX + 16, y, `${index + 1}.`, {
                fontSize: '14px',
                color: '#95a5a6',
                fontStyle: 'bold'
            }).setOrigin(0, 0.5).setDepth(60);

            const qualityIndicator = this.add.rectangle(menuX + 46, y, 10, 10, qualityColor).setDepth(60);

            const optionText = this.add.text(menuX + 62, y, option.text, {
                fontSize: '13px',
                color: '#ecf0f1',
                wordWrap: { width: menuWidth - 160 }
            }).setOrigin(0, 0.5).setDepth(60);

            let qualityTag = null;
            if (option.quality === 'good') {
                qualityTag = this.add.text(menuX + menuWidth - 20, y, '[BUENO]', {
                    fontSize: '10px',
                    color: '#27ae60',
                    fontStyle: 'bold'
                }).setOrigin(1, 0.5).setDepth(60);
            } else if (option.quality === 'regular') {
                qualityTag = this.add.text(menuX + menuWidth - 20, y, '[REGULAR]', {
                    fontSize: '10px',
                    color: '#f39c12',
                    fontStyle: 'bold'
                }).setOrigin(1, 0.5).setDepth(60);
            }

            const hitArea = this.add.rectangle(
                width / 2,
                y,
                menuWidth - 10,
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
                qualityTag,
                hitArea,
                y
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
            if (opt.qualityTag) opt.qualityTag.destroy();
            if (opt.hitArea) opt.hitArea.destroy();
        });
        this.menuOptions = [];

        this.selectedIndex = 0;
        this.createVerticalMenu();
        this.setMenuEnabled(enabled);
    }

    updateSelector() {
        if (this.menuOptions[this.selectedIndex]) {
            this.menuSelector.y = this.menuOptions[this.selectedIndex].y;
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

    showCombatFeedback(message, color) {
        const { width } = this.cameras.main;

        const feedback = this.add.text(
            width / 2,
            398,
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
        this.combatSystem.combatLog.push(result.message);

        const feedbackColor = result.outcome === 'victory'
            ? 0x27ae60
            : result.outcome === 'defeat'
                ? 0xe74c3c
                : option.action === 'amphora'
                    ? 0xe67e22
                    : 0x3498db;

        this.showCombatFeedback(result.message, feedbackColor);
        this.updateUI();

        if (result.combatEnded) {
            this.time.delayedCall(1800, () => this.endCombat(result.outcome));
            return;
        }

        if (option.action === 'amphora') {
            this.recreateMenu(false);
        }

        this.combatSystem.isPlayerTurn = false;
        this.updateUI();

        this.time.delayedCall(1300, () => {
            const enemyResult = this.combatSystem.executeSocratesAction();
            this.combatSystem.combatLog.push(enemyResult.message);

            this.showCombatFeedback(enemyResult.message, 0xe74c3c);
            this.updateUI();

            if (enemyResult.questionChanged) {
                this.recreateMenu(false);
            }

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

        this.questionText.setText(state.question.layer2.question);

        const intensityPercent = Phaser.Math.Clamp(state.socrates.intensity / state.socrates.maxIntensity, 0, 1);
        this.intensityBar.width = this.ui.barWidth * intensityPercent;
        this.intensityText.setText(`${Math.max(0, state.socrates.intensity)}/${state.socrates.maxIntensity}`);

        if (intensityPercent > 0.5) {
            this.intensityBar.setFillStyle(0xe74c3c);
        } else if (intensityPercent > 0.25) {
            this.intensityBar.setFillStyle(0xf39c12);
        } else {
            this.intensityBar.setFillStyle(0x95a5a6);
        }

        const patiencePercent = Phaser.Math.Clamp(state.player.patience / state.player.maxPatience, 0, 1);
        this.patienceBar.width = this.ui.barWidth * patiencePercent;
        this.patienceText.setText(`${Math.max(0, state.player.patience)}/${state.player.maxPatience}`);

        if (patiencePercent > 0.6) {
            this.patienceBar.setFillStyle(0x27ae60);
        } else if (patiencePercent > 0.3) {
            this.patienceBar.setFillStyle(0xf39c12);
        } else {
            this.patienceBar.setFillStyle(0xe74c3c);
        }

        if (state.isPlayerTurn) {
            this.turnIndicator.setText('Tu turno');
            this.turnIndicator.setColor('#3498db');
        } else {
            this.turnIndicator.setText('Turno de Socrates...');
            this.turnIndicator.setColor('#e74c3c');
        }

        const recentLog = state.combatLog.slice(-4).join('\n\n');
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
        } else if (outcome === 'fled') {
            resultText = 'ESCAPASTE\n\nSocrates se queda filosofando solo.';
            resultColor = '#f39c12';
        } else {
            resultText = 'DERROTA\n\nPerdiste toda tu paciencia...';
            resultColor = '#e74c3c';
        }

        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.72).setDepth(200);

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
