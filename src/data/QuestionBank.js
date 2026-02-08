// Banco de Preguntas Filosóficas para Sócrates
// Cada pregunta tiene 2 capas: diálogo rápido (layer1) y combate profundo (layer2)

const QuestionBank = [
    {
        id: 1,
        theme: 'La Arcilla',
        layer1: {
            question: '"Alfarero, ¿sabés cuál es la esencia de la arcilla?"',
            options: [
                {
                    text: '"La potencia de convertirse en cualquier forma"',
                    quality: 'good'
                },
                {
                    text: '"Tierra húmeda, Sócrates. Tierra húmeda."',
                    quality: 'regular'
                },
                {
                    text: '[Ignorar]',
                    quality: 'bad'
                }
            ]
        },
        layer2: {
            question: '"¿Pero la forma existe antes de que la moldees, o la creás vos?"',
            options: [
                {
                    text: '"La forma ya está en la arcilla, yo solo la libero"',
                    quality: 'good',
                    damage: 25
                },
                {
                    text: '"La creo yo con mis manos"',
                    quality: 'regular',
                    damage: 15
                }
            ]
        }
    },
    {
        id: 2,
        theme: 'El Trabajo',
        layer1: {
            question: '"¿Trabajás para vivir o vivís para trabajar?"',
            options: [
                {
                    text: '"Trabajo para que otros puedan beber vino en mis ánforas"',
                    quality: 'good'
                },
                {
                    text: '"Trabajo porque si no mi jefe me mata"',
                    quality: 'regular'
                },
                {
                    text: '[Ignorar]',
                    quality: 'bad'
                }
            ]
        },
        layer2: {
            question: '"¿Y si tu jefe no existiera, seguirías haciendo ánforas?"',
            options: [
                {
                    text: '"Sí, porque crear es parte de mi naturaleza"',
                    quality: 'good',
                    damage: 25
                },
                {
                    text: '"Ni loco, me iría a la playa"',
                    quality: 'regular',
                    damage: 15
                }
            ]
        }
    },
    {
        id: 3,
        theme: 'El Conocimiento',
        layer1: {
            question: '"¿Qué sabés con certeza, alfarero?"',
            options: [
                {
                    text: '"Solo sé que tengo que entregar estas ánforas"',
                    quality: 'good'
                },
                {
                    text: '"Sé que la arcilla se seca si no la mojo"',
                    quality: 'regular'
                },
                {
                    text: '[Ignorar]',
                    quality: 'bad'
                }
            ]
        },
        layer2: {
            question: '"¿Pero cómo sabés que lo que sabés no es mera opinión?"',
            options: [
                {
                    text: '"Si es opinión, al menos es una opinión útil"',
                    quality: 'good',
                    damage: 25
                },
                {
                    text: '"Porque mis ánforas no se rompen"',
                    quality: 'regular',
                    damage: 15
                }
            ]
        }
    },
    {
        id: 4,
        theme: 'La Belleza',
        layer1: {
            question: '"¿Tus ánforas son bellas o solo útiles?"',
            options: [
                {
                    text: '"Lo útil bien hecho es bello por naturaleza"',
                    quality: 'good'
                },
                {
                    text: '"Mirá, son ánforas, no esculturas de Fidias"',
                    quality: 'regular'
                },
                {
                    text: '[Ignorar]',
                    quality: 'bad'
                }
            ]
        },
        layer2: {
            question: '"¿Entonces un cuchillo afilado también es bello?"',
            options: [
                {
                    text: '"Si cumple su propósito con perfección, sí"',
                    quality: 'good',
                    damage: 25
                },
                {
                    text: '"Un cuchillo es un cuchillo, dejame en paz"',
                    quality: 'regular',
                    damage: 15
                }
            ]
        }
    },
    {
        id: 5,
        theme: 'La Justicia',
        layer1: {
            question: '"¿Es justo que cobres por tus ánforas?"',
            options: [
                {
                    text: '"Es justo porque intercambio mi tiempo y habilidad"',
                    quality: 'good'
                },
                {
                    text: '"Es justo porque si no cobro me muero de hambre"',
                    quality: 'regular'
                },
                {
                    text: '[Ignorar]',
                    quality: 'bad'
                }
            ]
        },
        layer2: {
            question: '"¿Y si alguien necesita un ánfora pero no puede pagar?"',
            options: [
                {
                    text: '"La justicia no me obliga a regalar mi trabajo, pero la compasión a veces sí"',
                    quality: 'good',
                    damage: 25
                },
                {
                    text: '"Mala suerte, que se compre una de barro barato"',
                    quality: 'regular',
                    damage: 15
                }
            ]
        }
    },
    {
        id: 6,
        theme: 'La Libertad',
        layer1: {
            question: '"¿Te considerás un hombre libre, alfarero?"',
            options: [
                {
                    text: '"Soy libre cuando elijo hacer bien lo que hago"',
                    quality: 'good'
                },
                {
                    text: '"Soy libre cuando tipos como vos me dejan pasar"',
                    quality: 'regular'
                },
                {
                    text: '[Ignorar]',
                    quality: 'bad'
                }
            ]
        },
        layer2: {
            question: '"¿Pero elegiste ser alfarero, o la vida te puso ahí?"',
            options: [
                {
                    text: '"Elegí quedarme cuando pude irme"',
                    quality: 'good',
                    damage: 25
                },
                {
                    text: '"Mi viejo era alfarero, no había mucha opción"',
                    quality: 'regular',
                    damage: 15
                }
            ]
        }
    }
];

// Función helper para obtener pregunta random
function getRandomQuestion() {
    const index = Math.floor(Math.random() * QuestionBank.length);
    return QuestionBank[index];
}

// Función helper para obtener chance según quality
function getChanceByQuality(quality) {
    switch(quality) {
        case 'good': return GAME_CONSTANTS.DIALOG_CHANCE_GOOD;
        case 'regular': return GAME_CONSTANTS.DIALOG_CHANCE_REGULAR;
        case 'bad': return GAME_CONSTANTS.DIALOG_CHANCE_BAD;
        default: return 0;
    }
}
