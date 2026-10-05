# El equipo

Cinco miembros por vuelta: los tres del núcleo y dos invitados. Cada miembro puede mandar ayudantes para medir lo que necesita (ver abajo).

## El núcleo (siempre están)

### La persona
- **Habla por** quien va a usar esto: alguien común en Argentina, con un Android de gama media, poco tiempo y cero ganas de leer instrucciones.
- **Pregunta**: ¿lo entiendo en cinco segundos? ¿Me resuelve algo hoy?
- **Entrega**: la escena de uso en tres líneas (dónde está, qué quiere, qué pasa después).
- **Puede**: vetar algo que confunde a la primera.

### Casandra
- **Mira** la falla que nadie quiere decir en voz alta.
- **Pregunta**: ¿cómo sale mal esto? ¿Qué pasa en seis meses? ¿Qué estamos evitando mirar?
- **Entrega**: los tres riesgos más probables, cada uno con una forma de comprobarlo.
- **Puede**: levantar una bandera roja. Con bandera roja no se publica hasta resolverla o hasta que Fer la acepte por escrito.

### La tijera
- **Mira** el alcance.
- **Pregunta**: ¿qué es lo mínimo que resuelve el problema entero? ¿Qué sobra?
- **Entrega**: la lista de lo que entra y la de lo que queda para después.
- **Puede**: cortar cualquier cosa que no sea necesaria para la próxima entrega.

## El plantel de invitados

En cada vuelta entran dos: uno **elegido** por lo que el proyecto necesita y uno **al azar**, elegido con `tools/elegir-equipo.mjs`. El azar trae la mirada que nadie habría pedido. Nunca se repite la misma pareja de invitados dos vueltas seguidas del mismo proyecto.

| Invitado | Mira | Su pregunta | Entrega |
| --- | --- | --- | --- |
| **La guionista** | La historia | ¿Hay una historia o es una lista? ¿Dónde está la tensión, el giro y la prueba? | El arco en cuatro tiempos: tensión, giro, prueba, invitación |
| **El tonto** | Lo obvio | ¿Por qué hacemos esto así? ¿Y si no lo hacemos? | Una pregunta que nadie hizo, con su respuesta |
| **El nulo** | Los números | ¿Esa métrica dice algo? ¿Ese dato tiene fuente? | Cada número del proyecto con su fuente, o tachado |
| **La editora** | Las palabras | ¿Esta palabra se gana su lugar? ¿Suena a persona o a máquina? | El texto con la mitad de palabras y sin frases de relleno |
| **La cartógrafa** | La navegación | ¿Sé dónde estoy, a dónde puedo ir y cómo vuelvo? ¿Llego a lo importante en tres gestos, con el pulgar o con el teclado? | El mapa de secciones y tres tareas medidas, en gestos y segundos, antes y después |
| **La directora de arte** | El oficio visual | ¿Se ve hecho con cuidado? ¿Dónde mira primero el ojo? | Tres correcciones de jerarquía, ritmo o detalle |
| **El animador** | El movimiento | ¿Este movimiento explica algo o solo se mueve? | Qué se mueve, cuándo, cuánto dura y por qué |
| **La periodista** | La noticia | ¿Por qué le importaría a alguien que no nos conoce? | El titular en ocho palabras y la primera línea de la nota |
| **La ingeniera de campo** | El mundo real | ¿Anda sin señal, con 10 % de batería, al sol, en un teléfono de 2019? | Las pruebas de campo que corresponden y su resultado |
| **La abuela** | La primera vez | ¿Lo puede usar alguien que nunca vio la app, con letra grande y sin ayuda? | Los puntos donde se trabó, en orden |
| **El soberano** | La dependencia | ¿Esto nos ata a alguien? ¿Qué pasa si ese proveedor desaparece o cambia las reglas? | Cada dependencia externa, con su reemplazo o su motivo |
| **La abogada** | Las reglas | ¿Licencias, datos personales, marcas, términos de las tiendas? | Lo que hay que cambiar y lo que hay que avisar |
| **El atacante** | La rotura a propósito | ¿Cómo lo rompo, lo engaño o le saco datos? | Los ataques probados y cómo se cerraron |
| **El competidor** | El mercado | ¿Cómo respondería una empresa grande? ¿Qué tenemos que no puedan copiar? | La ventaja que queda aunque nos copien |
| **El historiador** | Lo que ya pasó | ¿Quién intentó esto antes y por qué no funcionó? | Dos antecedentes y qué aprendemos de cada uno |
| **La tesorera** | El costo | ¿Cuánto cuesta mantenerlo cinco años, contando el tiempo de Fer? | El costo en horas por mes y qué lo baja |
| **Marco Aurelio** | El sentido | ¿Esto le mejora el día a alguien? ¿Lo haríamos aunque nadie se entere? | Una línea sobre a quién le cambia qué |

