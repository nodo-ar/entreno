# Kozmos

*Per aspera ad astra.* App de entrenamiento de habilidades en casa: cada habilidad es una constelación y cada marca que alcanzás enciende una estrella. Reemplaza a Nodo Entreno en la etapa 6; hasta entonces vive en esta carpeta y **no se publica** (el workflow de Pages solo arma la app de Entreno).

El modelo, la arquitectura y las seis etapas están en el documento «Kozmos · Modelo y arquitectura».

## Cómo está armado

| Carpeta | Qué tiene |
| --- | --- |
| `src/base/` | Letra, tokens de la dirección B «Luz de día», íconos, preferencias y tema |
| `src/piezas/` | Lo rescatado de Entreno: barra flotante, encabezado que se achica, menús, deshacer, isla, ajustes y horizontal |
| `src/pantallas/` | Hoy, Cielo, Progreso y Vos |
| `src/app.js` | Rutas, transiciones y arranque |
| `src/sw.js` | Service worker: abre sin conexión desde la segunda vez |
| `fuentes/` | Mona Sans y Geist Mono (latín, woff2) con su licencia SIL OFL |
| `iconos/` | Logo y los íconos de la app (los dibuja `tools/iconos.mjs`) |
| `tools/armar.mjs` | Junta todo en un solo `index.html` dentro de `app/` (no va a git) |
| `pruebas/suite.mjs` | Pruebas de punta a punta con Playwright |

Cada módulo es un archivo chico que suma lo suyo al objeto `K`. El orden de armado está en `tools/armar.mjs`.

## Comandos

```sh
node kozmos/tools/armar.mjs          # arma kozmos/app
node kozmos/pruebas/suite.mjs        # arma y corre todas las pruebas (unos 10 s)
node kozmos/pruebas/suite.mjs isla   # solo algunas
node kozmos/tools/iconos.mjs         # vuelve a dibujar los íconos si cambia el logo
```

Para mirarla en el navegador: `cd kozmos/app && python3 -m http.server`, y abrir `http://localhost:8000`.

## Datos

Las preferencias van en `localStorage` con la clave `kozmos.prefs.v1`. El diario de entrenamientos irá en IndexedDB (etapa 4). Kozmos no lee ni toca `barrabici.v4`, los datos de Entreno.
