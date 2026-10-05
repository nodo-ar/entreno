# Estado · Nodo Entreno

Última actualización: 2026-10-05 · la escribe quien cierra cada sesión.

## Dónde quedó

- **Publicado**: el PR #4 en GitHub Pages ([corrida 37203371846](https://github.com/nodo-ar/entreno/actions/runs/37203371846)). Incluye la marca Nodo, Nodo Sans Bold (700), los relojes en Nodo Reloj y la app sin conexión (service worker con la letra y los íconos).
- **Sin verificar en un teléfono real**: Fer todavía no confirmó que la versión publicada ande en su teléfono.
- **Kit del Equipo Nodo**: PR #5 (`equipo-nodo/kit`), abierto. Claude Code no lo pudo fusionar porque el control de permisos de la sesión no le deja fusionar sin revisión: lo fusiona Fer.
- **Ítem 1 del backlog** (rama `claude/pesos-y-esperas`, PR propio, sin fusionar ni publicar):
  - chk204 y chk239 esperan la condición que miran, con topes de 10 s y 2 s. Eran fallas de tiempo, no de diseño. En la suite 10 veces seguidas, las dos pasaron 10/10.
  - Pesos de letra: los textos de 13 px o menos y la opción elegida de los segmentados en 700; lo demás en 600. Tableros en la conversación y acta en `docs/actas/001-pesos-y-esperas.md`.
  - Casandra tiene una bandera roja abierta: la bajada a 600 de las opciones sin elegir de `.seg`, `.segx`, `.tseg` y `.yn`, que eran 700. El tablero extra ya la muestra; falta que Fer la apruebe por escrito.

## Decisiones ya tomadas por Fer (2026-10-04)

1. **chk204 y chk239**: primero averiguar por qué fallan. Si es por diseño, mostrar captura y no taparlo con una espera. Si es por tiempo, esperar la condición que miran, nunca un tiempo fijo más largo. Después, correr la suite 10 veces seguidas y reportar cuántas pasaron.
2. **Pesos de letra**: 700 para el estado elegido de los controles segmentados, los textos de 13 px o menos que eran 600 y el botón principal de cada pantalla; 600 para todo lo demás, incluidos los botones de esfuerzo sin marcar. El cambio de peso al elegir no tiene que mover nada.

## Esperando a Fer

- Fusionar el PR #5 (kit).
- En el PR del ítem 1:
  - aprobar o no, por escrito, que las opciones sin elegir de los segmentados bajen de 700 a 600 (baja la bandera roja);
  - decidir si los textos chicos dentro de los segmentados (`.seg button small`, `.ritmos small`) siguen la elección o quedan en 600;
  - decidir si queda en un PR o se separan las pruebas;
  - dar el OK al tablero.
- Que pruebe la versión publicada en su teléfono: con conexión, cerrar y abrir; después en modo avión, abrir y marcar una serie.

## Conocido en la suite

- Dependen del día: chk249, chk259, chk262, chk263 y chk274 fallan los lunes (y chk249 también los domingos), igual en `main`. Ver el ítem 2 del backlog.
- Inestables en paralelo, pasan solas: chk232, chk233, chk238, chk258 y chk264.
- chk237: pendiente para la etapa 3.

## Próximo paso

Con el OK de Fer al ítem 1: fusionar, publicar y escribir el registro en `docs/versiones/`. Después, el ítem 2 del backlog (la suite sin depender del día).
