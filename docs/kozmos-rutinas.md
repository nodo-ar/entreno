# Kozmos · rutinas y hazañas en el catálogo

Las rutinas y las hazañas viven en archivos de texto, separados del código, como las constelaciones. Viajan dentro de la página al armar (`kozmos/tools/armar.mjs`) y las revisa `node kozmos/pruebas/puras.mjs`.

## Ejercicios (`catalogo/ejercicios.json`)

Cada ejercicio: `id` (texto estable, en castellano y con guiones; nunca se reusa), `nombre`, `indicacion` (una frase de técnica, en voseo) y, si hace falta:

- `equipo`: lista de ids de equipo (`barra`, `paralelas`, `pared`, `poste`, `lastre`, `bici`, `soga`, `mancuernas`, `kettlebell`). Sin equipo, se hace en el piso.
- `lado: true`: se cuenta por lado.
- `mide: "segundos"`: se sostiene en vez de contar repeticiones.
- `patron`: lista de lo que entrena (`tirar`, `empujar`, `piernas`, `bisagra`, `abdomen`, `movilidad`). Lo llevan las habilidades que no están en una escalera (front lever, planche, bandera, muscle-up, parada de manos); los de una escalera toman el de su escalera (`K.caminos.patronDe`).

El equipo de un ejercicio es lo que pide de verdad; una estrella nunca pide menos que su ejercicio. Si pide más, es porque la constelación entera lo pide (Parada de manos pide pared, Lastre pide barra y paralelas); la prueba `catalogo-equipo-coherente` tiene la lista.

## Escaleras (`catalogo/escaleras.json`)

Una escalera es una fila de ejercicios del más fácil al más difícil. Las rutinas de fuerza y de rango la nombran y la app calcula en qué escalón estás a partir del diario: no guarda ningún estado aparte.

```json
{"version": 1, "escaleras": [{
  "id": "tirar", "nombre": "Tirar", "familia": "fu", "patron": "tirar", "texto": "…",
  "pasos": [{"ejercicio": "colgado-activo", "tipo": "segundos", "meta": 60},
            {"ejercicio": "dominada-negativa", "tipo": "repeticiones", "rango": [3, 5]}, …]
}]}
```

- Un escalón de `repeticiones` puede traer su propio `rango`; si no, vale el del bloque.
- Un escalón de `segundos` es un sostén: lleva `meta`, los segundos que hay que juntar para subir.
- Los escalones que tu equipo no permite se saltean (y no cuentan en el total).
- `patron`: lo que entrena la escalera (tirar y remo → `tirar`; empujar y fondos → `empujar`; piernas; isquios → `bisagra`; L-sit y bandera acostada → `abdomen`; cadera y puente → `movilidad`).
- **Variantes de un escalón** (cuentan como el mismo escalón, también en el diario):
  - `tambien`: ejercicios que lo reemplazan si tu equipo no permite el de siempre, sin kilos (sin barra, el remo invertido es el remo debajo de la mesa; sin mancuernas, el remo con mancuerna es el remo con toalla en la puerta).
  - `conPeso`: `{ejercicio, carga, kgInicial, hastaKg}`, el mismo escalón con una pesa; se usa si la tenés (sentadilla → sentadilla con pesa, puente de glúteo → peso muerto rumano con pesa).
  - Sin decir tu equipo, siempre el de siempre.
- **Una pesa** (`pesa`, vuelta 35): los ejercicios que se hacen con una sola pesa (remo a un brazo, sentadilla con pesa, sentadilla búlgara, peso muerto rumano y a una pierna) piden `pesa`, no `mancuernas`. Con mancuernas o con una kettlebell tenés pesa: las pantallas le pasan al motor tu equipo con `K.rutina.conPesa` (`K.tuEquipo()`). Lo que pide dos mancuernas (press de hombros, remo con dos, el circuito con mancuernas) sigue pidiendo mancuernas.
- **Pesas primero** (`K.rutina.defEscalera`): con una pesa, la escalera arranca por lo menos en su primer escalón con kilos. Los kilos se ajustan a vos y lo de abajo, sin peso, queda para bajar: con una pesa, el remo arranca en el remo a un brazo con pesa (6 kg) aunque tu nivel diga el poste. Tu nivel más arriba manda, y lo hecho manda sobre los dos.
- **Kilos con mancuernas**: un escalón con `carga`, `kgInicial` y `hastaKg` (remo con mancuerna 2/6/16, sentadilla búlgara 2/6/14, peso muerto a una pierna 2/8/16). Arrancás en `kgInicial`; con el tope del rango dos veces (o una con «Sobró») sumás `carga` y volvés al mínimo; si pasarías de `hastaKg`, subís al escalón siguiente (sin esos kilos). Dos veces sin el mínimo: `carga` de menos, nunca debajo de `kgInicial`; ya en `kgInicial`, el escalón de abajo. Los kilos que pusiste mandan. La sesión pide «Kilos por mano» y nunca tu peso: no son % de tu peso ni encienden estrellas de Lastre.

