class SoldierNPC {
    constructor(scene, x, y) {
        this.scene = scene;

        // Crear sombra
        this.shadow = scene.add.image(x, y, 'shadow');
        this.shadow.setScale(0.8);
        this.shadow.setAlpha(0.5);

        // Crear sprite del soldado
        this.sprite = scene.add.sprite(x, y, 'soldier');
        this.sprite.setScale(2);
        scene.physics.add.existing(this.sprite);

        this.sprite.body.setCollideWorldBounds(true);
        this.sprite.body.setSize(12, 14);
        this.sprite.body.setOffset(2, 2);

        // Animación inicial
        this.sprite.play('soldier_idle_down');
        this.currentDirection = 'down';

        // State machine - empieza INACTIVO hasta que el jugador complete un viaje
        this.state = GAME_CONSTANTS.SOLDIER_STATES.INACTIVE;

        // Patrol bounds (limitado a su zona en RIGHT_STREET)
        const { TILE_SIZE, SOLDIER_PATROL_ZONE } = GAME_CONSTANTS;
        this.patrolBounds = {
            left: SOLDIER_PATROL_ZONE.start * TILE_SIZE,
            right: (SOLDIER_PATROL_ZONE.end + 1) * TILE_SIZE,
            top: TILE_SIZE,
            bottom: (GAME_CONSTANTS.MAP_HEIGHT - 1) * TILE_SIZE
        };

        // Para wandering idle
        this.idleTimer = 0;
        this.idleDirection = { x: 0, y: 0 };
        this.changeDirectionInterval = 2500;

        // Cooldown después de cobrar
        this.cooldownTimer = 0;

        // Indicador visual (espada)
        this.icon = scene.add.text(x, y - 25, '⚔️', {
            fontSize: '18px'
        });
        this.icon.setOrigin(0.5);
        this.icon.setDepth(100);

        // Offset flotante para animación manual (porque el soldado se mueve)
        this.iconFloatOffset = 0;

        // Empezar invisible (INACTIVE)
        this.setVisible(false);

        // Feedback visual del estado
        this.updateStateVisual();
    }

    activate() {
        // Llamado cuando tripsCompleted >= 1
        if (this.state === GAME_CONSTANTS.SOLDIER_STATES.INACTIVE) {
            this.state = GAME_CONSTANTS.SOLDIER_STATES.IDLE;
            this.setVisible(true);
            this.updateStateVisual();

            if (DEBUG_MODE.logStates) {
                console.log('Soldado: ACTIVADO');
            }
        }
    }

    setVisible(visible) {
        this.sprite.setVisible(visible);
        this.shadow.setVisible(visible);
        this.icon.setVisible(visible);
        // Desactivar/activar el body de física
        if (this.sprite.body) {
            this.sprite.body.enable = visible;
        }
    }

    update(player) {
        // No hacer nada si está inactivo
        if (this.state === GAME_CONSTANTS.SOLDIER_STATES.INACTIVE) return;

        // Actualizar cooldown
        if (this.state === GAME_CONSTANTS.SOLDIER_STATES.COOLDOWN_IDLE) {
            this.cooldownTimer -= this.scene.game.loop.delta;
            if (this.cooldownTimer <= 0) {
                this.setState(GAME_CONSTANTS.SOLDIER_STATES.IDLE);
                if (DEBUG_MODE.logStates) {
                    console.log('Soldado: Cooldown terminado');
                }
            }
        }

        const distance = Phaser.Math.Distance.Between(
            this.sprite.x, this.sprite.y,
            player.sprite.x, player.sprite.y
        );

        // Verificar si el jugador está en la zona del soldado
        const playerInZone = this.isInZone(player.sprite.x);

        switch (this.state) {
            case GAME_CONSTANTS.SOLDIER_STATES.IDLE:
                this.updateIdle(distance, playerInZone);
                break;
            case GAME_CONSTANTS.SOLDIER_STATES.DETECT:
                this.updateDetect(distance, playerInZone);
                break;
            case GAME_CONSTANTS.SOLDIER_STATES.PURSUE:
                this.updatePursue(player, distance, playerInZone);
                break;
            case GAME_CONSTANTS.SOLDIER_STATES.COOLDOWN_IDLE:
                this.updateCooldownIdle();
                break;
        }

        this.enforceBounds();
    }

    updateIdle(distance, playerInZone) {
        // Wandering behavior (patrulla aleatoria)
        this.idleTimer += this.scene.game.loop.delta;

        if (this.idleTimer >= this.changeDirectionInterval) {
            this.idleTimer = 0;
            const angle = Math.random() * Math.PI * 2;
            this.idleDirection.x = Math.cos(angle);
            this.idleDirection.y = Math.sin(angle);
            this.updateDirection();
        }

        const speed = GAME_CONSTANTS.SOLDIER_SPEED * 0.5;
        this.sprite.body.setVelocity(
            this.idleDirection.x * speed,
            this.idleDirection.y * speed
        );

        if (Math.abs(this.idleDirection.x) > 0.1 || Math.abs(this.idleDirection.y) > 0.1) {
            this.sprite.play(`soldier_walk_${this.currentDirection}`, true);
        } else {
            this.sprite.play(`soldier_idle_${this.currentDirection}`, true);
        }

        // Detectar jugador si está en zona y en rango
        if (playerInZone && distance <= GAME_CONSTANTS.SOLDIER_DETECT_RADIUS) {
            this.setState(GAME_CONSTANTS.SOLDIER_STATES.DETECT);
        }

        this.updateIconPosition();
    }

