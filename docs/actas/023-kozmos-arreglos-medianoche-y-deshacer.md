# Acta · Kozmos · vuelta 23 · la medianoche y el deshacer · vuelta corta (Construir → Probar)

Rama `claude/project-thread-985fzq`, sin PR. Arreglos sin cambio visible: no hace falta brief ni tablero.

**Equipo**: la tijera · Casandra · ayudantes: el fiscal (una prueba por falla, que falle con el código de antes) y el estrangulador (relojes falsos para cruzar la medianoche y dormir el teléfono).

## Las fallas (del backlog, de Casandra)
1. **La fecha de Anotar pasada la medianoche**: con la app abierta, «Hoy» quedaba en ayer.
2. **Aviso y deshacer a la vez**: un aviso de error cerraba el deshacer que estaba pendiente.
3. **El deshacer dura lo que dura el aviso**: misma causa que la 2 (ver abajo).

## Por qué pasaban
1. `K.hoy()` se calcula bien cada vez, pero nadie volvía a dibujar al cambiar el día: Hoy seguía mostrando «Hoy ya entrenaste» y el plan de ayer. Y Anotar guarda su borrador con el día de cuando lo abriste, así que una marca empezada a las 23:58 se guardaba con la fecha de ayer.
2. y 3. Hay un solo lugar para los avisos de abajo, y el deshacer vivía en ese lugar: lo que ocupara el lugar (un aviso de error) se llevaba el deshacer con él. El deshacer duraba lo que durara su aviso en pantalla, no su propio tiempo.

## Construir
- **El día**: `K.alDia()` en `src/app.js` mira si cambió el día a la medianoche (un reloj que se vuelve a poner cada día), al volver a la app (el teléfono dormido no corre relojes) y justo antes de guardar una marca. Si cambió, redibuja lo que se ve y pasa al día nuevo el día de Anotar que no elegiste a mano; el que elegiste en el menú se respeta. La sesión en curso no se toca: su fecha es la de su inicio (acta 008).
- **El deshacer**: un aviso de error ya no lo cierra. El deshacer se guarda con el tiempo que le quedaba (frenado, como cuando lo tenés en foco) y vuelve cuando el aviso se va, con el anillo donde había quedado. Un aviso encima de otro tampoco se lo lleva; un deshacer nuevo sí lo reemplaza, como siempre. Escape cierra el aviso y devuelve el deshacer.
- De paso: frenar y seguir el tiempo del deshacer ya no descuentan dos veces si llegan juntos el foco y el dedo.

## Probar
- Sin pantalla: 79, sin cambios (las fallas viven en la pantalla).
- De pantallas: 88 (antes 84). Nuevas, que fallan con el código de antes: **medianoche-anotar** (el día de Anotar pasa a hoy con la app abierta y con el teléfono dormido; lo escrito queda; el día elegido se respeta), **medianoche-hoy** (Hoy cambia de día al volver a la app y a la medianoche) y **aviso-y-deshacer** (el deshacer vuelve después de uno o dos avisos, deshace, vuelve con su tiempo y su anillo, y uno nuevo nunca trae uno viejo). **medianoche-sesion-sigue** es una guarda: la sesión que cruza la medianoche sigue en el mismo paso, con lo anotado y la fecha de su inicio.
- Sin cambio visible: los avisos y el deshacer se ven igual; lo único nuevo es que el deshacer reaparece cuando antes se perdía.

## Objeciones que cambiaron algo
- Casandra: si el día de Anotar se pasa siempre a hoy, se pisa el día que elegiste → solo se pasa el que no tocaste.
- Casandra: el anillo del deshacer que vuelve arrancaba lleno aunque quedaran 2 s → vuelve donde había quedado.
- La tijera: nada de un segundo lugar de avisos ni de apilarlos (sería un cambio visible y una pieza más): el deshacer espera detrás del aviso.

## Al backlog
- Nada nuevo. Si «el deshacer dura lo que dura el aviso» quería decir que 5 s es poco, eso es diseño y lo decide Fer.
