# Estado · Nodo Entreno

Última actualización: 2026-10-21 · la escribe quien cierra cada sesión.

## Kozmos (2026-10-20)

- Fer decidió empezar de cero una app nueva, Kozmos, en este mismo repo. Entreno sigue publicado sin cambios hasta que Fer apruebe el tablero de Kozmos.
- **Etapa 1, el esqueleto**: en `kozmos/`, PR #12, aprobado por Fer y fusionado. Acta `docs/actas/006-kozmos-esqueleto.md`. Suite propia: `node kozmos/pruebas/suite.mjs` (13 pruebas en verde).
- **Decidido por Fer (2026-10-20)**: barra en píldora con la etiqueta solo en la elegida; Kozmos se publica en un dominio propio (baja la bandera roja del mismo origen).
- **Etapa 2, el cielo de lectura**: catálogo de 14 constelaciones y 86 estrellas, Cielo, Constelación y anotar marcas a mano, guardadas en IndexedDB. PR #13, aprobado por Fer y fusionado. Acta `docs/actas/007-kozmos-cielo.md`. Pruebas: `node kozmos/pruebas/suite.mjs` (19 sin pantalla y 20 de pantallas).
- **Etapa 3, la sesión**: rumbo, plan del día, sesión guiada con relojes, isla y resumen. Diario v2 con `sesiones`. PR #14, aprobado por Fer (tablero https://claude.ai/artifact/9EP8UbgMRQKH16nkVWDYtQ) y fusionado. Acta `docs/actas/008-kozmos-sesion.md`. Pruebas: 28 sin pantalla y 31 de pantallas.
- **Decidido por Fer (2026-10-20)**: calorías en la etapa 4; las reglas del plan del día (+10 %, no repetir fuerza, 70 % al volver) quedan.
- **Etapa 4, pruebas y vos**: prueba de estrella con manos libres, ventana al 80 %, Progreso, Vos (Tu equipo, Tu peso, Avisos, Tema, Respaldo, Acerca con Fuentes), calorías por sesión y respaldo de ida y vuelta (`docs/kozmos-respaldo.md`). PR #15, aprobado por Fer (tablero https://claude.ai/artifact/Y4MwrWUdHqWQDjqZCSXxT7) y fusionado. Acta `docs/actas/009-kozmos-pruebas-y-vos.md`. Pruebas: 34 sin pantalla y 41 de pantallas.
- **Decidido por Fer (2026-10-20)**: Tu peso queda en Vos (calorías y Lastre); Tus días va en la etapa 5.
- **Etapa 5, rutinas y hazañas**: 26 rutinas y 8 hazañas en el catálogo nuevo (`docs/kozmos-rutinas.md`), superseries, tramos y circuitos en el motor, Tus días en Vos. PR #16, aprobado por Fer (tablero https://claude.ai/artifact/HV7qnWVnK9G4j5HTo2bJye) y fusionado. Acta `docs/actas/010-kozmos-rutinas-y-hazanas.md`. Pruebas: 45 sin pantalla y 48 de pantallas.
- **Decidido por Fer (2026-10-20)**: «Entrena para» queda; las rutinas con nombres de personas pasan a nombres propios (fuente al pie). Pidió usar el logo de Kozmos en animaciones y transiciones, e íconos propios de la app en lugar de genéricos (como el escudo de las hazañas): propuesta en curso.
- **Logo en movimiento e íconos propios** (2026-10-21): cuatro bocetos aprobados por Fer (logo https://claude.ai/artifact/9yfjKnVnQAzDcN2ALn57wo, barra https://claude.ai/artifact/LTVUxWbhwooBDFLuWsMSFp, estrellas https://claude.ai/artifact/RNdRys49qjdYTPU2LenJbq, píldora https://claude.ai/artifact/VnXt2dFKAHvQGEpjtiWJZ5). Construido en `kozmos/src/piezas/movimiento.js`: arranque, disco al empezar, estrella al resumen, logo girando al guardar, órbita al terminar la rutina; estrella de color por pestaña (Hoy naranja, Cielo aqua, Progreso lima), Vos en pirámide que se prende al elegirla, pantallas que giran en órbita, píldora que se desliza, menús en círculo, isla que nace del anillo, hazañas dibujadas como su constelación. Tablero https://claude.ai/artifact/8ofAENqQ61kUHsPaqy4u5Z, aprobado por Fer; PR #17 fusionado. Acta `docs/actas/011-kozmos-logo-en-movimiento.md`. Pruebas: 46 sin pantalla y 51 de pantallas.
- **Decidido por Fer (2026-10-21)**: el nombre queda solo en la pestaña elegida; el logo sale cada vez que abrís la app, corto.
- **El maniquí** (2026-10-21): Fer no aprobó la vuelta 12 y pidió mejor dibujo, más variedad y elegir la persona en Vos. Vuelta 13 (acta `docs/actas/013-kozmos-maniqui-v2.md`): dibujo nuevo estilo Bend con disco del color del entreno, mujer u hombre, nueve peinados, «La persona de los dibujos» en Vos y las 155 animaciones revisadas una por una. PR #18, **aprobado por Fer y fusionado** (https://claude.ai/artifact/QyYfQqpQ8epkRxXsAx8Q7d, versión 2). Pruebas: 47 sin pantalla y 52 de pantallas (nueva: «persona-de-los-dibujos»; «sesion-sobrevive» admite 3 s de corrimiento del reloj falso). Próximo: la vista de frente y de tres cuartos (Fer dijo que sí).
- **Las vistas** (2026-10-21): vuelta 14 (acta `docs/actas/014-kozmos-vistas.md`). Fer eligió en el boceto: mariposa desde arriba, lado lejano apenas más oscuro, solo cambian de vista los que de perfil no se entienden. 24 ejercicios con vista nueva; los demás idénticos. Pruebas: 48 sin pantalla y 52 de pantallas. **Espera el OK de Fer al tablero.**
- **Próximo**: con el OK, fusionar las vistas; después la etapa 6 (publicar con dominio propio).

## Dónde quedó

- **Publicado**: el PR #4 en GitHub Pages ([corrida 37203371846](https://github.com/nodo-ar/entreno/actions/runs/37203371846)). Incluye la marca Nodo, Nodo Sans Bold (700), los relojes en Nodo Reloj y la app sin conexión (service worker con la letra y los íconos).
- **Sin verificar en un teléfono real**: Fer todavía no confirmó que la versión publicada ande en su teléfono.
- **Kit del Equipo Nodo**: fusionado (PR #5). Los agentes y la skill `equipo-nodo` se cargan al abrir cada sesión.
- **Ítem 1 del backlog** (PR #6, rama `claude/pesos-y-esperas`, aprobado por Fer el 2026-10-05, falta fusionar):
  - chk204 y chk239 esperan la condición que miran, con topes de 10 s y 2 s. Eran fallas de tiempo, no de diseño. En la suite 10 veces seguidas, las dos pasaron 10/10.
  - Pesos de letra: los textos de 13 px o menos y la opción elegida de los segmentados en 700; lo demás en 600. Tableros en la conversación y acta en `docs/actas/001-pesos-y-esperas.md`.
  - Bandera roja de Casandra, bajada: Fer aprobó por escrito (2026-10-05, «dale para adelante con tus recomendaciones») que las opciones sin elegir de `.seg`, `.segx`, `.tseg` y `.yn` bajen de 700 a 600, que el texto chico dentro de los segmentados quede en 600 y que todo vaya en un solo PR.

## Decisiones ya tomadas por Fer (2026-10-04)

1. **chk204 y chk239**: primero averiguar por qué fallan. Si es por diseño, mostrar captura y no taparlo con una espera. Si es por tiempo, esperar la condición que miran, nunca un tiempo fijo más largo. Después, correr la suite 10 veces seguidas y reportar cuántas pasaron.
2. **Pesos de letra**: 700 para el estado elegido de los controles segmentados, los textos de 13 px o menos que eran 600 y el botón principal de cada pantalla; 600 para todo lo demás, incluidos los botones de esfuerzo sin marcar. El cambio de peso al elegir no tiene que mover nada.

## Esperando a Fer

- Fusionar el PR #6 (ítem 1, ya aprobado). Después Claude Code verifica lo publicado, prueba la vuelta atrás y escribe el registro en `docs/versiones/`.
- Que pruebe la versión publicada en su teléfono: con conexión, cerrar y abrir; después en modo avión, abrir y marcar una serie.

## Conocido en la suite

- Dependen del día: chk249, chk259, chk262, chk263 y chk274 fallan los lunes (y chk249 también los domingos), igual en `main`. Ver el ítem 2 del backlog.
- Inestables en paralelo, pasan solas: chk232, chk233, chk238, chk258 y chk264.
- chk237: pendiente para la etapa 3.

## Próximo paso

Publicar el ítem 1 (verificar en producción y escribir el registro). En curso: el ítem 2 del backlog, la suite sin depender del día (vuelta 2, rama `claude/suite-sin-dia`).
