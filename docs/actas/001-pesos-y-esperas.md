# Acta · Nodo Entreno · vuelta 1 · fase Construir → Probar

Ítem 1 del backlog: estabilidad de la suite (chk204 y chk239) y pesos de letra. Rama `claude/pesos-y-esperas`. Las dos decisiones de partida las tomó Fer el 2026-10-04 (ver `docs/ESTADO.md`).

**Equipo**: la persona · Casandra · la tijera · la directora de arte (elegida: el cambio es tipográfico y se ve en toda la app) · el animador (azar: `node tools/elegir-equipo.mjs entreno 1 directora-de-arte`)

Los agentes del kit todavía no estaban cargados en la sesión (el kit va en el PR #5, sin fusionar): cada miembro y cada ayudante corrió como subagente con el texto de su rol de `.claude/agents/`.

## A · chk204 y chk239 (vuelta corta: la tijera y Casandra, con el fiscal y el estrangulador)

### Diagnóstico
- **chk204** recorre las fichas de los ~30 programas a 390 y 360 px. Esperaba 650/350 ms fijos; con la máquina ocupada la ficha seguía mostrando los esqueletos de carga (`prog/<id>.json` sin llegar). Se reprodujo también sin la Bold.
- **chk239** cierra un menú en 844×390 y espera 400 ms fijos a que la rueda mueva la pantalla. Con la CPU cargada, 2 de 20 corridas seguían en el mismo lugar a los 400 ms, sin traba ni menú y con 403 px de lugar; un instante después se movía. Pasó con y sin la Bold.
- **Diseño**: no es de diseño. El escaneo de textos que no entran o se salen da lo mismo en main y en la rama (79 casos, todos carruseles horizontales o cajas que se pasan 3–4 px; el único que cambia es «Resumen ›», que crece 2 px y sigue pasándose 4).

### Corrección
- Las dos pruebas esperan la condición que miran, preguntando cada 50 ms, y fallan con mensaje si no se cumple antes del tope:
  - chk204: el programa cargado, los días sin esqueletos y las animaciones finitas de la vista (y de lo de adentro) terminadas. Tope de 10 s por ficha.
  - chk239: que `scrollY` supere el valor anterior. Tope de 2 s.
- Las dos anotan cuánto tardó la condición. Sin carga: chk204 hasta 524 ms por ficha (media 195–222 ms), chk239 53–60 ms.

### Propuestas y objeciones que cambiaron algo
- Casandra: los topes de 20 s tapaban una demora real de la app y una prueba colgada tardaba 20 minutos en fallar → topes de 2 s (chk239) y 10 s (chk204).
- Casandra: chk204 no usaba el resultado de la espera y miraba las animaciones solo de la vista → ahora falla con mensaje y mira también las de adentro.
- Estrangulador: las pruebas corregidas pasan 16/16 con CPU libre y ocupada; la versión vieja de chk239 falló 1 de 3 con la CPU ocupada.

### Pendiente de esta parte
- La suite completa 10 veces seguidas (resultado en el PR).

## B · Pesos de letra (vuelta completa)

### Brief
1. **Para quién**: Fer entrenando en casa, con el teléfono apoyado y mirando de reojo entre series.
2. **Qué le resuelve**: los textos chicos se leen finos y en los segmentados la opción elegida no se distingue por el peso.
3. **Cómo sabemos que salió bien**: textos de 13 px o menos en 700; la elegida en 700 y las demás en 600 sin que se mueva ninguna caja; el botón principal en 700; tablero en grafito y en claro.
4. **Qué no vamos a hacer**: cambiar tamaños, colores, espacios, textos ni estructura; Ancha y Mono/Reloj quedan en sus pesos reales.
5. **El riesgo más grande**: reglas cambiadas en pantallas que no se miraron, y que con tanto 700 se aplane la jerarquía.

### Propuestas
- **La persona**: juzgar a 3× y achicado al 40 % (de reojo, a un metro); falta ver un esfuerzo marcado. Entre series se lee un poco mejor en claro; en grafito apenas. Sin veto.
- **Casandra**: falta una prueba automática de la regla; quedan textos chicos en 600 dentro de los segmentados; comparar desborde main contra la rama. Bandera roja por lo no visto.
- **La tijera**: entra lo que pide el criterio de éxito. Salen el 500 explícito de la isla y las clases de segmentados que no se dibujan. Dos PR (pruebas / pesos).
- **La directora de arte**: el 700 queda, pero la jerarquía se sostiene con el tono (`tinta-suave` en las líneas de detalle de Progreso y del encabezado de sesión) y no con el peso. «Terminar» naranja compite con «Siguiente».
- **El animador**: el peso cambia de una vez, junto con fondo, borde y color, sin animación propia. Riesgo en `.faces` y `.modes` (`transition:all`): esas clases no se usan en ninguna plantilla.

### Ayudantes
- **Fiscal** (para Casandra): el brief se sostiene, con una excepción. Además de `.segx`/`.tseg`, también bajan de 700 a 600 las opciones sin elegir de `.seg` (Apariencia, Hombre/Mujer) y `.yn` (Sí/No de las pruebas de la bienvenida). Seis de las doce clases de la regla de segmentados no estaban en el marcado.
- **Pulgar** (para la persona): con clics reales, ningún botón ni grupo se mueve al elegir; solo el texto elegido se ensancha hasta 5 px dentro de su caja («Al límite» 49→54).
- **Comparador** (para la directora de arte): tablero en grafito y en claro de inicio, sesión en curso, serie, descanso, resumen de la sesión, Progreso, cardio, isla y horizontal; tablero extra con Apariencia, la bienvenida, menús abiertos, inicio y Progreso vacíos, recortes a 3× (esfuerzo sin marcar y marcado, encabezado, barra de descanso, Progreso) y pantallas al 40 %. Lo armó el coordinador con los scripts de capturas de la sesión.

### Objeciones que cambiaron algo
- La persona, Casandra y la tijera a la directora: el tono `tinta-suave` cambia colores, que el brief deja afuera, y mezclado con el peso no se sabría qué mejoró → va al backlog como vuelta propia, con tablero. La persona agrega: nunca en la barra de descanso ni en el encabezado de la sesión.
- La directora a la tijera: mandar la jerarquía al backlog sin mostrarla es pedir un OK a ciegas → el tablero suma Progreso y el encabezado de sesión de cerca y de lejos.
- El animador a la persona: una captura quieta no muestra el momento de elegir → el tablero suma el esfuerzo antes y después de tocar «Al límite», y el criterio pasa a decir «ninguna caja ni ningún vecino se mueve; el texto elegido puede ensancharse dentro de su caja».
- Casandra: con lo del fiscal, la bandera roja suma la bajada de `.seg` y `.yn` → se muestran en el tablero extra y va como decisión de Fer.

### Decisiones
- La tijera recorta la regla de segmentados a lo que se dibuja (`.seg`, `.segx`, `.tseg`, `.ritmos`, `.yn` y los botones de esfuerzo) y saca el 500 explícito de la isla.
- Entra el tablero extra, la comparación de desborde main contra la rama y los recortes a 3× y al 40 %.
- **A Fer**: (1) que las opciones sin elegir de `.seg`, `.segx`, `.tseg` y `.yn` bajen de 700 a 600; (2) los textos chicos que siguen en 600 dentro de los segmentados (`.seg button small`, `.ritmos small`); (3) un PR o dos.

### Queda para después
- Prueba automática de la regla de pesos.
- Jerarquía con el tono (`tinta-suave`) en listas densas, como vuelta propia.
- «Terminar» naranja frente a «Siguiente» en la sesión.
- Limpiar el CSS de clases que no se usan (`.swfil`, `.cortaseg`, `.intensity`, `.faces`, `.modes`, `.htabs` y las funciones `pickers` / `pickerCards`).
- Duraciones de `.segx` (.25 s y .38 s) que no son tokens del manual de movimiento.

## Bandera roja
Casandra: «hay texto chico cambiado sin ver (menús, bienvenida, estados vacíos) y `.seg`/`.yn` bajan a 600 sin que el brief lo declare · se baja cuando haya un tablero en grafito y en claro de esas pantallas, con `.seg` y `.yn` antes y después, y Fer apruebe esa bajada por escrito».
Estado: **bajada**. El tablero extra mostró las pantallas que faltaban y Fer aprobó por escrito las tres recomendaciones (2026-10-05): las opciones sin elegir en 600, el texto chico de los segmentados en 600 y un solo PR.

## Entrega de esta fase
- Rama `claude/pesos-y-esperas` y su PR.
- Tableros: `tablero-pesos-{grafito,claro}-{1,2}.png` y `tablero-pesos-extra-{grafito,claro}.png` (en la conversación).
- Evidencia de ayudantes en `.equipo/vuelta1/` (local, fuera de git).
