class Socrates {
    constructor(scene, x, y) {
        this.scene = scene;

        // Crear sombra
        this.shadow = scene.add.image(x, y, 'shadow');
        this.shadow.setScale(0.8);
        this.shadow.setAlpha(0.5);

        // Crear sprite del personaje
        this.sprite = scene.add.sprite(x, y, 'oldman');
        this.sprite.setScale(2); // Escalar para que se vea mejor
        scene.physics.add.existing(this.sprite);

        this.sprite.body.setCollideWorldBounds(true);
        this.sprite.body.setSize(12, 14);
        this.sprite.body.setOffset(2, 2);

        // Animación inicial
        this.sprite.play('oldman_idle_down');
        this.currentDirection = 'down';

        // State machine
        this.state = GAME_CONSTANTS.SOCRATES_STATES.IDLE;
        this.target = null;

        // Stats
        this.pesadez = GAME_CONSTANTS.SOCRATES_PESADEZ_MAX;

        // Patrol bounds (limitado a la plaza)
        const { TILE_SIZE, ZONES } = GAME_CONSTANTS;
        this.patrolBounds = {
            left: ZONES.PLAZA.start * TILE_SIZE,
            right: (ZONES.PLAZA.end + 1) * TILE_SIZE,
            top: TILE_SIZE,
            bottom: (GAME_CONSTANTS.MAP_HEIGHT - 1) * TILE_SIZE
        };

        // Para wandering idle
        this.idleTimer = 0;
        this.idleDirection = { x: 0, y: 0 };
        this.changeDirectionInterval = 2000; // cambiar dirección cada 2 segundos

        // Indicador visual de estado (tint color)
        this.updateStateVisual();
    }

    update(player) {
        const distance = Phaser.Math.Distance.Between(
            this.sprite.x,
            this.sprite.y,
            player.sprite.x,
            player.sprite.y
        );

        // Verificar si el jugador está fuera de la plaza
        const playerInPlaza = this.isInPlaza(player.sprite.x);

        // Si el jugador salió de la plaza, volver a IDLE
        if (!playerInPlaza && this.state !== GAME_CONSTANTS.SOCRATES_STATES.IDLE) {
            this.setState(GAME_CONSTANTS.SOCRATES_STATES.IDLE);
        }

        // State machine transitions
        switch(this.state) {
            case GAME_CONSTANTS.SOCRATES_STATES.IDLE:
                this.updateIdle(distance, playerInPlaza);
                break;

            case GAME_CONSTANTS.SOCRATES_STATES.DETECT:
                this.updateDetect(distance);
                break;

            case GAME_CONSTANTS.SOCRATES_STATES.PURSUE:
                this.updatePursue(player, distance);
                break;

            case GAME_CONSTANTS.SOCRATES_STATES.ENGAGE:
                this.updateEngage(player);
                break;
        }

        // Asegurar que Sócrates no salga de sus bounds
        this.enforceBounds();
    }

    updateIdle(distance, playerInPlaza) {
        // Wandering behavior
        this.idleTimer += this.scene.game.loop.delta;

        if (this.idleTimer >= this.changeDirectionInterval) {
            this.idleTimer = 0;
            // Cambiar dirección aleatoria
            const angle = Math.random() * Math.PI * 2;
            this.idleDirection.x = Math.cos(angle);
            this.idleDirection.y = Math.sin(angle);

            // Actualizar dirección visual
            this.updateDirection();
        }

        const speed = GAME_CONSTANTS.SOCRATES_SPEED * 0.5;
        this.sprite.body.setVelocity(
            this.idleDirection.x * speed,
            this.idleDirection.y * speed
        );

        // Animar si se está moviendo
        if (Math.abs(this.idleDirection.x) > 0.1 || Math.abs(this.idleDirection.y) > 0.1) {
            this.sprite.play(`oldman_walk_${this.currentDirection}`, true);
        } else {
            this.sprite.play(`oldman_idle_${this.currentDirection}`, true);
        }

        // Detectar jugador (solo si está en la plaza)
        if (playerInPlaza && distance <= GAME_CONSTANTS.SOCRATES_DETECT_RADIUS) {
            this.setState(GAME_CONSTANTS.SOCRATES_STATES.DETECT);
        }

        // Actualizar sombra
        this.shadow.setPosition(this.sprite.x, this.sprite.y + 6);
    }

