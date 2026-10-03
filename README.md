# Nodo Entreno

App de entrenamiento: fuerza, cardio y movilidad. Parte de la familia Nodo.

Arranca de la v269 de Barra y Bici (su nombre anterior), tal cual estaba publicada como artifact de claude.ai: un solo `index.html` con todo adentro, más las animaciones de ejercicios (`ex/`), las rutinas (`prog/`) y el service worker de la notificación en vivo (`sw.js`).

## Pruebas

Desde la raíz del repo:

```
cd tests && npm ci && cd ..
bash tests/mkprev.sh index.html prev.html
bash tests/srv.sh
cd tests && node suite.js prev.html
```

- `npm ci` instala Playwright 1.56.1, fijado en `tests/package-lock.json` (usa Chromium 1194). Si cambia la versión, cambia el navegador que pide.
- La vista previa (`prev.html`) va en la raíz: el servidor la sirve desde ahí y las pruebas la leen de ahí. Todas reciben el nombre como argumento; por defecto, `prev.html`.
- `srv.sh` levanta el servidor en el puerto 8765 si no está corriendo. Si las pruebas fallan todas en un segundo, casi siempre es que el servidor no está.

Detalle en `tests/PRUEBAS.md`.

## Cómo se trabaja

Ver `docs/REGLAS.md`.