## Cómo se elige

1. El núcleo está siempre.
2. Quien coordina la vuelta elige un invitado por lo que el proyecto necesita y dice por qué en una línea.
3. El otro sale de `node tools/elegir-equipo.mjs <proyecto> <vuelta>`: siempre el mismo para el mismo proyecto y la misma vuelta, distinto del elegido y del par de la vuelta anterior.
4. El acta de cada vuelta anota quiénes fueron.

## Cómo trabaja el equipo en una vuelta

1. **Lee** el brief y lo que salió de la vuelta anterior.
2. **Propone**: cada miembro, una propuesta concreta desde su mirada.
3. **Objeta**: cada miembro, una objeción a la propuesta de otro.
4. **Decide**: la tijera deja lo mínimo; si hay empate, decide Fer.
5. **Entrega** lo que pide la fase, y el acta (`plantillas/acta.md`).

Las voces del equipo son una forma de mirar, no personajes para decorar. Lo que importa del acta son las decisiones y las objeciones que cambiaron algo.

## Los ayudantes

Un miembro opina; un ayudante mide. Cada miembro puede mandar ayudantes: subagentes con una sola tarea que vuelven con evidencia (una lista, una captura, un número), nunca con una opinión. El miembro decide con lo que traen.

### Reglas

1. **Una tarea**, con una entrada y una salida concretas. Si no se puede escribir la salida antes de mandarlo, no es tarea de ayudante.
2. **No opina ni decide.** Lo que vea fuera de su tarea lo anota al final, en una línea, bajo «Fuera de tarea».
3. **Hasta dos por miembro y por vuelta.** Corren en paralelo, mientras el equipo discute.
4. **Se puede repetir.** El acta guarda la orden con que se lo mandó y lo que trajo; si es un script, va a `tools/`.
5. **No toca nada.** Lee, mide y fotografía. Los cambios los hace quien construye.

En Claude Code, un ayudante es un subagente (`Agent`) armado con `plantillas/ayudante.md`, o un script de `tools/` cuando la tarea se repite.

### El plantel de ayudantes

| Trabaja para | Ayudante | Tarea | Trae |
| --- | --- | --- | --- |
| La persona | **El cronómetro** | Muestra la pantalla cinco segundos a un subagente sin contexto y le pregunta qué es, para quién y qué haría primero | Sus respuestas, textuales |
| La persona | **El pulgar** | Mide en 360 × 740 los controles de menos de 44 px y los que quedan fuera del alcance del pulgar | La lista, con capturas marcadas |
| Casandra | **El fiscal** | Contrasta cada afirmación del texto con el código o con su fuente | Tabla: afirmación, evidencia, se sostiene sí/no |
| Casandra | **El inventario** | Busca enlaces rotos, marcadores de prueba, `TODO`, textos de relleno y botones que no llevan a nada | La lista, con archivo y línea |
| La tijera | **El contador** | Cuenta palabras, secciones, pantallas de alto, peso y tiempo de carga | Los números, al lado de los de la vuelta anterior |
| La cartógrafa | **El recorredor** | Hace las tareas de navegación con mouse, con toque y con teclado: llegar a cada sección, a la acción principal y volver al principio | Por tarea: gestos, segundos, si llegó y la captura |
| La cartógrafa | **El índice** | Lista las anclas, los títulos y el orden del tabulador | Saltos de nivel, anclas sin destino y focos invisibles |
| La directora de arte | **El comparador** | Arma el tablero antes y después en grafito y en claro, con todos los estados | El tablero |
| El nulo | **El verificador** | Abre la fuente de cada número | Número, fuente, párrafo que lo respalda o «sin fuente» |
| La editora | **El detector** | Busca las muletillas de máquina y las palabras que la voz de Nodo no usa | Línea y palabra |
| La ingeniera de campo | **El estrangulador** | Corre lo construido con red lenta, procesador ×4, sin conexión y a 360 px | Tiempos y capturas |
| El atacante | **El revoltoso** | Carga datos raros en cada campo: vacío, 10.000 caracteres, emojis, fechas imposibles, el mismo dato desde dos lugares | Qué se rompió y cómo |

Cualquier otro miembro puede pedir un ayudante nuevo con las mismas reglas. Si funciona dos vueltas seguidas, entra a esta tabla.
