---
name: equipo-nodo
description: "Trabajar cualquier cambio de un repo de Nodo con el Equipo Nodo — núcleo fijo, invitados que rotan, ayudantes que miden y cinco fases con puerta. Usala al empezar una función, un arreglo, una publicación o una idea nueva."
---

# Equipo Nodo · cómo orquestar una vuelta

El detalle está en `docs/metodo/` (EQUIPO.md, FASES.md, PRUEBAS.md, plantillas). Esto es el procedimiento para correrlo con subagentes.

## 0 · Antes de empezar

- Leé `CLAUDE.md`, `docs/ESTADO.md`, `docs/BACKLOG.md` y la última acta de `docs/actas/`.
- Decidí el tamaño de la vuelta:
  - **Completa**: función nueva o cambio que se ve. Las cinco fases.
  - **Corta**: arreglo sin cambio visible. La tijera, Casandra y los ayudantes que hagan falta; acta breve.
  - **Boceto**: idea a probar. Brief de tres líneas, un solo invitado al azar, prototipo en un archivo, decisión seguir / guardar / tirar. Nunca se publica.

## 1 · Armar el equipo

1. Núcleo fijo: `persona`, `casandra`, `tijera`.
2. Un invitado **elegido** por lo que el cambio necesita (anotá por qué en una línea).
3. Un invitado **al azar**: `node tools/elegir-equipo.mjs <proyecto> <vuelta> <elegido> [azar-anterior]`. Si cambió el plantel desde la vuelta anterior, pasá el azar anterior que figura en el acta.

Plantel de invitados (cada uno es un agente en `.claude/agents/`): guionista, tonto, nulo, editora, directora-de-arte, animador, periodista, ingeniera-de-campo, abuela, soberano, abogada, atacante, competidor, historiador, tesorera, marco-aurelio, cartografa.

## 2 · Correr la vuelta

1. **Lee**: pasale a cada miembro el brief (o el diff y las capturas, según la fase) y lo que salió de la vuelta anterior.
2. **Propone**: lanzá los cinco miembros **en paralelo** (un mensaje con varias llamadas al agente). Cada uno devuelve una propuesta concreta desde su mirada.
3. **Ayudantes**: si un miembro necesita evidencia, lanzá sus ayudantes en paralelo (hasta dos por miembro). Los ayudantes miden, no opinan, no editan.
4. **Objeta**: mostrale a cada miembro las propuestas de los demás y pedile una objeción concreta a una de ellas.
5. **Decide**: la `tijera` deja lo mínimo que resuelve el problema entero. Si hay empate o es una decisión de producto, pregunta a Fer con opciones.
6. **Entrega**: lo que pide la fase y el acta en `docs/actas/NNN-tema.md` (plantilla en `docs/metodo/plantillas/acta.md`). Del acta importan las decisiones y las objeciones que cambiaron algo.

## 3 · Fases y puertas

| Fase | Entrega | Puerta |
| --- | --- | --- |
| Pensar | Brief de cinco líneas (`plantillas/brief.md`) | La persona cuenta la escena de uso, la tijera escribió qué queda afuera, Casandra nombró el riesgo. **Si se ve, OK de Fer al brief.** |
| Investigar | Nota (`plantillas/investigacion.md`) | Toda afirmación con fuente o marcada como supuesto; toda dependencia con reemplazo o motivo. Lo que cambia con el tiempo se busca en el momento. |
| Construir | El cambio en una rama, con capturas | Suite en verde; nada de lo que quedaba afuera se coló. |
| Probar | Resultado de `PRUEBAS.md` y tablero antes y después | Ayudantes corridos (comparador, estrangulador, pulgar, recorredor, fiscal según el caso), sin bandera roja, **OK de Fer al tablero**. |
| Publicar | Versión publicada y registro (`plantillas/version.md`) | Verificada en producción, vuelta atrás probada, registro escrito. |

Si una puerta no se cumple, se vuelve a la fase que corresponde y se dice. No es un fracaso: es el método.

## 4 · Ayudantes por miembro

| Miembro | Ayudantes |
| --- | --- |
| persona | `cronometro` (prueba de cinco segundos), `pulgar` (controles chicos o fuera de alcance) |
| casandra | `fiscal` (afirmaciones contra el código), `inventario` (enlaces rotos, textos de prueba) |
| tijera | `contador` (palabras, pantallas, peso, carga) |
| cartografa | `recorredor` (tareas de navegación), `indice` (anclas, títulos, tabulador) |
| directora-de-arte | `comparador` (tablero antes y después) |
| nulo | `verificador` (fuente de cada número) |
| editora | `detector` (muletillas y palabras fuera de la voz) |
| ingeniera-de-campo | `estrangulador` (red lenta, CPU lenta, sin conexión, 360 px) |
| atacante | `revoltoso` (datos raros en cada campo) |

Si un ayudante sirve dos vueltas seguidas para algo nuevo, sumalo a la tabla de `docs/metodo/EQUIPO.md`.

## 5 · Al cerrar

Actualizá `docs/ESTADO.md` y `docs/BACKLOG.md`, y reportá a Fer: qué cambió, la evidencia, hasta tres decisiones que necesitás y el próximo paso.
