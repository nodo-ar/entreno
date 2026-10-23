# Acta · Kozmos · vuelta 30 · sin el punto · Construir → Probar

A Fer no le gusta el punto medio «·» como separador. El boceto de la vuelta 29 (m19) probó tres caminos detrás de una bandera: A, jerarquía (lo que califica, un tono más suave); B, representación (dibujar lo que se puede dibujar); C, una raya fina. **Fer eligió B, con A para lo que no se puede dibujar**, y sumó cuatro ajustes: sacar la línea de bloques debajo de «Hoy toca» (no se gana su lugar), alinear los kilos con lo que toca en las filas, que el nombre largo de la isla pasee de punta a punta y que no quede ningún «·» a la vista. Esta vuelta es el cambio de verdad, sin bandera.

Trabajado en un árbol aparte desde `main` (22a0399), sin rama remota ni PR; los commits se pasan después a la rama del tema.

**Equipo**: la persona · Casandra · la tijera · la diseñadora (elegida: es una vuelta de cómo se ve) · el cronista (al azar) · ayudantes: el fiscal (cada uno de los 78 lugares del inventario contra el código), el pulgar (390 × 844, 360 × 740 y 844 × 390) y el relojero (la isla con el reloj falso de la suite).

## 1 · Lo que ve la persona
- **Hoy toca**: a la izquierda «Hoy toca»; a la derecha, un relojito y «60 min». Sin «6 bloques» y sin la línea de colores del boceto. La entrada en calor también lleva su relojito.
- **Las partes del día**: «Habilidad» y, un tono más suave, «descansado» («Fuerza de a dos», «Pruebas descansado»).
- **Cada fila**: lo que toca va a la derecha, en la línea del nombre (si el nombre ocupa dos renglones, en el primero), igual en todas las filas. **Los kilos van debajo, en la misma columna**, como su propia ficha: la mancuerna y «4 kg» en el color de la familia. Así «3 × 8–12» queda alineado con «3 × 3–5» de la fila de arriba.
- **Números en fila**: si son iguales se dicen como las filas, «3 × 4»; si no, con aire entre ellos («11 11 10»), sin punto. «La próxima: 3 × 4» en el resumen.
- **Para qué meta es**: cada cosa en su renglón, en el color de la familia: «Camino a Flexiones ×30» y debajo «Para Planche».
- **La próxima**: la etiqueta a la izquierda y, a la derecha, una debajo de la otra, las que siguen con el punto de su familia.
- **Tu rumbo**: «6 elegidas» a la izquierda; a la derecha, el calendario y «1–2× por semana». Si alguna pide equipo, antes dice de cuáles habla («las que podés»).
- **La sesión**: arriba, el nombre del bloque con un punto por bloque (el de ahora estirado), en vez de «Bloque 4 de 6 ·». «Serie 1 de 6» a la izquierda y «▲ nuevo» a la derecha, en el color de la familia. En la entrada en calor, «1/6» a la derecha, y debajo del nombre, la pieza y su dosis en dos renglones («Bici suave» / «2 min, sin apurarte»). Con mancuernas, «repeticiones» y la ficha de los kilos. «Sigue: Entrada en calor» con su relojito.
- **La isla**: el nombre, «▲» en el color de la familia y el reloj. **Si el nombre no entra, pasea**: espera 1,8 s, va hasta el final a 30 px por segundo, espera otra vez y vuelve. Si entra, queda quieto. Con «reducir movimiento» del teléfono, queda quieto y cortado con «…», como antes. Los bordes se esfuman del lado que queda tapado.
- **Listas de nombres en prosa**: «Front lever, Muscle-up y 4 más», «Estrellas nuevas: A y B».
- **Lo que agrega una frase va en su renglón**: «Semana de prueba» / «2 pruebas que encienden hasta 3 estrellas»; «Semana 6: la meta» / «100 flexiones seguidas»; en Planes, la prueba y debajo «Tu última: ×12 m3».
- **Categoría e ítem**: la categoría suave y el nombre en tinta («Prueba Dominadas al máximo», «Front lever Horizontal hecho bolita»).
- **Progreso**: en tus sesiones, la estrellita y cuántas al lado de los minutos; debajo de la fecha, qué fue y, más suave, «cortada».
- **Planes**: «Semana 1 la tuya» en el botón y en el menú (la tuya, más suave).
- **La ventana**: dice «Tu cosmos», no «Tu cosmos · Kozmos»; en Hoy, «Kozmos».

