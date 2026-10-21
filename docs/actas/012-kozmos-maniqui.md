# Acta · Kozmos · vuelta 12 · el maniquí en los 155 ejercicios · fase Construir → Probar

Fer quería una persona que muestre cada ejercicio en lugar de fotos. Dos bocetos: el primero (figura que se mueve en la serie, el que sigue en chico en el descanso, miniaturas en «Entrena para») le encantó y pidió algo más realista; en el segundo eligió **«Ilustrado, color de piel al azar, ropa como dijiste pero mejorarla un poco»**. Rama `claude/project-thread-985fzq`.

**Equipo**: la persona · Casandra · la tijera · la directora de arte (elegida: todo el cambio es dibujo) · la ingeniera de campo (al azar).

## Qué se construyó
- `kozmos/src/piezas/figura.js` y `.css` (`K.fig`): un cuerpo de perfil con ángulos por segmento, límites de cada articulación y del piso (`revisar`), dibujado ilustrado: piel sorteada por ejercicio (ocho tonos, siempre la misma persona para el mismo ejercicio), musculosa del color de la familia, short con franja, zapatillas con suela y medias, sombras y líneas de músculo.
- `kozmos/src/poses/` (seis archivos): las 155 poses del catálogo, con su ritmo (ida, quieto, vuelta, quieto) o su ciclo.
- Dónde aparece: en la serie, grande y moviéndose; en tramos y pruebas de estrella, arriba del anillo; en el descanso, el que sigue en chico; en la lista de un circuito y en «Entrena para», la miniatura. En horizontal, la figura va al lado del número.
- Un solo reloj a 30 cuadros que corre solo mientras la sesión corre, se queda quieto en pausa o con movimiento reducido, y se apaga cuando no queda ninguna figura.
- Pruebas: `poses-de-cada-ejercicio` (sin pantalla: las 155 sin fallas, sin faltantes ni sobrantes, SVG válido, al menos seis tonos) y `maniqui` (rutina, serie que se mueve, pausa, sin encimarse con el número ni el botón, descanso, circuito, resumen, movimiento reducido, horizontal).

## Propuestas y objeciones que cambiaron algo
- **Persona (veto)**: la vertical se leía como pararse de cabeza. Ahora la cabeza queda despegada del piso, los brazos se ven y la mano apoya plana. Los colgados parecían parados: rodillas apenas dobladas atrás, y sin piso a la vista cuando el cuerpo no llega. La doble de soga muestra la segunda vuelta; el criss-cross cruza los brazos. El nórdico muestra la mitad de la bajada en la miniatura.
- **Directora de arte**: disco centrado en el cuerpo y cortado por el piso; un solo gris para todo lo que se usa (en grafito la barra ya no es blanca); sin los puntitos del recorrido; pelo más bajo. Miniaturas recortadas al cuerpo, sin postes y con trazos más gruesos.
- **Casandra (bandera roja, bajada)**: pedía medir en gama media, que la figura se quede quieta en pausa y el circuito en el tablero. La ingeniera midió con la CPU frenada 4×: 30 cuadros sin perder ninguno, unos 7 ms de 33. La pausa y el movimiento reducido frenan el reloj (con prueba). El circuito está en el tablero. Además, las sombras de piel se calculan en JS y la ropa usa negro y blanco transparentes: nada depende de `color-mix`, que un WebView viejo no tiene.
- **Ingeniera de campo**: el reloj pedía 60 cuadros y dibujaba 30; ahora se despierta solo para dibujar. Lo fijo (disco, aparato, piso) se dibuja una vez y en cada cuadro cambia solo el cuerpo.
- **Tijera (sin cambio visible)**: exports sin uso fuera; `quieto`, `PARADO` y `CUATRO` compartidos desde el motor; `TOBILLO` en lugar de 263; banco y pared en una regla; el pelo repetido pasó a ser un sexto tono.
- **Persona (objeción, a Fer)**: las aproximaciones de perfil que dibujan otro ejercicio no valen. Lo que pasa al costado (17 ejercicios) se lo preguntamos en el tablero.

## Lo que no hay todavía
- Medir en un Android real con Chrome remoto.
- Vista de frente para lo lateral.

## Al backlog
- Vista de frente para espagat lateral, pancake, mariposa, plancha lateral, bandera, cosaca, saltos de tijera y estiramientos de costado.
- Tronco en dos piezas (gato-camello, dragon flag) y rotación de hombro.
- Miniaturas en «Hoy toca» y en la Constelación.
- Medir batería en el teléfono de Fer durante una sesión.

## Respuesta de Fer
Pendiente. Tablero https://claude.ai/artifact/QyYfQqpQ8epkRxXsAx8Q7d.
