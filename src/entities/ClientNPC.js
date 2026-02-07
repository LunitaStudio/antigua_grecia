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
        if (this.hasDelivered) return;

        this.hasDelivered = true;

        // Ocultar indicador
        this.exclamation.setVisible(false);

        // Trigger win condition
        this.scene.events.emit('delivery-complete');
    }

    getPosition() {
        return { x: this.sprite.x, y: this.sprite.y };
    }
}
