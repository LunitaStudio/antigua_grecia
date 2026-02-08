class CombatScene extends Phaser.Scene {
    constructor() {
        super({ key: 'CombatScene' });
    }

    init(data) {
        this.player = data.player;
        this.question = data.question;
        this.onCombatEnd = data.onCombatEnd; // Callback para volver a GameScene

        this.combatSystem = new CombatSystem(this);
        this.combatSystem.init(this.player, this.question);

        // Referencia a stats de GameScene
        this.stats = data.stats;
    }

    create() {
        const { width, height } = this.cameras.main;

        // Fondo oscuro
        this.add.rectangle(width / 2, height / 2, width, height, 0x1a1a2e, 1).setDepth(0);

        // Título
        this.add.text(width / 2, 30, '⚔️ COMBATE FILOSÓFICO ⚔️', {
            fontSize: '28px',
            color: '#f39c12',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(100);

        // === SÓCRATES (ARRIBA) ===
        this.socratesSprite = this.add.rectangle(
            width / 2,
            130,
            70,
            70,
            0xe74c3c
        ).setDepth(50);

        this.socratesLabel = this.add.text(width / 2, 210, 'SÓCRATES', {
            fontSize: '16px',
            color: '#e74c3c',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(100);

        // Barra de Intensidad de Sócrates
        const intensityBarBg = this.add.rectangle(
            width / 2,
            235,
            200,
            16,
            0x2c3e50
        ).setDepth(80);

        this.intensityBar = this.add.rectangle(
            width / 2,
            235,
            200,
            16,
            0xe74c3c
        ).setDepth(81);

        this.intensityText = this.add.text(width / 2, 235, '', {
            fontSize: '12px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(82);

        // === JUGADOR (ABAJO) ===
        this.playerSprite = this.add.rectangle(
            width / 2,
            height - 130,
            70,
            70,
            0x3498db
        ).setDepth(50);

        this.playerLabel = this.add.text(width / 2, height - 50, 'ALFARERO', {
            fontSize: '16px',
            color: '#3498db',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(100);

        // Barra de Paciencia
        const patienceBarBg = this.add.rectangle(
            width / 2,
            height - 75,
            200,
            16,
            0x2c3e50
        ).setDepth(80);

        this.patienceBar = this.add.rectangle(
            width / 2,
            height - 75,
            200,
            16,
            0x27ae60
        ).setDepth(81);

        this.patienceText = this.add.text(width / 2, height - 75, '', {
            fontSize: '12px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(82);

        // === ZONA CENTRAL: PREGUNTA ===
        // Pregunta de Sócrates (Layer 2)
        this.questionBox = this.add.rectangle(
            width / 2,
            260,
            width - 80,
            70,
            0x34495e,
            0.95
        ).setDepth(50);
        this.questionBox.setStrokeStyle(2, 0xf39c12);

        this.questionText = this.add.text(
            width / 2,
            260,
            '',
            {
                fontSize: '14px',
                color: '#ecf0f1',
                fontStyle: 'italic',
                align: 'center',
                wordWrap: { width: width - 100 }
            }
        ).setOrigin(0.5).setDepth(51);

        // Indicador de turno
        this.turnIndicator = this.add.text(width / 2, height - 105, '', {
            fontSize: '14px',
            color: '#f39c12',
            fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(100);

        // Crear menú vertical estilo RPG
        this.selectedIndex = 0;
        this.createVerticalMenu();

        // Configurar input de teclado
        this.setupKeyboardInput();

        // Actualizar UI inicial
        this.updateUI();
    }

    setupKeyboardInput() {
        // Teclas de navegación
        this.cursors = this.input.keyboard.createCursorKeys();
        this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Teclas numéricas para quick-select
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

        // Navegación con flechas
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.moveSelection(-1);
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
            this.moveSelection(1);
        }

        // Confirmar selección con Enter o Espacio
        if (Phaser.Input.Keyboard.JustDown(this.enterKey) ||
            Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
            this.confirmSelection();
        }

        // Quick-select con números
        if (Phaser.Input.Keyboard.JustDown(this.numberKeys.one)) {
            this.selectOption(0);
        }
        if (Phaser.Input.Keyboard.JustDown(this.numberKeys.two)) {
            this.selectOption(1);
        }
        if (Phaser.Input.Keyboard.JustDown(this.numberKeys.three)) {
            this.selectOption(2);
        }
        if (Phaser.Input.Keyboard.JustDown(this.numberKeys.four)) {
            this.selectOption(3);
        }
    }

    showCombatFeedback(message, color) {
        const { width, height } = this.cameras.main;

        const feedback = this.add.text(
            width / 2,
            height / 2 + 80,
            message,
            {
                fontSize: '16px',
                color: '#ffffff',
                backgroundColor: Phaser.Display.Color.IntegerToColor(color).rgba,
                padding: { x: 10, y: 5 }
            }
        );
        feedback.setOrigin(0.5);
        feedback.setDepth(150);

        this.tweens.add({
            targets: feedback,
            alpha: 0,
            duration: 1500,
            onComplete: () => feedback.destroy()
        });
    }

    createVerticalMenu() {
        const { width, height } = this.cameras.main;

        // Leer del state actualizado, NO de this.question (para evitar desincronización)
        const state = this.combatSystem.getState();
        const layer2Options = state.question.layer2.options;
        const allOptions = [...layer2Options];

        // Agregar opción de Ánfora si el jugador tiene
        if (this.player.amphoras > 0) {
            allOptions.push({
                text: `🏺 Tirar Ánfora (${this.player.amphoras})`,
                action: 'amphora',
                color: 0xe67e22
            });
        }

        // Agregar opción de Huir
        allOptions.push({
            text: '🏃 Huir',
            action: 'flee',
            color: 0x95a5a6
        });

        // Configuración del menú
        const menuX = 60;
        const menuY = 310;
        const menuWidth = width - 120;
        const optionHeight = 28;
        const optionSpacing = 4;
        const menuHeight = (optionHeight + optionSpacing) * allOptions.length + 20;

        // Fondo del menú
        this.menuBox = this.add.rectangle(
            width / 2,
            menuY + menuHeight / 2,
            menuWidth,
            menuHeight,
            0x2c3e50,
            0.95
        ).setDepth(60);
        this.menuBox.setStrokeStyle(2, 0x34495e);

        // Selector visual
        this.menuSelector = this.add.rectangle(
            width / 2,
            menuY + 15 + optionHeight / 2,
            menuWidth - 10,
            optionHeight,
            0xf39c12,
            0.4
        ).setDepth(70);
        this.menuSelector.setStrokeStyle(2, 0xf39c12);

        // Crear opciones del menú
        this.menuOptions = [];

        allOptions.forEach((option, index) => {
            const y = menuY + 15 + (index * (optionHeight + optionSpacing)) + optionHeight / 2;

            // Color del indicador de calidad
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

            // Numeración de la opción
            const numberText = this.add.text(
                menuX + 15,
                y,
                `${index + 1}.`,
                {
                    fontSize: '14px',
                    color: '#95a5a6',
                    fontStyle: 'bold'
                }
            ).setOrigin(0, 0.5).setDepth(75);

            // Indicador de calidad (cuadrado de color)
            const qualityIndicator = this.add.rectangle(
                menuX + 45,
                y,
                8,
                8,
                qualityColor
            ).setDepth(75);

            // Texto de la opción
            const optionText = this.add.text(
                menuX + 60,
                y,
                option.text,
                {
                    fontSize: '13px',
                    color: '#ecf0f1',
                    wordWrap: { width: menuWidth - 80 }
                }
            ).setOrigin(0, 0.5).setDepth(75);

            // Tag de calidad (opcional, para las respuestas filosóficas)
            let qualityTag = null;
            if (option.quality === 'good') {
                qualityTag = this.add.text(
                    menuX + menuWidth - 80,
                    y,
                    '[BUENO]',
                    {
                        fontSize: '10px',
                        color: '#27ae60',
                        fontStyle: 'bold'
                    }
                ).setOrigin(1, 0.5).setDepth(75);
            } else if (option.quality === 'regular') {
                qualityTag = this.add.text(
                    menuX + menuWidth - 80,
                    y,
                    '[REGULAR]',
                    {
                        fontSize: '10px',
                        color: '#f39c12',
                        fontStyle: 'bold'
                    }
                ).setOrigin(1, 0.5).setDepth(75);
            }

            // Zona interactiva (invisible, cubre toda la opción)
            const hitArea = this.add.rectangle(
                width / 2,
                y,
                menuWidth - 10,
                optionHeight,
                0xffffff,
                0
            ).setDepth(72);
            hitArea.setInteractive({ useHandCursor: true });

            // Eventos de mouse
            hitArea.on('pointerover', () => {
                this.selectedIndex = index;
                this.updateSelector();
            });

            hitArea.on('pointerdown', () => {
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

        // Actualizar selector inicial
        this.updateSelector();
    }

    updateSelector() {
        // Mover el selector a la opción actual
        if (this.menuOptions[this.selectedIndex]) {
            const targetY = this.menuOptions[this.selectedIndex].y;
            this.menuSelector.y = targetY;
        }
    }

    moveSelection(direction) {
        // Navegar arriba/abajo en el menú
        this.selectedIndex += direction;

        // Wrap around
        if (this.selectedIndex < 0) {
            this.selectedIndex = this.menuOptions.length - 1;
        } else if (this.selectedIndex >= this.menuOptions.length) {
            this.selectedIndex = 0;
        }

        this.updateSelector();
    }

    selectOption(index) {
        // Selección directa con teclas numéricas
        if (index >= 0 && index < this.menuOptions.length) {
            this.selectedIndex = index;
            this.updateSelector();
            this.confirmSelection();
        }
    }

    confirmSelection() {
        const state = this.combatSystem.getState();
        if (!state.isPlayerTurn) return;

        const selectedOption = this.menuOptions[this.selectedIndex].option;
        this.handlePlayerAction(selectedOption);
    }

    handlePlayerAction(option) {
        const state = this.combatSystem.getState();
        if (!state.isPlayerTurn) return;

        // Deshabilitar menú temporalmente
        this.setMenuEnabled(false);

        // Ejecutar acción del jugador
        const result = this.combatSystem.executePlayerAction(option);
        this.combatSystem.combatLog.push(result.message);

        // Mostrar feedback visual temporal
        const feedbackColor = result.outcome === 'win' ? 0x27ae60 :
                             result.outcome === 'lose' ? 0xe74c3c :
                             option.action === 'amphora' ? 0xe67e22 : 0x3498db;
        this.showCombatFeedback(result.message, feedbackColor);

        // Actualizar UI
        this.updateUI();

        // Si el combate terminó
        if (result.combatEnded) {
            this.time.delayedCall(2000, () => {
                this.endCombat(result.outcome);
            });
            return;
        }

        // Recrear menú solo si usó ánfora (para actualizar contador)
        if (option.action === 'amphora') {
            this.recreateMenu();
        }

        // Cambiar turno a Sócrates
        this.combatSystem.isPlayerTurn = false;
        this.updateUI();

        // Turno del enemigo
        this.time.delayedCall(1500, () => {
            const enemyResult = this.combatSystem.executeSocratesAction();
            this.combatSystem.combatLog.push(enemyResult.message);

            // Mostrar feedback del ataque de Sócrates
            this.showCombatFeedback(enemyResult.message, 0xe74c3c);

            this.updateUI();

            // Si Sócrates hizo una nueva pregunta, recrear menú
            if (enemyResult.questionChanged) {
                this.recreateMenu();
            }

            if (enemyResult.combatEnded) {
                this.time.delayedCall(2000, () => {
                    this.endCombat(enemyResult.outcome);
                });
            } else {
                // Volver turno al jugador
                this.combatSystem.isPlayerTurn = true;
                this.updateUI();
                this.setMenuEnabled(true);
            }
        });
    }

    recreateMenu() {
        // Destruir menú actual
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

        // Recrear menú
        this.selectedIndex = 0;
        this.createVerticalMenu();
    }

    updateUI() {
        const state = this.combatSystem.getState();

        // Pregunta de Sócrates
        this.questionText.setText(state.question.layer2.question);

        // Barra de Intensidad de Sócrates
        const intensityPercent = Math.max(0, state.socrates.intensity / state.socrates.maxIntensity);
        this.intensityBar.setScale(intensityPercent, 1);
        this.intensityText.setText(`${Math.max(0, state.socrates.intensity)}/${state.socrates.maxIntensity}`);

        // Cambiar color según intensidad
        if (intensityPercent > 0.5) {
            this.intensityBar.setFillStyle(0xe74c3c); // Rojo
        } else if (intensityPercent > 0.25) {
            this.intensityBar.setFillStyle(0xf39c12); // Naranja
        } else {
            this.intensityBar.setFillStyle(0x95a5a6); // Gris (casi derrotado)
        }

        // Barra de Paciencia del Jugador
        const patiencePercent = Math.max(0, state.player.patience / state.player.maxPatience);
        this.patienceBar.setScale(patiencePercent, 1);
        this.patienceText.setText(`${Math.max(0, state.player.patience)}/${state.player.maxPatience}`);

        // Cambiar color según paciencia
        if (patiencePercent > 0.6) {
            this.patienceBar.setFillStyle(0x27ae60); // Verde
        } else if (patiencePercent > 0.3) {
            this.patienceBar.setFillStyle(0xf39c12); // Naranja
        } else {
            this.patienceBar.setFillStyle(0xe74c3c); // Rojo (peligro)
        }

        // Turno
        if (state.isPlayerTurn) {
            this.turnIndicator.setText('▲ Tu turno');
            this.turnIndicator.setColor('#3498db');
        } else {
            this.turnIndicator.setText('▼ Turno de Sócrates...');
            this.turnIndicator.setColor('#e74c3c');
        }
    }

    setMenuEnabled(enabled) {
        this.menuOptions.forEach(opt => {
            if (enabled) {
                opt.hitArea.setInteractive({ useHandCursor: true });
            } else {
                opt.hitArea.disableInteractive();
            }
        });

        // Cambiar opacidad del menú para indicar estado
        if (enabled) {
            this.menuSelector.setAlpha(1);
        } else {
            this.menuSelector.setAlpha(0.3);
        }
    }

    endCombat(outcome) {
        const { width, height } = this.cameras.main;

        let resultText = '';
        let resultColor = '';

        if (outcome === 'victory') {
            resultText = '¡VICTORIA!\n\nSócrates se retira a reflexionar...';
            resultColor = '#27ae60';
        } else if (outcome === 'fled') {
            resultText = '¡ESCAPASTE!\n\nSócrates se queda filosofando solo.';
            resultColor = '#f39c12';
        } else if (outcome === 'defeat') {
            resultText = 'DERROTA\n\nPerdiste toda tu paciencia...';
            resultColor = '#e74c3c';
        }

        // Overlay oscuro
        const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);
        overlay.setDepth(200);

        const result = this.add.text(width / 2, height / 2 - 30, resultText, {
            fontSize: '32px',
            color: resultColor,
            fontStyle: 'bold',
            align: 'center'
        }).setOrigin(0.5).setDepth(201);

        result.setAlpha(0);
        this.tweens.add({
            targets: result,
            alpha: 1,
            duration: 1000
        });

        // Continuar texto
        const continueText = this.add.text(
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
