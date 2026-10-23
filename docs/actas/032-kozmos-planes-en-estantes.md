# Acta · Kozmos · vuelta 32 · Planes en estantes · Construir → Probar

Fer eligió la opción A del boceto de Planes (m28), «Estantes», y sumó cuatro cosas: el corazón como zona del cuerpo; el nivel de rutinas y medallas como 1, 2 o 3 satélites (el punto del logo); la biblioteca de ejercicios dentro de Planes, por las puertas del estante de Ejercicios; y el nombre de cada ejercicio en Hoy y en los días de una rutina abre su página. Pidió «que quede todo bien logrado y alineado, que sea fácil de entender». Ya en obra pidió un cuerpo mejor logrado: «más parecido a los que ya tenemos o con un poco más de detalle de los músculos». Las opciones B y C del boceto y el interruptor `planes.alt` no se construyen.

**Equipo**: la persona · Casandra · la tijera · la directora de arte (elegida: es una vuelta de cómo se ve) · ayudantes: el fiscal (cada escala contra su norma publicada), el pulgar (390 × 844 y 844 × 390) y el estrangulador (360 px).

## 1 · Lo que ve la persona
- **Planes**: arriba, para vos, tu rutina (sus semanas en puntos y cuándo es la prueba) y la próxima prueba (su medalla y tu última), lado a lado. Después, tres estantes: Rutinas, Ejercicios y Pruebas.
- **Estantes**: todos funcionan igual. Se deslizan de costado, frenan en cada tarjeta y la siguiente asoma. Todas las tarjetas de un estante miden lo mismo y sus nombres arrancan a la misma altura. El menú de familia queda solo para las rutinas, que van de inicial a avanzado.
- **Tarjeta de rutina**: el cuerpo de frente y de espaldas con lo que trabaja (de lleno en el color de la familia, el apoyo suave y lo demás neutro), el nivel en satélites, el nombre y los minutos. Debajo, sus semanas en puntos (la de prueba en anillos) y sus ejercicios, cada uno con su persona.
- **El cuerpo**: tiene la silueta del maniquí (cabeza, cuello y miembros redondeados) y cada músculo con su forma: deltoides, pectorales, bíceps y tríceps, antebrazos, abdominales y oblicuos, flexores de la cadera y glúteo medio, trapecio, dorsales y lumbares, glúteos, cuádriceps, isquios y gemelos. Entre músculo y músculo hay una línea fina. El corazón, si trabaja, es el satélite del logo sobre el pecho. Se lee igual en la tarjeta y en la página de la rutina, en claro y en grafito.
- **Pruebas en vitrina**: un tema por fila (Tirar, Empujar, Piernas, Abdomen, Movilidad, Motor) y un nivel por columna (Inicial, Intermedio, Avanzado). «Ver todas» abre la vitrina grande, con el nombre y tu marca de cada medalla; abrir una dice arriba su tema y su nivel, como «Motor, intermedio».
- **Medallas**: llevan los satélites de su nivel en todas las pantallas. Ganada, el primero es el satélite del logo y los otros van en el color de la familia; sin ganar, van en gris.
- **Seis pruebas nuevas**, cada una con su fuente al pie:
  - Mentón sobre la barra
  - Flexiones seguidas
  - Silla, un minuto
  - Plancha al máximo
  - Plancha de costado
  - 12 minutos corriendo
- **Biblioteca de ejercicios**:
  - Se llega por las puertas del estante, una por grupo y una para todos.
  - La lista va por lo que trabaja, con dos menús: «Qué trabaja» y «Con qué».
  - Cada ejercicio muestra:
    - la persona haciéndolo
    - qué trabaja, con el mismo cuerpo
    - cómo se hace
    - tu mejor marca
    - su escalera, con «Más fácil», «Más difícil» y «El tuyo»
    - la prueba que lo mide
    - lo que enciende
    - las rutinas que lo usan
  - En horizontal, la lista va a la izquierda y el ejercicio abierto a la derecha. La fila abierta queda a la vista en la lista.
- **Nombres que abren su ejercicio**: en Hoy y en los días de una rutina, el nombre de cada ejercicio lleva un subrayado suave y abre su página; volver vuelve de donde viniste. El resto de la fila no cambia y tocarlo no hace nada. En la página de una rutina, «Sus ejercicios» también abre cada uno.
- En horizontal, una lista que se redibuja queda donde estaba: su altura y lo deslizado de cada estante.

