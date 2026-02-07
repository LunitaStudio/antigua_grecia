class ClientNPC {
    constructor(scene, x, y) {
        this.scene = scene;

        // Crear sombra
        this.shadow = scene.add.image(x, y, 'shadow');
        this.shadow.setScale(0.8);
        this.shadow.setAlpha(0.5);

        // Crear sprite del NPC
        this.sprite = scene.add.sprite(x, y, 'villager');
        this.sprite.setScale(2);
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setImmovable(true);
        this.sprite.body.setSize(12, 14);
        this.sprite.body.setOffset(2, 2);

        // Animación idle mirando hacia abajo
        this.sprite.play('villager_idle_down');

        // Indicador de exclamación flotante
        this.exclamation = scene.add.image(x, y - 25, 'exclamation');
        this.exclamation.setScale(2);
        this.exclamation.setDepth(100);

        // Animación flotante del indicador
        scene.tweens.add({
            targets: this.exclamation,
            y: y - 30,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });

        // Flag para saber si ya entregó
        this.hasDelivered = false;
    }

    interact(player) {
        const { AMPHORA_SELL_PRICE } = GAME_CONSTANTS;

        // Verificar si el jugador tiene ánforas
        if (player.amphoras === 0) {
            return {
                success: false,
                message: '"¿Y las ánforas?\nVolvé cuando traigas mercadería."'
            };
        }

        // Vender ánforas
        const saleResult = player.sellAmphoras(AMPHORA_SELL_PRICE);

        // Regenerar paciencia
        player.restorePatience(GAME_CONSTANTS.PATIENCE_REGEN_ON_SELL);

        // Ocultar indicador temporalmente
        this.exclamation.setVisible(false);

        // Volver a mostrar indicador después de 2 segundos
        this.scene.time.delayedCall(2000, () => {
            if (this.exclamation) {
                this.exclamation.setVisible(true);
            }
        });

        return {
            success: true,
            message: `"¡Excelente trabajo!\nTe pago ${saleResult.earned} dracmas por ${saleResult.count} ánfora${saleResult.count > 1 ? 's' : ''}.\n¡Volvé pronto!"`,
            sold: saleResult.count,
            earned: saleResult.earned
        };
    }

    getPosition() {
        return { x: this.sprite.x, y: this.sprite.y };
    }
}
