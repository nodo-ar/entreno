# Nodo Entreno · cómo trabajar en este repo

Este archivo es la memoria del proyecto. Leelo entero al empezar cada sesión, junto con `docs/ESTADO.md`, `docs/BACKLOG.md` y la última acta de `docs/actas/`.

## Qué es

Nodo Entreno («Entrenar, resuelto.») es una app de entrenamiento en casa: fuerza, cardio y movilidad. Es la primera app de la familia **Nodo** (organización `nodo-ar`): aplicaciones local-first, gratis, sin cuentas ni servidores. Los datos quedan en el teléfono de cada persona.

- **Para quién**: alguien común en Argentina, con un Android de gama media, poco tiempo y cero ganas de leer instrucciones. El primer usuario real es Fer, el dueño del proyecto: entrena en casa con su propio equipamiento.
- **Hoy**: aplicación web instalable (PWA) publicada en GitHub Pages, que funciona sin conexión gracias al service worker.
- **Rumbo**: APK de Android con publicación automática, para que las actualizaciones lleguen solas.

## Quién decide

- **Fer** decide el producto, el diseño y todo lo que se ve. Revisa desde el teléfono, con capturas.
- **Vos (Claude Code)** construís, probás y proponés. Trabajás con el método del Equipo Nodo (`docs/metodo/` y la skill `equipo-nodo`).
- Ante una decisión de negocio o de diseño que no esté escrita acá, **preguntá antes de darla por hecha**. Ofrecé dos o tres opciones con un tablero y tu recomendación.

## Cómo hablarle a Fer

- Español rioplatense, con voseo. Corto, concreto, sin jerga de código cuando no hace falta.
- Cada reporte termina con: qué cambió (en palabras de la persona), la evidencia (pruebas, capturas, tablero), **hasta tres decisiones** que necesitás de él y el próximo paso.
- Nunca le pidas que pegue tokens, contraseñas o claves en el chat.
- Cuando trae una revisión de otra IA, dale tu opinión propia sobre con qué quedarse, con argumentos.

## Niveles de autonomía

| Podés hacerlo sin preguntar | Necesitás el OK del brief | Necesitás el OK del tablero |
| --- | --- | --- |
| Arreglar fallas, sumar pruebas, refactorizar sin cambio visible, documentar, mejorar la suite | Toda función nueva o cambio que se vea; todo lo marcado [idea] en el backlog | Publicar cualquier cosa que se vea (Pages, APK, release) |

Con bandera roja de Casandra no se publica hasta resolverla o hasta que Fer la acepte por escrito.

## Reglas de diseño (el gusto de Fer, ya decidido)

- **Moderno y sobrio.** Referencias: Apple Fitness y Salud, Linear y Arc. Menos texto y más representación visual, como se hace profesionalmente.
- **Paleta de la app**: naranja, aqua y lima sobre grafito, con su versión clara. Usá siempre los tokens; nada de colores sueltos.
- **Tipografía Nodo**: Nodo Sans (texto), Nodo Sans Ancha (títulos), Nodo Mono (datos) y **Nodo Reloj** para todo reloj o número con «:». Pesos: 700 para lo elegido, los textos de 13 px o menos y el botón principal de cada pantalla; 600 para el resto.
- **Sin diálogos de confirmación**: se hace la acción y se ofrece deshacer.
- **Sin hojas inferiores (bottom sheets).**
- **Menús desplegables** en lugar de filas de chips o pills. **Sin interruptores (toggles)** dentro de tarjetas de contenido.
- **Controles al alcance del pulgar**, cómodos para una mano.
- **Encabezado**: editar va con «⋯» en el encabezado; las acciones del encabezado (por ejemplo, ajustes) siguen visibles cuando se colapsa al desplazar.
- **Reproductor flotante**: va como isla arriba.
- **Horizontal**: patrón de Ajustes en todas las pantallas (lista a la izquierda, el ítem abierto a la derecha) y lo que no cambia queda estable.
- **Coherencia entre pantallas es prioridad alta**: lo mismo se resuelve igual en todas partes. Si encontrás dos formas distintas de resolver lo mismo, anotalo en el backlog.
- **Fuentes científicas**: se acreditan en un apartado de fuentes o al pie, nunca con nombres metidos en el texto de las explicaciones.
- **Voz**: voseo, frases cortas, nada que suene a máquina. Para presentar una app: «___, resuelto.»

## Invariantes técnicas (no se tocan sin plan de migración y OK de Fer)

- La clave de almacenamiento `barrabici.v4` y el nombre interno del archivo de exportación quedan como están: son los datos guardados de la gente.
- La app tiene que abrir y funcionar sin conexión desde la segunda apertura.
- Nada de servidores propios, cuentas ni analítica de terceros. Toda dependencia externa nueva pasa por el soberano (ver `docs/metodo/EQUIPO.md`).

## Cómo se publica

1. Rama nueva desde `main` y PR nuevo por cada tema. Una cosa por PR.
2. Suite completa en verde (las fallas conocidas, anotadas con su motivo en el PR).
3. Tablero antes y después, **en grafito y en claro**, con todos los estados que toca el cambio. Siempre incluí: inicio, sesión en curso, isla, serie con descanso, resumen y horizontal (844 × 390).
4. Esperá el OK de Fer al tablero. Recién ahí se mergea y se publica.
5. Después de publicar: verificá la versión publicada (no la local), escribí el registro en `docs/versiones/` y dejá probada la vuelta atrás.
6. Recordale a Fer cómo actualizar en el teléfono: abrir con conexión; si ve la versión vieja, cerrar la app del todo y abrirla de nuevo.

## Ritual de cada sesión

- **Al abrir**: leé este archivo, `docs/ESTADO.md`, `docs/BACKLOG.md` y la última acta. Decí en dos líneas dónde quedó todo y qué vas a hacer.
- **Al cerrar**: actualizá `docs/ESTADO.md` (qué quedó hecho, qué quedó a medias, qué decisiones esperan a Fer), el backlog y el acta de la vuelta. Cualquier sesión nueva, tuya o de otro asistente, tiene que poder seguir solo con esos archivos.

## Cómo trabajamos (Equipo Nodo)

Todo cambio pasa por cinco fases con su puerta: **Pensar → Investigar → Construir → Probar → Publicar**. Cada vuelta la trabaja un equipo de cinco: tres fijos (la persona, Casandra, la tijera), un invitado elegido por lo que hace falta y uno al azar (`node tools/elegir-equipo.mjs entreno <vuelta> <elegido>`). Cada miembro puede mandar ayudantes que miden y traen evidencia, sin opinar. Los agentes están en `.claude/agents/`, la orquestación en la skill `equipo-nodo` y el detalle en `docs/metodo/`. Las actas van a `docs/actas/`.

Para arreglos chicos sin cambio visible alcanza con una vuelta corta: la tijera, Casandra y los ayudantes que hagan falta (por ejemplo, el fiscal y el estrangulador). Para ideas nuevas, **modo boceto** (un prototipo, una vuelta, una decisión; nunca se publica).
