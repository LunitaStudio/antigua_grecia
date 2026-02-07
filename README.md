# Antigua Grecia RPG 🏛️

Juego RPG top-down cómico donde sos un alfarero griego que debe cruzar el ágora de Atenas para entregar ánforas, pero Sócrates te persigue con preguntas filosóficas.

## 🎮 Estado Actual: Sprint 1.5 Completo

### Win Condition Implementada
**Objetivo**: Llevá el ánfora desde la calle izquierda hasta el cliente (NPC con `!`) en la calle derecha, esquivando a Sócrates en la plaza central.

---

## ✨ Características Implementadas

### 🗺️ Mapa de 3 Zonas (40x18 tiles)

```
[════════════════════════════════════════]
║  Calle     ║        Plaza         ║ Calle    ║
║  Izquierda ║       Central        ║ Derecha  ║
║  (spawn)   ║     (Sócrates)       ║ (cliente)║
║            ║  ◆ columnas          ║    !     ║
║            ║  ■ puestos mercado   ║          ║
[════════════════════════════════════════]
```

**Zonas:**
- **Calle Izquierda** (tiles 0-7): Pasillo angosto donde spawnea el jugador - zona segura
- **Plaza Central** (tiles 8-28): Ágora amplia con obstáculos, Sócrates patrulla aquí
- **Calle Derecha** (tiles 29-39): Pasillo angosto hacia el objetivo final

**Cámara:**
- Sigue al jugador suavemente con lerp 0.1
- UI fija a la cámara (no se mueve con el scroll)
- Bounds del mundo: 1280x576 píxeles

### 👤 Protagonista (Sprite Animado)

- **Sprite**: Boy del pack Ninja Adventure
- **Animaciones**: Walk 4 direcciones + idle (8 animaciones totales)
- **Movimiento**: WASD o flechas (150 px/s)
- **Sombra**: Dinámica que sigue al personaje
- **Stats**: Paciencia 100 pts
- **Colisiones**: Con obstáculos y bordes
- **Spawn**: Calle izquierda (tile 4, 9)

### 🧙 Sócrates NPC (IA con State Machine)

- **Sprite**: OldMan2 del pack Ninja Adventure
- **Patrulla Limitada**: Solo se mueve en la plaza (tiles 8-28)
- **Estados Visuales** (cambio de color con tint):
  - Sin color: IDLE (wandering aleatorio)
  - Amarillo: DETECT (te vio)
  - Rojo: PURSUE (te persigue)
  - Magenta: ENGAGE (te alcanzó)
- **Comportamiento Inteligente**:
  - Si salís de la plaza → vuelve a IDLE
  - No puede salir de sus bounds
  - Patrulla aleatoria cuando está idle
- **Velocidad**: 100 px/s (más lento que el jugador)
- **Radio de detección**: 200 px
- **Radio de engagement**: 40 px
- **Spawn**: Centro de la plaza (tile 18, 9)

### 🎯 Cliente NPC (Win Condition)

- **Sprite**: Villager del pack Ninja Adventure
- **Ubicación**: Final de la calle derecha (tile 37, 9)
- **Indicador**: `!` flotante con animación bounce
- **Interacción**: Al tocarlo → pantalla de victoria
- **Victoria**:
  - Mensaje: "¡Entrega completada! Gracias por el ánfora."
  - Diálogo del cliente
  - Botón "Jugar de Nuevo" para reiniciar

### 💬 Sistema de Diálogo

Se activa cuando Sócrates te alcanza (estado ENGAGE):
- **Pausa la física** mientras dialogás
- **Opciones**:
  - ARGUMENTAR: 50% éxito (Sócrates se aleja) / 50% entra en combate
  - IGNORAR: -10 paciencia, 40% chance de combate después
  - HUIR: 50% éxito / 50% falla y puede iniciar combate
- **UI**: Fija a la cámara, siempre visible

### ⚔️ Combate por Turnos (Estilo Pokémon)

**Acciones del Jugador:**
- **ARGUMENTAR**: 50% acierta (10-30 daño) / 50% falla (-5-20 paciencia)
- **IGNORAR**: -5-15 paciencia
- **ÁNFORA**: 30 daño garantizado (uso único - solo 1 por partida)
- **HUIR**: 50% chance de escapar y volver al juego

**Ataques de Sócrates (aleatorios):**
- "¿Qué es la justicia?" (10-25 daño a paciencia)
- Cuestiona tus creencias (10-25 daño)
- Ironía socrática (10-25 daño)

**Condiciones:**
- **Victoria**: Sócrates llega a 0 pesadez → vuelve al juego
- **Derrota**: Jugador llega a 0 paciencia → reinicia la escena completa
- **Log de combate**: Muestra las últimas 4 acciones

### 🎨 UI & Controles

**Controles:**
- **WASD / Flechas**: Mover al alfarero
- **Mouse**: Seleccionar opciones de diálogo/combate

**UI Permanente (Fixed a cámara):**
- **Instrucciones** (superior izquierda)
- **Stats Panel** (superior derecha):
  - Paciencia del jugador
  - Pesadez de Sócrates
  - Estado actual de Sócrates
