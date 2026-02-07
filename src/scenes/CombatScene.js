class CombatScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CombatScene' });
    }

    init(data) {
        this.player = data.player;
        this.enemy = data.enemy;

        this.combatSystem = new CombatSystem(this);
        this.combatSystem.init(this.player, this.enemy);
    }

    create() {
        const { width, height } = this.cameras.main;

        // Fondo oscuro
        this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.9).setDepth(0);

        // Título
        this.add.text(width / 2, 50, '¡COMBATE FILOSÓFICO!', {
            fontSize: '32px',
            color: '#e74c3c',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(100);

        // Representaciones de los combatientes
        // Jugador
        this.add.rectangle(150, 200, 60, 60, 0x3498db).setDepth(50);
        this.add.text(150, 280, 'Alfarero', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(100);

        // Enemigo
        this.add.rectangle(width - 150, 200, 60, 60, 0xe74c3c).setDepth(50);
        this.add.text(width - 150, 280, 'Sócrates', {
            fontSize: '18px',
            color: '#ffffff'
        }).setOrigin(0.5).setDepth(100);

        // Stats
        this.playerStatsText = this.add.text(150, 320, '', {
            fontSize: '14px',
            color: '#3498db'
        }).setOrigin(0.5).setDepth(100);

        this.enemyStatsText = this.add.text(width - 150, 320, '', {
            fontSize: '14px',
            color: '#e74c3c'
        }).setOrigin(0.5).setDepth(100);

        // Log de combate
        this.logBackground = this.add.rectangle(
            width / 2,
            height - 200,
            width - 40,
            120,
            0x2c3e50,
            0.9
        ).setDepth(80);

        this.combatLogText = this.add.text(
            30,
            height - 250,
            '',
            {
                fontSize: '14px',
                color: '#ffffff',
                wordWrap: { width: width - 80 }
            }
        ).setDepth(100);

        // Indicador de turno
        this.turnIndicator = this.add.text(width / 2, 400, '', {
            fontSize: '18px',
            color: '#f39c12',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(100);

        // Menú de acciones
        this.createActionMenu();

        // Actualizar UI inicial
        this.updateUI();
    }

    createActionMenu() {
        const { width } = this.cameras.main;
        const startX = width / 2 - 180;
        const startY = 480;
        const spacing = 95;

        const actions = [
            { text: 'ARGUMENTAR', value: 'ARGUMENTAR', color: 0x3498db },
            { text: 'IGNORAR', value: 'IGNORAR', color: 0x95a5a6 },
            { text: 'ÁNFORA', value: 'ANFORA', color: 0xd35400 },
            { text: 'HUIR', value: 'HUIR', color: 0x27ae60 }
        ];

        this.actionButtons = [];

        actions.forEach((action, index) => {
            const x = startX + (index * spacing);

            // Botón
            const button = this.add.rectangle(x, startY, 85, 35, action.color);
            button.setStrokeStyle(2, 0xffffff);
            button.setDepth(100);
            button.setInteractive({ useHandCursor: true });

            // Texto
            const text = this.add.text(x, startY, action.text, {
                fontSize: '12px',
                color: '#ffffff',
                fontStyle: 'bold'
            }).setOrigin(0.5).setDepth(101);

            // Hover
            button.on('pointerover', () => {
                button.setScale(1.05);
            });

            button.on('pointerout', () => {
                button.setScale(1);
            });

            // Click
            button.on('pointerdown', () => {
                this.handlePlayerAction(action.value);
            });

            this.actionButtons.push({ button, text, value: action.value });
        });
    }

    handlePlayerAction(action) {
        if (!this.combatSystem.isPlayerTurn) return;

        // Deshabilitar botones temporalmente
        this.setButtonsEnabled(false);

        // Ejecutar acción del jugador
        const result = this.combatSystem.executeAction(action);

        // Actualizar UI
        this.updateUI();

        // Si el combate terminó
        if (result.combatEnded) {
            this.time.delayedCall(2000, () => this.endCombat(result.success));
            return;
        }

        // Turno del enemigo
        this.time.delayedCall(1500, () => {
            const enemyResult = this.combatSystem.executeAction();
            this.updateUI();

            if (enemyResult.combatEnded) {
                this.time.delayedCall(2000, () => this.endCombat(enemyResult.success));
            } else {
                this.setButtonsEnabled(true);
            }
        });
    }

    updateUI() {
        const state = this.combatSystem.getState();

        // Stats
        this.playerStatsText.setText(
            `Paciencia: ${state.player.patience}/${state.player.maxPatience}`
        );

        this.enemyStatsText.setText(
            `Pesadez: ${state.enemy.pesadez}/${state.enemy.maxPesadez}`
        );

        // Turno
        if (state.isPlayerTurn) {
            this.turnIndicator.setText('Tu turno');
            this.turnIndicator.setColor('#3498db');
        } else {
            this.turnIndicator.setText('Turno de Sócrates');
            this.turnIndicator.setColor('#e74c3c');
        }

        // Log (últimas 4 líneas)
        const recentLog = state.combatLog.slice(-4).join('\n');
        this.combatLogText.setText(recentLog);

        // Deshabilitar botón de ánfora si ya se usó
        if (!state.player.hasAmphora) {
            const amphoraButton = this.actionButtons.find(b => b.value === 'ANFORA');
            if (amphoraButton) {
                amphoraButton.button.setFillStyle(0x7f8c8d);
                amphoraButton.button.disableInteractive();
            }
        }
    }

    setButtonsEnabled(enabled) {
        this.actionButtons.forEach(button => {
            if (enabled) {
                button.button.setInteractive({ useHandCursor: true });
            } else {
                button.button.disableInteractive();
            }
        });
    }

    endCombat(playerWon) {
        const { width, height } = this.cameras.main;

        const resultText = playerWon
            ? '¡VICTORIA!\nSócrates se retira a reflexionar.'
            : 'DERROTA\nSócrates te convenció...';

        const resultColor = playerWon ? '#27ae60' : '#e74c3c';

        const result = this.add.text(width / 2, height / 2, resultText, {
            fontSize: '28px',
            color: resultColor,
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setDepth(200);

        result.setAlpha(0);
        this.tweens.add({
            targets: result,
            alpha: 1,
            duration: 1000
        });

        // Continuar texto
        const continueText = this.add.text(
            width / 2,
            height - 50,
            'Click para continuar',
            { fontSize: '16px', color: '#ffffff' }
        ).setOrigin(0.5).setDepth(200);

        this.input.once('pointerdown', () => {
            this.scene.stop();
            this.scene.resume('GameScene');

            // Si perdió, reiniciar el juego
            if (!playerWon) {
                this.scene.stop('GameScene');
                this.scene.start('GameScene');
            }
        });
    }
}
