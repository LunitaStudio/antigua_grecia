class DialogSystem {
    constructor(scene) {
        this.scene = scene;
        this.isActive = false;
        this.dialogBox = null;
        this.dialogText = null;
        this.options = [];
        this.callback = null;
    }

    create() {
        const { width, height } = this.scene.cameras.main;

        // Caja de diálogo
        this.dialogBox = this.scene.add.rectangle(
            width / 2,
            height - 100,
            width - 40,
            180,
            0x000000,
            0.8
        );
        this.dialogBox.setStrokeStyle(2, 0xf39c12);
        this.dialogBox.setDepth(1000);
        this.dialogBox.setVisible(false);

        // Texto del diálogo
        this.dialogText = this.scene.add.text(
            30,
            height - 170,
            '',
            {
                fontSize: '16px',
                color: '#ffffff',
                wordWrap: { width: width - 80 }
            }
        );
        this.dialogText.setDepth(1001);
        this.dialogText.setVisible(false);

        console.log('DialogSystem creado');
    }

    show(text, options, callback) {
        if (this.isActive) return;

        this.isActive = true;
        this.callback = callback;

        // Pausar el juego
        this.scene.physics.pause();

        // Mostrar diálogo
        this.dialogBox.setVisible(true);
        this.dialogText.setText(text);
        this.dialogText.setVisible(true);

        // Crear opciones
        this.createOptions(options);
    }

    createOptions(optionsData) {
        const { width, height } = this.scene.cameras.main;
        const startY = height - 80;
        const spacing = 100;

        optionsData.forEach((option, index) => {
            const x = 50 + (index * spacing);

            // Botón
            const button = this.scene.add.rectangle(
                x,
                startY,
                90,
                30,
                0x3498db,
                1
            );
            button.setStrokeStyle(2, 0x2980b9);
            button.setDepth(1001);
            button.setInteractive({ useHandCursor: true });

            // Texto del botón
            const buttonText = this.scene.add.text(
                x,
                startY,
                option.text,
                {
                    fontSize: '14px',
                    color: '#ffffff'
                }
            );
            buttonText.setOrigin(0.5);
            buttonText.setDepth(1002);

            // Hover effect
            button.on('pointerover', () => {
                button.setFillStyle(0x2980b9);
            });

            button.on('pointerout', () => {
                button.setFillStyle(0x3498db);
            });

            // Click
            button.on('pointerdown', () => {
                this.selectOption(option.value);
            });

            this.options.push({ button, text: buttonText });
        });
    }

    selectOption(value) {
        this.hide();

        if (this.callback) {
            this.callback(value);
        }
    }

    hide() {
        this.isActive = false;

        // Ocultar elementos
        this.dialogBox.setVisible(false);
        this.dialogText.setVisible(false);

        // Destruir opciones
        this.options.forEach(option => {
            option.button.destroy();
            option.text.destroy();
        });
        this.options = [];

        // Reanudar el juego
        this.scene.physics.resume();
    }
}
