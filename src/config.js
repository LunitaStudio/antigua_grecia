// Opciones de Debug
const DEBUG_MODE = {
    physics: false,  // Cambiar a true para ver hitboxes y colisiones
    showFPS: false,  // Mostrar FPS counter
    logStates: true  // Logs de cambios de estado de Sócrates
};

const GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#34495e',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: DEBUG_MODE.physics
        }
    },
    scene: []  // se llenan en main.js
};

const GAME_CONSTANTS = {
    PLAYER_SPEED: 150,
    SOCRATES_SPEED: 100,
    SOCRATES_DETECT_RADIUS: 200,
    SOCRATES_ENGAGE_RADIUS: 40,
    SOCRATES_KO_DURATION: 5000, // 5 segundos stunned al recibir ánfora
    TILE_SIZE: 32,
    MAP_WIDTH: 40,
    MAP_HEIGHT: 18,

    // Zonas del mapa (en tiles)
    ZONES: {
        LEFT_STREET: { start: 0, end: 7 },      // Calle izquierda (spawn/proveedor)
        PLAZA: { start: 8, end: 28 },           // Plaza central (Sócrates)
        RIGHT_STREET: { start: 29, end: 39 }    // Calle derecha (cliente)
    },

    // Spawn positions
    PLAYER_SPAWN_X: 4,  // tile x en calle izquierda
    PLAYER_SPAWN_Y: 9,  // tile y centro
    SOCRATES_SPAWN_X: 18, // tile x centro de plaza
    SOCRATES_SPAWN_Y: 9,
    CLIENT_SPAWN_X: 37,  // tile x final de calle derecha
    CLIENT_SPAWN_Y: 9,
    PROVIDER_SPAWN_X: 2, // tile x proveedor en calle izquierda
    PROVIDER_SPAWN_Y: 9,

    // Sistema Económico
    MONEY_INITIAL: 60,           // Dinero inicial (suficiente para ~1 viaje)
    AMPHORA_BUY_PRICE: 10,       // Precio de compra al proveedor
    AMPHORA_SELL_PRICE: 18,      // Precio de venta al cliente
    MAX_AMPHORAS: 5,             // Capacidad máxima de ánforas
    WIN_MONEY_GOAL: 200,         // Dinero objetivo para ganar

    // Sistema de Paciencia (Global)
    PATIENCE_MAX: 100,
    PATIENCE_INITIAL: 100,
    PATIENCE_REGEN_ON_SELL: 20,  // Regeneración al vender exitosamente
    PATIENCE_REGEN_ON_BUY: 10,   // Regeneración al comprar

    // Stats de combate (Capa 2)
    SOCRATES_INTENSITY_MAX: 100, // Intensidad de Sócrates en combate

    // Chances de éxito en diálogo (Capa 1)
    DIALOG_CHANCE_GOOD: 0.80,    // 80% con respuesta filosófica
    DIALOG_CHANCE_REGULAR: 0.50, // 50% con respuesta práctica
    DIALOG_CHANCE_BAD: 0.20,     // 20% si ignoras

    // Cooldown de Sócrates (tiempo de gracia para escapar)
    SOCRATES_COOLDOWN_AFTER_DIALOG: 3000,  // 3 seg después de Layer 1 exitoso
    SOCRATES_COOLDOWN_AFTER_COMBAT: 6000,  // 6 seg después de victoria/huida en combate
    SOCRATES_COOLDOWN_AFTER_STUNNED: 8000, // 8 seg después de ánfora (incluye KO + gracia)

    // Estados de Sócrates
    SOCRATES_STATES: {
        IDLE: 'IDLE',
        DETECT: 'DETECT',
        PURSUE: 'PURSUE',
        ENGAGE: 'ENGAGE',
        STUNNED: 'STUNNED'  // Nuevo: KO por ánfora
    }
};
