# Kozmos para Android

La APK de Kozmos: la misma app web, armada con `node kozmos/tools/armar.mjs www --apk` y empaquetada **adentro** de la APK con Capacitor. Abre sin conexión desde la primera vez y no habla con ningún servidor. Por ahora sale solo como APK para probar: sin tienda, sin web publicada y sin dominio.

- **appId: `ar.kozmos`. Es permanente.** Android reconoce la app por este nombre y por su firma: si cambia cualquiera de los dos, es otra app, no se instala encima y no ve los datos de la anterior.
- **Origen de la página: `https://localhost`** (`server.androidScheme` y `server.hostname` en `capacitor.config.json`). Los datos (localStorage e IndexedDB del WebView) son de ese origen: cambiarlo los deja atrás. No se toca sin plan de migración.
- La APK de prueba es `ar.kozmos.prueba` («Kozmos prueba»): se instala al lado de la de verdad y tiene sus propios datos.

## Cómo está armado

| Qué | Dónde |
| --- | --- |
| Dependencias de Capacitor, versiones exactas | `package.json`, `package-lock.json` |
| Configuración de Capacitor | `capacitor.config.json` |
| Proyecto de Android | `android/` (lo generó `npx cap add android`; `npx cap sync android` copia la página y los plugins) |
| Lo propio de Kozmos en Android | `android/app/src/main/java/ar/kozmos/` (pantalla encendida y vibración), `res/` (ícono, arranque y colores) |
| Lo que cambia en la página adentro de la APK | `kozmos/src/base/android.js` (en la web no hace nada) |
| La firma | `tools/firma.sh` |
| Las notas de cada versión | `tools/notas.sh` |
| Los workflows | `.github/workflows/kozmos-prueba.yml` y `kozmos-version.yml` |

Para armarla a mano hace falta el SDK de Android:

```sh
cd kozmos/apk
npm ci
node ../tools/armar.mjs www --apk
npx cap sync android
cd android && ./gradlew assemblePrueba     # app/build/outputs/apk/prueba/app-prueba.apk
```

## Qué cambia adentro de la APK

- **Sin service worker ni manifiesto.** La página viaja adentro; un service worker guardaría la versión vieja después de instalar una nueva. Si quedó alguno registrado, se borra al abrir.
- **Respaldo.** Guardar escribe el archivo en la caché de la app (plugin Filesystem) y abre el menú de compartir de Android (plugin Share): Drive, correo, WhatsApp. Traer usa el mismo selector de archivos que la web: el WebView de Capacitor lo abre solo.
- **Botón atrás.** Cierra el menú abierto; en Hoy sale de la app; si no, vuelve por lo recorrido, o sube a la raíz de la pestaña y después a Hoy. Con una sesión en curso, en Hoy no cierra: deja la app en segundo plano y la sesión sigue corriendo (y la isla queda arriba).
- **Pantalla encendida** durante la sesión y **vibración** de los avisos: con el plugin propio `Pantalla`, que usa el SDK de Android directamente.
- **Barras del sistema**: la página va de borde a borde, con las áreas seguras de siempre (`env(safe-area-inset-*)`); los iconos de la barra de estado siguen el tema elegido en Vos.
- **Datos**: en el WebView, dentro de la app. Sobreviven a instalar una APK nueva encima (mismo appId y misma firma). Se borran si se desinstala la app o se borran sus datos. La copia en la nube de Google está apagada (los datos quedan en el teléfono); el pase directo a un teléfono nuevo sí los lleva.
- **Permisos**: `INTERNET` (el WebView la necesita para cargar `https://localhost`, que sirve la propia APK) y `VIBRATE`. Ninguno pide nada al instalar.

## Cómo se publica

- **Prueba**: cada push a una rama que no sea `main` (y cada PR) que toque `kozmos/` arma «Kozmos prueba» y la deja como artifact de la corrida en Actions. Va firmada con la clave de depuración, que se guarda entre corridas.
- **Versión**: cada vez que entra a `main` algo que toca `kozmos/` (o a mano: Actions → «Kozmos · versión» → Run workflow), se arma la APK firmada con la firma de Kozmos y se publica en Releases como `kozmos-<número>`, con notas cortas. El enlace de siempre baja la última:
  `https://github.com/nodo-ar/entreno/releases/latest/download/kozmos.apk`
