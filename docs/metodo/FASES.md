# Las fases

Cinco fases. Cada una tiene una entrega y una puerta: no se pasa a la siguiente hasta que la entrega existe y la puerta se cumple. Una vuelta puede volver a una fase anterior cuando la puerta no se cumple; eso no es un fracaso, es el método.

## 1 · Pensar

- **Entrega**: el brief (`plantillas/brief.md`) y el acta de la primera vuelta.
- **El brief tiene cinco líneas**: para quién es, qué le resuelve, cómo sabemos que salió bien, qué no vamos a hacer y el riesgo más grande.
- **Puerta**: la persona puede contar la escena de uso, la tijera dejó escrito qué queda afuera y Casandra nombró el riesgo más grande.

## 2 · Investigar

- **Entrega**: la nota de investigación (`plantillas/investigacion.md`).
- Qué existe hoy y cómo lo resuelve la gente; quién lo intentó antes; los datos que vamos a usar, cada uno con su fuente; de qué servicios, librerías o proveedores dependemos y qué pasa si desaparecen; licencias y datos personales.
- Lo que cambia con el tiempo (precios, leyes, reglas de Google o de las tiendas, versiones) se busca en el momento, no se recuerda.
- **Puerta**: cada afirmación del proyecto tiene fuente o está marcada como supuesto, y cada dependencia externa tiene su reemplazo o su motivo.

## 3 · Construir

- **Entrega**: el cambio, en una rama, con capturas.
- Lo mínimo que resuelve el problema entero. Una cosa por cambio.
- Se sigue el manual de marca: voz, tokens, tipografía, movimiento, tacto y sonido. Nada de colores ni textos inventados fuera del manual.
- Sin diálogos de confirmación: se hace la acción y se ofrece deshacer.
- Los nombres internos y los datos guardados de la gente no se tocan sin un plan de migración.
- **Puerta**: la suite pasa, el cambio hace lo que dice el brief y la tijera confirmó que no se coló nada de lo que quedaba afuera.

## 4 · Probar

- **Entrega**: el resultado de las pruebas (`PRUEBAS.md`) y el tablero antes y después (`plantillas/tablero.md`).
- La suite automática completa, las pruebas de campo que correspondan y las que nadie quiere hacer.
- El tablero con capturas reales en grafito y en claro, con todos los estados que toca el cambio: sesión en curso, isla, horizontal, vacío, error.
- Los ayudantes que correspondan corren en paralelo (el recorredor, el fiscal, el estrangulador…) y su evidencia va al acta.
- Casandra revisa y decide si levanta bandera roja.
- **Puerta**: suite en verde (las fallas conocidas, anotadas), sin bandera roja abierta y con el OK de Fer al tablero.

## 5 · Publicar

- **Entrega**: la versión publicada, verificada, y su registro (`plantillas/version.md`).
- Número de versión nuevo, notas de la versión en palabras de la gente.
- Antes de publicar: cómo se vuelve a la versión anterior, probado.
- Después de publicar: se abre la versión publicada (no la local) y se verifica lo que cambió y lo que no debía cambiar.
- Si algo falla en producción: primero se vuelve atrás, después se investiga.
- **Puerta**: la versión publicada está verificada y el registro está escrito.

## Modo boceto, para ideas locas

Para probar si una idea vale la pena, sin gastar una semana.

1. Brief de tres líneas: qué es, para quién y qué tendría que pasar para seguir.
2. Una vuelta del equipo, con un solo invitado al azar.
3. Un prototipo en un solo archivo HTML, sin cuidar más que lo necesario para entenderlo.
4. Decisión: seguir (entra al método completo desde Pensar), guardar (se anota en la bitácora de ideas) o tirar (se anota por qué).

Un boceto nunca se publica como versión.
