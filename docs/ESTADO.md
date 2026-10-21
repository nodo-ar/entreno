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
- **Próximo**: la vuelta de las vistas de frente y de tres cuartos del maniquí; después la etapa 6 (publicar con dominio propio).

## Dónde quedó

- **Publicado: v269+7** (`fabf0d2`), registro en `docs/versiones/v269+7.md`.
  - **PR #6**: pesos de letra; chk204 y chk239 esperan la condición que miran.
  - **PR #7**: la suite corre con fecha y hora fijas.
  - Las dos publicaciones terminaron bien y la vuelta atrás quedó probada.
- **Verificado en el teléfono de Fer** (2026-10-05): «funciona todo perfecto». Desde las sesiones de Claude Code la URL pública no se puede abrir: la política de red del entorno bloquea `nodo-ar.github.io`.
- **Kit del Equipo Nodo**: fusionado (PR #5). Los agentes y la skill `equipo-nodo` se cargan al abrir cada sesión.
- **Actas**:
  - 001: pesos y esperas; la bandera roja la bajó Fer por escrito.
  - 002: la suite no depende del día.

## Decisiones ya tomadas por Fer

- **2026-10-04**: chk204/chk239 (esperar la condición, nunca un tiempo fijo más largo) y la regla de pesos (700 para lo elegido, los textos de 13 px o menos y el botón principal; 600 para el resto).
- **2026-10-05**, aceptando las recomendaciones:
  - las opciones sin elegir de los segmentados van en 600;
  - el texto chico dentro de un segmentado queda en 600;
  - el ítem 1 iba en un solo PR;
  - el texto largo de la notificación de movilidad se acorta con «…» (backlog 2);
  - el día futuro que se pierde al girar va después del respaldo (backlog 3).
- **Regla general (2026-10-05)**: seguir las recomendaciones de Claude Code siempre que respeten el foco de las apps (modernas, sobrias y coherentes con el resto de la app). Los cambios que se ven igual llevan tablero antes de publicar.

## Esperando a Fer

- Nada por ahora.

## Conocido en la suite

- Corre siempre como si fuera el jueves 2026-10-08 a las 10:00 (`tests/fecha.js`). Para otro momento: `APP_FECHA=aaaa-mm-ddThh:mm`.
- Inestables en paralelo, pasan solas: chk232, chk233, chk238, chk258 y chk264.
- chk237: pendiente para la etapa 3.

## Próximo paso

El ítem 1 del backlog: el respaldo que se puede comprobar (vuelta 3). Después, el texto largo de la notificación (con tablero).
