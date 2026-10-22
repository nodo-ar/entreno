# Respaldo de Kozmos · formato del archivo

Desde **Vos › Respaldo › Guardar un respaldo**, Kozmos baja un archivo JSON con todo lo que entrenaste y anotaste. **Traer un respaldo** suma lo que falte, no borra nada y ofrece deshacer. Lo prueba de punta a punta `respaldo-de-ida-y-vuelta` en `kozmos/pruebas/suite.mjs`: guardar → teléfono limpio → traer → comparar, y después traerlo de nuevo sin duplicar.

## Nombre del archivo

`kozmos-respaldo_<aaaa-mm-dd>.json`, con el día en que se guardó.

## Estructura

```json
{
  "app": "kozmos",
  "formato": 2,
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
| `formato` | Versión de la estructura. Hoy `2` (lee también el `1`: es el mismo archivo sin pruebas). Un número mayor se rechaza («Ese respaldo es de una versión más nueva. Actualizá Kozmos y probá de nuevo.»). Si la estructura cambia, sube este número y se suma la conversión de lo viejo. |
| `version` | Versión de la app que lo guardó. Informativo. |
| `exportado` | Fecha y hora, en ISO 8601 (UTC). |
| `catalogo` | Versión del catálogo de constelaciones. Informativo: cada marca guarda lo que midió. |
| `mediciones` | Marcas anotadas a mano: `id`, `estrella`, `ejercicio`, `tipo`, `valor`, `fecha` (`aaaa-mm-dd`), `origen` y, en Lastre, `lastreKg` y `pesoKg`. |
| `sesiones` | Cada sesión: `id`, `fecha`, `inicio`, `fin`, `duracion` (segundos), `cortada`, `encendio` (las estrellas que encendió) y `bloques`, cada uno con su `constelacion`, `familia`, `estrella`, `objetivo`, `prueba` si fue una prueba de estrella, y sus `series` (`ejercicio`, `tipo`, `valor` y, si los tienen, `objetivo`, `seg`, `kg`, `lastreKg`, `pesoKg`, `escalera`, `rango`, `n`, `descarga` y `sensacion`). Una sesión de rutina suma `rutina` (`id`, `sesion` y, si se cortó, `mitad`); una de hazaña suma `hazana`: en formato 2, una prueba (`id`, `v: 2`, `valor`, `completa`, `ejercicio`, `tipo`); en las de antes, `id`, `nivel`, `valor`, `completa`. Las series de una prueba llevan `hazana` (el id) y, si se cortó antes de llegar, `completa: false`. Los centímetros (`cm`) pueden ser negativos. Una sesión de la semana de prueba suma `semanaPrueba` (`bloque`, `rutina`, `semana`, `pruebas`). Sus bloques pueden llevar `clase` y `nombre`; los del día del motor, `molde` (la parte del día) y `constelaciones` (las metas de tu rumbo para las que era, una lista); y sus series los tipos `tramos` (con `ejercicio` nulo y `seg`) y `hazana`. |
| `perfil` | `peso` (kilos), `rumbo` (las constelaciones que elegiste, sin tope: hasta todas las del catálogo, sin repetir), `equipo` (lo que marcaste que tenés), `rutina` (`id` y `desde`, la que seguís) y `dias` (los días que entrenás, 0 = lunes). |

Las preferencias de este teléfono (tema, avisos, cuándo guardaste el último respaldo) no viajan: son del teléfono, no tuyas.

## Cómo se trae

Primero se revisa el archivo entero y recién después se guarda todo de una sola vez: si no se puede guardar, no queda nada a medias.

- **Archivo roto o de otra app**: avisa «Ese archivo no es un respaldo de Kozmos.» y no toca nada.
- **Marcas y sesiones**: entran las que no están (por `id`). Las que ya están no se tocan, así que traer el mismo archivo dos veces no duplica. Un `id` repetido en el archivo entra una sola vez.
- **Datos imposibles** (una fecha que no existe, un valor negativo o que no es número, un tipo de medida desconocido, una serie mal armada): se descartan y el aviso dice cuántas quedaron afuera.
- **Kilos**: `kg` (los de cada mancuerna, desde la vuelta 27) es opcional y va de 0 a 200; una serie con otro valor es una serie mal armada. No cambia el formato: un respaldo sin `kg` se lee igual y uno con `kg` lo lee cualquier versión que conozca el formato 2 (lo deja pasar sin mirarlo).
- **Perfil**: entra solo lo que este teléfono todavía no tiene. Un peso fuera de 20 a 400 kg no entra.
- **Deshacer** (en el aviso): saca lo que entró y deja el perfil como estaba.
