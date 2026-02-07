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
            debug: true // para ver colisiones en desarrollo
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
    MAP_WIDTH: 25,
    MAP_HEIGHT: 18,

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
