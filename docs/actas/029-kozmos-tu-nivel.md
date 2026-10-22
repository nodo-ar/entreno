# Acta · Kozmos · vuelta 29 · Tu nivel y «Arrancás en» · Construir → Probar

Fer aprobó (2026-10-22) el nivel por cuatro preguntas, la decisión D1 (tabla conservadora, estrellas «dadas» punteadas y nunca encendidas, y una fila Tu nivel en Vos) y, para el primer día, dejar las dos guías hasta que llegara Tu nivel y ahí juntarlas. Esta vuelta es el tercero de tres PR del motor B: **Tu nivel**.

Rama `claude/project-thread-985fzq`, sin PR.

**Equipo**: la persona · Casandra · la tijera · la cartógrafa (elegida: el primer día cambia de pasos y de guía) · el animador (al azar) · ayudantes: el fiscal (cada fila de la tabla del plan contra `K.nivel`), el pulgar (Tu nivel en 390 × 844, 360 × 740 y 844 × 390, con el menú abierto) y el comparador (antes y después, en claro y grafito).

## 1 · Lo que ve la persona
- **El primer día, una sola guía**: «Que Kozmos arme tu día» lleva a **Tu equipo → Tu nivel → Tu rumbo**, con los pasos «Tu equipo · Tu nivel · Tu rumbo» arriba de cada pantalla. Hoy ya no muestra «Elegí cómo · Elegí qué · Empezá» (ni Planes el paso 2, ni Hoy el «Empezá»). La tarjeta dice «Tu equipo, tu nivel y tus constelaciones. Cada día te da lo que toca.».
- **Tu nivel**: cuatro filas con menú (como Avisos o Tema): Dominadas seguidas, Flexiones seguidas, Sentadilla a una pierna y Parada de manos. Cada menú termina en «No sé». Sin barra no se pregunta por dominadas; sin pared, por la parada de manos. Lo que no contestaste dice «Elegí», tenue. Elegir queda en la fila y guardado, sin deshacer (otro toque lo cambia). Abajo, **«Arrancás en»**: una escalerita por escalera (Tirar, Remo, Empujar, Fondos, Piernas, Isquios, L-sit) con el escalón donde arrancás; se mueve al elegir. Sin barra abajo y con «Seguir» al alcance del pulgar, igual que Tu equipo y Tu rumbo. «Seguir» sin contestar es «No sé».
- **Tu rumbo**: cada constelación que elegís y todavía no empezaste dice debajo «Arrancás en …» (el escalón del camino o la estrella). Las que no elegiste no dicen nada: menos texto.
- **Tu cosmos**: lo que tu nivel da por hecho se ve **punteado en el color de la familia, nunca encendido**, en la lista de estrellas (dice «Dada») y en el dibujo de la constelación. Arriba de la lista: «3 estrellas dadas por hechas» y, más tenue, «Por tu nivel. Se encienden cuando las hacés.». La próxima estrella es la que sigue a las dadas. Los totales («0 de 9», «Todavía sin estrellas») no cambian.
- **Vos**: fila **Tu nivel** debajo de Tu equipo, con «Sin decir» o cuántas contestaste («2 de 4»). Abre la misma pantalla, como ajuste (en horizontal, lo abierto a la derecha, con la barra quieta y sin «Listo»).
- **Hoy arranca desde tu nivel**: la fuerza y los caminos empiezan en tu escalón, y ninguna habilidad te pide una estrella dada.

## 2 · Lo que cambia por dentro
- `src/sesion/nivel.js` (`K.nivel`, puro): `PREGUNTAS`, `preguntas(equipo)`, `desde(nivel, equipo)` (escalón de arranque por escalera), `dadas(nivel, equipo)`, `efectiva(c, dadas, {fecha})` (la constelación con estado `dada` y la próxima de verdad), `aplicar(cielo, …)`, `activas`, `arrancasEn(c, {escalones, ej})`, `poner` y `respondidas`. La tabla completa está en `docs/kozmos-rutinas.md` («Tu nivel»).
- `perfil.nivel = {dominadas, flexiones, unaPierna, vertical, fecha}`. No se escriben mediciones. El respaldo lo lleva (`PERFIL.nivel`: solo respuestas que existen y una fecha válida); traerlo no pisa el que ya tenés.
- `K.cieloActual` aplica las dadas: Hoy, tu cosmos, la ventana y la semana de prueba usan la misma próxima. `K.dia.conDadas` ahora es `K.nivel.efectiva`: una sola regla.
- `K.hoyPlan` pasa `nivelDesde` y `dadas` a `K.dia.armar`.
- `K.ARMAR` suma la fila de Tu nivel; `K.GUIA` ya no existe. Rutas nuevas `#/hoy/nivel` y `#/vos/nivel`.
- Íconos nuevos: `nivel` (el escalón), `flexion` y `unapierna`.

