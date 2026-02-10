// Configurar scenes
GameConfig.scene = [
    BootScene,
    TitleScene,
    GameScene,
    CombatScene,
    DialogScene
];

// Inicializar juego
const game = new Phaser.Game(GameConfig);

if (DEBUG_MODE.logStates) {
    console.log('Antigua Grecia RPG - Sprint 1.5');
    console.log('Debug Mode:', DEBUG_MODE);
}