Las reglas, en `src/sesion/rutina.js`:

- **Subir**: el tope del rango en todas las series dos sesiones seguidas, o una sola si marcaste «Sobró». Volvés al mínimo del escalón nuevo.
- **Sumar**: cada serie apunta a lo que hiciste en esa misma serie más uno (más 5 s en un bloque de segundos), dentro del rango.
- **Bajar**: dos sesiones sin llegar al mínimo en la primera serie.
- **Trabado**: tres sesiones sin mejorar abren una descarga (la mitad de las series, sin sumar). Después se vuelve a probar.
- **Sostenes**: se juntan 60 s por sesión en sostenes del 50 al 80 % de tu mejor marca (70 % de base; 80 si sobró, 50 si no llegaste). Si en una sesión no llegás a 5 s, bajás un escalón. Subís cuando todas las series llegan a la meta del escalón, dos sesiones seguidas (o una si sobró).
- **Sin tocar nada**: la sensación sale de las repeticiones. Dos o más arriba del objetivo (5 s en segundos) es «Sobró»; llegar es «Justo»; menos es «No llegué».

Fuera de una rutina: `K.rutina.escalonDe(id, {ej, equipo, sesiones, marcas, desde})` dice dónde estás en una escalera (con `desde`, el escalón de arranque si todavía no la hiciste) y `K.rutina.escalonesTodos(ctx)` todas a la vez. Cuentan las series que dicen su `escalera`, vengan de una rutina o no. `K.rutina.armarBloques(familia, bloques, ctx)` arma bloques con el formato de los de una rutina (lo usa `deRutina`, y el día del motor B).

## Zonas, grupos y niveles (vuelta 32, `src/sesion/biblioteca.js`)

Lo que trabaja cada ejercicio, dónde va en la biblioteca y el nivel de rutinas y pruebas salen del catálogo; no hay tablas en el código.

- **`zonas` y `apoyo`**: van en cada escalera y en cada ejercicio que no está en una. `zonas` es lo que trabaja de lleno y `apoyo`, lo que acompaña.
  - Las zonas son: `espalda`, `pecho`, `hombros`, `brazos`, `abdomen`, `cadera`, `gluteos`, `piernas` y `corazon`. El corazón va en lo de motor.
  - Un ejercicio de una escalera hereda las de la primera escalera en la que está, salvo que diga las suyas. Las muñecas, por ejemplo, dicen `brazos`.
  - `K.biblio.zonasDe(id, ej)` → `{zonas, apoyo}`.
  - `K.biblio.pesoDe(id, ej)` → `{zona: 2 | 1}`.
- **`grupo`**: dónde va un ejercicio suelto en la biblioteca. Los grupos son `tirar`, `empujar`, `piernas`, `bisagra` (Isquios y glúteos), `abdomen`, `movilidad` y `motor`.
  - Sin `grupo`, va el primer patrón (el suyo o el de su escalera).
  - Va aparte de `patron` porque `patron` cambia cómo se arma el día y la entrada en calor.
- **`nivel`** (1 inicial, 2 intermedio, 3 avanzado): en cada rutina, después de `minutos`, y en cada prueba.
  - Cada prueba dice además su `tema`, la fila de la vitrina: un grupo de la biblioteca.
  - En pantalla, el nivel son 1, 2 o 3 satélites alrededor del disco del logo (`K.nivelIc`). En una medalla son los satélites del borde.
- **Lo que hace una rutina** (`K.biblio.hace(r, {ej, equipo, sesiones, marcas, nivelDesde})`):
  - Cada serie suma 1 a sus zonas y 0,4 a su apoyo. En una escalera cuenta el ejercicio de tu escalón; cada minuto de un tramo suma lo mismo.
  - Lo que llega al 45 % de la zona más trabajada va de lleno (2); lo que pasa del 12 % va suave (1).
  - Devuelve `{zonas, ejs, fuertes, suaves}`, donde `ejs` son sus ejercicios, del que más series lleva al que menos.
- **La vitrina** (`K.biblio.vitrina(hazanas)`): un tema por fila, en el orden de los grupos, con sus pruebas de nivel 1, 2 y 3; las celdas sin prueba quedan vacías.

```json
{"id": "tirar", "nombre": "Tirar", "patron": "tirar", "zonas": ["espalda", "brazos"], "apoyo": ["hombros", "abdomen"], "pasos": [ … ]}
{"id": "cooper", "nombre": "12 minutos corriendo", "mide": "km", "grupo": "motor", "zonas": ["corazon", "piernas"], "apoyo": ["gluteos"]}
```

## Entrada en calor (`catalogo/entradas.json`)

