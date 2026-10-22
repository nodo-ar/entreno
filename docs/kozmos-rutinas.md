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
  - `conPeso`: `{ejercicio, carga, kgInicial, hastaKg}`, el mismo escalón con mancuernas; se usa si las tenés (sentadilla → sentadilla con mancuernas, puente de glúteo → peso muerto rumano).
  - Sin decir tu equipo, siempre el de siempre.
- **Kilos con mancuernas**: un escalón con `carga`, `kgInicial` y `hastaKg` (remo con mancuerna 2/6/16, sentadilla búlgara 2/6/14, peso muerto a una pierna 2/8/16). Arrancás en `kgInicial`; con el tope del rango dos veces (o una con «Sobró») sumás `carga` y volvés al mínimo; si pasarías de `hastaKg`, subís al escalón siguiente (sin esos kilos). Dos veces sin el mínimo: `carga` de menos, nunca debajo de `kgInicial`; ya en `kgInicial`, el escalón de abajo. Los kilos que pusiste mandan. La sesión pide «Kilos por mano» y nunca tu peso: no son % de tu peso ni encienden estrellas de Lastre.

Las reglas, en `src/sesion/rutina.js`:

- **Subir**: el tope del rango en todas las series dos sesiones seguidas, o una sola si marcaste «Sobró». Volvés al mínimo del escalón nuevo.
- **Sumar**: cada serie apunta a lo que hiciste en esa misma serie más uno (más 5 s en un bloque de segundos), dentro del rango.
- **Bajar**: dos sesiones sin llegar al mínimo en la primera serie.
- **Trabado**: tres sesiones sin mejorar abren una descarga (la mitad de las series, sin sumar). Después se vuelve a probar.
- **Sostenes**: se juntan 60 s por sesión en sostenes del 50 al 80 % de tu mejor marca (70 % de base; 80 si sobró, 50 si no llegaste). Si en una sesión no llegás a 5 s, bajás un escalón. Subís cuando todas las series llegan a la meta del escalón, dos sesiones seguidas (o una si sobró).
- **Sin tocar nada**: la sensación sale de las repeticiones. Dos o más arriba del objetivo (5 s en segundos) es «Sobró»; llegar es «Justo»; menos es «No llegué».

Fuera de una rutina: `K.rutina.escalonDe(id, {ej, equipo, sesiones, marcas, desde})` dice dónde estás en una escalera (con `desde`, el escalón de arranque si todavía no la hiciste) y `K.rutina.escalonesTodos(ctx)` todas a la vez. Cuentan las series que dicen su `escalera`, vengan de una rutina o no. `K.rutina.armarBloques(familia, bloques, ctx)` arma bloques con el formato de los de una rutina (lo usa `deRutina`, y el día del motor B).

## Entrada en calor (`catalogo/entradas.json`)

Piezas para armar la entrada en calor de un día que no viene de una rutina: `{id, nota, seg, para, equipo?, ejercicio?, pulso?, ultima?}`. `para` dice para qué sirve (`general`, `barra`, `manos`, `piernas`); `pulso`, que sube el pulso (va primero); `ultima`, que cierra («Primer ejercicio suave · 5, sin cargar»). `K.caminos.entrada(bloques, {equipo, ej})` arma un bloque de tramos de 5 a 6 minutos: 2 min de bici si tenés bici (si no, saltos de tijera), una pieza por cada cosa que pide el día, lo general hasta completar y la última. Solo usa lo que tu equipo permite; sin decir tu equipo, lo que usan los ejercicios del día.

## Caminos a una estrella

`K.caminos.caminoDe(estrella, {escalones})`: si la estrella se mide con el ejercicio del escalón k de una escalera y tu escalón está debajo, lo que toca es el camino («Camino a …», esa escalera); si no, la estrella. Cuando el ejercicio no está en ninguna escalera, la estrella puede decirlo en el catálogo con `camino: {escalera, hasta}` (el fondo ruso se llega por los fondos).

## El día del motor: un molde para cada día (`src/sesion/dia.js`)

Sin rutina, Hoy sale de `K.dia.armar(cielo, rumbo, sesiones, hoy, {ej, equipo, marcas, nivelDesde?, dadas?, descarga?})`. El día tiene siempre la misma forma; cada bloque dice su parte en `molde`:

