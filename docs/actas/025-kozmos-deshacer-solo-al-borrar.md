# Acta · Kozmos · vuelta 25 · el deshacer, solo al borrar · Construir → Probar

Fer pidió: «no tiene que aparecer el chip para deshacer en cada cosa que selecciono o cambio, eso hay que corregirlo en toda la app». Esta vuelta lo aplica en todas las pantallas.

Rama `claude/project-thread-985fzq`, sin PR.

**Equipo**: la persona · Casandra · la tijera · ayudantes: el fiscal (los 14 lugares que llaman a `K.deshacer`, uno por uno, contra la regla) y el comparador (antes y después en claro y grafito, 390 × 844 y 844 × 390).

## La regla
- **Con deshacer**: lo que borra, termina o reemplaza algo que deja de verse donde tocaste. Sigue valiendo «sin diálogos de confirmación: se hace la acción y se ofrece deshacer».
- **Sin deshacer**: elegir o cambiar algo que queda a la vista en el control que tocaste y que otro toque vuelve atrás (la tilde, la fila marcada, el valor en la fila).
- Los avisos de error (`K.aviso`) quedan como estaban.

Quedó escrita en `docs/REGLAS.md` y en el comentario de `kozmos/src/piezas/deshacer.js`.

## Construir: los 14 lugares
| Dónde | Qué hace | Decisión |
| --- | --- | --- |
| `hoy.js` · Tu rumbo (`K.rumboTocar`) | sumar o sacar una constelación | **Se va.** Queda la tilde en la fila; otro toque la saca. «Hasta 3» sigue avisando. |
| `hoy.js` · la ✕ de la sesión | salir o cortar la sesión | **Queda.** La sesión se termina y deja de verse. |
| `hoy.js` · Progreso | borrar una sesión | **Queda.** Borra. |
| `pantallas.js` · Tu equipo | sumar o sacar un equipo | **Se va.** Tilde en la fila. |
| `pantallas.js` · Tus días | sumar o sacar un día | **Se va.** Tilde en la fila. |
| `pantallas.js` · Tu peso | guardar el peso | **Se va.** El peso nuevo se ve en su fila de Vos. |
| `pantallas.js` · Respaldo | traer un respaldo | **Queda.** Suma sesiones y marcas que no se ven ahí. |
| `pantallas.js` · La persona de los dibujos | elegir un rasgo | **Se va.** La fila dice lo elegido. |
| `pantallas.js` · Avisos | elegir cómo avisa | **Se va.** La fila dice lo elegido. |
| `pantallas.js` · Tema | elegir el tema | **Se va.** Se ve al instante y la fila lo dice. |
| `cielo.js` · Anotar una marca | guardar la marca | **Queda.** Guarda un dato y el formulario se cierra. |
| `cielo.js` · borrar una marca | borrar | **Queda.** Borra. |
| `rutinas.js` · seguir una rutina | empezar una (y reemplazar la que tenías) | **Queda.** Reemplaza y te lleva a Hoy. |
| `rutinas.js` · dejar la rutina | dejarla | **Queda.** Termina la rutina. |

Siete se van y siete quedan. Donde se fue el deshacer, el estado elegido ya se veía (tilde y `aria-pressed` en las filas de rumbo, equipo y días; el valor en las filas de Vos), así que no hubo que sumar nada. De paso se simplificaron `K.equipoTocar`, `K.diaTocar`, `K.pesoListo`, `K.cambiarTema` y los menús de persona y avisos: ya no guardan el «antes».

## Probar
- Sin pantalla: 80, en verde.
- De pantallas: 90 (antes 89), en verde. Ninguna se salteó.
  - Nueva: **sin-deshacer-al-elegir**: sumar y sacar del rumbo, sacar y sumar equipo, elegir un día, cambiar el tema, los avisos y guardar el peso no muestran deshacer, y lo elegido se ve en el control. Borrar una marca sigue ofreciendo deshacer y deshace.
  - Cambiadas, porque esperaban un deshacer al elegir: **menu-y-deshacer** (el tema ya no lo ofrece; volver atrás es elegir otro; Escape en un menú y el foco siguen probados con un deshacer de borrar), **tu-equipo** (sin deshacer; otro toque devuelve la soga), **persona-de-los-dibujos** (sin deshacer; volver es elegir de nuevo) y **aviso-y-deshacer** (el deshacer ahora es el de borrar; el aviso sigue siendo el «Hasta 3» del rumbo; prueba lo mismo que antes).
- Tablero: capturas antes y después en grafito y en claro en el scratchpad (`m15/antes` y `m15/despues`, mismos nombres): Tu rumbo, Tu equipo y el tema un segundo después del toque, el Cielo después de borrar una marca (el deshacer sigue), inicio, sesión en curso, serie con descanso, isla, resumen y Tu rumbo en horizontal (844 × 390) después de un toque.

## Objeciones que cambiaron algo
- La persona: en Tu rumbo el deshacer tapaba el botón «Listo» justo cuando ibas a tocarlo → sin deshacer, «Listo» queda libre.
- Casandra: sacar el deshacer de una elección no puede dejar a nadie sin saber qué pasó → se revisó cada control: todos muestran lo elegido; la prueba nueva lo comprueba.
- Casandra: Anotar una marca y seguir una rutina no borran nada, pero lo que hiciste deja de verse (el formulario se cierra, pasás a Hoy) → quedan con deshacer.
- La tijera: nada de un aviso «Guardado» en su lugar; la tilde ya lo dice.

## Para Fer (decisiones)
1. **Anotar una marca** sigue con deshacer (guarda un dato y te saca del formulario). ¿Te cierra o lo querés sin?
2. **Seguir una rutina** sigue con deshacer aunque no tuvieras otra (te lleva a Hoy). ¿Queda?
3. **Tu peso** ya no ofrece deshacer: el valor nuevo queda en su fila de Vos. ¿OK?

## Al backlog
- Nada nuevo.