Piezas para armar la entrada en calor de un día que no viene de una rutina: `{id, nota, seg, para, equipo?, ejercicio?, pulso?, ultima?}`. `para` dice para qué sirve (`general`, `barra`, `manos`, `piernas`); `pulso`, que sube el pulso (va primero); `ultima`, que cierra («Primer ejercicio suave · 5, sin cargar»). `K.caminos.entrada(bloques, {equipo, ej})` arma un bloque de tramos de 5 a 6 minutos: 2 min de bici si tenés bici (si no, saltos de tijera), una pieza por cada cosa que pide el día, lo general hasta completar y la última. Solo usa lo que tu equipo permite; sin decir tu equipo, lo que usan los ejercicios del día.

## Caminos a una estrella

`K.caminos.caminoDe(estrella, {escalones})`: si la estrella se mide con el ejercicio del escalón k de una escalera y tu escalón está debajo, lo que toca es el camino («Camino a …», esa escalera); si no, la estrella. Cuando el ejercicio no está en ninguna escalera, la estrella puede decirlo en el catálogo con `camino: {escalera, hasta}` (el fondo ruso se llega por los fondos).

## El día del motor: un molde para cada día (`src/sesion/dia.js`)

Sin rutina, Hoy sale de `K.dia.armar(cielo, rumbo, sesiones, hoy, {ej, equipo, marcas, nivelDesde?, dadas?, descarga?, minutos?, enfoque?, formas?})`. El día tiene siempre la misma forma; cada bloque dice su parte en `molde`. Lo que sigue es la parte de fuerza; la resistencia y la flexibilidad tienen la suya (abajo, «Lo que entrenás y tu reparto»):

1. **Entrada en calor** (`entrada`): `K.caminos.entrada` según lo que pide el resto del día.
2. **Habilidad, descansado** (`habilidad`): dos metas de tu rumbo (Dominio del cuerpo), en el orden de `K.dia.rotar`: la ventana abierta primero; después la que hace más que no tocás (la que nunca tocaste, antes); empate: la que menos tocaste en 14 días y el orden de tu rumbo. Lo de ayer no se repite si hay otra. Cada meta da su camino (si estás abajo en la escalera de la próxima estrella: un bloque de esa escalera, 3 series, «Camino a …»), su estrella (sostenes del 50 al 80 % de tu mejor marca hasta sumar unos 60 s, con 45 a 90 s de descanso según lo largo del sostén) o la prueba si la ventana está abierta. Dos metas con el mismo ejercicio o la misma escalera van en un solo bloque «para» las dos (`constelaciones`). Si la segunda entrena lo mismo que la primera (mismo patrón principal) y la que sigue no, va la que sigue.
3. **Fuerza de a dos** (`fuerza`): dos superseries de 3 series (rango del escalón o 5–8; sin descanso entre los dos ejercicios y 2 min después del par). Cada par lleva un tirón o un empuje (el que menos series tiene hoy, después el que menos hiciste en 7 días) con piernas (primer par) o bisagra (segundo). Si una habilidad ya entrena piernas o bisagra, ese lugar es para el de arriba que más falta. Escaleras: tirar → remo o tirar; empujar → fondos o empujar; piernas; bisagra → isquios: la primera que tu equipo permite y que el día no usó.
4. **Abdomen** (`abdomen`): L-sit o bandera acostada (la que hace más que no tocás), salvo que una habilidad ya lo entrene (Draco, Bandera humana).
5. **Cierre** (`cierre`): si hoy no hay flexibilidad, 5 min de bici suave (así el abdomen entra en la hora) si tenés bici y el día no pedaleó; si no, tres posturas de 40 s según lo que entrenó el día. Con flexibilidad, ella cierra el día.

Sin ninguna habilidad posible (lo de tu rumbo pide equipo que no marcaste), la parte de fuerza es de fuerza de a dos. Lo que pide equipo queda en `pide` y Hoy lo dice con el atajo a Tu equipo. Al volver de 3 semanas o más, las estrellas al 70 % y las escaleras más livianas, sin ventana. En la semana de prueba (`K.dia.deSemanaDePrueba`) las escaleras van a la mitad, las pruebas adelante y la entrada en calor antes que todo. Nada se repite en un día: ni un ejercicio ni una escalera (dentro de la resistencia, el motor puede repetir el ejercicio de su meta).

`K.dia.frecuencia(n, D) = min(D, 2D/n)`: cada cuánto toca cada meta con n metas y D días por semana (`K.dia.diasSemana`: tus días; si no, lo de las últimas 4 semanas; si no, 3). Tu rumbo no tiene tope y lo dice: «5 elegidas · cada una, 1 o 2 veces por semana».

### Lo que entrenás y tu reparto (vuelta 36)

