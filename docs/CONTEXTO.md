# Contexto para seguir

Este repo es Nodo Entreno. Arranca de la v269 de Barra y Bici (su nombre anterior), publicada hasta ahora como artifact de claude.ai. Dentro de la app el nombre todavía dice Barra y Bici: el cambio de nombre es un PR aparte, con tableros.

## Dónde está cada cosa

- Plan por etapas (doc vivo): https://claude.ai/code/artifact/0c701248-5872-43a7-aff0-e30a465f1f91
- App publicada hoy (artifact, v269): https://claude.ai/artifact/XCckppgjBPBSuurb7h3fpm
- Organización: `nodo-ar` (antes `tandem-ar`). Familia de apps: Nodo (Nodo Entreno, Nodo Gastos, Nodo Pizarra).
- Identificadores Android propuestos: `ar.nodo.entreno`, `ar.nodo.gastos`, `ar.nodo.pizarra`.

## Estado

- Etapa 0 en curso: `nodo-ar/entreno`, nuevo y desde cero (el repo viejo `barra-y-bici` se descarta), con la v269 tal cual (`index.html`, `sw.js`, `ex/`, `prog/`), las pruebas en `tests/` y las reglas en `docs/REGLAS.md`.
- Lo que sigue: proteger `main` (todo por pull request, fusión con pruebas en verde) y pasar a la etapa 1 (GitHub Pages).

## Decisiones tomadas

- Un repo por app; lo común (`visual`, `enlace`) en repos propios, instalado por versión con etiquetas de git.
- TypeScript: de a poco en esta app, desde el arranque en lo nuevo.
- APK con Capacitor; catálogo propio con índice compatible con F-Droid.
- El bot de Telegram de gastos se apaga cuando gastos pase a APK.
- Sincronización entre teléfonos sin servidor propio: directo estando cerca, relays públicos cifrados estando lejos.

## Pruebas

- `tests/suite.js` corre las 60 pruebas (~16–20 min). Si fallan más de 3, no las repite: son del cambio, no de tiempos.
- chk232, chk237, chk239 y chk204 a veces fallan por tiempos.
- Hasta la etapa 3 apuntan a `http://127.0.0.1:8765/`.

## Cómo se trabaja con Fer

- Escribe en castellano rioplatense informal.
- Antes de publicar: tableros antes y después en oscuro y claro, con todos los estados, y esperar su OK.
- Cuando trae revisiones de otra IA, quiere una opinión propia.
