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

        // Colisión con NPC cliente (overlap para detectar contacto)
        this.physics.add.overlap(
            this.player.sprite,
            this.client.sprite,
            () => this.client.interact(this.player),
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

        this.events.on('delivery-complete', () => {
            this.handleVictory();
        });

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

        // Panel de stats (fijo en cámara)
        this.statsPanel = this.add.container(width - 150, 10);
        this.statsPanel.setScrollFactor(0);
        this.statsPanel.setDepth(6000);

        const bg = this.add.rectangle(0, 0, 140, 80, 0x000000, 0.7);
        bg.setOrigin(0);

        this.patienceText = this.add.text(10, 10, '', {
            fontSize: '14px',
            color: '#3498db'
        });

        this.socratesText = this.add.text(10, 35, '', {
            fontSize: '14px',
            color: '#e74c3c'
        });

        this.stateText = this.add.text(10, 60, '', {
            fontSize: '12px',
            color: '#f39c12'
        });

        this.statsPanel.add([bg, this.patienceText, this.socratesText, this.stateText]);
    }

    update() {
        if (this.dialogSystem.isActive) return;

        // Actualizar entidades
        this.player.update();
        this.socrates.update(this.player);

        // Actualizar UI
        this.patienceText.setText(`Paciencia: ${this.player.patience}`);
        this.socratesText.setText(`Sócrates: ${this.socrates.pesadez}`);
        this.stateText.setText(`Estado: ${this.socrates.state}`);

        // Actualizar FPS (solo en debug)
        if (DEBUG_MODE.showFPS && this.fpsText) {
            this.fpsText.setText(`FPS: ${Math.round(this.game.loop.actualFps)}`);
        }
    }

    handleSocratesEngagement() {
        if (DEBUG_MODE.logStates) {
            console.log('Sócrates te alcanzó!');
        }

        const dialogText = '¡Sócrates te alcanzó!\n"Permíteme preguntarte: ¿Qué es la virtud?"';

        const options = [
            { text: 'ARGUMENTAR', value: 'ARGUMENTAR' },
            { text: 'IGNORAR', value: 'IGNORAR' },
            { text: 'HUIR', value: 'HUIR' }
        ];

        this.dialogSystem.show(dialogText, options, (choice) => {
            this.handleDialogChoice(choice);
        });
    }

    handleDialogChoice(choice) {
        if (DEBUG_MODE.logStates) {
            console.log('Elegiste:', choice);
        }

        if (choice === 'ARGUMENTAR') {
            // Chance de fallar y entrar en combate
            const success = Math.random() > 0.5;

            if (success) {
                this.showFeedback('¡Buena respuesta! Sócrates se aleja.', 0x27ae60);
                this.socrates.setState(GAME_CONSTANTS.SOCRATES_STATES.IDLE);
            } else {
                this.startCombat();
            }
        } else if (choice === 'IGNORAR') {
            this.player.takeDamage(10);
            this.showFeedback('Perdiste 10 paciencia. Sócrates insiste...', 0xe67e22);

            // Después de varios IGNORAR, entrar en combate
            if (Math.random() > 0.6) {
                this.time.delayedCall(1000, () => this.startCombat());
            }
        } else if (choice === 'HUIR') {
            const escaped = Math.random() > 0.5;

            if (escaped) {
                this.showFeedback('¡Lograste escapar!', 0x27ae60);
                this.socrates.setState(GAME_CONSTANTS.SOCRATES_STATES.IDLE);
            } else {
                this.showFeedback('¡No pudiste escapar!', 0xe74c3c);
                this.time.delayedCall(1000, () => this.startCombat());
            }
        }
    }

    startCombat() {
        if (DEBUG_MODE.logStates) {
            console.log('Iniciando combate...');
        }
        this.scene.pause();
        this.scene.launch('CombatScene', {
            player: this.player,
            enemy: this.socrates
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
            this.cameras.main.height / 2 - 50,
            '¡ENTREGA COMPLETADA!',
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

        // Mensaje del cliente
        const dialogText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 20,
            '"¡Gracias por el ánfora!\nEres un alfarero excelente."',
            {
                fontSize: '18px',
                color: '#ffffff',
                align: 'center'
            }
        );
        dialogText.setOrigin(0.5);
        dialogText.setDepth(8001);
        dialogText.setScrollFactor(0);

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