`enfoque` (de `perfil.enfoque`) es lo que elegiste entrenar en la bienvenida, **en el orden en que lo elegiste**: `fu` fuerza, `mo` resistencia, `ra` flexibilidad. Si tu rumbo tiene metas de otra cosa, se suman al final; sin nada, fuerza (`K.dia.enfoqueDe`). Lo primero se lleva más tiempo del día, después de la entrada en calor (`K.dia.REPARTO`): una cosa, todo; dos, 60 y 40; tres, 50, 30 y 20. `K.dia.reparto(enfoque, minutos)` da esos minutos para mostrarlos (la bienvenida debajo del reloj, Vos en el menú del tiempo).

- **Fuerza**: lo de arriba (habilidad, fuerza de a dos, abdomen). De todas las formas de armarla (una o dos habilidades; uno, dos o ningún par; con o sin abdomen; la fuerza con 2, 3 o 4 series), la que entra con habilidad y al menos un par y, de esas, la más larga. El primer par lleva lo de abajo que menos hiciste en la semana: en un día corto piernas y bisagra se turnan.
- **Resistencia** (`resistencia`): la meta de resistencia de tu rumbo que toca (10 km, bici, soga; lo que se mide en minutos se acorta a lo que haya) y, si sobran 5 minutos, el motor a intervalos (`K.dia.motor`) con lo que quede. Con mucho tiempo, también la meta siguiente. Un día de prueba, la prueba sola.
- **Flexibilidad** (`flexibilidad`): la meta de rango de tu rumbo (espagat, puente; con 20 minutos o más, las dos) y las posturas (`K.dia.posturas`) en el orden de las rutinas de rango; cada día arranca donde dejó el anterior. Las de un lado van de a dos («Un lado», «El otro lado»). Con más tiempo que posturas, cada una dura más (de 45 s a 90 s). Va siempre al final, con el cuerpo caliente.

**Cómo te gusta entrenar** (`formas`, de `perfil.formas`, la rueda de la bienvenida): correr, bici, soga y pesas rusas eligen el motor (trote y caminata, bici, soga o kettlebell) y la meta de resistencia que va primero; yoga hace las posturas de un minuto, empezando por gato y camello.

**Tu tiempo** (`minutos`, de `perfil.minutos`): el día dura lo que elegiste, cinco minutos menos como mucho; sin elegir, hasta la hora. Cada parte necesita unos 10 minutos: si no entran todas, van menos por día (`K.dia.hoyVan`) y se turnan, primero la que más atrasada viene contra su parte en las últimas dos semanas (el primer día, lo que elegiste primero). Con 15 minutos o menos, la entrada en calor es de unos dos minutos y medio y no hay cierre. Lo que una parte no usa lo toma la primera que elegiste. En un día de pura fuerza con 10 minutos de sobra, el motor a intervalos antes del cierre y la bici del cierre se estira hasta 20 minutos. Si igual se pasa, el día se arma de nuevo con menos.

**El árbol** (`kozmos/pruebas/arbol.mjs`): todos los caminos de la bienvenida (12 órdenes de qué entrenar, 512 combinaciones de equipo, 11 tiempos y 4 niveles; 202.752 días) contra el motor, con lo que cada uno tiene que dar: el tiempo, una parte por cosa que va hoy y nada que no elegiste, lo primero pesa más, nada que pida equipo que no tenés, nada repetido y la flexibilidad al final. Las pruebas sin pantalla corren una muestra (`arbol-caminos`, `arbol-formas`, `arbol-turnos`); el árbol entero, `node kozmos/pruebas/arbol.mjs`.

`nivelDesde` (el escalón de arranque de cada escalera) y `dadas` (estrellas que tu nivel da por hechas) salen de Tu nivel (abajo): lo que hiciste manda sobre el nivel.

## Tu nivel (`src/sesion/nivel.js`)

Cinco movimientos, cada uno un menú con cuatro niveles y «No sé» al final. Cada nivel es un ejercicio que se ve (la figura en la fila): el que te sale con las repeticiones de la pregunta. Se guardan en el perfil como `nivel: {empujar, tirar, piernas, cadera, abdomen, fecha}` con `"0"` Inicial, `"1"` Intermedio, `"2"` Avanzado, `"3"` Experto o `"nose"` (la fecha es la del último cambio). «No sé» o no contestar es arrancar desde el principio. Tirar se pregunta solo con barra (sin decir tu equipo, los cinco); si después sacás la barra, ese nivel deja de contar.