## 2 · Lo que cambia por dentro
- **Catálogo** (formato en `docs/kozmos-rutinas.md`, «Zonas, grupos y niveles»):
  - `zonas` y `apoyo` en cada escalera y en cada ejercicio suelto; `grupo` en los sueltos.
  - `nivel` en las 26 rutinas y en las 14 pruebas, y `tema` en cada prueba.
  - Tres ejercicios nuevos, con su pose: «Colgado con el mentón sobre la barra», «Sentarte y pararte de una silla» y «12 minutos corriendo».
- **`src/sesion/biblioteca.js`** (puro): `K.biblio` con zonas, grupos, niveles, lo que trabaja un ejercicio (`zonasDe` y `pesoDe`), lo que hace una rutina (`hace`, con tus escalones de ahora) y la vitrina.
- **`src/pantallas/planes.js` y `planes.css`**: Planes, los estantes, el cuerpo, el nivel, las semanas en puntos, la vitrina y el vistazo de la rutina.
- **`src/pantallas/ejercicios.js` y `ejercicios.css`**: la biblioteca.
- **`rutinas.js`**: deja la pantalla de Planes y conserva la prueba y la rutina. `K.P.hazana(id, volver)` dice su tema y su nivel.
- **`iconos.js`**: `medalla(h, ganada, px, lb, nivel = h.nivel)` y el ícono nuevo `ejercicio(id, fam, px)`.
- **`rutina.js`**: las filas guardan `ej`, el id del ejercicio.
- **`hoy.js`**: `K.ejLink` envuelve el nombre.
- **`app.js`**:
  - rutas `#/planes/pruebas[/<id>]` y `#/planes/ejercicios[/<id>]`
  - las puertas (`data-ejque`) y los menús `#ej-que` y `#ej-con`
  - `K.verElegido`, para que lo elegido en horizontal quede a la vista
  - lo deslizado se conserva al redibujar
- **Lo que no cambia**: el diario, el respaldo y la clave de almacenamiento. Nada nuevo se guarda, salvo lo elegido en los dos menús de la biblioteca (`ejercicios.que` y `ejercicios.con`, en preferencias).

## 3 · Las escalas nuevas (el fiscal)
Cada escala se revisó contra su norma publicada, de la magnitud 5 a la 1.

| Prueba | Nivel | Escala | Fuente |
| --- | --- | --- | --- |
| Mentón sobre la barra | tirar, 1 | 15, 25, 40, 55 y 70 s | Prueba física de los Marines de EE. UU. (colgado con brazos flexionados, de 15 a 70 s) |
| Flexiones seguidas | empujar, 1 | 5, 10, 17, 22 y 29 | ACSM, normas de 20 a 29 años |
| Silla, un minuto | piernas, 1 | 25, 32, 40, 48 y 56 | Strassmann y otros (2013), percentiles por edad |
| Plancha al máximo | abdomen, 1 | 30, 60, 90, 120 y 180 s | Strand y otros (2014) |
| Plancha de costado | abdomen, 2 | 30, 45, 60, 90 y 120 s | McGill, Childs y Liebenson (1999) |
| 12 minutos corriendo | motor, 2 | 1,6, 1,8, 2,2, 2,4 y 2,8 km | Cooper (1968) |

- **Quedaron afuera**, por no tener una norma creíble para escalarlas: colgado al máximo, flexiones inclinadas, flexiones arqueras, pistol y pistol a la silla, fondos, sentadilla contra la pared, salto en largo, rascado de espalda, sentadilla profunda y sostén del puente.
- **10 km**: lo reemplaza Cooper.
- Las pruebas nuevas van al final del catálogo: entre dos que tocan igual, gana la de antes. Una prueba que nunca hiciste toca ya, así que quien ya hizo las 8 de antes ve primero las nuevas.
- Solo «Flexiones seguidas» enciende estrellas; las otras cinco dan solo su medalla.

## 4 · Pruebas
- **Sin pantalla**:
  - Nuevas: `catalogo-zonas`, `catalogo-grupos`, `catalogo-niveles`, `hazanas-nuevas-escalas`, `biblio-rutina-hace` e `iconos-medalla-nivel`.
  - Cambiada: `catalogo-hazanas` pasa de 8 a 14 pruebas. Las 8 de antes van primero y en su orden; las nuevas necesitan fuente y pueden no encender estrellas.
