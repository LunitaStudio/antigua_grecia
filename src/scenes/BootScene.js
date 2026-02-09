class BootScene extends Phaser.Scene {
    constructor() {
        super({ key: 'BootScene' });
    }

    preload() {
        // Mostrar texto de carga
        const { width, height } = this.cameras.main;
        const loadingText = this.add.text(
            width / 2,
            height / 2,
            'Cargando...',
            { fontSize: '32px', color: '#ffffff' }
        );
        loadingText.setOrigin(0.5);

        // Cargar spritesheets de personajes
        this.load.spritesheet('boy', 'assets/sprites/boy.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('oldman', 'assets/sprites/oldman.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        this.load.spritesheet('villager', 'assets/sprites/villager.png', {
            frameWidth: 16,
            frameHeight: 16
        });

        // Cargar tilesets
        this.load.image('tileset_floor', 'assets/tilesets/floor.png');
        this.load.image('tileset_house', 'assets/tilesets/house.png');

        // Cargar UI
        this.load.image('dialogbox', 'assets/ui/dialogbox.png');
        this.load.image('dialogbox_simple', 'assets/ui/dialogbox_simple.png');

        // Cargar sombra
        this.load.image('shadow', 'assets/sprites/shadow.png');

        // Cargar emotes
        this.load.image('exclamation', 'assets/ui/emotes/exclamation.png');

        // Assets de prueba para combate (fondo + pseudo-animaciones)
        this.load.image('combat_art_base', 'assets_prueba/combate_base.png');
        this.load.image('combat_art_rebatir', 'assets_prueba/buen_argumento.png');
        this.load.image('combat_art_throw', 'assets_prueba/arroja_anfora.png');
        this.load.image('combat_art_throw_alt', 'assets_prueba/arroja.png');
        this.load.image('combat_art_ko', 'assets_prueba/socrates_ko.png');
        this.load.image('combat_art_defeat', 'assets_prueba/derrota.png');

        // Assets de prueba para portada
        this.load.image('cover_art', 'assets_prueba/portada.png');
        this.load.image('cover_art_sky', 'assets_prueba/portada_cielo.png');

        if (DEBUG_MODE.logStates) {
            console.log('BootScene: Cargando assets reales');
        }
    }

    create() {
        // Crear animaciones para el protagonista (boy)
        this.createCharacterAnimations('boy');

        // Crear animaciones para Sócrates (oldman)
        this.createCharacterAnimations('oldman');

        // Crear animaciones para el cliente (villager)
        this.createCharacterAnimations('villager');

        if (DEBUG_MODE.logStates) {
            console.log('BootScene: Animaciones creadas, iniciando GameScene');
        }
        this.scene.start('GameScene');
    }

    createCharacterAnimations(key) {
        // Formato del spritesheet Ninja Adventure (64x112, 4 cols x 7 filas):
        // COLUMNAS: 0=Down, 1=Up, 2=Left, 3=Right
        // FILAS: 0=Idle, 1-3=Walk (3 frames), 4=Punch, 5=Jump, 6=Victory
        //
        // Índice de frame = fila * 4 + columna
        //
        // Fila 0 (Idle):     [0=Down, 1=Up, 2=Left, 3=Right]
        // Fila 1 (Walk f1):  [4=Down, 5=Up, 6=Left, 7=Right]
        // Fila 2 (Walk f2):  [8=Down, 9=Up, 10=Left, 11=Right]
        // Fila 3 (Walk f3):  [12=Down, 13=Up, 14=Left, 15=Right]

        // Idle animations (fila 0)
        this.anims.create({
            key: `${key}_idle_down`,
            frames: [{ key: key, frame: 0 }],
            frameRate: 1
        });

        this.anims.create({
            key: `${key}_idle_up`,
            frames: [{ key: key, frame: 1 }],
            frameRate: 1
        });

        this.anims.create({
            key: `${key}_idle_left`,
            frames: [{ key: key, frame: 2 }],
            frameRate: 1
        });

        this.anims.create({
            key: `${key}_idle_right`,
            frames: [{ key: key, frame: 3 }],
            frameRate: 1
        });

        // Walk down (columna 0, filas 1-3)
        this.anims.create({
            key: `${key}_walk_down`,
            frames: [
                { key: key, frame: 0 },  // idle
                { key: key, frame: 4 },  // fila 1
                { key: key, frame: 8 },  // fila 2
                { key: key, frame: 12 }  // fila 3
            ],
            frameRate: 8,
            repeat: -1
        });

        // Walk up (columna 1, filas 1-3)
        this.anims.create({
            key: `${key}_walk_up`,
            frames: [
                { key: key, frame: 1 },
                { key: key, frame: 5 },
                { key: key, frame: 9 },
                { key: key, frame: 13 }
            ],
            frameRate: 8,
            repeat: -1
        });

        // Walk left (columna 2, filas 1-3)
        this.anims.create({
            key: `${key}_walk_left`,
            frames: [
                { key: key, frame: 2 },
                { key: key, frame: 6 },
                { key: key, frame: 10 },
                { key: key, frame: 14 }
            ],
            frameRate: 8,
            repeat: -1
        });

        // Walk right (columna 3, filas 1-3)
        this.anims.create({
            key: `${key}_walk_right`,
            frames: [
                { key: key, frame: 3 },
                { key: key, frame: 7 },
                { key: key, frame: 11 },
                { key: key, frame: 15 }
            ],
            frameRate: 8,
            repeat: -1
        });
    }
}
