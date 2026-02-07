class Player {
    constructor(scene, x, y) {
        this.scene = scene;

        // Crear sombra
        this.shadow = scene.add.image(x, y, 'shadow');
        this.shadow.setScale(0.8);
        this.shadow.setAlpha(0.5);

        // Crear sprite del personaje
        this.sprite = scene.add.sprite(x, y, 'boy');
        this.sprite.setScale(2); // Escalar para que se vea mejor
        scene.physics.add.existing(this.sprite);

        this.sprite.body.setCollideWorldBounds(true);
        this.sprite.body.setSize(12, 14); // Ajustar hitbox
        this.sprite.body.setOffset(2, 2);

        // Animación inicial
        this.sprite.play('boy_idle_down');
        this.currentDirection = 'down';

        // Stats
        this.patience = GAME_CONSTANTS.PLAYER_PATIENCE_MAX;
        this.hasAmphora = true;

        // Input
        this.cursors = scene.input.keyboard.createCursorKeys();
        this.wasd = {
            up: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            down: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            left: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            right: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
        };
    }

    update() {
        // Resetear velocidad
        this.sprite.body.setVelocity(0);

        let moving = false;
        let newDirection = this.currentDirection;

        // Movimiento vertical (prioridad para las animaciones)
        if (this.cursors.up.isDown || this.wasd.up.isDown) {
            this.sprite.body.setVelocityY(-GAME_CONSTANTS.PLAYER_SPEED);
            newDirection = 'up';
            moving = true;
        } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
            this.sprite.body.setVelocityY(GAME_CONSTANTS.PLAYER_SPEED);
            newDirection = 'down';
            moving = true;
        }

        // Movimiento horizontal
        if (this.cursors.left.isDown || this.wasd.left.isDown) {
            this.sprite.body.setVelocityX(-GAME_CONSTANTS.PLAYER_SPEED);
            newDirection = 'left';
            moving = true;
        } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
            this.sprite.body.setVelocityX(GAME_CONSTANTS.PLAYER_SPEED);
            newDirection = 'right';
            moving = true;
        }

        // Normalizar velocidad diagonal
        if (this.sprite.body.velocity.x !== 0 && this.sprite.body.velocity.y !== 0) {
            this.sprite.body.velocity.normalize().scale(GAME_CONSTANTS.PLAYER_SPEED);
        }

        // Actualizar animación
        if (moving) {
            if (this.currentDirection !== newDirection) {
                this.currentDirection = newDirection;
                this.sprite.play(`boy_walk_${newDirection}`);
            }
        } else {
            this.sprite.play(`boy_idle_${this.currentDirection}`, true);
        }

        // Actualizar posición de la sombra
        this.shadow.setPosition(this.sprite.x, this.sprite.y + 6);
    }

    getPosition() {
        return { x: this.sprite.x, y: this.sprite.y };
    }

    takeDamage(amount) {
        this.patience = Math.max(0, this.patience - amount);
        return this.patience > 0;
    }

    useAmphora() {
        if (this.hasAmphora) {
            this.hasAmphora = false;
            return true;
        }
        return false;
    }
}
