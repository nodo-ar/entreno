# Estado · Nodo Entreno

Última actualización: 2026-10-20 · la escribe quien cierra cada sesión.

## Dónde quedó

- **Publicado**: v269+8 · `28f875c`, el PR #9 (respaldo que se puede comprobar, backlog 3), en GitHub Pages el 2026-10-20 ([corrida 39467598041](https://github.com/nodo-ar/entreno/actions/runs/39467598041)). Registro en `docs/versiones/v269+8.md`, con la vuelta atrás probada.
- **Antes, también publicados**: el PR #6 (pesos de letra y esperas, ítem 1) y el PR #7 (la suite no depende del día, ítem 2).
- **Sin verificar en la página publicada**: el entorno de Claude no llega a `nodo-ar.github.io`. La verificación queda para Fer en el teléfono, o para una sesión con ese dominio permitido en la red del entorno.
- **Kit del Equipo Nodo**: fusionado (PR #5). Los agentes y la skill `equipo-nodo` se cargan al abrir cada sesión.

## Decisiones ya tomadas por Fer (2026-10-04)

1. **chk204 y chk239**: primero averiguar por qué fallan. Si es por diseño, mostrar captura y no taparlo con una espera. Si es por tiempo, esperar la condición que miran, nunca un tiempo fijo más largo. Después, correr la suite 10 veces seguidas y reportar cuántas pasaron.
2. **Pesos de letra**: 700 para el estado elegido de los controles segmentados, los textos de 13 px o menos que eran 600 y el botón principal de cada pantalla; 600 para todo lo demás, incluidos los botones de esfuerzo sin marcar. El cambio de peso al elegir no tiene que mover nada.

## Esperando a Fer

- Que pruebe la versión publicada (v269+8) en su teléfono: abrir con conexión; si ve la versión vieja, cerrar la app del todo y abrirla de nuevo. Después, en modo avión, abrir y marcar una serie. Si quiere, exportar e importar un respaldo.
- Decidir las ideas que dejó la vuelta 3: fotos en el respaldo y exportar todos los perfiles juntos.

## Conocido en la suite

- Inestables en paralelo, pasan solas: chk232, chk233, chk238, chk258 y chk264. chk276 ya espera el aviso (no un tiempo fijo); con mucha carga falló 1 de 22 veces.
- chk237: anotada como pendiente para la etapa 3; en las dos vueltas del 2026-10-20 pasó.

## Próximo paso

El ítem 4 del backlog: APK con publicación automática.
