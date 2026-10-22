# Kozmos · rutinas y hazañas en el catálogo

Las rutinas y las hazañas viven en archivos de texto, separados del código, como las constelaciones. Viajan dentro de la página al armar (`kozmos/tools/armar.mjs`) y las revisa `node kozmos/pruebas/puras.mjs`.

## Ejercicios (`catalogo/ejercicios.json`)

Cada ejercicio: `id` (texto estable, en castellano y con guiones; nunca se reusa), `nombre`, `indicacion` (una frase de técnica, en voseo) y, si hace falta:

- `equipo`: lista de ids de equipo (`barra`, `paralelas`, `pared`, `poste`, `lastre`, `bici`, `soga`, `mancuernas`, `kettlebell`). Sin equipo, se hace en el piso.
- `lado: true`: se cuenta por lado.
- `mide: "segundos"`: se sostiene en vez de contar repeticiones.

## Escaleras (`catalogo/escaleras.json`)

Una escalera es una fila de ejercicios del más fácil al más difícil. Las rutinas de fuerza y de rango la nombran y la app calcula en qué escalón estás a partir del diario: no guarda ningún estado aparte.

```json
{"version": 1, "escaleras": [{
  "id": "tirar", "nombre": "Tirar", "familia": "fu", "texto": "…",
  "pasos": [{"ejercicio": "colgado-activo", "tipo": "segundos", "meta": 60},
            {"ejercicio": "dominada-negativa", "tipo": "repeticiones", "rango": [3, 5]}, …]
}]}
```

- Un escalón de `repeticiones` puede traer su propio `rango`; si no, vale el del bloque.
- Un escalón de `segundos` es un sostén: lleva `meta`, los segundos que hay que juntar para subir.
- Los escalones que tu equipo no permite se saltean (y no cuentan en el total).

Las reglas, en `src/sesion/rutina.js`:

- **Subir**: el tope del rango en todas las series dos sesiones seguidas, o una sola si marcaste «Sobró». Volvés al mínimo del escalón nuevo.
- **Sumar**: cada serie apunta a lo que hiciste en esa misma serie más uno (más 5 s en un bloque de segundos), dentro del rango.
- **Bajar**: dos sesiones sin llegar al mínimo en la primera serie.
- **Trabado**: tres sesiones sin mejorar abren una descarga (la mitad de las series, sin sumar). Después se vuelve a probar.
- **Sostenes**: se juntan 60 s por sesión en sostenes del 50 al 80 % de tu mejor marca (70 % de base; 80 si sobró, 50 si no llegaste). Si en una sesión no llegás a 5 s, bajás un escalón. Subís cuando todas las series llegan a la meta del escalón, dos sesiones seguidas (o una si sobró).
- **Sin tocar nada**: la sensación sale de las repeticiones. Dos o más arriba del objetivo (5 s en segundos) es «Sobró»; llegar es «Justo»; menos es «No llegué».

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
- `carga` (con lastre): kilos que se suman cuando completás el rango dos veces seguidas, en vez de subir de escalón. La sesión pide repeticiones y kilos.
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
  "figura": {…}, "formato": "maximo",
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
- El ícono en Planes no se escribe: es una medalla con la persona haciendo `mide.ejercicio` (`src/piezas/iconos.js`); el de una rutina, la persona haciendo lo que más series lleva. `figura` (la constelación dibujada a mano) la usan todavía Hoy, Progreso y el resumen.
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

Sin rutina, con tu rumbo, cuenta semanas de calendario con alguna sesión: después de 4, la semana de prueba. La ventana de prueba del 80 % sigue como prueba suelta entre bloques.

## Lo que guarda el diario

Una sesión de rutina guarda `rutina: {id, sesion}`. Cada serie de una escalera guarda además `escalera`, `rango`, `n` (cuántas series pedía), `descarga` si era una descarga y, si la tocaste, `sensacion` (`sobro`, `justo` o `no-llego`). Una serie con lastre guarda `lastreKg` y `pesoKg`. Las sesiones viejas, sin esos campos, siguen contando: sus series entran en la escalera del ejercicio que hicieron. Una prueba (hazaña) guarda `hazana: {id, v: 2, valor, completa, ejercicio, tipo}` y su serie lleva `hazana` con el id; esa serie cuenta como marca en el Cielo. Una sesión de la semana de prueba guarda `semanaPrueba: {bloque, rutina, semana, pruebas}`. Las hazañas de antes (versión 1) guardaban `hazana: {id, nivel, valor}`, con `valor` en segundos (tiempo, chipper), rondas (amrap) o 1 (completada): se siguen viendo en tu historia y en la prueba, como «versión anterior», y no cuentan como marcas. El perfil guarda `rutina: {id, desde}` mientras la seguís y `dias`: los días de la semana que entrenás (0 = lunes).