| Movimiento (pregunta) | Inicial | Intermedio | Avanzado | Experto |
| --- | --- | --- | --- | --- |
| `empujar` (8 seguidas) | flexión con las manos en alto | flexión en el piso | flexión con los pies en alto | flexión cargando un brazo |
| `tirar` (5 seguidas, con barra) | colgarme de la barra | dominada | dominada rápida, pecho a la barra | dominada cargando un brazo |
| `piernas` (8 por pierna) | sentadilla | un pie atrás, en alto | una pierna, hasta una silla | una pierna, hasta abajo |
| `cadera` · Atrás de las piernas (8 seguidas) | puente de glúteo | bisagra en una pierna | curl deslizando los pies | de rodillas, bajar despacio |
| `abdomen` (20 s) | plancha | banana boca arriba | piernas en L, en el aire | piernas en V, en el aire |

**Dónde arrancás** (`K.nivel.desde`, conservador: D1): el escalón de arranque por escalera. Si tu equipo no permite ese escalón, la escalera usa el de abajo que sí (el fondo sin paralelas es el fondo en banco). Lo que ya hiciste en una escalera manda sobre esto.

| Movimiento | Inicial | Intermedio | Avanzado | Experto |
| --- | --- | --- | --- | --- |
| empujar | empujar: flexión inclinada; fondos: flexión cerrada | flexión; fondo en banco | flexión declinada; fondo | flexión arquera; fondo |
| tirar | tirar: dominada negativa; remo: agarrado del marco de la puerta | dominada; remo invertido | dominada explosiva; remo invertido | dominada arquera; remo invertido a un brazo |
| piernas | sentadilla | sentadilla búlgara | hasta una silla | pistol |
| cadera (isquios) | puente de glúteo | peso muerto a una pierna | curl femoral deslizante | nórdico negativo |
| abdomen (L-sit) | plancha | hollow | l-sit | v-sit |

**Lo que se da por hecho** (`K.nivel.dadas`; cada nivel suma lo de los de abajo): tirar Intermedio el colgado de 60 s (Front lever); Avanzado además Dominadas ×10 (Muscle-up) y la bolita 10 s (Front lever); Experto además Dominadas ×15 (Un brazo). Empujar Avanzado Flexiones ×30 (Planche); Experto además Flexiones ×40 (Un brazo). Piernas Avanzado la de 5 hasta la silla; Experto además Pistol ×3. Abdomen Avanzado L-sit 10 s; Experto además L-sit 20 s. Atrás de las piernas no da estrellas.

**Lo de antes** (`K.nivel.normal`): un nivel guardado con las cuatro preguntas por cantidad (dominadas, flexiones, una pierna, parada de manos) se lee por movimiento, un escalón abajo ante la duda: dominadas `0` → tirar Inicial, `1-9` → Intermedio, `10-14` → Avanzado, `15+` → Experto; flexiones `0-9` / `10-29` / `30-39` / `40+` → empujar Inicial a Experto, y abdomen Inicial (hasta 19), Intermedio (20-29) o Avanzado (30 o más); una pierna `no` / `silla` / `completa` → piernas Inicial / Avanzado / Experto y atrás de las piernas Inicial / Intermedio / Avanzado. La parada de manos ya no se pregunta: se prueba haciéndola. Lo dicho por movimiento manda; al cambiar un nivel se guarda la forma nueva. Un respaldo con la forma de antes se trae igual.

Una estrella dada no se enciende ni escribe marcas: en tu cosmos se ve punteada con «N estrellas dadas por hechas», los totales no cambian y la próxima es la que sigue (`K.nivel.efectiva`, la misma regla en Hoy, el cosmos, la ventana y la semana de prueba). Se enciende de verdad cuando la hacés. Un intento real a esa estrella que no llega (anotado, o una serie que la probaba, desde la fecha de tu nivel) le saca lo de dada y vuelve a ser la próxima. Las series de una escalera no cuentan como intento.

`K.nivel.arrancasEn(c, {escalones, ej})`: lo que dice Tu rumbo debajo de cada elegida que todavía no empezaste, «Arrancás en …»: el escalón del camino si estás abajo en la escalera, si no la próxima estrella.

## Las rutinas en el molde (`K.dia.deRutina`)

Una rutina que seguís conserva sus ejercicios, series, semanas, semana de prueba y meta; el molde le da la forma del día de Hoy (vuelta 31, opción A elegida por Fer). `K.dia.deRutina(r, i, ctx)` marca cada bloque con su parte (`entrada`, `fuerza`, `abdomen`, `cierre`, `motor` o `rango`):
- **Tu nivel**: sus escaleras arrancan en `nivelDesde`; lo que ya hiciste manda sobre el nivel y sobre el `desde` de la rutina.
- **Fuerza**: la entrada en calor del catálogo se cambia por la de Hoy (armada con tu equipo y el día) y se suma el cierre de Hoy: bici de 5 min si entra en la hora, si no posturas. Las superseries van bajo «Fuerza de a dos»; L-sit y dragon, bajo «Abdomen».
- **Motor** (correr, intervalos): un solo bloque con tramos, como siempre; en pantalla se muestra en Entrada, Motor y Cierre («Vuelta a la calma»). La sesión no cambia.
- **Rango**: sin entrada en calor ni cierre agregados.
- **Semana de prueba y ventana**: las pruebas van después de la entrada en calor (`K.dia.deSemanaDePrueba`), nunca en frío.

