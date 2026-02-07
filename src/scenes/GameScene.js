class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene' });
    }

    create() {
        console.log('GameScene: Iniciando juego');

        // Crear mapa procedural
        this.createMap();

        // Crear jugador
        this.player = new Player(this, 400, 300);

        // Crear Sócrates
        this.socrates = new Socrates(this, 600, 200);

        // Colisiones con obstáculos
        this.physics.add.collider(this.player.sprite, this.obstacles);
        this.physics.add.collider(this.socrates.sprite, this.obstacles);

        // Sistema de diálogo
        this.dialogSystem = new DialogSystem(this);
        this.dialogSystem.create();

        // Event listeners
        this.events.on('socrates-engaged', (player) => {
            this.handleSocratesEngagement();
        });

        // UI de stats
        this.createUI();

        // Instrucciones
        this.add.text(10, 10, 'WASD/Flechas: Mover\nEscapá del viejo (Sócrates)\nAmarillo=detectó | Rojo=persigue', {
            fontSize: '14px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 5, y: 5 }
        }).setDepth(1000);
    }

    createMap() {
        const { MAP_WIDTH, MAP_HEIGHT, TILE_SIZE } = GAME_CONSTANTS;

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

        // Bordes del mapa (muros)
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

        for (let y = 1; y < MAP_HEIGHT - 1; y++) {
            // Izquierda
            const leftWall = this.add.rectangle(
                TILE_SIZE / 2,
                y * TILE_SIZE + TILE_SIZE / 2,
                TILE_SIZE,
                TILE_SIZE,
                borderColor
            );
            this.physics.add.existing(leftWall, true);
            this.obstacles.add(leftWall);

            // Derecha
            const rightWall = this.add.rectangle(
                (MAP_WIDTH - 1) * TILE_SIZE + TILE_SIZE / 2,
                y * TILE_SIZE + TILE_SIZE / 2,
                TILE_SIZE,
                TILE_SIZE,
                borderColor
            );
            this.physics.add.existing(rightWall, true);
            this.obstacles.add(rightWall);
        }

        // Columnas (obstáculos internos)
        const columnPositions = [
            { x: 5, y: 5 },
            { x: 19, y: 5 },
            { x: 5, y: 12 },
            { x: 19, y: 12 },
            { x: 12, y: 9 }
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
            { x: 10, y: 3 },
            { x: 15, y: 3 },
            { x: 8, y: 14 },
            { x: 16, y: 14 }
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

    createUI() {
        const { width } = this.cameras.main;

        // Panel de stats
        this.statsPanel = this.add.container(width - 150, 10);

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
    }

    handleSocratesEngagement() {
        console.log('Sócrates te alcanzó!');

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
        console.log('Elegiste:', choice);

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
        console.log('Iniciando combate...');
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
        feedback.setDepth(2000);

        this.tweens.add({
            targets: feedback,
            alpha: 0,
            duration: 2000,
            onComplete: () => feedback.destroy()
        });
    }
}
