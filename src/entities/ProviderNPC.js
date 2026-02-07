class ProviderNPC {
    constructor(scene, x, y) {
        this.scene = scene;

        // Crear sombra
        this.shadow = scene.add.image(x, y, 'shadow');
        this.shadow.setScale(0.8);
        this.shadow.setAlpha(0.5);

        // Crear sprite del NPC (usar otro villager diferente al cliente)
        this.sprite = scene.add.sprite(x, y, 'villager');
        this.sprite.setScale(2);
        scene.physics.add.existing(this.sprite);
        this.sprite.body.setImmovable(true);
        this.sprite.body.setSize(12, 14);
        this.sprite.body.setOffset(2, 2);

        // Animación idle
        this.sprite.play('villager_idle_down');

        // Tint verde para diferenciarlo del cliente
        this.sprite.setTint(0x90EE90); // Verde claro

        // Indicador de tienda
        this.shopIcon = scene.add.text(x, y - 25, '🏺', {
            fontSize: '20px'
        });
        this.shopIcon.setOrigin(0.5);
        this.shopIcon.setDepth(100);

        // Animación flotante del indicador
        scene.tweens.add({
            targets: this.shopIcon,
            y: y - 30,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    interact(player) {
        const { MAX_AMPHORAS, AMPHORA_BUY_PRICE } = GAME_CONSTANTS;

        // Calcular cuántas ánforas puede comprar
        const neededAmphoras = MAX_AMPHORAS - player.amphoras;

        if (neededAmphoras === 0) {
            return {
                success: false,
                message: '"Ya llevás el máximo de ánforas.\nVolvé cuando las vendas."'
            };
        }

        const totalCost = neededAmphoras * AMPHORA_BUY_PRICE;

        if (player.money < totalCost) {
            return {
                success: false,
                message: `"Necesitás ${totalCost} dracmas para llenar tu inventario.\nSolo tenés ${player.money} dracmas."`
            };
        }

        // Comprar ánforas (auto-llenar)
        player.buyAmphoras(neededAmphoras, AMPHORA_BUY_PRICE);

        // Regenerar paciencia
        player.restorePatience(GAME_CONSTANTS.PATIENCE_REGEN_ON_BUY);

        return {
            success: true,
            message: `"Acá tenés ${neededAmphoras} ánfora${neededAmphoras > 1 ? 's' : ''}.\nSon ${totalCost} dracmas.\n¡Buena suerte con Sócrates!"`,
            amphoras: neededAmphoras,
            cost: totalCost
        };
    }

    getPosition() {
        return { x: this.sprite.x, y: this.sprite.y };
    }
}