## Rutinas (`catalogo/rutinas/<id>.json`, una por archivo)

```json
{
  "id": "armstrong",
  "nombre": "Cinco días de dominadas",
  "familia": "fu",
  "texto": "Cinco días por semana para sumar dominadas seguidas.",
  "semanas": 6, "dias": 5, "minutos": 25,
  "equipo": ["barra"],
  "alimenta": ["un-brazo.dominada-arquera-5"],
  "fuente": "el programa Armstrong de los Marines de EE. UU.",
  "sesiones": [{"nombre": "Máximas", "nota": "…", "bloques": [ … ]}]
}
```

- `familia`: `fu`, `ra` o `mo`, como las constelaciones.
- `alimenta`: ids de estrellas hacia las que lleva. Al menos una.
- `sesiones`: todas, en orden (semanas × días). La sesión `i` es la que toca después de hacer `i` sesiones de la rutina.
- `equipo` puede pedir `pesa`: una mancuerna o una kettlebell, cualquiera de las dos (la app la suma sola si tenés alguna).

**Cada familia, en los tres niveles (vuelta 35).** Para hacer cualquier cosa por tu cuenta, sin depender del día que arma Kozmos, se sumaron cinco rutinas, todas con escalones o tiempos que crecen semana a semana:

| Rutina | Familia | Nivel | Qué progresa |
| --- | --- | --- | --- |
| Fuerza en casa (`casa`) | fuerza | 1 | Escaleras de todo el cuerpo, 3 series y 4 desde la semana 5; con una pesa, el remo, la sentadilla y el peso muerto arrancan con kilos |
| Fuerza con una pesa (`una_pesa`) | fuerza | 2 | Las mismas escaleras con kilos, más swing y paseo de la maleta; primero suben las repeticiones, después los kilos |
| Movilidad con fuerza (`rango`) | movilidad | 2 | Cadera, hombros y todo el cuerpo: posturas de 45 s a 1:30 y escaleras de cadera, puente e isquios |
| Movilidad avanzada (`abierto`) | movilidad | 3 | Espagat, piernas abiertas y puente: posturas de 1 a 2 min y los últimos escalones de cadera y puente |
| Swing para empezar (`swing`) | motor | 1 | Swing a intervalos: de 20 s con 40 de pausa a 40 s con 20, y de un bloque a dos |

### Bloques

**Series** (fuerza y sostenes):

```json
{"ejercicio": ["dominada", "dominada-negativa", "remo-invertido"], "tipo": "repeticiones", "series": 3,
 "rango": [5, 8], "descanso": 120, "grupo": "A"}
```

- `ejercicio`: uno o una lista de alternativas; la app usa la primera que tu equipo permite.
- `escalera` (en lugar de `ejercicio`): el id de una escalera, o una lista; la app usa la primera en la que tu equipo permite algún escalón. Con `desde`, el escalón donde arranca quien no tiene historia. Un bloque de escalera lleva `series` y, si el escalón no trae el suyo, `rango`.
- `tipo`: `repeticiones` o `segundos`.
- Lo que se pide en cada serie sale de uno de estos, en este orden:
  - `porSerie`: un número o `"max"` (al máximo) por serie;
  - `rango`: mínimo y máximo; arranca en el mínimo y suma por serie con las mismas reglas de las escaleras (es una escalera de un solo escalón);
  - `objetivo`: un número fijo.
- `elegir` (solo 100 flexiones): `{"umbrales": [5, 10], "columnas": [[…], […], […]]}`. Tu mejor serie de ese ejercicio elige la columna de `porSerie`.
- `carga` (con lastre): kilos que se suman cuando completás el rango dos veces seguidas, en vez de subir de escalón. La sesión pide repeticiones y los kilos de lastre (y tu peso, para el %). Los kilos de las mancuernas van en la escalera, no en el bloque.
- `descanso`: segundos después de cada serie.
- `grupo`: dos bloques seguidos con el mismo grupo se alternan serie a serie (superserie). En Hoy y en los días de la rutina van en una fila cada uno, juntos, con «en superserie» (tres: «en triserie»).
- `dura` (opcional): los segundos que lleva una serie larga (los 1000 saltos), para que los minutos del día no mientan. Sin esto, una serie de repeticiones cuenta 45 s.

**Tramos** (cardio, intervalos, cada minuto, movilidad):

```json
{"nombre": "4 × 4", "tramos": [{"clase": "entrada", "seg": 600}, {"clase": "fuerte", "seg": 240}, …],
 "mide": {"ejercicio": "intervalos", "tipo": "sesiones"}}
```

