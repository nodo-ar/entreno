# Kozmos · versión 43 (k-579924f) · 2026-10-24

Publicada en GitHub Releases por el workflow «Kozmos · versión» el 2026-10-24 a las 12:09 UTC.

- **Enlace**: https://github.com/nodo-ar/entreno/releases/tag/kozmos-43 · siempre la última: https://github.com/nodo-ar/entreno/releases/latest/download/kozmos.apk
- **Qué trae**: la bienvenida la primera vez que se abre la app (qué entrenar, qué tenés, tu tiempo, tus días, tu nivel por movimiento o con una prueba, y tu primer día); el motor a tu medida: pesas primero, el día en tus minutos y motor a intervalos; cinco rutinas nuevas para que fuerza, movilidad y motor tengan algo en cada nivel (31 en total) (PR #44, acta 035).
- **Por qué es la 43 y no la 42**: el número es la cantidad de commits de `main`. La publicación del merge del #44 (que habría sido la 42) se frenó en la prueba `rutina-armar-bloques`, que en `main` comparaba el código consigo mismo con distinto equipo. El PR #45 arregló la prueba y esta versión trae todo junto. No hay release 42.
- **APK**: `ar.kozmos`, versionCode 43, 3.433.858 bytes, sha256 del archivo `faaf525060587beac7f2e8e70f5ac387b4e8cad666caf96e81eba3c394c8ba48`. Firma SHA-256 `F4:ED:AC:94:DA:63:C5:95:08:5D:0A:5B:68:1D:B3:29:68:6B:B7:B4:E2:09:4B:8E:00:87:A7:0A:6A:A1:01:7B`, la misma de la 19 a la 41.
- **Verificado en la versión publicada (no la local)**:
  - Con la API de GitHub: el release existe, no es borrador, apunta a `579924f` y es el «latest».
  - Bajando el APK del enlace fijo: su página es `k-579924f` y trae la bienvenida.
  - Antes del merge, la prueba en el emulador (humo) pasó en verde con la bienvenida.
- **Vuelta atrás**: igual que en la 19. Se revierte el cambio en `main` (PR de revert) y el workflow publica una versión nueva, con número mayor, que contiene lo anterior. La otra opción es marcar el release como borrador: el enlace «latest» vuelve a la 41.
- **Para actualizar en el teléfono**: abrir el enlace fijo, bajar y tocar el archivo; se instala encima. Como el teléfono de Fer ya tiene datos, no ve la bienvenida.
