class DialogSystem {
    constructor(scene) {
        this.scene = scene;
        this.isActive = false;
        this.dialogBox = null;
        this.dialogText = null;
        this.options = [];
        this.callback = null;
        this.currentQuestion = null;
    }

    create() {
        const { width, height } = this.scene.cameras.main;

        // Caja de diálogo (fija a la cámara, abajo y más pequeña)
        this.dialogBox = this.scene.add.rectangle(
            width / 2,
            height - 150,
            width - 100,
            280,
            0x000000,
            0.85
        );
        this.dialogBox.setStrokeStyle(3, 0xf39c12);
        this.dialogBox.setDepth(5000);
        this.dialogBox.setScrollFactor(0);
        this.dialogBox.setVisible(false);

        // Texto del diálogo (fijo a la cámara)
        this.dialogText = this.scene.add.text(
            width / 2,
            height - 280,
            '',
            {
                fontSize: '16px',
                color: '#ffffff',
                wordWrap: { width: width - 140 },
                lineSpacing: 4,
                align: 'center'
            }
        );
        this.dialogText.setOrigin(0.5, 0);
        this.dialogText.setDepth(5001);
        this.dialogText.setScrollFactor(0);
        this.dialogText.setVisible(false);

        // Índice de selección para navegación
        this.selectedIndex = 0;

        if (DEBUG_MODE.logStates) {
            console.log('DialogSystem creado (Capa 1)');
        }
    }

    showLayer1(player, onSuccess, onFail) {
        if (this.isActive) return;

        this.isActive = true;
        this.currentQuestion = getRandomQuestion();

        // Pausar el juego
        this.scene.physics.pause();

        // Mostrar diálogo
        this.dialogBox.setVisible(true);

        const questionText = `Sócrates te alcanzó:\n${this.currentQuestion.layer1.question}`;
        this.dialogText.setText(questionText);
        this.dialogText.setVisible(true);

        // Crear opciones
        this.createLayer1Options(player, onSuccess, onFail);
    }

    createLayer1Options(player, onSuccess, onFail) {
        const { width, height } = this.scene.cameras.main;

        // Preparar opciones
        const questionOptions = this.currentQuestion.layer1.options;
        const allOptions = [...questionOptions];

        // Agregar opción de Ánfora si el jugador tiene
        if (player.hasAmphora()) {
            allOptions.push({
                text: '🏺 Tirar Ánfora',
                quality: 'amphora'
            });
        }

        // Configuración del menú vertical
        const menuX = 60;
        const menuY = height - 220;
        const menuWidth = width - 140;
        const optionHeight = 30;
        const optionSpacing = 6;
        const menuHeight = (optionHeight + optionSpacing) * allOptions.length + 20;

        // Fondo del menú
        const menuBox = this.scene.add.rectangle(
            width / 2,
            menuY + menuHeight / 2,
            menuWidth,
            menuHeight,
            0x2c3e50,
            0.9
        );
        menuBox.setStrokeStyle(2, 0x34495e);
        menuBox.setDepth(5001);
        menuBox.setScrollFactor(0);

        // Selector visual
        this.selector = this.scene.add.rectangle(
            width / 2,
            menuY + 15 + optionHeight / 2,
            menuWidth - 10,
            optionHeight,
            0xf39c12,
            0.4
        );
        this.selector.setStrokeStyle(2, 0xf39c12);
        this.selector.setDepth(5002);
        this.selector.setScrollFactor(0);

        // Crear opciones
        allOptions.forEach((option, index) => {
            const y = menuY + 15 + (index * (optionHeight + optionSpacing)) + optionHeight / 2;

            // Color según calidad
            let qualityColor = 0x3498db;
            if (option.quality === 'good') qualityColor = 0x27ae60;
            if (option.quality === 'regular') qualityColor = 0xf39c12;
            if (option.quality === 'bad') qualityColor = 0x95a5a6;
            if (option.quality === 'amphora') qualityColor = 0xe67e22;

            // Numeración
            const numberText = this.scene.add.text(
                menuX + 15,
                y,
                `${index + 1}.`,
                {
                    fontSize: '14px',
                    color: '#95a5a6',
                    fontStyle: 'bold'
                }
            );
            numberText.setOrigin(0, 0.5);
            numberText.setDepth(5003);
            numberText.setScrollFactor(0);

            // Indicador de calidad
            const qualityIndicator = this.scene.add.rectangle(
                menuX + 45,
                y,
                10,
                10,
                qualityColor
            );
            qualityIndicator.setDepth(5003);
            qualityIndicator.setScrollFactor(0);

            // Texto de la opción
            const optionText = this.scene.add.text(
                menuX + 65,
                y,
                option.text,
                {
                    fontSize: '14px',
                    color: '#ecf0f1',
                    wordWrap: { width: menuWidth - 100 }
                }
            );
            optionText.setOrigin(0, 0.5);
            optionText.setDepth(5003);
            optionText.setScrollFactor(0);

            // Zona interactiva
            const hitArea = this.scene.add.rectangle(
                width / 2,
                y,
                menuWidth - 10,
                optionHeight,
                0xffffff,
                0
            );
            hitArea.setDepth(5002);
            hitArea.setScrollFactor(0);
            hitArea.setInteractive({ useHandCursor: true });

            // Eventos de mouse
            hitArea.on('pointerover', () => {
                this.selectedIndex = index;
                this.updateSelector();
            });

            hitArea.on('pointerdown', () => {
                this.resolveLayer1Option(option, player, onSuccess, onFail);
            });

            this.options.push({
                option,
                menuBox,
                numberText,
                qualityIndicator,
                optionText,
                hitArea,
                y
            });
        });

        // Actualizar selector inicial
        this.updateSelector();
    }

    updateSelector() {
        if (this.options[this.selectedIndex]) {
            const targetY = this.options[this.selectedIndex].y;
            this.selector.y = targetY;
        }
    }

    resolveLayer1Option(option, player, onSuccess, onFail) {
        this.hide();

        // Caso especial: Ánfora
        if (option.quality === 'amphora') {
            player.useAmphora();
            this.scene.stats.amphorasLost++;

            if (DEBUG_MODE.logStates) {
                console.log('¡Ánfora lanzada! Sócrates KO');
            }

            // Sócrates queda STUNNED
            onSuccess('amphora');
            return;
        }

        // Resolver por chance
        const chance = getChanceByQuality(option.quality);
        const roll = Math.random();
        const success = roll < chance;

        if (DEBUG_MODE.logStates) {
            console.log(`Respuesta ${option.quality}: ${(chance*100).toFixed(0)}% chance, roll ${(roll*100).toFixed(0)}% → ${success ? 'ZAFASTE' : 'FALLÓ'}`);
        }

        if (success) {
            onSuccess('dialog');
        } else {
            // Va a Capa 2 (combate)
            onFail(this.currentQuestion);
        }
    }

    hide() {
        this.isActive = false;

        // Ocultar elementos
        this.dialogBox.setVisible(false);
        this.dialogText.setVisible(false);

        // Destruir selector
        if (this.selector) {
            this.selector.destroy();
            this.selector = null;
        }

        // Destruir opciones
        this.options.forEach(option => {
            if (option.menuBox) option.menuBox.destroy();
            if (option.numberText) option.numberText.destroy();
            if (option.qualityIndicator) option.qualityIndicator.destroy();
            if (option.optionText) option.optionText.destroy();
            if (option.hitArea) option.hitArea.destroy();
        });
        this.options = [];

        // Reanudar el juego
        this.scene.physics.resume();
    }
}
