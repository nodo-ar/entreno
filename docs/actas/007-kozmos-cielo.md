# Acta · Kozmos · vuelta 7 · etapa 2, el cielo de lectura · fase Construir → Probar

Segunda etapa de Kozmos: el catálogo cargado, las pantallas Cielo y Constelación, y las marcas anotadas a mano. Rama `claude/project-thread-985fzq` (sale de `main` con la etapa 1 fusionada). Todo en `kozmos/`; Entreno no se toca.

**Equipo**: la persona · Casandra · la tijera · la cartógrafa (invitada: la etapa suma rutas y niveles de navegación) · el soberano (al azar, `node tools/elegir-equipo.mjs entreno 7 cartografa`).

## Qué se construyó
- `kozmos/catalogo/constelaciones.json`: las 14 constelaciones aprobadas con sus 86 estrellas. Cada estrella tiene id de texto, magnitud de 5 a 1, orden, requisitos y su prueba (ejercicio, tipo y umbral). `retirados.json` guarda los ids que no se pueden volver a usar.
- `kozmos/src/cielo/cielo.js`: funciones puras. Entra el catálogo y las marcas y sale el cielo: estrellas encendidas, la próxima con su avance, el brillo y la atenuación a las 8 semanas. Las marcas cuentan por ejercicio: 25 s de tuck encienden «Tuck 10 s» y «Tuck 20 s».
- `kozmos/src/diario/diario.js`: las marcas en IndexedDB, en el teléfono. Base `kozmos` v1 con `mediciones` y `perfil` (el peso para Lastre).
- Pantallas: Cielo (el cielo entero, con leyenda, y la lista por familia con anillo de avance), Constelación (su dibujo, la próxima estrella, las estrellas y tus marcas) y Anotar una marca (estrella y día con menú desplegable, − y +, Lastre en kilos más tu peso, «Lo logré» para lo que no se mide). Guardar ofrece deshacer y borrar una marca también.
- En horizontal, el patrón de Ajustes: la lista de constelaciones a la izquierda y la abierta (o Anotar) a la derecha.
- Pruebas: 19 sin pantalla (catálogo y cielo, con casos escritos a mano) y 20 de pantallas (7 nuevas).

## Propuestas y objeciones que cambiaron algo
- **Persona (bloqueaba)**: Anotar arrancaba con el número que enciende la estrella, y un toque sin mirar la encendía para siempre. Ahora arranca en tu mejor marca o vacío, y vacío no se guarda (con prueba). El cielo vacío no decía qué hacer: la frase va arriba. Se sumó una leyenda (próxima, encendida, por delante) y las etiquetas del cielo crecieron. La fila elegida en horizontal perdía su anillo: arreglado.
- **Casandra (bandera roja, bajada)**: las marcas dependían de que el catálogo no cambiara nunca. Ahora cada marca guarda qué midió (ejercicio, tipo y versión del catálogo) y el cielo la lee con eso. Una prueba compara el catálogo contra `main`: si una estrella cambia su prueba o desaparece sin retirarse, falla. También: doble toque en Guardar (una sola marca, con prueba), base que llega tarde (se cierra), otra pestaña con versión nueva (avisa), migraciones por pasos y relectura del diario al volver a la pestaña.
- **Cartógrafa**: en horizontal, anotar movía toda la pantalla: ahora se mueve solo el panel abierto (con prueba). El foco va al título de lo que se abre, o a la fila elegida. «Anotar una marca» sube arriba de la lista de estrellas, al alcance del pulgar. Tocar la pestaña en la que estás vuelve a su raíz sin sumar pasos (con prueba). Al girar a vertical, atrás vuelve a la lista. Lo que estás anotando queda guardado por constelación.
- **Tijera**: un solo PR; el diario y el peso son lo mínimo para que una marca anotada quede. Pedía sacar la atenuación; se queda porque está en el modelo que Fer aprobó (atenuar a las 8 semanas sin perderse).
- **Soberano**: no hay dependencias nuevas; IndexedDB, `crypto.randomUUID` y las fechas de `Intl` pasan. Condición: exportar e importar el diario antes de que haya datos reales (etapa 4, respaldo).

## Lo que no hay todavía
Hoy, la sesión, Progreso y el respaldo llegan en las etapas 3 y 4. Las estrellas que piden equipo se muestran todas: el perfil de equipo es de la etapa 4.

## Decisiones para Fer
1. OK al tablero de la etapa 2.
