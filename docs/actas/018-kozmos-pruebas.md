# Acta · Kozmos · vuelta 18 · pruebas con escala y semana de prueba (Modelo B) · Pensar → Investigar → Construir → Probar

Fer pidió el Modelo B de la propuesta de progresión, con todas sus recomendaciones: las hazañas pasan a ser pruebas estandarizadas con escala que encienden el Cielo, cada rutina se arma en bloques con una semana de prueba, y Planes se rehace según el boceto (la próxima prueba arriba). Se construye sobre el motor de escaleras del Modelo A. Quedan afuera los íconos nuevos y el Modelo C.

Rama `claude/project-thread-985fzq`, sin PR.

**Equipo**: la persona · Casandra · la tijera · el historiador (elegido: las hazañas guardadas con niveles tienen que seguir cargando) · el fiscal y el recorredor como ayudantes (las reglas en pruebas puras; los estados en claro, grafito y horizontal).

## Pensar
- **Una prueba es una serie con nombre.** La serie guarda `hazana` con el id: así cuenta como marca en el Cielo, como escalón en su escalera y como una vez más en su escala, sin estado nuevo. La sesión suelta guarda además `hazana: {id, v: 2, valor, ejercicio, tipo}`.
- **La semana de prueba no se guarda**: sale de las sesiones hechas de la rutina, como el escalón. Una sesión de esa semana dice `semanaPrueba` para que la siguiente sepa que las pruebas ya se hicieron.
- Lo que la persona ve: la próxima prueba en Planes, la escala con su marca y la vez anterior, «+3 desde agosto», cuándo toca, y en Hoy «Semana de prueba · 3 pruebas · encienden hasta 4 estrellas».

## Investigar
- Bloques de 4 a 6 semanas con descarga en la de prueba, trabajo al 75 % del máximo después de la prueba, sentarse y pararse del piso de 0 a 10, flexiones a ritmo fijo: lo que ya traía el informe de progresión. Las fuentes van al pie de cada prueba; los textos no nombran a nadie.
- **Lo que estaba mal**: Pegaso, Sagitario, Draco y Casiopea solo anotaban «la hiciste»; las estrellas de Motor eran «8 y 12 sesiones de intervalos», metas de ir y no de poder.

## Construir
- **`hazanas.json` versión 2**, las ocho con nombre propio y lo que miden:

  | Hazaña | Prueba | Mide | Escala (m5 → m1) | Enciende |
  | --- | --- | --- | --- | --- |
  | Perseo | Tirón | dominadas, máximo | 1 · 5 · 10 · 15 · 20 | Dominadas ×10 (Muscle-up), ×15 (Un brazo) |
  | Hércules | Empuje | flexiones a ritmo, máximo | 10 · 20 · 30 · 40 · 50 | Flexiones ×30 (Planche), ×40 (Un brazo) |
  | Sagitario | Del piso | sentarse y pararse, puntos | 5 · 6 · 7 · 8 · 9 | Del piso 8 (Una pierna), 9 (Espagat) |
  | Andrómeda | Escalera de minutos | dominadas del último minuto completo | 4 · 6 · 8 · 10 · 12 | las de Perseo |
  | Casiopea | Compresión | cm más allá de los pies, en pike | −10 · 0 · 5 · 10 · 15 | Pike 5 cm (Draco), 10 cm (Puente) |
  | Pegaso | Motor 12 | km en 12 min de bici | +0 · 5 · 10 · 15 · 20 % sobre tu primera vez | Motor 12 +10 % y +20 % (Motor) |
  | Orión | Mil saltos | tiempo para 1000 saltos | 15 · 12 · 10 · 9 · 8 min | Mil saltos en 12 min (Soga) |
  | Draco | Escuadra | L-sit, segundos | 5 · 10 · 15 · 20 · 30 | L-sit 10 s y 20 s (Draco) |

  Cada una se repite cada 42 días. Cuatro ejercicios nuevos que solo se miden en una prueba (del piso, alcance en pike, doce minutos en la bici, mil saltos), con su dibujo prestado de uno parecido.
- **El Cielo**: nueve estrellas nuevas en ocho constelaciones, medidas con pruebas. Motor cambia «8 y 12 sesiones de intervalos» por Motor 12 +10 % y +20 % (las viejas pasan a `retirados.json`). Una estrella que solo se mide con una prueba se entrena, entre pruebas, con lo que dice la prueba (`entrena`), y en la Constelación «Probar» lleva a la prueba.
- **Las rutinas**: `bloque: {carga, prueba: 1}` en las 26 (3 + 1 en las de 4, 8 y 9 semanas; 5 + 1 en las de 6).
- **El motor** (`plan.js`, `rutina.js`, `motor.js`):
  - `semanaDePrueba` cuenta semanas de la rutina; sin rutina, semanas de calendario con sesiones desde la última prueba (4 + 1). Si volvés después de 3 semanas, la prueba espera.
  - `deSemanaDePrueba` arma la sesión: las próximas estrellas de las constelaciones de tu rutina o rumbo (hasta 3), una o dos hazañas (la segunda solo si también toca), la descarga a la mitad y las de motor al final. La primera sesión de la semana lleva las pruebas; las demás, solo la descarga.
  - Después de una prueba, cada escalera arranca al 75 % de tu máximo: si ya llega al tope, el escalón de arriba; si no llega al mínimo, el de abajo.
  - Formatos nuevos: reloj fijo con campana (Motor 12) y escalera de minutos con un pitido por minuto y «No llegué».
