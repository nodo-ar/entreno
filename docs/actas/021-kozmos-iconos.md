# Acta · Kozmos · vuelta 21 · los íconos · Pensar → Investigar → Construir → Probar

Fer aprobó la dirección del boceto de la vuelta 17 (backlog «Íconos nuevos»): en grande, el asterismo de la habilidad; en chico, el pictograma del maniquí. Hasta ahora las 26 rutinas compartían un punto de color, las constelaciones salían de un sorteo con su nombre y las pruebas dibujaban constelaciones reales que no decían nada del desafío.

Rama `claude/project-thread-985fzq`, sin PR.

**Equipo**: la persona · Casandra · la tijera · la directora de arte (elegida: es un cambio de oficio visual en casi todas las pantallas) · la tesorera (azar, `node tools/elegir-equipo.mjs entreno 21 directora-de-arte`) · ayudantes: el fiscal (cada ícono contra los datos, en pruebas puras), el comparador (antes y después en claro y grafito) y el estrangulador (cuánto tarda en armarse todo).

## Pensar
- **La persona**: en Planes, «¿cuál era la de bici con intervalos cortos?». Hoy todas las filas tienen el mismo punto: hay que leer los 26 nombres. Con la figura haciendo lo suyo y la forma de su semana, se encuentra de un vistazo.
- **Directora de arte**: tres cosas. (1) La figura en una sola tinta y el color de la familia en el marco: así el ícono no compite con el texto. (2) El asterismo en grande sobre un disco apenas más claro, como una medalla; sin disco, una pose vertical (dominada, soga) queda como un palito suelto en la cabecera. (3) La columna del ícono en las filas crece con él: el nombre no se pega (ya pasaba con la persona de «Entrena para»).
- **Casandra**: el riesgo es que dos cosas se vean iguales. Seis rutinas son de bici, dos de trote y tres van a la dominada: con la pose sola no alcanza. Y que se calcule todo en cada pantalla en un Android de gama media.
- **La tijera**: fuera de esta vuelta: dibujos nuevos de ejercicios, cambiar nombres, animar los íconos en las filas, tocar el Cielo más allá del dibujo de cada constelación.
- **Tesorera**: nada que mantener a mano. Si cada ícono sale de los datos, una rutina nueva trae su ícono sin que nadie lo dibuje: cero horas por mes. Lo caro sería una lista de poses por id.

## Investigar · de dónde sale cada ícono (sin nombrar ningún id en el código)
| Qué | Pose | Marco (chico) | Estrellas (grande) |
| --- | --- | --- | --- |
| Constelación | la de su estrella final | el anillo de avance que ya tenía la fila del Cielo | una por estrella, con su estado (encendida, próxima, por delante) |
| Prueba | la de lo que mide (`mide.ejercicio`) | por cómo se mide: círculo (al máximo), hexágono (cada minuto), cuadrado redondeado (contra el reloj) | cinco, una por magnitud; encendidas hasta la tuya |
| Rutina | lo que más series lleva; de una escalera, el escalón de la estrella más difícil que alimenta («Entrena para»), si no el último. Sin series (motor), lo que más tiempo se hace: el ejercicio del tramo, o bici, trote o soga | la vuelta de su semana típica (la de carga del medio): un tramo por día; lo fuerte grueso en el color de la familia, lo suave fino, las pausas vacías | una por semana; si la seguís, encendidas las que hiciste |

- **Cámara**: el asterismo usa la vista del ejercicio; si de perfil se juntan tantas articulaciones que no alcanzan para las estrellas, gira a tres cuartos o de frente. Lo decide la pose, no una lista.
- **Lo que quedó**: 14 poses distintas para las constelaciones; las 8 pruebas distintas por pose o marco (Dominadas al máximo y Dominadas minuto a minuto: la misma pose, círculo y hexágono); las 26 rutinas distintas por pose y semana. Comparten pose y se distinguen por la vuelta: las tres de dominadas (Cinco días, Base, Primera dominada), las seis de bici, las dos de trote y las dos de L-sit (Abdomen firme y Abdomen de gimnasta).