## 2 · Lo que cambia por dentro
- `base.js`: `K.jer` (lo que califica, más suave), `K.cat` (categoría e ítem), `K.yLista`, `K.aparte` (otro renglón), `K.pesa` (la ficha de los kilos) y `K.dur` (el relojito); íconos `reloj` y `estrella`. Estilos en `base.css` (`.q`, `.aparte`, `.dur`, `.kg`).
- `rutina.js`: `nombreDia` devuelve `[día, nombre]` (`["Día 2", "Pirámide"]`); las filas traen los kilos aparte (`kg: "6 kg"`) y lo que califica un tramo aparte (`nq: "1:30 suave"`); `K.rutina.serie` arma los números en fila.
- `dia.js`: el pie pasa a ser `proxima` (los ids; la pantalla los dibuja).
- `K.filaLn` y `K.filaToca` trabajan en HTML ya escapado; `marcas` es una lista (un renglón cada una).
- `isla.js`: la isla se arma una vez y después cambia solo el reloj y el aro, así el paseo no vuelve a empezar a cada latido. `K.isla.pasear` mide, y con `setTimeout` (como el reloj de la figura) mueve el nombre con una transición de CSS: el reloj falso de la suite lo adelanta siempre igual. `data-mq` dice el tramo (inicio, ida, fin, vuelta). Vuelve a medir si el nombre cambia, si el reloj cambia de ancho o si gira el teléfono.
- `K.menu` acepta `nota` en cada opción (lo que la califica, más suave).
- **Catálogo**: las 15 piezas de `entradas.json` y sus 966 copias en seis rutinas pasan de `"nota": "Bici suave · 2 min, sin apurarte"` a `"nota": "Bici suave", "dosis": "2 min, sin apurarte"`, con un guion de una sola vez que conserva el formato de cada archivo. `caminos.entrada` copia la dosis. El diario y el respaldo no cambian.

## Lo que difiere del pedido (y por qué)
- **Los kilos van debajo de lo que toca, no al costado.** Al costado, o la serie se corre a la izquierda (y deja de estar alineada con las filas sin kilos) o hay que reservar una columna en todas las filas de la tarjeta (y las filas sin kilos quedan corridas). Debajo, en la misma columna, la serie queda donde están todas y los kilos en el renglón de abajo, alineados a la derecha. Con nombres de dos renglones, los kilos caen en el segundo.
- **Todas las filas alinean lo que toca con el primer renglón del nombre**, no al medio: es lo que hace que los kilos y la serie queden en su lugar, y es como lo hacen las listas de Salud.
- **«minuto 3 · quedan 0:42»** pasa a prosa: «quedan 0:42 del minuto 3» (la etiqueta se actualiza cuatro veces por segundo como texto; un ícono adentro obligaba a redibujarla).
- **La entrada en calor sigue con su nombre arriba** («Bici en zona 2» o «Entrada en calor»); la pieza y su dosis van abajo, en dos renglones. Poner la pieza como título es otra decisión.
- **«Te toca»** en el día de la rutina va en tinta y el día un tono más suave («Te toca Día C»).
- **El aviso al traer un respaldo con datos rotos** dice «Trajiste 3 sesiones. 2 con datos rotos quedaron afuera».
- **Las notas de la entrada en calor son 15**, no 16: 15 piezas en `entradas.json` (más sus copias en las rutinas).

