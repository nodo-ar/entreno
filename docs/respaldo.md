# Respaldo · formato del archivo

Desde **Ajustes › Datos › Exportar**, la app baja un archivo JSON con todo lo de una persona. **Importar** suma lo que falte y no borra nada, y ofrece deshacer. Lo prueba de punta a punta `tests/t_chk276.js`: exportar → teléfono limpio → importar → comparar.

## Nombre del archivo

`nodo-entreno_<persona>_<aaaa-mm-dd>.json`

- `<persona>`: el nombre del perfil en minúsculas, sin acentos y con guiones en lugar de espacios o signos (por ejemplo `fer`).
- `<aaaa-mm-dd>`: el día en que se exportó.

## Estructura

```json
{
  "app": "barra-y-bici",
  "v": 1,
  "ver": "v269+7 · fabf0d2",
  "exportado": "2026-10-05T14:40:00.000Z",
  "perfil": { "id": "…", "n": "Fer" },
  "cfg": { … },
  "sess": [ … ],
  "diario": { "aaaa-mm-dd": { …, "updated": 0 } },
  "med": { "aaaa-mm-dd": { …, "updated": 0 } }
}
```

| Campo | Qué es |
| --- | --- |
| `app` | Siempre `"barra-y-bici"`. **No se cambia**: es el nombre interno que reconocen todos los respaldos guardados. Un archivo con otro valor se rechaza. |
| `v` | Versión del formato. Hoy `1`. Si algún día cambia la estructura, sube este número y la importación sabe convertir lo viejo. |
| `ver` | Versión de la app que exportó (informativo). |
| `exportado` | Fecha y hora del respaldo, en ISO 8601 (UTC). |
| `perfil` | El id interno y el nombre de la persona. |
| `cfg` | Los ajustes del perfil: días de entrenamiento (`diasF`, `diasFS`, `diasB`, `diasBS`), lugares y equipamiento (`lugares`), metas, progresiones de habilidades (`skills`, `skHist`, `skUp`), pruebas (`tests`), movilidad, logros y preferencias. `updated` marca cuándo se cambiaron por última vez. |
| `sess` | Todas las sesiones. Cada una lleva `id`, `kind` (`fuerza`, `bici` o `mov`), `fecha` (`aaaa-mm-dd`) y `tipo`. Las de fuerza suman `ej` (ejercicios con sus `series`: `r` reps, `kg`, `t`); las de cardio, `min`, `kcal`, `km`, `ritmo` y, si hay, `splits` y `ruta`; las de movilidad, `min`, `items` y `zonas`. |
| `diario` | Notas y datos del día, por fecha. |
| `med` | Medidas del cuerpo (peso, cintura…), por fecha. |

## Cómo se importa

- **Sesiones**: entran las que no están (por `id`). Las que ya están no se tocan, así que importar dos veces no duplica nada.
- **Diario y medidas**: por fecha, gana la más reciente (`updated`).
- **Ajustes**: entran si son más nuevos que los del teléfono, o si el perfil del teléfono todavía no tiene ninguna sesión (un teléfono nuevo). El nombre del perfil y la fecha del último respaldo quedan los del teléfono.
- **Deshacer** (en el aviso de la importación): saca las sesiones que entraron y deja el diario, las medidas y los ajustes como estaban.
- **Un archivo roto o de otra app**: avisa «Ese archivo no es un respaldo» y no toca nada.

## Qué no viaja en el respaldo

- **Las fotos de progreso** de las habilidades: se guardan solo en el teléfono (IndexedDB `byb-fotos`) y no entran en el archivo.
- **Los otros perfiles** del mismo teléfono: cada perfil se exporta por separado.
- **Las ideas para la app** y lo que la app recuerda para comodidad: ayudas ya vistas, el modo de rendimiento, el árbol y la isla. No es historia de entrenamiento.
- **Las rutinas descargadas** (`prog/`): se vuelven a bajar solas.

## Nombres internos que no cambian

`barrabici.v4` (donde la app guarda los datos en el teléfono), `app: "barra-y-bici"` (respaldos), `byb-fotos` (fotos) y `byb-live` (notificación). Cambiar cualquiera necesita un plan de migración y el OK de Fer (`CLAUDE.md`).