- **Depth optimizado**: Todos los elementos UI por encima del debug de física

---

## 🚀 Cómo Ejecutar

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm start
```

El juego se abre automáticamente en **http://localhost:8080**

---

## 📂 Estructura del Proyecto

```
antigua_grecia/
├── assets/
│   ├── sprites/
│   │   ├── boy.png          # Protagonista
│   │   ├── oldman.png       # Sócrates
│   │   ├── villager.png     # Cliente NPC
│   │   └── shadow.png       # Sombras
│   ├── tilesets/
│   │   ├── floor.png        # (preparado para Sprint 2)
│   │   └── house.png        # (preparado para Sprint 2)
│   └── ui/
│       ├── emotes/
│       │   └── exclamation.png  # Indicador !
│       ├── dialogbox.png    # (preparado)
│       └── dialogbox_simple.png # (preparado)
│
├── src/
│   ├── config.js            # Constantes globales (zonas, spawns, velocidades)
│   ├── main.js              # Entry point
│   ├── entities/
│   │   ├── Player.js        # Clase del jugador con animaciones
│   │   ├── Socrates.js      # IA de Sócrates con state machine
│   │   └── ClientNPC.js     # Cliente objetivo (win condition)
│   ├── systems/
│   │   ├── DialogSystem.js  # Sistema de diálogos (fixed a cámara)
│   │   └── CombatSystem.js  # Lógica de combate por turnos
│   └── scenes/
│       ├── BootScene.js     # Carga de assets y creación de animaciones
│       ├── GameScene.js     # Escena principal con mapa de 3 zonas
│       ├── CombatScene.js   # Escena de combate
│       └── DialogScene.js   # (reservada para futuro)
│
├── index.html
├── package.json
├── README.md
├── ASSETS_STRUCTURE.md      # Documentación del pack Ninja Adventure
└── .gitignore
```

---

## 🎯 Cómo Jugar

1. **Inicio**: Spawneas en la calle izquierda (zona segura)
2. **Objetivo**: Llegar al NPC con `!` en la calle derecha
3. **Obstáculo**: Cruzar la plaza donde Sócrates patrulla
4. **Estrategia**:
   - Usá las columnas y puestos como cobertura
   - Sócrates es más lento que vos
   - Si te alcanza, podés intentar HUIR o ARGUMENTAR
   - Las calles son zonas seguras (Sócrates no puede entrar)
5. **Victoria**: Tocá al cliente para completar la entrega

---

## 🔧 Stack Tecnológico

- **Phaser 3.80.1**: Motor de juego HTML5
- **Vanilla JavaScript ES6**: Sin frameworks adicionales
- **Ninja Adventure Asset Pack**: Sprites pixel art (CC0 license)
- **http-server**: Servidor local de desarrollo

---

## 🐛 Debug

Podés activar/desactivar opciones de debug en `src/config.js`:

```javascript
const DEBUG_MODE = {
    physics: false,  // Cambiar a true para ver hitboxes (verde)
    showFPS: false,  // Cambiar a true para ver contador de FPS
    logStates: true  // Cambiar a false para ocultar logs en consola
};
```

**Debug Physics** muestra:
- Cuerpos de colisión (hitboxes en verde)
- Velocidades y direcciones
- Bounding boxes de todos los objetos

**Show FPS**: Contador de frames por segundo en la esquina inferior izquierda

**Log States**: Mensajes en consola sobre cambios de estado de Sócrates y eventos del juego

---

## 📋 Próximos Sprints

- **Sprint 2**: Tilesets reales con Phaser Tilemaps
- **Sprint 3**: Múltiples niveles y dificultad progresiva
- **Sprint 4**: Más NPCs (ciudadanos, otros filósofos)
- **Sprint 5**: Sistema de items y power-ups
- **Sprint 6**: Diálogos más variados y narrativa
- **Sprint 7**: Música y efectos de sonido

---

## 📜 Licencia

Este proyecto usa el **Ninja Adventure Asset Pack** bajo licencia CC0 (dominio público).

**Créditos a:**
- [Pixel-boy](https://pixel-boy.itch.io/)
- [AAA](https://www.instagram.com/challenger.aaa/)
- [Pack completo](https://pixel-boy.itch.io/ninja-adventure-asset-pack)

---

## 🎓 Notas de Desarrollo

### Cambios Recientes (Sprint 1.5)

✅ Mapa expandido de 25x18 a 40x18 tiles
✅ Diseño de 3 zonas (2 calles + plaza)
✅ Cámara que sigue al jugador
✅ Win condition implementada (NPC cliente)
✅ Sócrates limitado a la plaza
✅ UI fixed a cámara con depth correcto
✅ Sistema de victoria con "Jugar de Nuevo"

### Conocidos Issues

- El mapa usa placeholders de colores (no tilesets reales aún)
- Un solo nivel por ahora
- Sin música ni SFX

---

¡Divertite esquivando a Sócrates! 🏃‍♂️💨🧙
