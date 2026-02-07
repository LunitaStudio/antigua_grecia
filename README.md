# Antigua Grecia RPG

Juego RPG top-down cómico donde sos un alfarero griego que debe cruzar el ágora de Atenas para entregar ánforas, pero Sócrates te persigue con preguntas filosóficas.

## Sprint 1 - Mecánicas Core + Sprites Reales ✅

### Características Implementadas

#### Mapa
- Ágora simple con colores tierra/arena
- Piso con variación procedural
- Obstáculos: columnas y puestos de mercado con decoración
- Bordes colisionables (muros marrones)

#### Protagonista (Sprite Animado)
- **Sprite**: Boy del pack Ninja Adventure
- Animaciones de walk en 4 direcciones (up, down, left, right)
- Idle cuando está quieto
- Sombra dinámica
- Movimiento con WASD o flechas
- Colisiones con obstáculos
- Sistema de stats (Paciencia: 100)
- Puede portar ánforas

#### Sócrates NPC (Sprite Animado)
- **Sprite**: OldMan2 del pack Ninja Adventure
- Animaciones de walk y idle en 4 direcciones
- Sombra dinámica
- State machine con 4 estados:
  - **IDLE**: Wandering aleatorio (sin tint)
  - **DETECT**: Detecta al jugador en radio (tint amarillo)
  - **PURSUE**: Persigue al jugador (tint rojo)
  - **ENGAGE**: Alcanza al jugador (tint magenta)
- Cambio visual de color según estado (tint)

#### Sistema de Diálogo
- Caja de texto en la parte inferior
- Opciones clickeables
- Se activa cuando Sócrates te alcanza
- Opciones: ARGUMENTAR, IGNORAR, HUIR

#### Combate por Turnos
- Estilo Pokémon con pantalla dedicada
- Menú de acciones: ARGUMENTAR, IGNORAR, ÁNFORA, HUIR
- Turnos alternados
- Stats:
  - **Paciencia** (Jugador): 100
  - **Pesadez** (Sócrates): 100
- Condiciones de victoria/derrota

## Cómo Ejecutar

```bash
# Instalar dependencias
npm install

# Iniciar servidor
npm start
```

El juego se abrirá automáticamente en http://localhost:8080

## Estructura del Proyecto

```
antigua_grecia/
├── index.html
├── package.json
├── src/
│   ├── config.js              # Configuración de Phaser y constantes
│   ├── main.js                # Punto de entrada
│   ├── entities/
│   │   ├── Player.js          # Clase del jugador
│   │   └── Socrates.js        # Clase de Sócrates con IA
│   ├── systems/
│   │   ├── DialogSystem.js    # Sistema de diálogos
│   │   └── CombatSystem.js    # Lógica de combate
│   └── scenes/
│       ├── BootScene.js       # Carga inicial
│       ├── GameScene.js       # Escena principal
│       ├── CombatScene.js     # Escena de combate
│       └── DialogScene.js     # Reservada para futuro
└── Ninja Adventure - Asset Pack/  # Assets (no usados en Sprint 1)
```

## Controles

- **WASD / Flechas**: Mover al alfarero
- **Mouse**: Seleccionar opciones de diálogo y combate

## Mecánicas de Juego

### Diálogo con Sócrates
Cuando Sócrates te alcanza:
- **ARGUMENTAR**: 50% chance de éxito. Si falla, combate.
- **IGNORAR**: Pierdes 10 paciencia. Riesgo de combate.
- **HUIR**: 50% chance de escapar.

### Combate
- **ARGUMENTAR**: 50% de acertar (10-30 daño) o fallar (pierdes 5-20 paciencia)
- **IGNORAR**: Pierdes 5-15 paciencia
- **ÁNFORA**: 30 daño garantizado (uso único)
- **HUIR**: 50% chance de escapar

Sócrates ataca con:
- Preguntar "¿Qué es la justicia?"
- Cuestionar tus creencias
- Usar ironía socrática

## Assets Integrados

### Sprites de Personajes
- `assets/sprites/boy.png` - Protagonista (Boy)
- `assets/sprites/oldman.png` - Sócrates (OldMan2)
- `assets/sprites/shadow.png` - Sombras para los personajes

### Tilesets
- `assets/tilesets/floor.png` - Tiles de piso (preparado para uso futuro)
- `assets/tilesets/house.png` - Tiles de estructuras (preparado para uso futuro)

### UI
- `assets/ui/dialogbox.png` - Caja de diálogo (preparado para uso futuro)
- `assets/ui/dialogbox_simple.png` - Caja de diálogo simple (preparado para uso futuro)

**Nota**: Los tilesets y UI están copiados pero aún no integrados. El mapa actual usa rectángulos de colores con mejor estética.

## Próximos Sprints

- Sprint 2: Integrar tilesets reales para el mapa (TilesetFloor, TilesetHouse)
- Sprint 3: Sistema de objetivos y win conditions (entregar ánforas)
- Sprint 4: Múltiples NPCs y diálogos variados
- Sprint 5: Items y power-ups
- Sprint 6: Integrar cajas de diálogo del pack de UI

## Stack Tecnológico

- **Phaser 3.80.1**: Motor de juego
- **Vanilla JavaScript**: Sin frameworks adicionales
- **http-server**: Servidor local de desarrollo

## Debug

El modo debug de física está activado. Se muestran:
- Cuerpos de colisión (verde)
- Velocidades
- Bounding boxes
