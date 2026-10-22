# Acta · Kozmos · vuelta 20 · filas de Hoy y la meta · Pensar → Investigar → Construir → Probar

Fer aprobó las recomendaciones de la vuelta 19: Hoy con una fila por ejercicio, como los días de la rutina; la última semana de una rutina que termina en un desafío es la meta, no una descarga; «más liviana» en las filas; y arreglar las notas raras del catálogo.

Rama `claude/project-thread-985fzq`, sin PR.

**Equipo**: la persona · Casandra · la tijera · ayudantes: el fiscal (las 26 rutinas, semana por semana, en pruebas puras) y el recorredor (claro, grafito y horizontal).

## Pensar
- **Lo mismo se lee igual**: «Hoy toca» decía «Dominada negativa + Sentadilla · 6 series»; el día de la rutina, una fila por ejercicio con series × rango. Ahora los dos usan las mismas filas (`K.filasHtml`).
- **La superserie se sigue viendo**: sus dos filas van juntas sobre un fondo apenas distinto, con «en superserie» al pie (tres: «en triserie»). Sin chips. La sesión sigue alternando serie a serie, como antes.
- **«Empezar» al alcance del pulgar**: con una fila por ejercicio, la Base pasa de 5 a 9 filas. El botón queda fijo abajo, como «Seguir esta rutina». En horizontal, abajo de la columna derecha. Resuelta en la vuelta: el aviso de deshacer («Seguís Base de calistenia») tapaba el botón fijo; ahora el botón sube encima del aviso mientras está abierto, también «Seguir esta rutina».
- **La meta**: una rutina que termina en un desafío no puede llegar a él con la mitad de las series. La última semana es la meta, completa, sin pruebas sueltas. La semana de prueba que caía ahí pasa a la anterior y cierra ese bloque (llega descansado a la meta).

## Investigar · qué rutina tiene meta (caso por caso)
El criterio: tiene meta si el catálogo pone en su última semana el desafío o una prueba de lo que busca. Si no, la semana de prueba de la app sigue cerrando la rutina: descarga y pruebas para saber dónde quedaste.

| Rutina | Última semana en el catálogo | Decisión | Semanas |
| --- | --- | --- | --- |
| 100 flexiones | la semana más dura | meta: 100 flexiones seguidas | prueba en la 5, meta en la 6 |
| Soga hasta 1000 saltos | el día 3, el desafío | meta: 1000 saltos seguidos | prueba en la 3, meta en la 4 |
| Arranques con kettlebell | 40 × 15 s, el tope | meta: 40 rondas de 15 s | prueba en la 3, meta en la 4 |
| Intervalos de 1 minuto en bici | 12 × 1 min, el tope | meta: 12 minutos fuertes | prueba en la 5, meta en la 6 |
| Correr de 5 a 10 km | los 10 km | meta: los 10 km | pruebas en la 4 y la 7, meta en la 8 |
| Correr tus primeros 5 km | 30 minutos trotando | meta: 30 minutos trotando | pruebas en la 4 y la 8, meta en la 9 |
| Abdomen de gimnasta | «anotá tu mejor sostén de hollow y de L-sit» | meta: tu mejor hollow y L-sit | pruebas en la 4 y la 7, meta en la 8 |
| Primera dominada | entrenamiento común; se pasa de escalón por lo que hacés, no por fecha | sin meta: la prueba de la semana 6 mide si ya sale | prueba en la 6 |
| Las otras 18 (fuerza, intervalos, bici, movilidad) | entrenamiento común, sin desafío | sin meta | como antes |

## Construir
- **Las semanas** (`K.rutina.semanas`, `tipoSemana`, `esMeta`, `metaDe`): carga, prueba o meta, sacado del catálogo. El motor no nombra ninguna rutina. `bloque.meta` es `true` o lo que se busca, en corto. `plan.semanaDePrueba` las usa y suma `meta` y `semanaMeta`; `proxima` es `null` cuando no queda otra prueba.
- **Hoy en la meta**: «Semana 4: la meta · 1000 saltos seguidos» arriba de lo que toca, sin descarga ni ventana de prueba. En la rutina: el menú dice «Semana 6: la meta», la línea de la semana también, y el bloque dice «Prueba en la semana 5; la 6, la meta». En Planes, «Esta semana es la meta» o «La meta, en la semana 6».
- **«más liviana»** debajo del nombre, en el color de la familia, como en la sesión: escalera trabada, semana de prueba y lo de motor partido a la mitad. Una salida larga que no se puede partir no lo dice (antes quedaba marcada como descarga sin cambiar).
- **Catálogo**: Intervalos de 4 minutos, día 2, dice «40 min suaves» (el tramo es de 40); Bici: 20 s fuerte, 10 s suave dice «Si terminás los 8 con aire para otro, subí un nivel de resistencia»; el desafío de Soga cuenta 10 min con `dura` (el día pasa de 5 a 15 min con la entrada).
- Lo guardado no cambia: la clave, el respaldo y las sesiones viejas siguen igual. Las semanas salen de las sesiones hechas, así que una rutina en curso solo ve la meta cuando llega.

## Probar
- Sin pantalla: 74 (antes 69). Nuevas: rutina-meta-en-el-catalogo (las 26, semana por semana), semana-de-prueba-y-meta (la prueba movida y la meta), rutina-filas-superserie, rutina-filas-mas-liviana y catalogo-rarezas-019. Las cinco fallan con el código de antes.
- De pantallas: 77 (antes 74). Nuevas: hoy-filas-superserie (Hoy igual al día de la rutina, la superserie junta, «Empezar» al pulgar en 390 × 844 y 844 × 390, la sesión alterna), hoy-mas-liviana y rutina-meta. Las tres fallan con el código de antes.
- Tablero antes y después, en claro y grafito: Hoy con superseries, Hoy abajo con «Empezar», Hoy con una escalera trabada, 100 flexiones en la semana 6 (la meta) y en la 5 (la prueba), Soga en la meta, los días de la Base, la sesión, el descanso, la isla, el resumen y, en horizontal (844 × 390), Hoy y los días.

## Casandra
1. **Hoy es más largo**: la Base pasa de 5 a 9 filas. Por eso «Empezar» queda fijo; tapa la última fila hasta que desplazás.
2. **100 flexiones no pide las 100**: la meta es la semana más dura, con «máx» en la última serie. Anotado en el backlog.
3. **«más liviana» se repite**: en la semana de prueba lo dice cada fila. Es lo que pide la regla (igual que la sesión), pero se lee mucho.
4. Sin probar en un teléfono real.

## La tijera
- Una sola forma de dibujar filas para Hoy y los días (`K.filasHtml`); una sola forma de decir la semana (`K.semanaTx`) y el bloque (`K.bloqueTx`).
- Encontrado: las notas cuentan los minutos de dos maneras (lo suave o el día entero). Anotado en el backlog.

## Esperando a Fer
- El OK al tablero.
- Si 100 flexiones suma el intento de las 100 en el último día.
- Si «más liviana» va en cada fila de la semana de prueba o una sola vez arriba.