## Cómo se juntaron las dos guías
Había dos: la de Hoy («Elegí cómo · Elegí qué · Empezá», también en Planes) y la de adentro («Tu equipo · Tu rumbo»). Quedó **una**: la de adentro, con Tu nivel en el medio. Elegir cómo empezar no es un paso, es una elección (las dos tarjetas lo dicen solas), y «Empezá» lo dice el botón Empezar. Mostrar cinco pasos («Elegí cómo · Tu equipo · Tu nivel · Tu rumbo · Empezá») no entraba en 360 px y repetía lo que ya se ve. El camino de la rutina queda sin pasos: es elegir una rutina y seguirla.

## Lo que difiere del plan (y por qué)
- **Un intento que no llega saca lo de dada solo si fue un intento a esa estrella** (anotado, o una serie que la probaba) desde la fecha de tu nivel. Las series de una escalera cuentan como marcas del ejercicio: con la regla al pie de la letra, tres series de 6 dominadas sacaban «Dominadas ×10» el primer día.
- **«La semana de prueba incluye las dadas»**: se tomó como que la semana de prueba prueba la próxima de verdad (no vuelve a probar una dada). Sale solo, porque las dadas se aplican al cosmos entero.
- **Las dadas se aplican en `K.cieloActual`**, no solo en Hoy: la constelación, Hoy y la ventana tenían que decir la misma próxima.
- **«Arrancás en …» sin dos puntos** y **solo en las elegidas sin empezar**: catorce filas con una línea más era mucho texto.
- **La tarjeta «Arrancás en» en Tu nivel** (las escaleritas) no estaba en el plan: es la forma de ver qué cambia cada respuesta sin leer.
- **Dominadas «Ninguna»**: el remo arranca en el remo del poste, el primer escalón (el remo debajo de la mesa es la alternativa del remo invertido, más arriba).
- **«Fondo si tenés paralelas»** no está en la tabla: la escalera ya usa el escalón de abajo que tu equipo permite (fondo en banco).
- **La fila de Vos dice cuántas contestaste** («2 de 4»), no una fecha: «Tu nivel · Hoy» no decía nada.

## Probar
- Sin pantalla: 112 (antes 105), en verde. Nuevas: nivel-desde, nivel-dadas, nivel-no-se, nivel-confirma, nivel-arrancas-en, respaldo-nivel y dia-con-nivel.
- De pantallas: 102 (antes 98). Nuevas: primer-dia-nivel (paso 2, cuatro menús con «No sé», sin chips ni deshacer, la escalerita sube, Hoy desde tu nivel, sin barra no pregunta por dominadas), rumbo-arrancas-en, vos-tu-nivel (fila, constelación punteada, el intento que no llega, el respaldo) y nivel-horizontal (844 × 390).
- Cambiadas porque el primer día tiene un paso más y una sola guía: **primer-dia** (Hoy y Planes sin pasos; Tu equipo 1, Tu nivel 2, Tu rumbo 3; Hoy sin guía después), **primer-dia-equipo** (los pasos son tres; volver desde Tu rumbo pasa por Tu nivel), **sin-nav-al-elegir** (también mide Tu nivel) y **sesion-entera** (pasa por Tu nivel con «Seguir»). Ninguna se debilitó ni se salteó.
- La corrida entera se cortó dos veces porque algo de afuera cerró el navegador a mitad de camino (67 en verde hasta ahí); las 35 que faltaban se corrieron aparte, todas en verde (`m20/suite.log` y `m20/suite-resto.log`).
- Tablero: antes (`main` 22a0399) y después, en grafito y en claro, 390 × 844 y 844 × 390, en el scratchpad (`m20/antes`, `m20/despues`). Sin errores de consola ni desbordes, también a 360 px.

## Objeciones que cambiaron algo
- Casandra: con «un intento corto saca la dada» al pie de la letra, entrenar sacaba lo que tu nivel dio → solo un intento a esa estrella.
- Casandra: si Hoy aplicaba las dadas y la constelación no, cada pantalla decía otra próxima → las dadas van en el cosmos entero.
- La cartógrafa: dos guías, y una de ellas con un paso («Elegí qué») que el camino de Kozmos nunca mostraba → una sola guía.
- La persona: «Elegí» en la fila vacía se leía como ya elegido → tenue.
- El animador: el menú ya nace del botón, como en Ajustes; no hace falta otro movimiento.
- La tijera: sin componentes nuevos (filas de Ajustes con `K.menu`, `K.pasos`, `K.escalerasMini`) y una sola regla de dadas.

## Para Fer (decisiones)
1. **Una sola guía el primer día** («Tu equipo · Tu nivel · Tu rumbo»), sin pasos en Hoy ni en Planes. ¿OK? Recomiendo que sí: la elección de cómo empezar ya se ve sola.
2. **«Arrancás en …» solo en las que elegís** en Tu rumbo (y mientras no las empezaste). ¿OK, o en todas las filas? Recomiendo solo en las elegidas: menos texto.
3. **Lo dado por hecho se pierde solo con un intento a esa estrella que no llega** (no con las series de entrenamiento). ¿OK? Recomiendo que sí.

## Al backlog
- Las rutinas no usan tu nivel (sus escaleras arrancan donde dice la rutina o donde estás).
- Cambiar tu nivel renueva su fecha: un intento que no llegó antes vuelve a no contar.
- En horizontal, Tu nivel deja la columna derecha vacía arriba del botón (igual que Tu equipo y Tu rumbo).
