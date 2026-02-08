class CombatSystem {
    constructor(scene) {
        this.scene = scene;
        this.player = null;
        this.socrates = null;
        this.question = null;
        this.isPlayerTurn = true;
        this.combatLog = [];
    }

    init(player, question) {
        // Player usa su paciencia GLOBAL (no copia local)
        this.player = {
            name: 'Alfarero',
            patienceRef: player, // Referencia directa al jugador
            amphoras: player.amphoras
        };

        // Sócrates tiene Intensidad en combate
        this.socrates = {
            name: 'Sócrates',
            intensity: GAME_CONSTANTS.SOCRATES_INTENSITY_MAX,
            maxIntensity: GAME_CONSTANTS.SOCRATES_INTENSITY_MAX
        };

        this.question = question;
        this.isPlayerTurn = true;
        this.combatLog = [`Sócrates: "${question.layer2.question}"`];

        if (DEBUG_MODE.logStates) {
            console.log('CombatSystem iniciado (Capa 2):', question.theme);
        }
    }

    executePlayerAction(option) {
        let result = { success: false, message: '', combatEnded: false };

        // Caso especial: Huir
        if (option.action === 'flee') {
            const fleeChance = Math.random();
            if (fleeChance > 0.5) {
                result.message = '¡Lograste escapar de Sócrates!';
                result.success = true;
                result.combatEnded = true;
                result.outcome = 'fled';
            } else {
                result.message = 'No pudiste escapar... Sócrates bloquea tu camino.';
                // Sócrates contraataca por intentar huir
                const counterDamage = Math.floor(Math.random() * 10) + 10;
                this.player.patienceRef.patience -= counterDamage;
                result.message += `\nPerdiste ${counterDamage} paciencia.`;
            }
            return result;
        }

        // Caso especial: Ánfora
        if (option.action === 'amphora') {
            if (this.player.amphoras > 0) {
                const amphoraDamage = 40; // Golpe directo fuerte
                this.socrates.intensity -= amphoraDamage;
                this.player.patienceRef.useAmphora();
                this.player.amphoras = this.player.patienceRef.amphoras;
                this.scene.stats.amphorasLost++;

                result.message = `¡CRASH! Le tiraste un ánfora a Sócrates. Perdió ${amphoraDamage} intensidad.`;
                result.success = true;

                if (DEBUG_MODE.logStates) {
                    console.log('Ánfora lanzada en combate');
                }
            } else {
                result.message = '¡No tenés ánforas!';
                return result;
            }
        }

        // Respuestas filosóficas de Layer 2
        if (option.quality) {
            const chance = getChanceByQuality(option.quality);
            const roll = Math.random();
            const success = roll < chance;

            if (success) {
                const damage = option.damage;
                this.socrates.intensity -= damage;
                result.message = `Respondiste: "${option.text}"\nSócrates pierde ${damage} intensidad.`;
                result.success = true;

                if (DEBUG_MODE.logStates) {
                    console.log(`Respuesta ${option.quality}: ${(chance*100).toFixed(0)}% chance, roll ${(roll*100).toFixed(0)}% → ÉXITO (-${damage} intensidad)`);
                }
            } else {
                result.message = `Respondiste: "${option.text}"\n¡Sócrates refuta tu argumento!`;

                if (DEBUG_MODE.logStates) {
                    console.log(`Respuesta ${option.quality}: ${(chance*100).toFixed(0)}% chance, roll ${(roll*100).toFixed(0)}% → FALLÓ`);
                }
            }
        }

        // Verificar victoria
        if (this.socrates.intensity <= 0) {
            result.message += '\n\n¡Sócrates se rinde! "Quizás tengas razón, alfarero..."';
            result.combatEnded = true;
            result.success = true;
            result.outcome = 'victory';
        }

        // Verificar derrota
        if (this.player.patienceRef.patience <= 0) {
            result.message += '\n\n¡Perdiste toda tu paciencia!';
            result.combatEnded = true;
            result.success = false;
            result.outcome = 'defeat';
        }

        return result;
    }

    executeSocratesAction() {
        // Sócrates hace una NUEVA pregunta del banco
        const newQuestion = getRandomQuestion();
        const oldQuestion = this.question;
        this.question = newQuestion;

        // Mensaje de la nueva pregunta
        let result = {
            success: true,
            message: `Sócrates: ${newQuestion.layer2.question}`,
            combatEnded: false,
            questionChanged: true, // Flag para que CombatScene recree el menú
            oldQuestion: oldQuestion,
            newQuestion: newQuestion
        };

        // No hace daño directo, el daño viene de las respuestas del jugador
        // Pero perder paciencia por pensar en la pregunta
        const mentalDamage = Math.floor(Math.random() * 5) + 5; // 5-10 de daño mental
        this.player.patienceRef.patience -= mentalDamage;
        result.message += `\n(-${mentalDamage} paciencia por pensar en esto)`;

        // Verificar derrota
        if (this.player.patienceRef.patience <= 0) {
            result.message += '\n\n¡Perdiste toda tu paciencia!';
            result.combatEnded = true;
            result.success = false;
            result.outcome = 'defeat';
        }

        if (DEBUG_MODE.logStates) {
            console.log(`Sócrates cambia de pregunta: "${oldQuestion.theme}" → "${newQuestion.theme}" (-${mentalDamage} paciencia)`);
        }

        return result;
    }

    getState() {
        return {
            player: {
                name: this.player.name,
                patience: this.player.patienceRef.patience,
                maxPatience: this.player.patienceRef.maxPatience,
                amphoras: this.player.amphoras
            },
            socrates: this.socrates,
            question: this.question,
            isPlayerTurn: this.isPlayerTurn,
            combatLog: this.combatLog
        };
    }
}
