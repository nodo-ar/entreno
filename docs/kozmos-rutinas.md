# Kozmos · rutinas y hazañas en el catálogo

Las rutinas y las hazañas viven en archivos de texto, separados del código, como las constelaciones. Viajan dentro de la página al armar (`kozmos/tools/armar.mjs`) y las revisa `node kozmos/pruebas/puras.mjs`.

## Ejercicios (`catalogo/ejercicios.json`)

Cada ejercicio: `id` (texto estable, en castellano y con guiones; nunca se reusa), `nombre`, `indicacion` (una frase de técnica, en voseo) y, si hace falta:

- `equipo`: lista de ids de equipo (`barra`, `paralelas`, `pared`, `poste`, `lastre`, `bici`, `soga`, `mancuernas`, `kettlebell`). Sin equipo, se hace en el piso.
- `lado: true`: se cuenta por lado.
- `mide: "segundos"`: se sostiene en vez de contar repeticiones.

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
- `tipo`: `repeticiones` o `segundos`.
- Lo que se pide en cada serie sale de uno de estos, en este orden:
  - `porSerie`: un número o `"max"` (al máximo) por serie;
  - `rango`: mínimo y máximo; arranca en el mínimo y sube de a uno según tu vez pasada;
  - `objetivo`: un número fijo.
- `elegir` (solo 100 flexiones): `{"umbrales": [5, 10], "columnas": [[…], […], […]]}`. Tu mejor serie de ese ejercicio elige la columna de `porSerie`.
- `descanso`: segundos después de cada serie.
- `grupo`: dos bloques seguidos con el mismo grupo se alternan serie a serie (superserie).

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

## Hazañas (`catalogo/hazanas.json`)

```json
{"version": 1, "hazanas": [{
  "id": "hercules", "nombre": "Hércules", "familia": "fu", "texto": "Fuerza total, por tiempo.",
  "formato": "tiempo",
  "niveles": [{"rondas": 3, "items": [{"ejercicio": ["flexion", "flexion-inclinada"], "reps": 8}, {"ejercicio": "plancha", "seg": 30}]}, …]
}]}
```

- Siempre tres niveles: Inicial, Intermedio y Completo.
- `formato` y qué lleva cada nivel:
  - `tiempo`: `rondas` e `items`. Se anota el tiempo total; mejor, menos.
  - `chipper`: `items` en orden, una sola vuelta. Un ítem puede ser `{"ejercicio": "trote", "min": 8}`. Se anota el tiempo total.
  - `amrap`: `minutos` e `items`. Se anotan las rondas; mejor, más.
  - `emom`: `minutos` e `items`. Cada minuto, el ítem que sigue. Se anota si se completó.
  - `intervalos` y `flujo`: `tramos`, como en las rutinas. Se anota si se completó.

## Lo que guarda el diario

Una sesión de rutina guarda `rutina: {id, sesion}`. Una de hazaña guarda `hazana: {id, nivel, valor}`, con `valor` en segundos (tiempo, chipper), rondas (amrap) o 1 (completada). El perfil guarda `rutina: {id, desde}` mientras la seguís y `dias`: los días de la semana que entrenás (0 = lunes).