- **De pantalla, nuevas**: `planes-estantes`, `planes-vitrina`, `biblioteca-ejercicios` y `ejercicio-enlaces`.
- **De pantalla, cambiadas a la pantalla nueva** (qué afirmaban y qué afirman ahora):
  - `planes-proxima-prueba`:
    - La escala, tus veces y «Probar ahora» pasan de la tarjeta a la prueba abierta.
    - La próxima ya no se saca de la lista: la vitrina la marca.
    - «hace 10 días» pasa a ser la marca en la vitrina grande.
    - Siembra también las seis pruebas nuevas: sin hacer, tocan ya y serían la próxima.
  - `planes-familia`: las pruebas ya no tienen menú de familia (van por tema y nivel); el de rutinas queda.
  - `rutina-linea-escalon`: «Tu rutina» muestra sus semanas en puntos (`.sem-pts`) en lugar de la escalerita (`.esc-mini`).
  - `planes-horizontal`: «nombres cortados en las filas» pasa a «los estantes entran en la lista y sus tarjetas miden lo mismo». La rutina marcada es la tarjeta, que queda a la vista en su estante.
  - `planes-pestana`:
    - El orden pasa a ser para vos, rutinas, ejercicios y pruebas.
    - Las pruebas pasan de 8 a 14, y las 26 rutinas se cuentan como tarjetas.
  - `planes-iconos-b`:
    - Las medallas de la vitrina miden 46 px y llevan su nivel.
    - Las rutinas son el cuerpo y sus ejercicios en el color de la familia.
    - La próxima prueba mide 52 px y «Tu rutina» muestra sus semanas.
  - `rutina-cardio-entera` y `hazana-prueba-maximo`: 26 rutinas en tarjetas y 14 pruebas.
  - `sin-desborde-360`: suma la vitrina, una prueba nueva, la biblioteca y un ejercicio.
  - `horizontal` y `cielo-horizontal`: «abrir un ajuste o una constelación no mueve la lista» se mide ahora con la fila ya a la vista, como la toca una persona. Antes la lista volvía arriba en cada redibujo y la prueba medía desde arriba; ahora queda donde estaba. Por lo mismo, «los dos títulos se alinean» se mide con la lista arriba de todo.

- **Resultado**: `puras.mjs`, 120 en verde. Suite completa, en verde: 108 de pantalla en 1049 s.
- `hoy-sin-repetir-constelacion` compara el nombre sin el enlace y mira el enlace aparte. `planes-vitrina`, `biblioteca-ejercicios` y `ejercicio-enlaces` tocan el volver que se ve, porque la lista de atrás también tiene el suyo, escondido.

## 5 · Lo que queda
- Las tarjetas «para vos» en horizontal van una debajo de la otra: ocupan la primera pantalla de la lista.
- «Sentarte y pararte» (del piso) y «Silla, un minuto» se parecen de nombre: mirar con Fer si «Del piso y arriba» se entiende mejor.
- El cuerpo de las rutinas de rango (movilidad) marca cadera y piernas: es correcto, pero dice poco de la flexibilidad.

## Segunda pasada (después de la revisión de Fer)

- Fer aceptó las dos recomendaciones: «Sentarte y pararte» pasa a «Del piso y arriba» (también en sus estrellas; el id `sagitario` no cambia) y, en horizontal, las tarjetas de «para vos» una arriba de la otra.
- El menú «Con qué» de la biblioteca lleva el ícono de cada equipo (el mismo de Tu equipo); «Sin nada», la persona sola; «Con lo que tenés», los dos aros.
- Los niveles quedan con los satélites: Fer se refería a las barras de las escaleras. Se mostraron bocetos (constelación, anillo, escalera y variantes) y eligió la **escalera de bloques con vos parado en el escalón de ahora**: en Hoy («Tu avance»), en la rutina («Tus escalones») y en Tu nivel («Arrancás en»).
- La cantidad de escalones sale del catálogo; Remo y Fondos son cortas (anotado en el backlog).
- Suite completa: 108 de 108 de pantalla y 120 de 120 sin pantalla. Publicada como versión 40 con el OK de Fer al tablero.
