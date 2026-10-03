# Nodo Entreno

App de entrenamiento: fuerza, cardio y movilidad. Parte de la familia Nodo.

Arranca de la v269 de Barra y Bici (su nombre anterior), tal cual estaba publicada como artifact de claude.ai: un solo `index.html` con todo adentro, más las animaciones de ejercicios (`ex/`), las rutinas (`prog/`) y el service worker de la notificación en vivo (`sw.js`).

## Pruebas

Desde la raíz del repo:

```
cd tests && npm ci && cd ..
bash tests/srv.sh
cd tests && node suite.js
```

- `npm ci` instala Playwright 1.56.1, fijado en `tests/package-lock.json` (usa Chromium 1194). Si cambia la versión, cambia el navegador que pide.
- Las pruebas cargan `index.html` directo desde el servidor local. Todas aceptan otra página de la raíz como argumento (`node suite.js otra.html`).
- `srv.sh` levanta el servidor en el puerto 8765 si no está corriendo. Si las pruebas fallan todas en un segundo, casi siempre es que el servidor no está.

Detalle en `tests/PRUEBAS.md`.

## Publicación

Cada fusión a `main` publica la app en GitHub Pages (`.github/workflows/publicar.yml`): `tools/armar.js` copia la app tal cual y le pone la versión, que sale del commit (`v269` en la etiqueta, `v269+N · abc1234` con N commits encima).

## Cómo se trabaja

Ver `docs/REGLAS.md`.