    updateDetect(distance) {
        this.sprite.body.setVelocity(0);
        this.sprite.play(`oldman_idle_${this.currentDirection}`, true);
        this.shadow.setPosition(this.sprite.x, this.sprite.y + 6);

        if (distance > GAME_CONSTANTS.SOCRATES_DETECT_RADIUS) {
            this.setState(GAME_CONSTANTS.SOCRATES_STATES.IDLE);
        } else {
            // Transición a PURSUE después de un momento
            this.scene.time.delayedCall(500, () => {
                if (this.state === GAME_CONSTANTS.SOCRATES_STATES.DETECT) {
                    this.setState(GAME_CONSTANTS.SOCRATES_STATES.PURSUE);
                }
            });
        }
    }

    updatePursue(player, distance) {
        // Perseguir al jugador
        this.scene.physics.moveToObject(this.sprite, player.sprite, GAME_CONSTANTS.SOCRATES_SPEED);

        // Actualizar dirección según el movimiento
        const velocity = this.sprite.body.velocity;
        if (Math.abs(velocity.y) > Math.abs(velocity.x)) {
            this.currentDirection = velocity.y < 0 ? 'up' : 'down';
        } else {
            this.currentDirection = velocity.x < 0 ? 'left' : 'right';
        }

        // Animar persecución
        this.sprite.play(`oldman_walk_${this.currentDirection}`, true);
        this.shadow.setPosition(this.sprite.x, this.sprite.y + 6);

        if (distance > GAME_CONSTANTS.SOCRATES_DETECT_RADIUS * 1.5) {
            this.setState(GAME_CONSTANTS.SOCRATES_STATES.IDLE);
        } else if (distance <= GAME_CONSTANTS.SOCRATES_ENGAGE_RADIUS) {
            this.setState(GAME_CONSTANTS.SOCRATES_STATES.ENGAGE);
        }
    }

    updateEngage(player) {
        this.sprite.body.setVelocity(0);
        this.sprite.play(`oldman_idle_${this.currentDirection}`, true);
        this.shadow.setPosition(this.sprite.x, this.sprite.y + 6);

        // Activar diálogo
        this.scene.events.emit('socrates-engaged', player);

        // Volver a idle después de la interacción
        this.setState(GAME_CONSTANTS.SOCRATES_STATES.IDLE);
    }

    setState(newState) {
        const oldState = this.state;
        this.state = newState;

        this.updateStateVisual();

        if (DEBUG_MODE.logStates) {
            console.log(`Sócrates: ${oldState} → ${newState}`);
        }
    }

    updateStateVisual() {
        // Visual feedback del estado (tint color)
        switch(this.state) {
            case GAME_CONSTANTS.SOCRATES_STATES.IDLE:
                this.sprite.clearTint();
                break;
            case GAME_CONSTANTS.SOCRATES_STATES.DETECT:
                this.sprite.setTint(0xffff00); // amarillo
                break;
            case GAME_CONSTANTS.SOCRATES_STATES.PURSUE:
                this.sprite.setTint(0xff0000); // rojo
                break;
            case GAME_CONSTANTS.SOCRATES_STATES.ENGAGE:
                this.sprite.setTint(0xff00ff); // magenta
                break;
        }
    }

    updateDirection() {
        // Actualizar dirección basado en idleDirection
        if (Math.abs(this.idleDirection.y) > Math.abs(this.idleDirection.x)) {
            this.currentDirection = this.idleDirection.y < 0 ? 'up' : 'down';
        } else if (Math.abs(this.idleDirection.x) > 0.1) {
            this.currentDirection = this.idleDirection.x < 0 ? 'left' : 'right';
        }
    }

    takeDamage(amount) {
        this.pesadez = Math.max(0, this.pesadez - amount);
        return this.pesadez > 0;
    }

    getPosition() {
        return { x: this.sprite.x, y: this.sprite.y };
    }

    isInPlaza(x) {
        return x >= this.patrolBounds.left && x <= this.patrolBounds.right;
    }

    enforceBounds() {
        // Mantener a Sócrates dentro de sus bounds
        if (this.sprite.x < this.patrolBounds.left) {
            this.sprite.x = this.patrolBounds.left;
        } else if (this.sprite.x > this.patrolBounds.right) {
            this.sprite.x = this.patrolBounds.right;
        }

        if (this.sprite.y < this.patrolBounds.top) {
            this.sprite.y = this.patrolBounds.top;
        } else if (this.sprite.y > this.patrolBounds.bottom) {
            this.sprite.y = this.patrolBounds.bottom;
        }

        this.shadow.setPosition(this.sprite.x, this.sprite.y + 6);
    }
}
