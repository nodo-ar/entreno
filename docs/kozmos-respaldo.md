# Respaldo de Kozmos · formato del archivo

Desde **Vos › Respaldo › Guardar un respaldo**, Kozmos baja un archivo JSON con todo lo que entrenaste y anotaste. **Traer un respaldo** suma lo que falte, no borra nada y ofrece deshacer. Lo prueba de punta a punta `respaldo-de-ida-y-vuelta` en `kozmos/pruebas/suite.mjs`: guardar → teléfono limpio → traer → comparar, y después traerlo de nuevo sin duplicar.

## Nombre del archivo

`kozmos-respaldo_<aaaa-mm-dd>.json`, con el día en que se guardó.

## Estructura

```json
{
  "app": "kozmos",
  "formato": 1,
  "version": "k-abc1234",
  "exportado": "2026-10-20T14:40:00.000Z",
  "catalogo": 1,
  "mediciones": [ … ],
  "sesiones": [ … ],
  "perfil": { … }
}
```

| Campo | Qué es |
| --- | --- |
| `app` | Siempre `"kozmos"`. Un archivo con otro valor se rechaza entero. |
| `formato` | Versión de la estructura. Hoy `1`. Un número mayor se rechaza («Ese respaldo es de una versión más nueva. Actualizá Kozmos y probá de nuevo.»). Si la estructura cambia, sube este número y se suma la conversión de lo viejo. |
| `version` | Versión de la app que lo guardó. Informativo. |
| `exportado` | Fecha y hora, en ISO 8601 (UTC). |
| `catalogo` | Versión del catálogo de constelaciones. Informativo: cada marca guarda lo que midió. |
| `mediciones` | Marcas anotadas a mano: `id`, `estrella`, `ejercicio`, `tipo`, `valor`, `fecha` (`aaaa-mm-dd`), `origen` y, en Lastre, `lastreKg` y `pesoKg`. |
| `sesiones` | Cada sesión: `id`, `fecha`, `inicio`, `fin`, `duracion` (segundos), `cortada`, `encendio` (las estrellas que encendió) y `bloques`, cada uno con su `constelacion`, `familia`, `estrella`, `objetivo`, `prueba` si fue una prueba de estrella, y sus `series` (`ejercicio`, `tipo`, `valor`). |
| `perfil` | `peso` (kilos), `rumbo` (hasta 3 constelaciones) y `equipo` (lo que marcaste que tenés). |

Las preferencias de este teléfono (tema, avisos, cuándo guardaste el último respaldo) no viajan: son del teléfono, no tuyas.

## Cómo se trae

Primero se revisa el archivo entero y recién después se guarda todo de una sola vez: si no se puede guardar, no queda nada a medias.

- **Archivo roto o de otra app**: avisa «Ese archivo no es un respaldo de Kozmos.» y no toca nada.
- **Marcas y sesiones**: entran las que no están (por `id`). Las que ya están no se tocan, así que traer el mismo archivo dos veces no duplica. Un `id` repetido en el archivo entra una sola vez.
- **Datos imposibles** (una fecha que no existe, un valor negativo o que no es número, un tipo de medida desconocido, una serie mal armada): se descartan y el aviso dice cuántas quedaron afuera.
- **Perfil**: entra solo lo que este teléfono todavía no tiene. Un peso fuera de 20 a 400 kg no entra.
- **Deshacer** (en el aviso): saca lo que entró y deja el perfil como estaba.
