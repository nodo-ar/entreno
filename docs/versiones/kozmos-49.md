# Kozmos · versión 49 (k-a601b3a) · 2026-10-25

Publicada en GitHub Releases por el workflow «Kozmos · versión» el 2026-10-25.

- **Enlace**: https://github.com/nodo-ar/entreno/releases/tag/kozmos-49 · siempre la última: https://github.com/nodo-ar/entreno/releases/latest/download/kozmos.apk
- **Qué trae**: motor por días. Cada día de fuerza tiene un tipo según tu semana (con 3 días o menos, cuerpo entero; con 4, arriba y abajo; con 5 o 6, empujar, tirar y piernas). Dentro del día: habilidad, principales, secundarios, accesorios y abdomen; de a dos solo lo que no se pisa; si falta tiempo se cae lo último. Las habilidades van en el día de su movimiento. Hoy dice qué toca (PR #51, acta 041, reglas en `docs/kozmos-motor.md`).
- **APK**: `ar.kozmos`, versionCode 49, 3.459.434 bytes, sha256 del archivo `53c86b2322a3c06bc049a257efa03e2a72dc9720e2e7188898779c593690ca93`. Firma SHA-256 `F4:ED:AC:94:DA:63:C5:95:08:5D:0A:5B:68:1D:B3:29:68:6B:B7:B4:E2:09:4B:8E:00:87:A7:0A:6A:A1:01:7B` (la del release), la misma de siempre.
- **Verificado en la versión publicada (no la local)**:
  - Con la API de GitHub: el release existe, no es borrador, apunta a `a601b3a` y es el «latest».
  - Bajando el APK del enlace fijo: su página es `k-a601b3a` y trae `tipoDelDia` del motor nuevo.
- **Vuelta atrás**: se revierte el cambio en `main` (PR de revert) y el workflow publica una versión nueva con lo anterior; o se marca el release como borrador y el enlace «latest» vuelve a la 48.
- **Para actualizar en el teléfono**: abrir el enlace fijo con conexión, bajar y tocar el archivo; se instala encima y los datos quedan.