1. **Entrada en calor** (`entrada`): `K.caminos.entrada` según lo que pide el resto del día.
2. **Habilidad, descansado** (`habilidad`): dos metas de tu rumbo (Dominio del cuerpo), en el orden de `K.dia.rotar`: la ventana abierta primero; después la que hace más que no tocás (la que nunca tocaste, antes); empate: la que menos tocaste en 14 días y el orden de tu rumbo. Lo de ayer no se repite si hay otra. Cada meta da su camino (si estás abajo en la escalera de la próxima estrella: un bloque de esa escalera, 3 series, «Camino a …»), su estrella (sostenes del 50 al 80 % de tu mejor marca hasta sumar unos 60 s, con 45 a 90 s de descanso según lo largo del sostén) o la prueba si la ventana está abierta. Dos metas con el mismo ejercicio o la misma escalera van en un solo bloque «para» las dos (`constelaciones`). Si la segunda entrena lo mismo que la primera (mismo patrón principal) y la que sigue no, va la que sigue.
3. **Fuerza de a dos** (`fuerza`): dos superseries de 3 series (rango del escalón o 5–8; sin descanso entre los dos ejercicios y 2 min después del par). Cada par lleva un tirón o un empuje (el que menos series tiene hoy, después el que menos hiciste en 7 días) con piernas (primer par) o bisagra (segundo). Si una habilidad ya entrena piernas o bisagra, ese lugar es para el de arriba que más falta. Escaleras: tirar → remo o tirar; empujar → fondos o empujar; piernas; bisagra → isquios: la primera que tu equipo permite y que el día no usó.
4. **Abdomen** (`abdomen`): L-sit o bandera acostada (la que hace más que no tocás), salvo que una habilidad ya lo entrene (Draco, Bandera humana).
5. **Cierre** (`cierre`): la meta de rango o motor de tu rumbo que hace más que no tocás (corta, `extra`); si no hay, 10 min de bici suave si tenés bici; si no, tres posturas de 40 s según lo que entrenó el día.

Sin ninguna habilidad posible (lo de tu rumbo pide equipo que no marcaste), rango o motor toman ese lugar; si tampoco hay, el día es de fuerza. Lo que pide equipo queda en `pide` y Hoy lo dice con el atajo a Tu equipo. Al volver de 3 semanas o más, las estrellas al 70 % y las escaleras más livianas, sin ventana. El día apunta a 40–55 minutos: si pasa de 60, el abdomen queda para otro día, y si igual pasa, la fuerza va con 2 series. En la semana de prueba (`K.dia.deSemanaDePrueba`) las escaleras van a la mitad, las pruebas adelante y la entrada en calor antes que todo. Nada se repite en un día: ni un ejercicio ni una escalera.

`K.dia.frecuencia(n, D) = min(D, 2D/n)`: cada cuánto toca cada meta con n metas y D días por semana (`K.dia.diasSemana`: tus días; si no, lo de las últimas 4 semanas; si no, 3). Tu rumbo no tiene tope y lo dice: «5 elegidas · cada una, 1 o 2 veces por semana».

`nivelDesde` (el escalón de arranque de cada escalera) y `dadas` (estrellas que tu nivel da por hechas) son para Tu nivel (PR3): lo que hiciste manda sobre el nivel.

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
  "antes": {"formato": "amrap"}
}]}
```

- `formato`:
  - `maximo`: una serie, todas las que salgan (o el sostén más largo, o lo que anotás: puntos, centímetros).
  - `reloj`: un tiempo fijo (`minutos`) y al final anotás lo que hiciste (Motor 12: los km).
  - `escalera`: cada minuto una más; con «No llegué» cuenta el último minuto completo.
  - `tiempo`: lo que dicen los `items`, lo más rápido posible (Mil saltos).
- El ícono no se escribe: una prueba es una medalla con la persona haciendo `mide.ejercicio` (`src/piezas/iconos.js`); una rutina, la persona haciendo lo que más series lleva; una constelación, la persona haciendo su última estrella adentro de un anillo de avance. Es el mismo en todas las pantallas. Desde la vuelta 22 ya no hay `figura` (la constelación dibujada a mano).
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
