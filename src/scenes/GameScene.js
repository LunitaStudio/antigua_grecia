class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        if (DEBUG_MODE.logStates) {
            console.log('GameScene: Iniciando juego');
        }

        // Configurar mundo más grande
        const worldWidth = GAME_CONSTANTS.MAP_WIDTH * GAME_CONSTANTS.TILE_SIZE;
        const worldHeight = GAME_CONSTANTS.MAP_HEIGHT * GAME_CONSTANTS.TILE_SIZE;
        this.physics.world.setBounds(0, 0, worldWidth, worldHeight);

        // Crear mapa procedural
        this.createMap();

        // Crear jugador en spawn de calle izquierda
        const { TILE_SIZE, PLAYER_SPAWN_X, PLAYER_SPAWN_Y } = GAME_CONSTANTS;
        this.player = new Player(
            this,
            PLAYER_SPAWN_X * TILE_SIZE + TILE_SIZE / 2,
            PLAYER_SPAWN_Y * TILE_SIZE + TILE_SIZE / 2
        );

        // Crear Sócrates en centro de la plaza
        const { SOCRATES_SPAWN_X, SOCRATES_SPAWN_Y } = GAME_CONSTANTS;
        this.socrates = new Socrates(
            this,
            SOCRATES_SPAWN_X * TILE_SIZE + TILE_SIZE / 2,
            SOCRATES_SPAWN_Y * TILE_SIZE + TILE_SIZE / 2
        );

        // Crear NPC proveedor en calle izquierda
        const { PROVIDER_SPAWN_X, PROVIDER_SPAWN_Y } = GAME_CONSTANTS;
        this.provider = new ProviderNPC(
            this,
            PROVIDER_SPAWN_X * TILE_SIZE + TILE_SIZE / 2,
            PROVIDER_SPAWN_Y * TILE_SIZE + TILE_SIZE / 2
        );

        // Crear NPC cliente en calle derecha
        const { CLIENT_SPAWN_X, CLIENT_SPAWN_Y } = GAME_CONSTANTS;
        this.client = new ClientNPC(
            this,
            CLIENT_SPAWN_X * TILE_SIZE + TILE_SIZE / 2,
            CLIENT_SPAWN_Y * TILE_SIZE + TILE_SIZE / 2
        );

        // Configurar cámara para seguir al jugador
        this.cameras.main.startFollow(this.player.sprite, true, 0.1, 0.1);
        this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);
        this.cameras.main.setZoom(1);

        // Colisiones con obstáculos
        this.physics.add.collider(this.player.sprite, this.obstacles);
        this.physics.add.collider(this.socrates.sprite, this.obstacles);

        // Colisión con NPC proveedor
        this.physics.add.overlap(
            this.player.sprite,
            this.provider.sprite,
            () => this.handleProviderInteraction(),
            null,
            this
        );

        // Colisión con NPC cliente
        this.physics.add.overlap(
            this.player.sprite,
            this.client.sprite,
            () => this.handleClientInteraction(),
            null,
            this
        );

        // Sistema de diálogo
        this.dialogSystem = new DialogSystem(this);
        this.dialogSystem.create();

        // Event listeners
        this.events.on('socrates-engaged', (player) => {
            this.handleSocratesEngagement();
        });

        this.isInteracting = false;
        this.isSocratesEncounterActive = false;

        // Trackear estadísticas
        this.stats = {
            tripsCompleted: 0,
            amphorasLost: 0,
            encountersWithSocrates: 0
        };

        // UI de stats
        this.createUI();

        // Instrucciones (fijas en cámara)
        this.instructionsText = this.add.text(10, 10, 'WASD/Flechas: Mover\nLlevá el ánfora al cliente (→)\nEsquivá a Sócrates en la plaza', {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
        }).setScrollFactor(0).setDepth(6000);

        // FPS counter (solo en debug)
        if (DEBUG_MODE.showFPS) {
            this.fpsText = this.add.text(10, this.cameras.main.height - 30, 'FPS: 60', {
                fontSize: '12px',
                color: '#00ff00',
                backgroundColor: '#000000',
                padding: { x: 3, y: 3 }
            }).setScrollFactor(0).setDepth(6000);
        }
    }

    createMap() {
        const { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE, ZONES } = GAME_CONSTANTS;

        // Fondo simple con color
        this.add.rectangle(
            MAP_WIDTH * TILE_SIZE / 2,
            MAP_HEIGHT * TILE_SIZE / 2,
            MAP_WIDTH * TILE_SIZE,
            MAP_HEIGHT * TILE_SIZE,
            0xd4a574 // Color tierra/arena
        ).setOrigin(0.5);

        // Grupo de obstáculos
        this.obstacles = this.physics.add.staticGroup();

        // Patrón de piso con variación
        for (let y = 0; y < MAP_HEIGHT; y++) {
            for (let x = 0; x < MAP_WIDTH; x++) {
                const posX = x * TILE_SIZE + TILE_SIZE / 2;
                const posY = y * TILE_SIZE + TILE_SIZE / 2;

                // Agregar variación sutil
                if (Math.random() > 0.7) {
                    const tile = this.add.rectangle(
                        posX, posY,
                        TILE_SIZE, TILE_SIZE,
                        0xc49563
                    );
                    tile.setAlpha(0.3);
                }
            }
        }

        // Crear las 3 zonas visuales
        this.createLeftStreet();
        this.createPlaza();
        this.createRightStreet();

        // Bordes superior e inferior (todo el mapa)
        const borderColor = 0x8b7355;
        for (let x = 0; x < MAP_WIDTH; x++) {
            // Arriba
            const topWall = this.add.rectangle(
                x * TILE_SIZE + TILE_SIZE / 2,
                TILE_SIZE / 2,
                TILE_SIZE,
                TILE_SIZE,
                borderColor
            );
            this.physics.add.existing(topWall, true);
            this.obstacles.add(topWall);

            // Abajo
            const bottomWall = this.add.rectangle(
                x * TILE_SIZE + TILE_SIZE / 2,
                (MAP_HEIGHT - 1) * TILE_SIZE + TILE_SIZE / 2,
                TILE_SIZE,
                TILE_SIZE,
                borderColor
            );
            this.physics.add.existing(bottomWall, true);
            this.obstacles.add(bottomWall);
        }
    }

    createLeftStreet() {
        const { TILE_SIZE, ZONES, MAP_HEIGHT } = GAME_CONSTANTS;
        const streetColor = 0x9b8774;

        // Paredes laterales de la calle (excepto zona central)
        for (let y = 1; y < MAP_HEIGHT - 1; y++) {
            // Solo si no está en la zona de paso central (tiles 7-10)
            if (y < 7 || y > 10) {
                // Pared izquierda (borde del mapa)
                const leftWall = this.add.rectangle(
                    TILE_SIZE / 2,
                    y * TILE_SIZE + TILE_SIZE / 2,
                    TILE_SIZE,
                    TILE_SIZE,
                    streetColor
                );
                this.physics.add.existing(leftWall, true);
                this.obstacles.add(leftWall);

                // Pared derecha (separación con plaza)
                const rightWall = this.add.rectangle(
                    ZONES.LEFT_STREET.end * TILE_SIZE + TILE_SIZE / 2,
                    y * TILE_SIZE + TILE_SIZE / 2,
                    TILE_SIZE,
                    TILE_SIZE,
                    streetColor
                );
                this.physics.add.existing(rightWall, true);
                this.obstacles.add(rightWall);
            }
        }
    }

    createPlaza() {
        const { TILE_SIZE, ZONES } = GAME_CONSTANTS;

        // Columnas en la plaza (obstáculos)
        const columnPositions = [
            { x: 12, y: 5 },
            { x: 24, y: 5 },
            { x: 12, y: 12 },
            { x: 24, y: 12 },
            { x: 18, y: 9 }
        ];

        columnPositions.forEach(pos => {
            // Base de la columna
            const base = this.add.rectangle(
                pos.x * TILE_SIZE + TILE_SIZE / 2,
                pos.y * TILE_SIZE + TILE_SIZE / 2,
                TILE_SIZE * 2,
                TILE_SIZE * 2,
                0xa0826d
            );
            this.physics.add.existing(base, true);
            this.obstacles.add(base);

            // Top de la columna (decorativo)
            this.add.rectangle(
                pos.x * TILE_SIZE + TILE_SIZE / 2,
                pos.y * TILE_SIZE + TILE_SIZE / 2 - 10,
                TILE_SIZE * 2 + 4,
                TILE_SIZE / 2,
                0xd4a574
            );
        });

        // Puestos de mercado
        const stallPositions = [
            { x: 15, y: 3 },
            { x: 21, y: 3 },
            { x: 13, y: 14 },
            { x: 22, y: 14 }
        ];

        stallPositions.forEach(pos => {
            // Estructura del puesto
            const stall = this.add.rectangle(
                pos.x * TILE_SIZE + TILE_SIZE / 2,
                pos.y * TILE_SIZE + TILE_SIZE / 2,
                TILE_SIZE * 3,
                TILE_SIZE,
                0xd35400
            );
            this.physics.add.existing(stall, true);
            this.obstacles.add(stall);

            // Techo del puesto (decorativo)
            this.add.rectangle(
                pos.x * TILE_SIZE + TILE_SIZE / 2,
                pos.y * TILE_SIZE + TILE_SIZE / 2 - 12,
                TILE_SIZE * 3 + 8,
                TILE_SIZE / 2,
                0xe67e22
            );
        });
    }

    createRightStreet() {
        const { TILE_SIZE, ZONES, MAP_WIDTH, MAP_HEIGHT } = GAME_CONSTANTS;
        const streetColor = 0x9b8774;

        // Paredes laterales de la calle (excepto zona central)
        for (let y = 1; y < MAP_HEIGHT - 1; y++) {
            // Solo si no está en la zona de paso central (tiles 7-10)
            if (y < 7 || y > 10) {
                // Pared izquierda (separación con plaza)
                const leftWall = this.add.rectangle(
                    (ZONES.RIGHT_STREET.start - 1) * TILE_SIZE + TILE_SIZE / 2,
                    y * TILE_SIZE + TILE_SIZE / 2,
                    TILE_SIZE,
                    TILE_SIZE,
                    streetColor
                );
                this.physics.add.existing(leftWall, true);
                this.obstacles.add(leftWall);

                // Pared derecha (borde del mapa)
                const rightWall = this.add.rectangle(
                    (MAP_WIDTH - 1) * TILE_SIZE + TILE_SIZE / 2,
                    y * TILE_SIZE + TILE_SIZE / 2,
                    TILE_SIZE,
                    TILE_SIZE,
                    streetColor
                );
                this.physics.add.existing(rightWall, true);
                this.obstacles.add(rightWall);
            }
        }
    }

    createUI() {
        const { width } = this.cameras.main;

        // Panel de economía (superior derecha)
        this.economyPanel = this.add.container(width - 180, 10);
        this.economyPanel.setScrollFactor(0);
        this.economyPanel.setDepth(6000);

        const economyBg = this.add.rectangle(0, 0, 170, 110, 0x000000, 0.8);
        economyBg.setOrigin(0);

        this.moneyText = this.add.text(10, 10, '', {
            fontSize: '16px',
            color: '#f39c12',
            fontStyle: 'bold'
        });

        this.moneyGoalText = this.add.text(10, 32, '', {
            fontSize: '12px',
            color: '#95a5a6'
        });

        this.amphorasText = this.add.text(10, 52, '', {
            fontSize: '14px',
            color: '#e67e22'
        });

        this.patienceText = this.add.text(10, 74, '', {
            fontSize: '14px',
            color: '#3498db'
        });

        this.patienceBar = this.add.rectangle(10, 95, 150, 8, 0x3498db);
        this.patienceBar.setOrigin(0, 0);
        this.patienceBarBg = this.add.rectangle(10, 95, 150, 8, 0x34495e);
        this.patienceBarBg.setOrigin(0, 0);

        this.economyPanel.add([
            economyBg,
            this.patienceBarBg,
            this.patienceBar,
            this.moneyText,
            this.moneyGoalText,
            this.amphorasText,
            this.patienceText
        ]);

        // Debug info (solo si DEBUG_MODE.logStates)
        if (DEBUG_MODE.logStates) {
            this.debugText = this.add.text(10, 120, '', {
                fontSize: '11px',
                color: '#95a5a6',
                backgroundColor: '#000000',
                padding: { x: 3, y: 3 }
            }).setScrollFactor(0).setDepth(6000);
        }
    }

    update() {
        if (this.dialogSystem.isActive) return;

        // Actualizar entidades
        this.player.update();
        this.socrates.update(this.player);

        // Actualizar UI
        const { WIN_MONEY_GOAL } = GAME_CONSTANTS;
        this.moneyText.setText(`💰 $${this.player.money}`);
        this.moneyGoalText.setText(`Objetivo: $${WIN_MONEY_GOAL}`);
        this.amphorasText.setText(`🏺 ${this.player.amphoras}/${this.player.maxAmphoras}`);
        this.patienceText.setText(`😊 ${this.player.patience}/${this.player.maxPatience}`);

        // Actualizar barra de paciencia
        const patiencePercent = this.player.patience / this.player.maxPatience;
        this.patienceBar.width = 150 * patiencePercent;

        // Color de la barra según nivel
        if (patiencePercent > 0.5) {
            this.patienceBar.setFillStyle(0x3498db); // Azul
        } else if (patiencePercent > 0.25) {
            this.patienceBar.setFillStyle(0xf39c12); // Amarillo
        } else {
            this.patienceBar.setFillStyle(0xe74c3c); // Rojo
        }

        // Debug info
        if (DEBUG_MODE.logStates && this.debugText) {
            this.debugText.setText(`Sócrates: ${this.socrates.state}`);
        }

        // Actualizar FPS (solo en debug)
        if (DEBUG_MODE.showFPS && this.fpsText) {
            this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
        }
    }

    handleSocratesEngagement() {
        if (this.isSocratesEncounterActive || this.dialogSystem.isActive) {
            return;
        }

        this.isSocratesEncounterActive = true;
        this.stats.encountersWithSocrates++;

        if (DEBUG_MODE.logStates) {
            console.log('=== ENCUENTRO CON SÓCRATES ===');
        }

        // CAPA 1: Diálogo rápido
        this.dialogSystem.showLayer1(
            this.player,
            (escapeMethod) => this.onLayer1Success(escapeMethod),
            (question) => this.onLayer1Fail(question)
        );
    }

    onLayer1Success(escapeMethod) {
        // El jugador zafó en Capa 1
        if (escapeMethod === 'amphora') {
            // Le tiró un ánfora: Sócrates KO
            this.showFeedback('💥 ¡CRASH! Sócrates quedó STUNNED', 0xe67e22);
            this.socrates.stun();

            // Cooldown largo: KO + gracia adicional
            this.socrates.setCooldown(GAME_CONSTANTS.SOCRATES_COOLDOWN_AFTER_STUNNED);

            if (DEBUG_MODE.logStates) {
                console.log('Layer 1 → ÉXITO (Ánfora). Sócrates STUNNED.');
            }
        } else {
            // Respuesta filosófica exitosa
            this.showFeedback('¡Buena respuesta! Sócrates se retira...', 0x27ae60);
            this.socrates.setState(GAME_CONSTANTS.SOCRATES_STATES.IDLE);

            // Cooldown corto: 3 segundos de gracia
            this.socrates.setCooldown(GAME_CONSTANTS.SOCRATES_COOLDOWN_AFTER_DIALOG);

            if (DEBUG_MODE.logStates) {
                console.log('Layer 1 → ÉXITO (Diálogo). Sócrates satisfecho.');
            }
        }

        // Regenerar paciencia por zafar
        this.player.restorePatience(5);
        this.isSocratesEncounterActive = false;
    }

    onLayer1Fail(question) {
        // El jugador falló en Capa 1 → CAPA 2: Combate
        if (DEBUG_MODE.logStates) {
            console.log('Layer 1 → FALLÓ. Iniciando Layer 2 (Combate)...');
        }

        this.showFeedback('Sócrates no quedó satisfecho...', 0xe74c3c);

        this.time.delayedCall(1000, () => {
            this.startCombatLayer2(question);
        });
    }

    startCombatLayer2(question) {
        if (DEBUG_MODE.logStates) {
            console.log('=== INICIANDO CAPA 2: COMBATE ===');
        }

        this.scene.pause();
        this.scene.launch('CombatScene', {
            player: this.player,
            question: question,
            stats: this.stats,
            onCombatEnd: (outcome) => this.onCombatLayer2End(outcome)
        });
    }

    onCombatLayer2End(outcome) {
        this.scene.resume();
        this.isSocratesEncounterActive = false;

        if (outcome === 'victory') {
            // Victoria en combate: Sócrates se retira
            this.showFeedback('¡Venciste a Sócrates en el debate!', 0x27ae60);
            this.socrates.setState(GAME_CONSTANTS.SOCRATES_STATES.IDLE);

            // Cooldown largo: 6 segundos de gracia
            this.socrates.setCooldown(GAME_CONSTANTS.SOCRATES_COOLDOWN_AFTER_COMBAT);

            // Pequeña regeneración de paciencia
            this.player.restorePatience(10);

            if (DEBUG_MODE.logStates) {
                console.log('Layer 2 → VICTORIA. Sócrates derrotado.');
            }
        } else if (outcome === 'fled') {
            // Escapó del combate
            this.showFeedback('Escapaste de Sócrates...', 0xf39c12);
            this.socrates.setState(GAME_CONSTANTS.SOCRATES_STATES.IDLE);

            // Cooldown corto: 3 segundos de gracia
            this.socrates.setCooldown(GAME_CONSTANTS.SOCRATES_COOLDOWN_AFTER_DIALOG);

            if (DEBUG_MODE.logStates) {
                console.log('Layer 2 → HUIDA. Escapaste.');
            }
        } else if (outcome === 'defeat') {
            // Derrota: Paciencia = 0
            // TODO: Task #11 - Implementar penalización
            this.showFeedback('Perdiste toda tu paciencia...', 0xe74c3c);

            if (DEBUG_MODE.logStates) {
                console.log('Layer 2 → DERROTA. Paciencia agotada.');
            }

            // Placeholder: Por ahora solo volver a IDLE
            this.socrates.setState(GAME_CONSTANTS.SOCRATES_STATES.IDLE);
        }
    }

    handleProviderInteraction() {
        if (this.isInteracting) return;
        this.isInteracting = true;

        const result = this.provider.interact(this.player);

        if (result.success) {
            this.showFeedback(result.message, 0x27ae60);
        } else {
            this.showFeedback(result.message, 0xe67e22);
        }

        this.time.delayedCall(2500, () => {
            this.isInteracting = false;
        });
    }

    handleClientInteraction() {
        if (this.isInteracting) return;
        this.isInteracting = true;

        const result = this.client.interact(this.player);

        if (result.success) {
            this.stats.tripsCompleted++;
            this.showFeedback(result.message, 0x27ae60);

            // Verificar win condition
            if (this.player.money >= GAME_CONSTANTS.WIN_MONEY_GOAL) {
                this.time.delayedCall(2500, () => this.handleVictory());
            }
        } else {
            this.showFeedback(result.message, 0xe67e22);
        }

        this.time.delayedCall(2500, () => {
            this.isInteracting = false;
        });
    }

    showFeedback(message, color) {
        const { width, height } = this.cameras.main;

        const feedback = this.add.text(
            width / 2,
            height / 2,
            message,
            {
                fontSize: '20px',
                color: '#ffffff',
                backgroundColor: Phaser.Display.Color.IntegerToColor(color).rgba,
                padding: { x: 10, y: 10 }
            }
        );
        feedback.setOrigin(0.5);
        feedback.setDepth(7000);
        feedback.setScrollFactor(0);

        this.tweens.add({
            targets: feedback,
            alpha: 0,
            duration: 2000,
            onComplete: () => feedback.destroy()
        });
    }

    handleVictory() {
        if (DEBUG_MODE.logStates) {
            console.log('¡Victoria! Entrega completada');
        }

        // Pausar física y actualización
        this.physics.pause();

        // Overlay oscuro
        const overlay = this.add.rectangle(
            this.cameras.main.scrollX + this.cameras.main.width / 2,
            this.cameras.main.scrollY + this.cameras.main.height / 2,
            this.cameras.main.width,
            this.cameras.main.height,
            0x000000,
            0.7
        );
        overlay.setDepth(8000);
        overlay.setScrollFactor(0);

        // Mensaje de victoria
        const victoryText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 80,
            '¡OBJETIVO CUMPLIDO!',
            {
                fontSize: '48px',
                color: '#f39c12',
                fontStyle: 'bold',
                stroke: '#000000',
                strokeThickness: 6
            }
        );
        victoryText.setOrigin(0.5);
        victoryText.setDepth(8001);
        victoryText.setScrollFactor(0);

        // Estadísticas
        const statsText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 10,
            `Dinero final: $${this.player.money}\n` +
            `Viajes completados: ${this.stats.tripsCompleted}\n` +
            `Ánforas perdidas: ${this.stats.amphorasLost}`,
            {
                fontSize: '16px',
                color: '#ffffff',
                align: 'center',
                lineSpacing: 8
            }
        );
        statsText.setOrigin(0.5);
        statsText.setDepth(8001);
        statsText.setScrollFactor(0);

        // Botón para reiniciar
        const playAgainButton = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 100,
            200,
            50,
            0x27ae60
        );
        playAgainButton.setDepth(8001);
        playAgainButton.setInteractive({ useHandCursor: true });
        playAgainButton.setScrollFactor(0);

        const buttonText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 100,
            'Jugar de Nuevo',
            {
                fontSize: '20px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        );
        buttonText.setOrigin(0.5);
        buttonText.setDepth(8002);
        buttonText.setScrollFactor(0);

        // Hover effect
        playAgainButton.on('pointerover', () => {
            playAgainButton.setFillStyle(0x2ecc71);
        });

        playAgainButton.on('pointerout', () => {
            playAgainButton.setFillStyle(0x27ae60);
        });

        // Reiniciar al hacer click
        playAgainButton.on('pointerdown', () => {
            this.scene.restart();
        });

        // Animación de entrada
        victoryText.setAlpha(0);
        this.tweens.add({
            targets: victoryText,
            alpha: 1,
            scale: { from: 0.5, to: 1 },
            duration: 500,
            ease: 'Back.easeOut'
        });
    }
}
