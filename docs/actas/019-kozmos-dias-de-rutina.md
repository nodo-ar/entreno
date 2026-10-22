# Acta · Kozmos · vuelta 19 · los días de una rutina · Pensar → Investigar → Construir → Probar

Fer: «hay que arreglar algo en las pantallas de rutinas porque no se puede saber qué entrenamiento te tocaría cada día, por lo menos un estimado de ejercicios, además dice día 1 - día 1 la de base calistenia». Esta vuelta arregla el nombre repetido en todas las rutinas y hace que la rutina muestre qué se hace cada día.

Rama `claude/project-thread-985fzq`, sin PR.

**Equipo**: la persona · Casandra · la tijera · ayudantes: el fiscal (las 26 rutinas, día por día, en pruebas puras) y el recorredor (claro, grafito y horizontal).

## Pensar
- **La causa del «Día 1 · Día 1»**: la pantalla de la rutina escribía `Día ${k + 1} · ${nombre}` y 17 de las 26 rutinas ya se llaman «Día 1», «Día A» en el catálogo. En la Base salía «Día 1 · Día A»; en De 0 a 5 km, 100 flexiones y otras, «Día 1 · Día 1». Hoy tenía lo mismo escondido: un bloque de motor sin nombre tomaba el del día («Hoy toca · Día 1» y abajo la fila «Día 1»).
- Lo que la persona ve: una tarjeta por día con las filas de «Hoy toca», el día que sigue con «Te toca», lo hecho de la semana en una línea con «Hecho» y un menú para mirar otra semana. El escalón es tuyo: una rutina que no seguís muestra sus días como serían si la empezás hoy.
- Lo que la persona toca: el menú de la semana (no guarda nada). Sin diálogos, sin hojas, sin chips, sin días que se abren: no hay en la app tarjetas que se expanden, así que no se inventó una.

## Construir
- **El nombre del día** (`rutina.nombreDia`): el del catálogo si ya dice el día («Día A»); si no, su lugar y su nombre («Día 1 · Máximas», «Día 2 · 8×1»).
- **Un día armado** (`rutina.dia`): sale del mismo motor que la sesión, con tus escalones de ahora. En cada escalera, el ejercicio de tu escalón con series × rango («Dominada · 3 × 5–8»); en un sostén, series × segundos; lo suelto, como en Hoy («2 · 3 · 2 · 2 · máx»; una pirámide larga, «11 series, de 1 a máx»). En lo de motor, qué es y su forma: «Trote · 8 × 1 min · 1:30 suave», «Bici · 30 min suave + 4 × 20 s · 10 s suave», «Soga · 10 × 30 s · 30 s de pausa»; con ejercicios, uno por fila («Dominada · 4 × 3» en el EMOM). Los minutos y la nota del día al pie.
- **La semana de prueba**: el menú dice «Semana 4: prueba»; esa semana muestra la descarga (la mitad de las series y de lo de motor, como la arma la sesión) y la línea «Semana 4: prueba · más liviana, con las pruebas el primer día». El día que te toca es el mismo plan que Hoy, con sus pruebas.
- **Un bloque de motor se llama por lo que se hace** (Trote, Bici, Soga, Posturas, Circuito, Entrada en calor), en Hoy y en la sesión.
- **Resuelta en la vuelta**: sin barra, Cinco días de dominadas y Primera dominada rompían el motor (una escalera sin ningún escalón posible). Ahora queda la escalera entera y la rutina avisa «Pide barra», como ya hacía.
- En horizontal, los días van en la rutina abierta a la derecha, como Ajustes.

## Probar
- Sin pantalla: 69 (antes 67). Nuevas: rutina-nombre-dia y rutina-dias-filas (las 26 rutinas, cada semana y cada día, con equipo completo, sin equipo y sin elegir: ninguna fila vacía, rara ni con el nombre del día).
- De pantallas: 74 (antes 71). Nuevas: rutina-dias-nombres (falla antes del arreglo: «cien: el día dice "Día 1 · Día 1"»), rutina-dias-te-toca y rutina-dias-horizontal.
- Tablero antes y después, en claro y grafito: la Base arriba y en sus días, Correr tus primeros 5 km, Abdomen de gimnasta sin seguirla, Movilidad de cadera (mixta), Planes con la lista de pruebas y la de rutinas, Hoy, la sesión, el descanso, la isla, el resumen y, en horizontal (844 × 390), la rutina y sus días.

## Casandra
1. **Es un estimado**: los escalones de los días que vienen son los de hoy; después de cada sesión pueden cambiar. Lo dice la línea «Con tus escalones de hoy».
2. **Hoy junta la superserie y la rutina no**: Hoy dice «Dominada + Sentadilla · 5 series»; el día de la rutina, una fila por ejercicio con su rango. Anotado en el backlog para decidir con Fer.
3. **La última semana casi siempre es de prueba**: en 24 de las 26 rutinas (todas menos Correr tus primeros 5 km y Mucho suave, poco fuerte, de 9 semanas). En las que terminan en un desafío (100 flexiones, Soga hasta 1000 saltos, Arranques con kettlebell, Intervalos de 1 minuto en bici, Correr de 5 a 10 km y sus 10 km) esa semana se hace más liviana. Ya era así en la sesión; ahora se ve.
4. Sin probar en un teléfono real.

## Nombres más claros (aprobados por Fer)
- **Las pruebas** se llaman por lo que miden y, donde hay subtítulo, llevan una línea que dice cómo: Dominadas al máximo, Flexiones a ritmo, Sentarte y pararte, Dominadas minuto a minuto, Alcance de piernas, 12 minutos en bici, 1000 saltos de soga y L-sit sostenido. Se fue el «Nombre · Prueba» en Planes, Hoy, la sesión, el resumen, Progreso y el Cielo. Las estrellas que nombraban la prueba también («12 minutos en bici: +10 % sobre tu primera vez», «Sentarte y pararte: 8 puntos», «1000 saltos de soga en 12 min»).
- **Las rutinas**: Correr tus primeros 5 km, Correr de 5 a 10 km, Movilidad de cadera, Circuito con mancuernas, Intervalos de 1 minuto en bici, Abdomen de gimnasta, Intervalos sin equipo, Arranques con kettlebell, Intervalos de 4 minutos, Intervalos de 11 minutos, Mucho suave, poco fuerte, Dos sprints en bici, Soga hasta 1000 saltos, Bici: 20 s fuerte, 10 s suave, Abdomen firme y Bici suave y larga. Las otras 10 quedan.
- **«Abdomen»** en lugar de «tronco» donde quiere decir los abdominales (rutinas, escaleras y la meta de Draco). «En línea con el tronco», en la indicación de un ejercicio, queda: ahí es el torso.
- Los ids no cambian (hazañas, rutinas, ejercicios, estrellas): lo guardado sigue contando. Las constelaciones del Cielo quedan con su nombre.

## La tijera
- Una sola fila para Hoy y para los días (`K.filaLn`); una sola línea de la semana de prueba (`K.pruebaLn`).
- No se guardó nada nuevo: la semana elegida vive en la pantalla.

## Esperando a Fer
- El OK al tablero.
- Si Hoy pasa a una fila por ejercicio, como los días de la rutina.
- Qué hacer con las rutinas cuya última semana es de prueba.