## Construir
- `src/piezas/iconos.js` (`K.icono`): de qué pose sale cada cosa, el asterismo (articulaciones que se juntan, huesos que se parten si faltan estrellas, orden desde el apoyo), el pictograma y la vuelta de la semana. Todo queda guardado en memoria: se calcula una vez por apertura.
- `K.fig.muestra(id)`: la pose que más dice de un ejercicio (la del maniquí chico).
- **Grande**: el Cielo y la constelación abierta dibujan el asterismo con la figura tenue detrás y las líneas en el color de la familia (la leyenda de estados no cambia); la próxima prueba en Planes, la prueba abierta, la rutina abierta (nueva cabecera, igual a la de la prueba) y el resumen de una prueba (las estrellas logradas se prenden de a una, desde el apoyo).
- **Chico (40 px)**: las filas de pruebas y rutinas de Planes, «Sale de tu rutina» y «¿Solo por hoy?» en Hoy, «Rutinas que llevan acá» en la constelación, las filas del Cielo y de Tu rumbo (el pictograma adentro del anillo de avance) y las sesiones de Progreso.
- **Coherencia**: «Enciende» (la prueba) ahora muestra la persona como «Entrena para» (la rutina): son las mismas filas de estrellas. La columna del ícono crece a 40 px en las filas con figura.
- **Catálogo**: las pruebas pierden `figura` (la constelación dibujada a mano); `docs/kozmos-rutinas.md` dice de dónde sale el ícono. Ids, clave de guardado y respaldo, sin tocar.

## Probar
- Sin pantalla: 78 (antes 75). Se va hazanas-figura (la figura dibujada a mano ya no existe). Nuevas: iconos-salen-de-una-pose (cada pose contra los datos, y que `iconos.js` no nombre ningún id), iconos-distintos (las 48 firmas y los 48 íconos chicos dibujados), iconos-asterismo (n estrellas dentro de la caja, sin pisarse y todas unidas) e iconos-ritmo-de-la-semana. Las cuatro fallan con el código de antes.
- De pantallas: 80 (antes 77). Nuevas: iconos-en-las-filas (32 filas de Planes con pictograma, todos distintos y sin pegarse al nombre; el mismo ícono en Hoy, en la constelación, en el Cielo y en Progreso) e iconos-asterismo-grande (Cielo, constelación, prueba y rutina abiertas; horizontal sin desbordar), que fallan con el código de antes; iconos-rapidos (Planes y Cielo enteros por primera vez en menos de 400 ms, y la segunda sale de la memoria) es una guarda que también pasa con el código de antes.
- Tablero antes y después, claro y grafito: Planes (pruebas y rutinas), la prueba, la rutina, Cielo, Cielo abajo, la constelación arriba y abajo, Progreso, el resumen de una prueba, Hoy, la sesión, el descanso, la isla, el resumen y, en horizontal (844 × 390), Planes, la rutina y la constelación.

## Objeciones que cambiaron algo
- Casandra a la directora de arte: con la pose sola, seis rutinas de bici son el mismo ícono → la vuelta de la semana alrededor de la figura (y la prueba prueba que las 26 son distintas).
- La directora de arte a la persona: la vuelta de un solo día se lee igual en la bici suave y en Mucho suave, poco fuerte → la semana entera, un tramo por día.
- La tesorera al boceto: la vista de la cámara y la pose de cada constelación estaban en una lista a mano → salen de los datos y la prueba falla si el módulo nombra un id.

## Casandra
1. **Tres rutinas de dominadas con la misma figura**: se distinguen por la vuelta (cinco días, tres días con muchas series, tres días con pocas). Si Fer quiere, la pose puede salir del escalón donde arrancás.
2. **Las poses verticales se ven finas** en la cabecera (dominada, soga, trote): es la forma del cuerpo. El disco las sostiene.
3. **Bandera humana y Lastre dicen «0 de 0»** en el Cielo cuando no marcaste poste ni lastre: ya pasaba antes. Anotado en el backlog.
4. Sin probar en un teléfono real; la guarda de tiempo corre en la computadora.

## La tijera
- Una sola pieza para los íconos (`K.icono`) y una sola forma de mostrar una estrella en una fila (`estrellaTile`). `K.dibujo.figura` y los `figura` del catálogo se fueron.
- Quedan con un punto de color: «Estrellas nuevas» del resumen y «Lo que se apaga» de Progreso. Anotado en el backlog.

## Bandera roja
Ninguna.

## Ajuste antes del tablero

- **Cabecera (prueba, rutina, próxima prueba)**: el asterismo ahora llena el disco (caja de la pose al 76 % del disco, sin deformar), con estrellas más grandes que las líneas. Si la pose queda como columna (de pie o colgado), se prueba la vista a tres cuartos o de frente; si igual sigue angosta, se abre un poco el eje corto y no se dibuja la figura de fondo.
- **Cielo**: la grilla muestra solo estrellas y líneas, sin la figura gris detrás. En la vista de una constelación la figura queda, mucho más tenue.
- Prueba nueva en la suite: el asterismo de la cabecera mide al menos 75 de largo y 18 de ancho (sobre 100).
