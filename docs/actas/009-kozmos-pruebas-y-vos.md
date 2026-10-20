# Acta · Kozmos · vuelta 9 · etapa 4, pruebas y vos · fase Construir → Probar

Cuarta etapa de Kozmos: la prueba de estrella con manos libres, Progreso, Vos, calorías por sesión y el respaldo. Rama `claude/project-thread-985fzq` (sale de `main` con la etapa 3 fusionada). Todo en `kozmos/`; Entreno no se toca.

**Equipo**: la persona · Casandra · la tijera · el soberano (invitado: el respaldo saca los datos del teléfono) · la cartógrafa (al azar).

## Qué se construyó
- **Prueba de estrella** (`plan.prueba`, `K.P.prueba`): una sola serie que apunta al umbral de la estrella. Anillo que se llena hacia la marca, vibración al llegar, y al soltar se toca en cualquier lado de la pantalla. Durante «Preparate» no hay botón. Se lanza desde la constelación (Probar) o desde Hoy.
- **Ventana de prueba**: cuando una constelación del rumbo tiene marca y está al 80 % o más de su próxima estrella, Hoy la ofrece primero («Ventana abierta: probá X.»). No se abre al volver después de 21 días. Las estrellas de «sesiones» y «menos-minutos» no se prueban: se anotan.
- **Resumen de prueba**: si llegaste, el resumen de siempre con la estrella nueva; si no, «Todavía no.» con lo de esta vez y tu marca. La ✕ vuelve a donde lanzaste la prueba.
- **Progreso**: semanas en minutos, estrellas encendidas este mes, lo que se apaga y tus sesiones. Cada sesión abre su resumen; el ⋯ la borra con deshacer.
- **Vos**: Tu equipo (siete cosas; lo que falta deja estrellas punteadas que no cuentan, ni ellas ni las que dependen de ellas, y el plan no las pide), Tu peso (20 a 400 kg), Avisos (todo, solo vibración, solo sonido, nada), Tema, Respaldo y Acerca con Fuentes.
- **Calorías** (`src/sesion/calorias.js`): MET × kilos × horas, solo por sesión, redondeadas a 10, ocultas debajo de 30. El peso del día queda guardado con la sesión. Fuente: Compendio de Actividades Físicas 2011, acreditado en Acerca › Fuentes.
- **Respaldo** (`src/diario/respaldo.js`, formato en `docs/kozmos-respaldo.md`): un archivo `kozmos-respaldo_AAAA-MM-DD.json`. Guardar prueba primero compartir y si no, descarga. Traer suma lo que falta por id, cuenta lo roto, rechaza otras apps o un formato más nuevo, escribe todo en una sola transacción y se puede deshacer.
- Pruebas: 34 sin pantalla y 41 de pantallas, todas en verde (`node kozmos/pruebas/puras.mjs`, `node kozmos/pruebas/suite.mjs`).

## Propuestas y objeciones que cambiaron algo
- **Casandra (bandera roja, bajada)**: una prueba de 10 km («menos-minutos») cortada antes de tiempo encendía la estrella. Ahora esas estrellas no se prueban (con prueba). También: una sesión vencida inflaba minutos y calorías (ahora termina en su último paso, con prueba); las calorías usaban el peso de hoy (ahora el del día de la sesión); las estrellas inalcanzables sumaban al total (con prueba); Tu equipo fallaba en silencio al guardar (ahora avisa); «guardado» aparecía aunque la descarga fallara (ahora compartir primero).
- **Persona**: sin Listo durante «Preparate», datos en «Todavía no.», botones para lo que pide soga, etiquetas en las filas de sesiones, íconos propios para cada equipo, eje de semanas y lista de estrellas más clara. Se quedó «Ventana abierta» porque está en la tabla de voz que Fer aprobó.
- **Tijera**: sacó las calorías por semana y su enlace; unificó código repetido (`MIDE`, `K.pide`, `K.kg`, `K.estrella`, la regla de 30 kcal). Borrar sesión y «Lo que se apaga» se quedan: están en el prototipo aprobado.
- **Soberano**: sin dependencias nuevas; el formato del respaldo quedó documentado; el selector de archivo acepta cualquier archivo (algunos Android no ven `.json`).
- **Cartógrafa**: la ✕ de una prueba lanzada desde el cielo vuelve a la constelación; «Hoy ya entrenaste» abre la sesión en Progreso; el borrador de Tu peso se descarta al salir; Probar con una sesión abierta avisa en vez de pisarla.

## Lo que no hay todavía
- Prueba en un Android real: vibración, campana con la pantalla bloqueada, compartir y traer el respaldo desde la app instalada.
- Tus días (calendario): etapa 5.

## Al backlog
- Respaldo: validar `familia` y `encendio` de cada registro; traducir ids a nombres para quien lo lea.
- El deshacer dura lo que dura el aviso.
- Atajos entre pestañas (Tu equipo desde Hoy) vuelven a Vos, no a donde estabas.
- Horizontal: al borrar la sesión abierta se muestra la siguiente sin avisar; «Tus sesiones» queda abajo en la columna izquierda; el ⋯ no deja claro a qué lado pertenece.
- `AVISOS` está definido en dos lugares.

## Decisiones para Fer
1. OK al tablero de la etapa 4 (https://claude.ai/artifact/Y4MwrWUdHqWQDjqZCSXxT7).
2. Tu peso en Vos (se usa para calorías además de Lastre).
3. Tus días para la etapa 5.
