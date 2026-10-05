# Estado · Nodo Entreno

Última actualización: 2026-10-05 · la escribe quien cierra cada sesión.

## Dónde quedó

- **Publicado: v269+7** (`fabf0d2`), registro en `docs/versiones/v269+7.md`.
  - **PR #6**: pesos de letra; chk204 y chk239 esperan la condición que miran.
  - **PR #7**: la suite corre con fecha y hora fijas.
  - Las dos publicaciones terminaron bien y la vuelta atrás quedó probada.
- **Sin verificar en un teléfono real**:
  - La URL pública no se puede abrir desde las sesiones de Claude Code: la política de red del entorno bloquea `nodo-ar.github.io`. Fer puede sumarla en «Network access» del entorno.
  - Fer todavía no confirmó que la versión publicada ande en su teléfono.
- **Kit del Equipo Nodo**: fusionado (PR #5). Los agentes y la skill `equipo-nodo` se cargan al abrir cada sesión.
- **Actas**:
  - 001: pesos y esperas; la bandera roja la bajó Fer por escrito.
  - 002: la suite no depende del día.

## Decisiones ya tomadas por Fer

- **2026-10-04**: chk204/chk239 (esperar la condición, nunca un tiempo fijo más largo) y la regla de pesos (700 para lo elegido, los textos de 13 px o menos y el botón principal; 600 para el resto).
- **2026-10-05**, aceptando las recomendaciones:
  - las opciones sin elegir de los segmentados van en 600;
  - el texto chico dentro de un segmentado queda en 600;
  - el ítem 1 iba en un solo PR.

## Esperando a Fer

- **Texto largo de la notificación de movilidad** (backlog 2). Recomendación: acortar el nombre con «…». Con el OK, brief y tablero.
- **Orden de los ítems**: si el día futuro que se pierde al girar (backlog 3) va antes o después del respaldo (backlog 1). Recomendación: después.
- **Prueba en el teléfono**: con conexión, cerrar y abrir; ver la versión v269+7 en Ajustes. Después, en modo avión, abrir y marcar una serie.

## Conocido en la suite

- Corre siempre como si fuera el jueves 2026-10-08 a las 10:00 (`tests/fecha.js`). Para otro momento: `APP_FECHA=aaaa-mm-ddThh:mm`.
- Inestables en paralelo, pasan solas: chk232, chk233, chk238, chk258 y chk264.
- chk237: pendiente para la etapa 3.

## Próximo paso

El ítem 1 del backlog: el respaldo que se puede comprobar. No cambia nada visible, salvo que haga falta arreglar algo; se trabaja con una vuelta del equipo.