- **Número de versión**: `versionCode` es la cantidad de commits de `main` (solo crece); `versionName` es la versión de la app (`k-<commit>`), la misma que se ve en Vos → Acerca.

## La firma

Android solo instala una versión encima de otra si las dos tienen la misma firma. La firma la genera el workflow una sola vez y nadie la ve:

1. Fer inventa una frase y la carga como secreto del repo `KOZMOS_FIRMA`.
2. La primera vez que corre «Kozmos · versión», el workflow crea la firma (RSA 4096, 50 años), la cifra con la frase (AES-256, clave derivada con PBKDF2 de 600.000 vueltas), prueba que se descifra y la guarda como adjunto `kozmos-firma.cifrada` de un **borrador** de release llamado `kozmos-firma` (los borradores no son públicos).
3. Las siguientes veces la baja, la descifra con la frase, firma, y borra la copia descifrada.

Si falta el secreto, la versión no se arma y el error lo dice. Si la frase no abre la firma guardada, frena: nunca crea otra encima. Si la firma no está pero ya hubo versiones, también frena. Cada versión trae en sus notas la huella de la firma (SHA-256): si alguna vez cambia, algo anda mal.

### Pasos para Fer (una sola vez)

1. **Inventá una frase** de cinco o seis palabras sueltas que no tengan que ver entre sí, por ejemplo «tortuga lámpara invierno ruta mate nube» (esa no: inventá la tuya). Nada de frases conocidas, canciones ni fechas. Mínimo cuatro palabras y 25 letras.
2. **Guardala** en tu gestor de contraseñas, o en un papel en un lugar seguro. No la pegues en ningún chat.
3. En GitHub, en el repo `nodo-ar/entreno`: **Settings → Secrets and variables → Actions → New repository secret**. En *Name* poné `KOZMOS_FIRMA` y en *Secret*, la frase. Tocá *Add secret*.
4. Después de la primera versión, entrá a **Releases**, abrí el borrador «Firma de Kozmos · no borrar», bajá `kozmos-firma.cifrada` y guardalo en tu correo o tu Drive. Sin la frase no sirve para nada; con la frase, es la firma.
5. **No borres ni publiques** ese borrador.

### Qué pasa si…

- **Perdés la frase**: la firma guardada no se puede abrir. Las versiones nuevas tendrían que salir con otra firma, y en cada teléfono habría que guardar un respaldo, desinstalar Kozmos, instalar la nueva y traer el respaldo. Por eso la frase va al gestor de contraseñas.
- **Alguien ve el archivo cifrado**: sin la frase no puede hacer nada; con una frase de cinco palabras al azar, probar todas no termina nunca. El archivo además está en un borrador, que solo ven quienes pueden escribir en el repo.
- **Alguien consigue la frase y el archivo**: podría firmar una APK que se instale encima de Kozmos. Habría que cambiar de firma (como si se perdiera la frase) y avisar.
- **Se borra el borrador**: el workflow frena. Se arregla creando a mano un borrador de release `kozmos-firma` con tu copia de `kozmos-firma.cifrada` adjunta.
- **Cambiás el secreto por otra frase**: el workflow frena y lo dice. Volvé a cargar la original.

## Cómo se instala en el teléfono

1. Abrí en el teléfono `https://github.com/nodo-ar/entreno/releases/latest/download/kozmos.apk` (o, para la de prueba, bajá el artifact de la corrida desde Actions, descomprimilo y abrí la APK).
2. Tocá el archivo. La primera vez Android pide permitir instalar apps desde ese navegador o el gestor de archivos.
3. Para actualizar, lo mismo: se instala encima y los datos quedan.

Desde 2026, Google pide que quien publica APK por fuera de la tienda se registre como desarrollador en algunos países (ítem 4 del backlog): antes de repartirla a más gente, revisá el estado de esa regla.
