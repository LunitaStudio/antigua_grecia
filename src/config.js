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
    TILE_SIZE: 32,
    MAP_WIDTH: 40,
    MAP_HEIGHT: 18,

    // Zonas del mapa (en tiles)
    ZONES: {
        LEFT_STREET: { start: 0, end: 7 },      // Calle izquierda (spawn)
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

    // Stats de combate
    PLAYER_PATIENCE_MAX: 100,
    SOCRATES_PESADEZ_MAX: 100,

    // Estados de Sócrates
    SOCRATES_STATES: {
        IDLE: 'IDLE',
        DETECT: 'DETECT',
        PURSUE: 'PURSUE',
        ENGAGE: 'ENGAGE'
    }
};