    updateDetect(distance, playerInZone) {
        // Se detuvo, "vio" al jugador
        this.sprite.body.setVelocity(0);
        this.sprite.play(`soldier_idle_${this.currentDirection}`, true);

        if (!playerInZone || distance > GAME_CONSTANTS.SOLDIER_DETECT_RADIUS) {
            this.setState(GAME_CONSTANTS.SOLDIER_STATES.IDLE);
            return;
        }

        // Transición a PURSUE después de un momento
        if (!this.detectTransitionTimer) {
            this.detectTransitionTimer = this.scene.time.delayedCall(400, () => {
                this.detectTransitionTimer = null;
                if (this.state === GAME_CONSTANTS.SOLDIER_STATES.DETECT) {
                    this.setState(GAME_CONSTANTS.SOLDIER_STATES.PURSUE);
                }
            });
        }

        this.updateIconPosition();
    }

    updatePursue(player, distance, playerInZone) {
        // Perseguir al jugador
        this.scene.physics.moveToObject(this.sprite, player.sprite, GAME_CONSTANTS.SOLDIER_SPEED);

        // Actualizar dirección visual
        const velocity = this.sprite.body.velocity;
        if (Math.abs(velocity.y) > Math.abs(velocity.x)) {
            this.currentDirection = velocity.y < 0 ? 'up' : 'down';
        } else {
            this.currentDirection = velocity.x < 0 ? 'left' : 'right';
        }

        this.sprite.play(`soldier_walk_${this.currentDirection}`, true);

        // Si el jugador se alejó mucho, volver a IDLE
        if (distance > GAME_CONSTANTS.SOLDIER_DETECT_RADIUS * 1.5) {
            this.setState(GAME_CONSTANTS.SOLDIER_STATES.IDLE);
        } else if (distance <= GAME_CONSTANTS.SOLDIER_ENGAGE_RADIUS) {
            // Alcanzó al jugador → cobrar
            this.setState(GAME_CONSTANTS.SOLDIER_STATES.COLLECT);
            this.scene.events.emit('soldier-collect', player);
        }

        this.updateIconPosition();
    }

    updateCooldownIdle() {
        // Quieto durante el cooldown, relajado
        this.sprite.body.setVelocity(0);
        this.sprite.play(`soldier_idle_${this.currentDirection}`, true);
        this.updateIconPosition();
    }

    startCooldown() {
        this.setState(GAME_CONSTANTS.SOLDIER_STATES.COOLDOWN_IDLE);
        this.cooldownTimer = GAME_CONSTANTS.SOLDIER_COOLDOWN;
    }

    setState(newState) {
        const oldState = this.state;

        // Limpiar timer de detección si sale de DETECT
        if (oldState === GAME_CONSTANTS.SOLDIER_STATES.DETECT && newState !== GAME_CONSTANTS.SOLDIER_STATES.DETECT) {
            if (this.detectTransitionTimer) {
                this.detectTransitionTimer.remove();
                this.detectTransitionTimer = null;
            }
        }

        this.state = newState;
        this.updateStateVisual();

        if (DEBUG_MODE.logStates) {
            console.log(`Soldado: ${oldState} → ${newState}`);
        }
    }

    updateStateVisual() {
        switch (this.state) {
            case GAME_CONSTANTS.SOLDIER_STATES.INACTIVE:
                this.sprite.clearTint();
                break;
            case GAME_CONSTANTS.SOLDIER_STATES.IDLE:
                this.sprite.setTint(0x6699ff); // Azul (patrulla)
                break;
            case GAME_CONSTANTS.SOLDIER_STATES.DETECT:
                this.sprite.setTint(0xffff00); // Amarillo (alerta)
                break;
            case GAME_CONSTANTS.SOLDIER_STATES.PURSUE:
                this.sprite.setTint(0xff0000); // Rojo (persecución)
                break;
            case GAME_CONSTANTS.SOLDIER_STATES.COLLECT:
                this.sprite.setTint(0xff0000); // Rojo
                break;
            case GAME_CONSTANTS.SOLDIER_STATES.COOLDOWN_IDLE:
                this.sprite.setTint(0x00ff00); // Verde (ya cobró, deja pasar)
                break;
        }
    }

    updateDirection() {
        if (Math.abs(this.idleDirection.y) > Math.abs(this.idleDirection.x)) {
            this.currentDirection = this.idleDirection.y < 0 ? 'up' : 'down';
        } else if (Math.abs(this.idleDirection.x) > 0.1) {
            this.currentDirection = this.idleDirection.x < 0 ? 'left' : 'right';
        }
    }

    updateIconPosition() {
        // Animación flotante manual (el tween no sirve porque el soldado se mueve)
        this.iconFloatOffset = Math.sin(this.scene.time.now / 400) * 3;
        this.icon.x = this.sprite.x;
        this.icon.y = this.sprite.y - 27 + this.iconFloatOffset;
        this.shadow.setPosition(this.sprite.x, this.sprite.y + 6);
    }

    isInZone(x) {
        return x >= this.patrolBounds.left && x <= this.patrolBounds.right;
    }

    enforceBounds() {
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

    getPosition() {
        return { x: this.sprite.x, y: this.sprite.y };
    }
}
