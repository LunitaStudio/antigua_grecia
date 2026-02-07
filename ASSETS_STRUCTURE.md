# Estructura del Pack Ninja Adventure

## Resumen

El pack Ninja Adventure incluye assets pixel art con licencia CC0 (uso libre, incluso comercial).

## Estructura de Carpetas

```
Ninja Adventure - Asset Pack/
├── Actor/
│   ├── Animals/          # Animales (gatos, perros, caballos, etc.)
│   ├── Boss/             # Jefes finales (dragones, gigantes, etc.)
│   └── Characters/       # Personajes jugables y NPCs
│       ├── Boy           ✅ USADO (protagonista)
│       ├── OldMan2       ✅ USADO (Sócrates)
│       ├── Villager (1-5)
│       ├── Child
│       ├── Woman
│       ├── Noble
│       ├── Monk (1-2)
│       ├── Master
│       └── [muchos más...]
│
├── Backgrounds/
│   ├── Animated/         # Fondos animados
│   ├── Tilesets/         # ✅ Tilesets para mapas
│   │   ├── TilesetFloor.png      ✅ COPIADO
│   │   ├── TilesetHouse.png      ✅ COPIADO
│   │   ├── TilesetDesert.png
│   │   ├── TilesetNature.png
│   │   ├── TilesetWater.png
│   │   └── [más tilesets...]
│   └── Vehicles/         # Vehículos
│
├── Items/                # Items y objetos del mundo
│   ├── Food/
│   ├── Potion/
│   ├── Weapons/
│   └── [más categorías...]
│
├── Ui/                   # ✅ Elementos de interfaz
│   ├── Dialog/           # ✅ Cajas de diálogo
│   │   ├── DialogBox.png         ✅ COPIADO
│   │   ├── DialogueBoxSimple.png ✅ COPIADO
│   │   ├── ChoiceBox.png
│   │   └── [más...]
│   ├── Emote/            # Emoticonos
│   ├── Font/             # Fuentes pixel
│   ├── Input/            # Controles de input
│   └── Theme/            # Temas de UI
│
├── FX/                   # Efectos visuales
│   ├── Particle/
│   ├── Magic/
│   └── [más categorías...]
│
└── Audio/                # Sonidos y música
    ├── Music/
    └── Sounds/
```

## Formato de Spritesheets de Personajes

### Dimensiones
- Cada sprite: **16x16 píxeles**
- Spritesheet completo: **64x112 píxeles** (4 columnas x 7 filas)

### Estructura del Spritesheet
```
Fila 0-3:   Walk Down  (frames 0-3)
Fila 4-7:   Walk Left  (frames 4-7)
Fila 8-11:  Walk Right (frames 8-11)
Fila 12-15: Walk Up    (frames 12-15)
```

Cada fila tiene 4 frames:
- Frame 0: Idle (pie izquierdo)
- Frame 1: Walk ciclo
- Frame 2: Idle (pies juntos)
- Frame 3: Walk ciclo

### Animaciones Creadas en Phaser

Para cada personaje (`boy`, `oldman`):
- `{key}_walk_down` - Caminar hacia abajo
- `{key}_walk_left` - Caminar a la izquierda
- `{key}_walk_right` - Caminar a la derecha
- `{key}_walk_up` - Caminar hacia arriba
- `{key}_idle_down` - Quieto mirando abajo
- `{key}_idle_left` - Quieto mirando izquierda
- `{key}_idle_right` - Quieto mirando derecha
- `{key}_idle_up` - Quieto mirando arriba

## Personajes Disponibles para Futuros Sprints

### NPCs Civiles (ideal para aldeanos griegos)
- `Villager` (1-5) - Aldeanos genéricos
- `Child` - Niño
- `Woman` - Mujer
- `OldWoman` - Mujer anciana
- `OldMan` (1-3) - Hombres ancianos
- `Noble` - Noble/aristocrata

### NPCs Especiales
- `Monk` (1-2) - Monje (podría ser filósofo)
- `Master` - Maestro
- `Shaman` - Chamán
- `Inspector` - Inspector

### Mercaderes/Oficios
- `Hunter` - Cazador
- `Sultan` (1-2) - Sultán (comerciante rico)

### Guerreros/Guardias (para antagonistas o guardias)
- `Knight` - Caballero
- `GladiatorBlue` - Gladiador
- `RedGladiator` - Gladiador rojo
- `Samurai` - Samurái

## Assets Copiados a /assets/

### ✅ Actualmente en Uso
- `sprites/boy.png` - Protagonista alfarero
- `sprites/oldman.png` - Sócrates
- `sprites/shadow.png` - Sombras

### ✅ Preparados para Uso Futuro
- `tilesets/floor.png` - Tiles de piso
- `tilesets/house.png` - Tiles de edificios
- `ui/dialogbox.png` - Caja de diálogo
- `ui/dialogbox_simple.png` - Caja simple

## Próximas Integraciones Recomendadas

### Sprint 2: Mapa con Tilesets Reales
1. Crear tilemap con Phaser usando `TilesetFloor.png`
2. Agregar detalles con `TilesetHouse.png`
3. Usar tiles para crear columnas y puestos más detallados

### Sprint 3: UI Mejorada
1. Reemplazar cajas de diálogo con `DialogBox.png`
2. Agregar emoticonos de `Ui/Emote/` para NPCs
3. Mejorar menú de combate con assets de `Ui/Theme/`

### Sprint 4: Más NPCs
1. Agregar `Villager` (1-5) como ciudadanos del ágora
2. Agregar `Woman` y `Child` para vida en la ciudad
3. Posible `Monk` como segundo filósofo

### Sprint 5: Items
1. Integrar ánforas desde `Items/`
2. Agregar items recogibles (comida, pociones)

## Notas de Licencia

**Creative Commons Zero (CC0)**
- Uso libre sin restricciones
- No requiere atribución (pero se aprecia)
- Puede usarse en proyectos comerciales

Créditos recomendados:
- [Pixel-boy](https://pixel-boy.itch.io/)
- [AAA](https://www.instagram.com/challenger.aaa/)
- [Pack completo](https://pixel-boy.itch.io/ninja-adventure-asset-pack)