- **Lo que se ve**:
  - Planes: «Próxima prueba» grande (figura, escala con tu marca y la vez anterior, tus veces en una línea, «Probar ahora»), «Pruebas» y «Otras rutinas» con un menú de familia, y «Tu rutina» con el bloque, los escalones y «Prueba en la semana 5». En horizontal, como Ajustes.
  - La prueba abierta: la escala, «+3 desde agosto», cuándo toca, cómo se hace, qué enciende, tus veces (las de antes como «versión anterior») y la fuente al pie. Se fue el menú de niveles.
  - La rutina: cómo son sus bloques y, debajo de «Seguir esta rutina», «El escalón es tuyo: arrancás donde ya estás en cada escalera».
  - Hoy: la línea de la semana de prueba y las pruebas marcadas en lo que toca.
  - La sesión: «Prueba» arriba, la escala chica con tu vez anterior, y en el descanso «Tu prueba anterior». Puntos de medio en medio y de 0 a 10; centímetros que bajan de cero; km de a 0,1.
  - El resumen: la marca con su magnitud, la escala, la vez anterior, las constelaciones donde encendió (varias a la vez) y los escalones que movió la prueba.
- **El respaldo** pasa a formato 2 y lee el 1.

## Probar
- Sin pantalla: 67 (antes 59). Nuevas: hazana-escala-y-magnitud, cielo-desde-hazana, hazana-datos-viejos, respaldo-pruebas, semana-de-prueba-cuando, semana-de-prueba-sesion, bloque-desde-la-prueba y plan-solo-con-prueba; reescritas catalogo-hazanas y hazana-formatos.
- De pantallas: 71 (antes 66). Reemplazan a las tres de hazañas por niveles: hazana-prueba-maximo, hazana-escalera-y-reloj y hazana-datos-viejos. Nuevas: planes-proxima-prueba, planes-familia, rutina-linea-escalon, semana-de-prueba-hoy y pruebas-horizontal. Al día con el catálogo nuevo: planes-pestana, planes-horizontal, anotar-enciende-y-queda (95 estrellas), anotar-tipos (Lateral completo pasa a ser la 5 de Espagat), tu-equipo (Soga tiene 7), rutina-cardio-entera y maniqui (el circuito con figuras ahora es Andrómeda).
- Tablero antes y después, en claro y grafito: Hoy, Hoy en semana de prueba, Planes, el menú de familia, una prueba abierta, la sesión de prueba, el descanso, la isla, el resumen de una prueba, el Cielo después y, en horizontal (844 × 390), Hoy, Planes y el resumen.

## Casandra
1. **Las de antes no entran en la escala.** Las hazañas por niveles no guardaron qué ejercicio midieron: se ven como «versión anterior» y no encienden nada. Quien hizo Hércules ve «todavía no la hiciste» en la escala nueva.
2. **La semana de prueba es larga**: con rutina y rumbo puede sumar 3 estrellas y 2 hazañas antes de la descarga (40 min en la Base). Saltear una prueba no rompe nada.
3. **Una prueba suelta también mueve el escalón**: si hacés Tirón desde Planes con ×4, la escalera de tirar baja. Es lo que pide el modelo.
4. **Compresión con escala fija**: la propuesta decía «según el largo de tu pierna»; se usó una escala fija desde la punta de los pies para no pedir otra medida.
5. **Resuelta en la vuelta**: en horizontal la lista de Planes se achicaba hasta desaparecer (las secciones con `overflow: hidden` dentro de una columna con alto fijo). Ahora nada se achica en la lista de dos paneles.
6. Sin probar en un teléfono real.

## La tijera
- Se fueron los tres niveles, la grilla de hazañas y su menú. Una prueba es una sesión de un bloque, o un bloque más en la sesión de la semana de prueba.
- Las cadenas de estrellas existentes no se reordenaron: las nuevas se sumaron en su lugar.
- No se hicieron íconos nuevos ni el Modelo C.

## Lo que no hay todavía
- Los íconos que Fer ya aprobó: asterismo en grande, pictograma del maniquí en chico. Son lo próximo.
- Dibujos propios para Del piso, el alcance en pike, la bici de 12 min y los mil saltos (usan los de sentadilla profunda, pike, bici y soga).

## Esperando a Fer
- El OK al tablero.
- Los nombres: ¿quedan los mitológicos (Perseo, Hércules…) con la prueba al lado, o pasan a llamarse Tirón, Empuje…?
- Draco como «Escuadra» (L-sit), una octava prueba que la propuesta no tenía.
