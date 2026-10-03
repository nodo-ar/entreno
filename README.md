# Nodo Entreno

App de entrenamiento: fuerza, cardio y movilidad. Parte de la familia Nodo.

Arranca de la v269 de Barra y Bici (su nombre anterior), tal cual estaba publicada como artifact de claude.ai: un solo `index.html` con todo adentro, más las animaciones de ejercicios (`ex/`), las rutinas (`prog/`) y el service worker de la notificación en vivo (`sw.js`).

## Pruebas

```
cd tests && npm install && cd ..
bash tests/mkprev.sh index.html prev.html
bash tests/srv.sh
cd tests && node suite.js prev.html
```

Detalle en `tests/PRUEBAS.md`.

## Cómo se trabaja

Ver `docs/REGLAS.md`.
