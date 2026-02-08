class CombatSystem {
    constructor(scene) {
        this.scene = scene;
        this.player = null;
        this.socrates = null;
        this.question = null;
        this.isPlayerTurn = true;
        this.combatLog = [];

        // Placeholders iniciales para calibrar luego.
        this.balance = {
            rebatirSuccessChance: 0.55,
            rebatirDamageMin: 22,
            rebatirDamageMax: 34,
            rebatirFailPatienceMin: 14,
            rebatirFailPatienceMax: 24,
            divagarSuccessChance: 0.45,
            divagarChipMin: 6,
            divagarChipMax: 10,
            amphoraDamage: 35,
            fleeSuccessChance: 0.40,
            socratesDamageMin: 9,
            socratesDamageMax: 17
        };

        this.logPhrases = {
            rebatirSuccess: [
                "Chremes: 'Si todo es relativo, tu pregunta tambien.' Socrates se queda mudo.",
                'Chremes usa logica de mercado. Es super efectivo.',
                "Chremes: 'La esencia es que me debes 3 dracmas.' Socrates titubea."
            ],
            rebatirFail: [
                'Chremes intenta argumentar... Socrates lo enreda con una analogia del zapatero.',
                "Chremes: 'Porque... eh...' Socrates sonrie. Eso no es buena senal.",
                'Socrates le da vuelta el argumento. Chremes se pregunta por que lo intento.'
            ],
            divagarSuccess: [
                'Chremes habla del precio de las aceitunas... Socrates pierde el hilo.',
                "Chremes: 'Sabias que mi suegra...?' Socrates queda perplejo.",
                'Chremes divaga sobre el clima. Socrates parpadea confundido.'
            ],
            divagarFail: [
                'Chremes divaga, pero Socrates lo ignora y sigue preguntando.',
                "Chremes menciona el trigo. Socrates: 'Y que ES el trigo, realmente?'",
                'El intento de distraccion falla. Socrates es inmune a las charlas de mercado.'
            ],
            amphora: [
                "'Responde ESTO, Socrates!' - CRASH.",
                'Chremes lanza un anfora. Impacto directo en la dialectica.',
                'Socrates no esperaba ese argumento de peso.'
            ],
            fleeSuccess: [
                'Chremes sale corriendo. La filosofia tendra que esperar.',
                "Chremes escapa entre la multitud. Socrates grita: 'Esto no termino.'"
            ],
            fleeFail: [
                'Chremes intenta huir, pero Socrates lo agarra de la tunica.',
                'Chremes tropieza. Socrates ni se movio.'
            ],
            socratesAttack: [
                "Socrates: 'Que queres decir con eso?' Chremes siente que le explota la cabeza.",
                'Socrates usa ironia socratica. Es devastador.',
                "Socrates: 'Y si estas equivocado sobre TODO?' Chremes duda de su existencia.",
                "Socrates cuestiona el concepto de 'anfora'. Chremes pierde la paciencia.",
                'Socrates te mira en silencio. Eso es peor que las preguntas.'
            ]
        };
    }

    init(player, question) {
        // Usa paciencia global del jugador.
        this.player = {
            name: 'Alfarero',
            patienceRef: player,
            amphoras: player.amphoras
        };

        this.socrates = {
            name: 'Socrates',
            intensity: GAME_CONSTANTS.SOCRATES_INTENSITY_MAX,
            maxIntensity: GAME_CONSTANTS.SOCRATES_INTENSITY_MAX
        };

        this.question = question;
        this.isPlayerTurn = true;
        this.combatLog = [
            `Tema del encuentro: ${question.theme}.`,
            'Socrates inicia el duelo dialectico.'
        ];

        if (DEBUG_MODE.logStates) {
            console.log('CombatSystem iniciado (Capa 2):', question.theme);
        }
    }

    executePlayerAction(option) {
        let result = {
            success: false,
            message: '',
            combatEnded: false,
            skipEnemyTurn: false,
            invalidAction: false
        };

        switch (option.action) {
            case 'rebatir':
                result = this.handleRebatir(result);
                break;

            case 'divagar':
                result = this.handleDivagar(result);
                break;

            case 'amphora':
                result = this.handleAmphora(result);
                break;

            case 'flee':
                result = this.handleFlee(result);
                break;

            default:
                result.invalidAction = true;
                result.message = 'Esa accion no existe.';
                break;
        }

        if (!result.invalidAction) {
            this.syncPlayerState();
            this.resolveCombatEnd(result);
        }

        return result;
    }

    handleRebatir(result) {
        const hit = Math.random() < this.balance.rebatirSuccessChance;

        if (hit) {
            const damage = this.randomRange(this.balance.rebatirDamageMin, this.balance.rebatirDamageMax);
            this.socrates.intensity -= damage;
            result.success = true;
            result.message = `${this.pickPhrase(this.logPhrases.rebatirSuccess)} (-${damage} intensidad).`;
        } else {
            const damage = this.randomRange(this.balance.rebatirFailPatienceMin, this.balance.rebatirFailPatienceMax);
            this.player.patienceRef.patience -= damage;
            result.message = `${this.pickPhrase(this.logPhrases.rebatirFail)} (-${damage} paciencia).`;
        }

        return result;
    }

    handleDivagar(result) {
        const worked = Math.random() < this.balance.divagarSuccessChance;

        if (worked) {
            const chipDamage = this.randomRange(this.balance.divagarChipMin, this.balance.divagarChipMax);
            this.socrates.intensity -= chipDamage;
            result.success = true;
            result.skipEnemyTurn = true;
            result.message = `${this.pickPhrase(this.logPhrases.divagarSuccess)} (-${chipDamage} intensidad, Socrates no ataca).`;
        } else {
            result.message = this.pickPhrase(this.logPhrases.divagarFail);
        }

        return result;
    }

    handleAmphora(result) {
        if (this.player.amphoras <= 0) {
            result.invalidAction = true;
            result.message = 'No te quedan anforas.';
            return result;
        }

        this.socrates.intensity -= this.balance.amphoraDamage;
        this.player.patienceRef.useAmphora();
        this.syncPlayerState();

        if (this.scene.stats) {
            this.scene.stats.amphorasLost++;
        }

        result.success = true;
        result.message = `${this.pickPhrase(this.logPhrases.amphora)} (-${this.balance.amphoraDamage} intensidad).`;
        return result;
    }

    handleFlee(result) {
        const escaped = Math.random() < this.balance.fleeSuccessChance;

        if (escaped) {
            result.success = true;
            result.combatEnded = true;
            result.outcome = 'fled';
            result.message = this.pickPhrase(this.logPhrases.fleeSuccess);
        } else {
            result.message = `${this.pickPhrase(this.logPhrases.fleeFail)} Perdes el turno.`;
        }

        return result;
    }

    executeSocratesAction() {
        const damage = this.randomRange(this.balance.socratesDamageMin, this.balance.socratesDamageMax);
        this.player.patienceRef.patience -= damage;

        const result = {
            success: true,
            message: `${this.pickPhrase(this.logPhrases.socratesAttack)} (-${damage} paciencia).`,
            combatEnded: false
        };

        this.syncPlayerState();
        this.resolveCombatEnd(result);
        return result;
    }

    resolveCombatEnd(result) {
        if (this.socrates.intensity <= 0) {
            result.combatEnded = true;
            result.success = true;
            result.outcome = 'victory';
            result.message += ' Socrates baja la guardia.';
            return;
        }

        if (this.player.patienceRef.patience <= 0) {
            result.combatEnded = true;
            result.success = false;
            result.outcome = 'defeat';
            result.message += ' Chremes se queda sin paciencia.';
        }
    }

    syncPlayerState() {
        this.player.amphoras = this.player.patienceRef.amphoras;
    }

    randomRange(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    pickPhrase(list) {
        return Phaser.Utils.Array.GetRandom(list);
    }

    getState() {
        this.syncPlayerState();

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
