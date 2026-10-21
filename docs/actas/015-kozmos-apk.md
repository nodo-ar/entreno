# Acta · Kozmos · vuelta 15 · la APK de Android · fase Construir → Probar

Fer decidió (2026-10-21) que Kozmos sale por ahora **solo como APK de Android para probar**: sin tienda, sin web publicada y sin dominio. Aprobó usar Capacitor. Rama `claude/project-thread-985fzq`, sin PR todavía.

**Equipo**: la persona · Casandra · la tijera · el soberano (elegido: entran dependencias nuevas) · la ingeniera de campo (pantalla encendida, sin red, botón atrás).

## Qué se construyó
- `kozmos/apk/`: Capacitor 8.5.3 con versiones exactas y su `package-lock.json` (nada en la raíz). appId **`ar.kozmos`, permanente**; origen `https://localhost`, del que dependen los datos. Detalle en `kozmos/apk/README.md`.
- `armar.mjs --apk`: la página va adentro de la APK, sin service worker ni manifiesto, con el puente de Capacitor.
- `kozmos/src/base/android.js` (en la web, `K.apk` es null y nada cambia): respaldo por Filesystem + Share; botón atrás (menú → Hoy sale → lo recorrido → la raíz → Hoy; con sesión en curso, segundo plano); pantalla encendida y vibración con el plugin propio `Pantalla` (Java, sin dependencias); barras del sistema según el tema.
- Ícono adaptable (con versión monocroma) y pantalla de arranque con el logo, en vectores, con `--bg` y `--solid` de la app (claro y oscuro).
- Permisos: `INTERNET` y `VIBRATE`. Copia en la nube de Google apagada; el pase directo a un teléfono nuevo sí copia.
- La firma: `tools/firma.sh` la crea una vez, la cifra con la frase del secreto `KOZMOS_FIRMA` y la guarda en un borrador de release; nunca crea otra encima de una que existe.
- Workflows: «Kozmos · APK de prueba» (artifact `kozmos-prueba-<n>`, más un humo en emulador) y «Kozmos · versión» (Releases, `releases/latest/download/kozmos.apk`). `publicar.yml` sin tocar.

## Pruebas
- 48 sin pantalla; 55 de pantallas, completa en verde (nuevas: apk-sin-service-worker, apk-respaldo, apk-atras, apk-sesion, con un Capacitor simulado).
- `firma.sh` con un `gh` simulado: sin secreto, frase corta, primera vez, segunda vez (misma huella), frase equivocada y firma borrada con versiones publicadas.
- En Actions: la APK se arma, `apksigner` la verifica y el humo en un emulador Android 15 **en modo avión** la abre en Hoy, la gira, pasa a oscuro, sale con atrás y se instala encima de sí misma.

## Casandra
1. **Perder la frase** = no se puede actualizar encima; cada persona tendría que guardar un respaldo, desinstalar e instalar de nuevo. Se mitiga con el gestor de contraseñas y la copia del archivo cifrado.
2. **Cambiar el appId o el origen** pierde los datos: anotado como invariante.
3. **Sin probar en un teléfono real**: compartir, selector de archivos, vibración y áreas seguras con WebView viejo.

## Esperando a Fer
- Cargar el secreto `KOZMOS_FIRMA` (pasos en `kozmos/apk/README.md`).
- Probar la APK de prueba en su teléfono.
- Decidir la copia en la nube (hoy apagada).

## Respuesta de Fer
Probó «Kozmos prueba» en su teléfono (2026-10-21): «impecable, funciona diez puntos». La copia en la nube de Google queda apagada. Cargó el secreto `KOZMOS_FIRMA`. OK para fusionar y sacar la primera versión firmada.