- Clases: `entrada`, `fuerte`, `suave`, `pausa`, `trabajo`, `postura`, `vuelta`.
- Un tramo puede llevar `ejercicio` (uno o alternativas), `reps` y `nota`.
- `{"repetir": 8, "tramos": [{"clase": "trabajo", "seg": 20}, {"clase": "pausa", "seg": 10}]}` repite esos tramos 8 veces. Se puede usar dentro de cualquier lista de tramos, también en las hazañas.
- La app pasa sola de un tramo al siguiente, con pitido y vibración.
- `mide` (opcional): lo que la sesión anota al terminar el bloque.
  - `{"ejercicio": "trote", "tipo": "minutos", "de": "fuerte-seguido"}`: los minutos del tramo fuerte más largo.
  - `{"ejercicio": "bici", "tipo": "minutos", "de": "total"}`: los minutos del bloque entero.
  - `{"ejercicio": "intervalos", "tipo": "sesiones"}`: una sesión de intervalos.

## Hazañas: pruebas con escala (`catalogo/hazanas.json`, versión 2)

Desde el Modelo B, cada hazaña es una **prueba estandarizada**: mide un ejercicio, tiene una escala de cinco magnitudes y sabe qué estrellas puede encender. El nombre (Perseo, Hércules…) es nombre propio; `prueba` es lo que mide, en corto.

```json
{"version": 2, "hazanas": [{
  "id": "perseo", "nombre": "Perseo", "prueba": "Tirón", "familia": "fu",
  "texto": "Dominadas estrictas, todas las que salgan.", "como": "Colgado con los brazos rectos…",
  "formato": "maximo",
  "mide": {"ejercicio": "dominada", "tipo": "repeticiones"},
  "escala": [1, 5, 10, 15, 20],
  "estrellas": ["muscle-up.dominadas-10", "un-brazo.dominadas-15"],
  "cada": 42,
  "tema": "tirar", "nivel": 2,
  "antes": {"formato": "amrap"}
}]}
```

- `tema` y `nivel` (vuelta 32): la fila y la columna de la vitrina. Desde la vuelta 32 hay 14 pruebas: las 8 de antes, en su orden, y 6 nuevas al final, para que la semana de prueba y «la próxima» elijan igual que antes. Toda prueba nueva necesita una escala revisada contra una norma publicada y su `fuente`; puede no encender estrellas (`"estrellas": []`) y dar solo su medalla. Las nuevas son Mentón sobre la barra (`lira`), Flexiones seguidas (`cefeo`), Silla, un minuto (`tauro`, con `"formato": "reloj"` y `"minutos": 1`), Plancha al máximo (`fenix`), Plancha de costado (`cisne`) y 12 minutos corriendo (`centauro`, reloj de 12 minutos y km).

- `formato`:
  - `maximo`: una serie, todas las que salgan (o el sostén más largo, o lo que anotás: puntos, centímetros).
  - `reloj`: un tiempo fijo (`minutos`) y al final anotás lo que hiciste (Motor 12: los km).
  - `escalera`: cada minuto una más; con «No llegué» cuenta el último minuto completo.
  - `tiempo`: lo que dicen los `items`, lo más rápido posible (Mil saltos).
- El ícono no se escribe: una prueba es una medalla con la persona haciendo `mide.ejercicio` y los satélites de su `nivel` (`src/piezas/iconos.js`); una rutina, la persona haciendo lo que más series lleva; una constelación, la persona haciendo su última estrella adentro de un anillo de avance. Es el mismo en todas las pantallas. Desde la vuelta 22 ya no hay `figura` (la constelación dibujada a mano).
- `escala`: cinco umbrales, de la magnitud 5 a la 1. Con `{"propia": [0, 5, 10, 15, 20]}` es por persona: el % de mejora contra tu primera vez.
- `estrellas`: las que puede encender. Puede ser más de una constelación a la vez.
- `cada`: cada cuántos días toca repetirla (42 si falta).
- `entrena` (opcional): qué se entrena entre pruebas para una estrella que solo se mide con la prueba (por ejemplo, la sentadilla profunda para Del piso).
- `fuente` (opcional): va al pie, nunca en el texto.
- `antes`: el formato que tenía en la versión 1, para leer las sesiones guardadas entonces.

## Semana de prueba (`bloque` en cada rutina)

Cada rutina trae `"bloque": {"carga": 3, "prueba": 1}`: tantas semanas de carga y una de prueba (bloques de 4 a 6 semanas). La semana sale de las sesiones hechas de la rutina (sesión `i` → semana `i / días`), no del calendario. En la semana de prueba:

