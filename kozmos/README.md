# Kozmos

*Per aspera ad astra.* App de entrenamiento de habilidades en casa: cada habilidad es una constelación y cada marca que alcanzás enciende una estrella. Reemplaza a Nodo Entreno en la etapa 6; hasta entonces vive en esta carpeta y **no se publica** (el workflow de Pages solo arma la app de Entreno).

El modelo, la arquitectura y las seis etapas están en el documento «Kozmos · Modelo y arquitectura».

## Cómo está armado

| Carpeta | Qué tiene |
| --- | --- |
| `src/base/` | Letra, tokens de la dirección B «Luz de día», íconos, preferencias y tema |
| `src/piezas/` | Lo rescatado de Entreno: barra flotante, encabezado que se achica, menús, deshacer, isla, ajustes y horizontal |
| `src/pantallas/` | Hoy (con Tu rumbo y el primer día), Planes (hazañas y rutinas, en `rutinas.js`), Cosmos (en `cielo.js`, con Constelación y Anotar), Progreso y Vos (con Tu equipo) |
| `src/cielo/` | Las reglas del cielo (funciones puras) y su dibujo |
| `src/diario/` | Lo que hacés, guardado en IndexedDB, y el respaldo (armar y leer el archivo) |
| `src/sesion/` | El plan del día, las rutinas, hazañas y tus días, los caminos y la entrada en calor del motor B, y las calorías (funciones puras), y el motor de la sesión |
| `catalogo/` | Constelaciones y estrellas, ejercicios, escaleras de progresión, piezas de la entrada en calor (`entradas.json`), rutinas (una por archivo; formato de escaleras y rutinas en `docs/kozmos-rutinas.md`), hazañas y los ids retirados |
| `src/app.js` | Rutas, transiciones y arranque |
| `src/sw.js` | Service worker: abre sin conexión desde la segunda vez |
| `fuentes/` | Mona Sans y Geist Mono (latín, woff2) con su licencia SIL OFL |
| `iconos/` | Logo y los íconos de la app (los dibuja `tools/iconos.mjs`) |
| `src/base/android.js` | Lo que cambia adentro de la APK de Android (en la web no hace nada) |
| `apk/` | La APK de Android con Capacitor: cómo se arma, se firma y se publica en `apk/README.md` |
| `tools/armar.mjs` | Junta todo en un solo `index.html` dentro de `app/` (no va a git); con `--apk`, la versión para la APK |
| `pruebas/puras.mjs` | Pruebas sin pantalla: catálogo, cielo, plan, calorías y respaldo |
| `pruebas/suite.mjs` | Corre las puras y después las de punta a punta con Playwright |

Cada módulo es un archivo chico que suma lo suyo al objeto `K`. El orden de armado está en `tools/armar.mjs`.

## Comandos

```sh
node kozmos/tools/armar.mjs          # arma kozmos/app
node kozmos/tools/armar.mjs kozmos/apk/www --apk   # la versión para la APK (antes, «npm ci» en kozmos/apk)
node kozmos/pruebas/suite.mjs        # arma y corre todas las pruebas (alrededor de un minuto)
node kozmos/pruebas/suite.mjs isla   # solo algunas
node kozmos/tools/iconos.mjs         # vuelve a dibujar los íconos si cambia el logo
```

Para mirarla en el navegador: `cd kozmos/app && python3 -m http.server`, y abrir `http://localhost:8000`.

## Datos

Las preferencias van en `localStorage` con la clave `kozmos.prefs.v1`. Lo que hacés va en el diario: IndexedDB, base `kozmos`, versión 2, con `mediciones` (cada marca: estrella, valor, día y origen), `perfil` (tu peso, tu rumbo y tu equipo) y `sesiones` (cada sesión con sus bloques y series). La sesión en curso vive en `localStorage` con la clave `kozmos.vivo.v1` hasta que termina. El cielo no se guarda: se calcula cada vez del catálogo más las mediciones. Kozmos no lee ni toca `barrabici.v4`, los datos de Entreno. Los avisos (todo, vibra, suena, nada) y la fecha del último respaldo van en las preferencias.

El respaldo es un archivo `kozmos-respaldo_AAAA-MM-DD.json` con las mediciones, las sesiones y el perfil. Su formato está en `docs/kozmos-respaldo.md`; cambiarlo pide subir `formato` y que `leer` siga entendiendo los anteriores.

Reglas que cuidan los datos de la gente:
- Un id de estrella o de constelación no se cambia ni se reusa nunca. Si una se retira, su id va a `catalogo/retirados.json` y la prueba del catálogo impide volver a usarlo.
- Subir la versión de la base `kozmos` necesita un paso de migración escrito en `diario.js` que conserve todo lo que había.

## Catálogo

`catalogo/ejercicios.json` tiene el nombre y la indicación de cada ejercicio. `catalogo/constelaciones.json` tiene las 14 constelaciones con sus estrellas y la prueba de cada una (ejercicio, tipo y umbral). Viaja dentro de la página al armar. Las marcas cuentan por ejercicio: una marca de tuck sirve para todas las estrellas de tuck. `node kozmos/pruebas/puras.mjs` revisa el catálogo y las reglas del cielo sin abrir el navegador.
