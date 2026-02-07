class CombatSystem {
    constructor(scene) {
        this.scene = scene;
        this.player = null;
        this.enemy = null;
        this.isPlayerTurn = true;
        this.combatLog = [];
    }

    init(player, enemy) {
        this.player = {
            name: 'Alfarero',
            patience: player.patience,
            maxPatience: GAME_CONSTANTS.PLAYER_PATIENCE_MAX,
            hasAmphora: player.hasAmphora
        };

        this.enemy = {
            name: 'Sócrates',
            pesadez: enemy.pesadez,
            maxPesadez: GAME_CONSTANTS.SOCRATES_PESADEZ_MAX
        };

        this.isPlayerTurn = true;
        this.combatLog = ['¡Sócrates te alcanzó!'];
    }

    executeAction(action) {
        let result = { success: false, message: '', combatEnded: false };

        if (this.isPlayerTurn) {
            result = this.playerAction(action);
        } else {
            result = this.enemyAction();
        }

        this.combatLog.push(result.message);

        // Alternar turno si el combate no terminó
        if (!result.combatEnded) {
            this.isPlayerTurn = !this.isPlayerTurn;
        }

        return result;
    }

    playerAction(action) {
        let result = { success: false, message: '', combatEnded: false };

        switch(action) {
            case 'ARGUMENTAR':
                const argumentDamage = Math.floor(Math.random() * 20) + 10;
                const argumentSuccess = Math.random() > 0.5;

                if (argumentSuccess) {
                    this.enemy.pesadez -= argumentDamage;
                    result.message = `Argumentaste bien. Sócrates pierde ${argumentDamage} pesadez.`;
                    result.success = true;
                } else {
                    const counterDamage = Math.floor(Math.random() * 15) + 5;
                    this.player.patience -= counterDamage;
                    result.message = `Tu argumento falló. Perdiste ${counterDamage} paciencia.`;
                }
                break;

            case 'IGNORAR':
                const ignoreDamage = Math.floor(Math.random() * 10) + 5;
                this.player.patience -= ignoreDamage;
                result.message = `Ignoraste a Sócrates pero perdiste ${ignoreDamage} paciencia.`;
                break;

            case 'ANFORA':
                if (this.player.hasAmphora) {
                    const amphoraDamage = 30;
                    this.enemy.pesadez -= amphoraDamage;
                    this.player.hasAmphora = false;
                    result.message = `¡Tiraste el ánfora! Sócrates pierde ${amphoraDamage} pesadez.`;
                    result.success = true;
                } else {
                    result.message = '¡Ya no tenés ánforas!';
                }
                break;

            case 'HUIR':
                const fleeChance = Math.random();
                if (fleeChance > 0.5) {
                    result.message = '¡Lograste escapar!';
                    result.success = true;
                    result.combatEnded = true;
                } else {
                    result.message = 'No pudiste escapar...';
                }
                break;
        }

        // Verificar si ganó el jugador
        if (this.enemy.pesadez <= 0) {
            result.message += '\n¡Sócrates se rindió! Ganaste.';
            result.combatEnded = true;
            result.success = true;
        }

        // Verificar si perdió el jugador
        if (this.player.patience <= 0) {
            result.message += '\n¡Perdiste toda tu paciencia! Game Over.';
            result.combatEnded = true;
            result.success = false;
        }

        return result;
    }

    enemyAction() {
        const actions = ['PREGUNTAR', 'CUESTIONAR', 'IRONIZAR'];
        const action = Phaser.Utils.Array.GetRandom(actions);
        const damage = Math.floor(Math.random() * 15) + 10;

        this.player.patience -= damage;

        let message = '';
        switch(action) {
            case 'PREGUNTAR':
                message = `Sócrates pregunta "¿Qué es la justicia?". Perdiste ${damage} paciencia.`;
                break;
            case 'CUESTIONAR':
                message = `Sócrates cuestiona tus creencias. Perdiste ${damage} paciencia.`;
                break;
            case 'IRONIZAR':
                message = `Sócrates usa ironía socrática. Perdiste ${damage} paciencia.`;
                break;
        }

        let result = { success: true, message, combatEnded: false };

        // Verificar si perdió el jugador
        if (this.player.patience <= 0) {
            result.message += '\n¡Perdiste toda tu paciencia! Game Over.';
            result.combatEnded = true;
            result.success = false;
        }

        return result;
    }

    getState() {
        return {
            player: this.player,
            enemy: this.enemy,
            isPlayerTurn: this.isPlayerTurn,
            combatLog: this.combatLog
        };
    }
}