- Toca la misma sesión, con la mitad de las series (descarga).
- La primera sesión de esa semana lleva las pruebas adelante, descansado: las próximas estrellas de las constelaciones a las que lleva la rutina (hasta 3) y una o dos hazañas (la que toca antes; la segunda, solo si también toca). Las de motor van al final.
- Las demás sesiones de esa semana son solo la descarga.
- Lo que sacás en una prueba fija dónde arranca el bloque siguiente en cada escalera: se trabaja al 75 % de tu máximo; si eso ya llega al tope del rango, el escalón de arriba; si no llega al mínimo, el de abajo.
- Si volvés después de 3 semanas sin entrenar, la prueba espera.

**La meta** (`"bloque": {"carga": 5, "prueba": 1, "meta": "100 flexiones seguidas"}`): en una rutina que termina en un desafío o en una prueba de lo que busca, la última semana es la meta: completa, sin descarga y sin pruebas sueltas. Si la semana de prueba caía ahí, pasa a la anterior y cierra ese bloque (100 flexiones: prueba en la 5, meta en la 6). `meta` es `true` o lo que se busca, en corto (hasta 30 letras); la app lo dice como «Semana 6: la meta · 100 flexiones seguidas». El motor no conoce ninguna rutina: todo sale de `K.rutina.semanas`. Hoy tienen meta: Correr tus primeros 5 km, Correr de 5 a 10 km, 100 flexiones, Intervalos de 1 minuto en bici, Abdomen de gimnasta, Arranques con kettlebell y Soga hasta 1000 saltos (acta 020).

En la semana de prueba y en una escalera trabada, cada fila de Hoy y de los días dice «más liviana», como la serie en la sesión.

Sin rutina, con tu rumbo, cuenta semanas de calendario con alguna sesión: después de 4, la semana de prueba. La ventana de prueba del 80 % es la habilidad del día de esa meta.

## Lo que guarda el diario

Una sesión de rutina guarda `rutina: {id, sesion}`. Cada bloque del día del motor guarda `molde` (la parte: `entrada`, `habilidad`, `fuerza`, `abdomen`, `cierre`) y, si era para metas de tu rumbo, `constelaciones` (la lista; los bloques de antes guardan una sola, `constelacion`, y las dos cuentan para rotar). La serie de una entrada en calor no guarda ejercicio: las calorías la cuentan como el resto del día. Cada serie de una escalera guarda además `escalera`, `rango`, `n` (cuántas series pedía), `descarga` si era una descarga y, si la tocaste, `sensacion` (`sobro`, `justo` o `no-llego`). Una serie con lastre guarda `lastreKg` y `pesoKg`; una con mancuernas, `kg` (por mano, sin tu peso). Las sesiones viejas, sin esos campos, siguen contando: sus series entran en la escalera del ejercicio que hicieron. Una prueba (hazaña) guarda `hazana: {id, v: 2, valor, completa, ejercicio, tipo}` y su serie lleva `hazana` con el id; esa serie cuenta como marca en el Cielo. Una sesión de la semana de prueba guarda `semanaPrueba: {bloque, rutina, semana, pruebas}`. Las hazañas de antes (versión 1) guardaban `hazana: {id, nivel, valor}`, con `valor` en segundos (tiempo, chipper), rondas (amrap) o 1 (completada): se siguen viendo en tu historia y en la prueba, como «versión anterior», y no cuentan como marcas. El perfil guarda `rutina: {id, desde}` mientras la seguís y `dias`: los días de la semana que entrenás (0 = lunes).

## La bienvenida (`src/pantallas/bienvenida.js`, vuelta 35)

La primera vez que se abre la app en un teléfono sin nada (ni sesiones, ni marcas, ni rumbo, ni rutina, ni equipo, ni nivel), una capa arriba de todo pregunta en tres pasos: qué querés entrenar (fuerza, resistencia, flexibilidad; uno o más, y el orden importa), qué tenés y cuánto tiempo (minutos por día de 10 a 60 y días por semana de 2 a 6), y desde dónde arrancás: eligiéndolo por movimiento (las figuras de `K.nivel.PREGUNTAS`; sin barra no pregunta por tirar) o con una prueba de un minuto (flexiones si elegiste fuerza primero, alcance de piernas si fue flexibilidad; solo resistencia, la prueba es correr y va en el primer día). Al llegar a «Tu primer día» guarda todo junto en el perfil: `equipo`, `minutos`, `dias` (repartidos desde hoy), `rumbo` (dos o tres constelaciones por cosa elegida, las que tu equipo permite y primero las que tu nivel ya empezó), `nivel` y `bienvenida` (la fecha; con eso no vuelve, y viaja en el respaldo). La prueba queda como una sesión de prueba, igual que la de Planes. El día lo arma `K.hoyPlan`. Si se cierra a la mitad, un borrador en este teléfono (`localStorage`, `kozmos.bienvenida.v1`) la retoma en el mismo paso. Las pruebas de pantalla que no son de la bienvenida la marcan como vista (`prefs.bienvenida`).
