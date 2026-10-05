# Estado · Nodo Entreno

Última actualización: 2026-10-04 · la escribe quien cierra cada sesión.

## Dónde quedó

- **Publicado**: el PR #4 en GitHub Pages ([corrida 37203371846](https://github.com/nodo-ar/entreno/actions/runs/37203371846)). Incluye la marca Nodo, Nodo Sans Bold (700), los relojes en Nodo Reloj y la app sin conexión (service worker con la letra y los íconos).
- **Sin verificar en un teléfono real**: Fer todavía no confirmó que la versión publicada ande en su teléfono.
- **Rama**: `claude/modest-brahmagupta-x4r8oz` quedó igual a `main`. Todo lo nuevo va en una rama nueva y un PR nuevo.

## Decisiones ya tomadas por Fer (2026-10-04)

1. **chk204 y chk239**: primero averiguar por qué fallan. Si es por diseño (por ejemplo, en horizontal 844 × 390 algo no entra con la Bold), mostrar captura y no taparlo con una espera. Si es por tiempo, esperar la condición que miran (que la ficha termine de cargar, que termine el desplazamiento), nunca un tiempo fijo más largo. Después, correr la suite 10 veces seguidas y reportar cuántas pasaron.
2. **Pesos de letra**: 700 para el estado elegido de los controles segmentados (por ejemplo, el botón de esfuerzo marcado), los textos de 13 px o menos que eran 600 y el botón principal de cada pantalla; 600 para todo lo demás, incluidos los botones de esfuerzo sin marcar. El cambio de peso al elegir no tiene que mover nada.

## Esperando a Fer

- Que pruebe la versión publicada en su teléfono: con conexión, cerrar y abrir; después en modo avión, abrir y marcar una serie.

## Próximo paso

El ítem 1 del backlog (`docs/BACKLOG.md`).