## Probar
- Sin pantalla: 106 (antes 105), en verde. Nueva: **sin-punto-medio** (el código de la app sin sus comentarios, todos los textos del catálogo y los textos que arman las funciones puras: ningún «·»; y los números en fila). Cambiadas a la forma nueva, sin aflojar: catalogo-entradas (nota y dosis, cada una corta y sin «·»), rutina-nombre-dia (`[día, nombre]`, nunca «Día» dos veces), rutina-dias-filas (el trote con su `nq`), escalera-kilos (`kg` aparte, sin kilos en `n`) y dia-rotacion (`proxima` con los ids).
- De pantallas: 99 (antes 98). La corrida completa del 22 de octubre dio 98 de 99: falló semana-de-prueba-hoy, que buscaba «más liviana» en minúscula (ahora va en su renglón, con mayúscula); corregida y corrida sola, en verde. La corrida final, ya pasada la medianoche (viernes 23), dio 98 de 99: falla **rumbo-sin-tope** en la línea de «Muscle-up pide barra», **igual en `main`** (corrida sola en 22a0399): la prueba no fija la fecha, siembra martes, jueves y sábado (`dias: [1, 3, 5]`) y el viernes Hoy dice «Hoy descansás». Las partes que cambió esta vuelta (la frecuencia de Tu rumbo) pasan antes de esa línea. `main` el 22: 98 de 98 (`m21/suite-antes.log`). Nueva: **isla-pasea** (un nombre largo espera, va a 25–35 px/s, para en la punta y vuelve; el reloj de la isla no lo reinicia; un nombre que entra queda quieto; otro largo vuelve a pasear; con «reducir movimiento», quieta y con «…»). Cambiadas a la forma nueva: hoy-molde (las partes, las metas en su renglón, el reloj de «Hoy toca», los puntos de los bloques), rumbo-sin-tope (las elegidas a la izquierda y la frecuencia a la derecha, también medido en pantalla), hoy-rota (la meta y «La próxima» con su punto), escalera-isla (el «▲» en la isla y lo que lee el lector de pantalla), escalera-resumen («La próxima: 11 11 10»), rutina-dias-nombres (además: ningún «·» en el día), rutina-dias-te-toca («Te toca Día C»; el trote con su «1:30 suave» aparte), serie-con-kilos (los kilos debajo de la serie, alineados a la derecha, con la mancuerna; la ficha en la serie; el «▲ más peso»), hazana-datos-viejos («Flexiones a ritmo Intermedio»), hoy-sin-repetir-constelacion (la constelación más suave), rutina-meta (la meta en su renglón, en Planes y en Hoy), semana-de-prueba-hoy (las pruebas en su renglón y, después, «Más liviana…» en el suyo, con mayúscula), origen-de-hoy («Front lever y Motor») y cosmos-nombre (el título de la ventana). Ninguna se debilitó ni se salteó.
- Tablero: antes (`main` 22a0399) y después, en grafito y en claro, 390 × 844 y 844 × 390, en el scratchpad (`m21/antes`, `m21/despues`): hoy, hoy-molde, hoy-pie, rumbo-pie, sesion-entrada, sesion-habilidad, sesion-fuerza (con ▲ nuevo), descanso, isla, isla-serie, isla-larga (a mitad del paseo), resumen, resumen-abajo, rutina-base_cali (los kilos alineados), rutina-cien, progreso, planes, constelacion, h-hoy y h-sesion. Sin errores de consola ni desbordes, también a 360 px (Hoy, Tu rumbo, tu cosmos, Progreso, Planes, dos rutinas y cada bloque de la sesión).

## Objeciones que cambiaron algo
- Casandra: la isla se rearmaba entera cuatro veces por segundo; un paseo con CSS volvía a empezar a cada latido → la isla cambia solo el reloj y el aro.
- Casandra: el nombre se medía antes de poner el reloj y el paseo se quedaba corto 36 px → se mide con el reloj puesto, y otra vez si el reloj cambia de ancho.
- El relojero: con `requestAnimationFrame` la prueba dependería del tiempo real → `setTimeout` para cada tramo y la transición de CSS para el movimiento.
- La persona: con los kilos al costado, «3 × 8–12» no quedaba debajo de «3 × 3–5» → debajo, en la columna.
- La tijera: `K.kg` ya existía (da formato a un número) → la ficha se llama `K.pesa`.
- El cronista: el texto que leen las pruebas y el lector de pantalla quedaba pegado («Semana de prueba2 pruebas») → un espacio entre los renglones, que en pantalla no se ve.

## Para Fer (decisiones)
1. **Los kilos debajo de lo que toca** (en la columna de la derecha) en vez de al costado. ¿OK? Recomiendo que sí: la serie queda alineada en todas las filas y en 390 px nada se aprieta.
2. **En la entrada en calor, ¿el título es la pieza?** Hoy dice «Entrada en calor» arriba y abajo «Círculos de brazos» / «30 s cada lado». Recomiendo que la pieza sea el título y «Entrada en calor» quede en la etiqueta: es lo que estás haciendo.
3. **El tono más suave en etiquetas chicas** usa `--ink-3`, que en claro tiene poco contraste (unos 2,4 : 1). ¿Lo dejamos o lo subimos un punto? Recomiendo subirlo un poco solo para `.lb .q`, sin tocar el token.

## Al backlog
- rumbo-sin-tope depende del día (falla los lunes, miércoles, viernes y domingos, también en `main`): fijarle la fecha con `conReloj`.
- La entrada en calor: ¿la pieza como título? (decisión 2).
- El contraste de lo suave en las etiquetas chicas (decisión 3).
