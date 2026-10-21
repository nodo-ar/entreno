# Kozmos · versión 19 (k-99f4a0e) · 2026-10-21

Primera versión de Kozmos para Android, publicada en GitHub Releases por el workflow «Kozmos · versión».

- **Enlace**: https://github.com/nodo-ar/entreno/releases/tag/kozmos-19 · siempre la última: https://github.com/nodo-ar/entreno/releases/latest/download/kozmos.apk
- **Qué trae**: Kozmos entero (cielo, rutinas, hazañas, maniquí con vistas) adentro de la APK; abre sin conexión desde la primera vez.
- **APK**: `ar.kozmos`, versionCode 19, 3,3 MB, firma SHA-256 `F4:ED:AC:94:DA:63:C5:95:08:5D:0A:5B:68:1D:B3:29:68:6B:B7:B4:E2:09:4B:8E:00:87:A7:0A:6A:A1:01:7B`.
- **Verificado en la versión publicada (no la local)**: el release existe, no es borrador, tiene `kozmos.apk` subido por Actions y es el «latest»; el armado comprobó con apksigner y aapt2 paquete, versionCode y que la huella coincide con la firma guardada. La misma huella salió en dos corridas seguidas: la firma cifrada se reusa.
- **Antes**: la corrida 1 del workflow armó y firmó bien pero frenó al leer la huella (arreglado en el PR #21); no publicó nada.
- **Vuelta atrás**: Android no instala una versión con número menor encima de una mayor. Para volver atrás se revierte el cambio en `main` (PR de revert); el workflow publica una versión nueva, con número mayor, que contiene lo anterior, y se instala encima sin perder datos. Para no publicar nada, se puede marcar el release malo como borrador y el enlace «latest» vuelve a la versión anterior.
- **Para actualizar en el teléfono**: abrir el enlace fijo, bajar y tocar el archivo; se instala encima.
