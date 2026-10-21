# Acta · Kozmos · vuelta 13 · el maniquí nuevo y las 155 animaciones revisadas · fase Construir → Probar

Fer no aprobó el maniquí de la vuelta 12: «el pelo no está para nada bien, debería haber más variedad, y también de sexo; todo variable que se randomice, que se pueda cambiar en Vos pero que por defecto sea random; la calidad de las animaciones y de los dibujos hay que mejorarla, no más realista sino la calidad del dibujo en sí; investigá Bend y compará». Mandó capturas de Bend (la red no deja abrir la tienda ni el sitio). En el boceto v2 eligió **colores estilo Bend** y el **camino A** (seguir con el dibujo generado y subirle el techo). Después pidió: «el fondo o algún detalle tiene que tener el color del tipo de entreno, como antes», «revisar las animaciones a fondo, una por una, investigando antes cómo es cada movimiento, qué se mueve y cuánto» y «ver diferencias entre generado o con ilustrador». Rama `claude/project-thread-985fzq`, mismo PR.

**Equipo**: la persona · Casandra · la tijera · la directora de arte (elegida: el pedido es calidad de dibujo) · un ayudante por grupo de ejercicios (seis), que estudió cada movimiento y corrigió las poses mirando cada una en ocho cuadros.

## Qué se construyó
- **Dibujo nuevo** (`kozmos/src/piezas/figura.js`): siluetas lisas sin líneas de músculo, perfiles de mujer y de hombre (tronco, brazos, piernas), cabeza sin cara con nueve peinados (colita, rodete, largo, melena, afro, corto, rapado, rulos, pelado), barba que sigue la mandíbula, pelo que cuelga y se hamaca con el movimiento, ropa de arriba clara (top, musculosa, remera, manga larga) y de abajo honda (calza, calza corta, short, jogger), colchoneta.
- **El color del entreno**: disco del color de la familia, hondo, con tokens nuevos `--fu-disco`, `--mo-disco`, `--ra-disco` (claro y grafito). La ropa de arriba evita los tonos que se pierden contra su disco.
- **Vos · «La persona de los dibujos»**: mujer u hombre, piel, pelo y color de pelo, cada uno «Al azar» de entrada, con deshacer, guardado en `K.prefs` («persona»). El peinado se ofrece según el sexo elegido; si cambiás de sexo, un peinado que no le va vuelve al azar.
- **Las 155 animaciones**: estudio por ejercicio (articulaciones, grados, trayectoria, tempo, errores que no hay que dibujar) y corrección en las tiras. Lo grueso: negativas con la bajada lenta (estaban al revés), poses intermedias calculadas para que los apoyos no se deslicen, pies planos en sentadillas, verticales con la cabeza despegada, burpees rehechos, correr y caminar en seis tiempos, soga que gira y pasa bajo los pies, sostenidos que respiran uno o dos grados.
- **Arreglos del dibujo que salieron de la revisión**: colchoneta fija durante todo el movimiento y que abarca la cola y la espalda; sin colchoneta colgado de la barra; pelo que se acuesta en el piso; pared, postes y barra adentro del disco; paralelas como barra con patas; lastre detrás de las piernas; silla detrás del cuerpo; kettlebell en la línea del antebrazo; borde suave en el brazo que pasa por la cara; miniaturas de lo acostado más arriba.
- Sin `color-mix` (Android viejos), el reloj sigue a 33 ms y se frena en pausa.

## Generado o con ilustrador
En el tablero: Bend (techo de un profesional), una muestra dibujada a mano pose por pose (hecha acá, no por un profesional, para ver la diferencia de tipo) y lo generado en movimiento, con una tabla de qué gana cada uno. Recomendación: seguir generado y sumar de a poco lo que hace lindo a Bend (tres cuartos, manos con forma, pliegues); más adelante, un ilustrador podría diseñar las piezas que el motor arma.

## Lo que no hay todavía
- Vista de frente y de tres cuartos (lo lateral).
- Mano con orientación (muñecas en el dorso), tronco que se curva (gato-camello), escorzo (agarre ancho, straddle).
- Bici más grande (el pedalier está bajo: hay que rehacer el pedaleo con él).
- Ciclos con ritmo por tramo (saltos con más tiempo en el piso que en el aire).

## Respuesta de Fer
Pendiente. Tablero https://claude.ai/artifact/QyYfQqpQ8epkRxXsAx8Q7d (versión 2).
