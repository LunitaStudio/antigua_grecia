class TitleScene extends Phaser.Scene {
    constructor() {
        super({ key: 'TitleScene' });
    }

    create() {
        const { width, height } = this.cameras.main;

        // Obtener dimensiones de la imagen
        const coverImage = this.textures.get('cover_art_sky').getSourceImage();
        const imageWidth = coverImage.width;
        const imageHeight = coverImage.height;

        // Calcular escala para que la imagen cubra el ancho de la pantalla
        const scale = width / imageWidth;

        // Crear la imagen de fondo (posicionada para mostrar el cielo al inicio)
        // La imagen es vertical larga, así que la posicionamos para que se vea el cielo arriba
        this.coverArt = this.add.image(width / 2, 0, 'cover_art_sky');
        this.coverArt.setOrigin(0.5, 0);
        this.coverArt.setScale(scale);

        // Calcular cuánto debe bajar la imagen para mostrar la parte inferior
        const scaledImageHeight = imageHeight * scale;
        const scrollDistance = scaledImageHeight - height;

        // Animación de scroll down (3.5 segundos)
        this.tweens.add({
            targets: this.coverArt,
            y: -scrollDistance, // Mover hacia arriba para simular scroll down
            duration: 3500,
            ease: 'Sine.InOut',
            onComplete: () => {
                // Esperar a que la fuente Cinzel esté cargada antes de mostrar el texto
                document.fonts.ready.then(() => {
                    this.showTitleAndUI();
                });
            }
        });

        if (DEBUG_MODE.logStates) {
            console.log('TitleScene: Iniciando animación de scroll');
            console.log(`Imagen: ${imageWidth}x${imageHeight}, Scale: ${scale}, Scroll: ${scrollDistance}px`);
        }
    }

    showTitleAndUI() {
        const { width, height } = this.cameras.main;

        // Contenedor para todo el texto (para fade-in conjunto)
        const textContainer = this.add.container(0, 0);
        textContainer.setDepth(20);
        textContainer.setAlpha(0);

        // === TÍTULO ===
        const title = this.add.text(
            width / 2,
            70,
            'LAS ÁNFORAS',
            {
                fontFamily: 'Cinzel',
                fontSize: '72px',
                color: '#f39c12',
                fontStyle: 'bold',
                stroke: '#1a1a1a',
                strokeThickness: 8,
                shadow: {
                    offsetX: 4,
                    offsetY: 4,
                    color: '#000000',
                    blur: 12,
                    fill: true
                }
            }
        );
        title.setOrigin(0.5);

        // === SUBTÍTULO ===
        const subtitle = this.add.text(
            width / 2,
            145,
            'Una tragedia comercial en Atenas',
            {
                fontFamily: 'Cinzel',
                fontSize: '24px',
                color: '#ecf0f1',
                stroke: '#1a1a1a',
                strokeThickness: 5,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 6,
                    fill: true
                }
            }
        );
        subtitle.setOrigin(0.5);

        // === DESCRIPCIÓN ===
        const description = this.add.text(
            width / 2,
            230,
            'Sos Chremes, vendedor de ánforas.\nTu problema: Sócrates.',
            {
                fontSize: '26px',
                color: '#ffffff',
                align: 'center',
                lineSpacing: 10,
                stroke: '#1a1a1a',
                strokeThickness: 5,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 6,
                    fill: true
                }
            }
        );
        description.setOrigin(0.5);

        // === INSTRUCCIONES ===
        const instructions = this.add.text(
            width / 2,
            330,
            'Movete con ← ↑ ↓ → o WASD\nComprá, vendé, esquivá y argumentá.',
            {
                fontSize: '22px',
                color: '#ecf0f1',
                align: 'center',
                lineSpacing: 8,
                stroke: '#1a1a1a',
                strokeThickness: 4,
                shadow: {
                    offsetX: 2,
                    offsetY: 2,
                    color: '#000000',
                    blur: 6,
                    fill: true
                }
            }
        );
        instructions.setOrigin(0.5);

        // Agregar textos al contenedor
        textContainer.add([title, subtitle, description, instructions]);

        // === BOTÓN START ===
        const startButtonY = height - 80;

        // Fondo del botón
        const buttonBg = this.add.rectangle(
            width / 2,
            startButtonY,
            180,
            50,
            0xf39c12,
            1
        );
        buttonBg.setStrokeStyle(3, 0xffffff);
        buttonBg.setDepth(20);
        buttonBg.setAlpha(0);
        buttonBg.setInteractive({ useHandCursor: true });

        // Texto del botón
        const buttonText = this.add.text(
            width / 2,
            startButtonY,
            'START',
            {
                fontFamily: 'Cinzel',
                fontSize: '32px',
                color: '#ffffff',
                fontStyle: 'bold'
            }
        );
        buttonText.setOrigin(0.5);
        buttonText.setDepth(21);
        buttonText.setAlpha(0);

        // Eventos del botón
        buttonBg.on('pointerover', () => {
            buttonBg.setFillStyle(0xe67e22);
            buttonBg.setScale(1.05);
            buttonText.setScale(1.05);
        });

        buttonBg.on('pointerout', () => {
            buttonBg.setFillStyle(0xf39c12);
            buttonBg.setScale(1);
            buttonText.setScale(1);
        });

        buttonBg.on('pointerdown', () => {
            this.startGame();
        });

        // También permitir iniciar con ENTER o SPACE
        this.input.keyboard.once('keydown-ENTER', () => this.startGame());
        this.input.keyboard.once('keydown-SPACE', () => this.startGame());

        // Fade-in de todo el contenido
        this.tweens.add({
            targets: [textContainer, buttonBg, buttonText],
            alpha: 1,
            duration: 1000,
            ease: 'Power2'
        });

        // Efecto de pulso en el botón para llamar la atención
        this.tweens.add({
            targets: buttonBg,
            scaleX: 1.05,
            scaleY: 1.05,
            duration: 800,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.InOut'
        });

        if (DEBUG_MODE.logStates) {
            console.log('TitleScene: Mostrando UI y botón START');
        }
    }

    startGame() {
        if (DEBUG_MODE.logStates) {
            console.log('TitleScene: Iniciando juego');
        }

        // Fade out y transición a GameScene
        this.cameras.main.fadeOut(500, 0, 0, 0);

        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('GameScene');
        });
    }
}
