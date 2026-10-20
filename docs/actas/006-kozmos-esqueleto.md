# Acta · Kozmos · vuelta 6 · etapa 1, el esqueleto · fase Construir → Probar

Primera etapa de Kozmos (ver el documento «Kozmos · Modelo y arquitectura»): la cáscara de la app, sin datos de entrenamiento todavía. Rama `claude/project-thread-985fzq` (sale de `main`). Todo vive en `kozmos/`; Entreno no se toca y sigue publicado.

**Equipo**: la persona · Casandra · la tijera · la directora de arte (invitada: la etapa es casi toda oficio visual) · el soberano (al azar, `node tools/elegir-equipo.mjs entreno 6 directora-de-arte`).

## Qué se construyó
- Armado sin dependencias de ejecución: módulos chicos en `kozmos/src/` que `kozmos/tools/armar.mjs` junta en un solo `index.html`, con service worker, manifiesto, letra e íconos. Versión `k-<commit>` (con `+cambios` si el árbol está sucio).
- Lo rescatado de Entreno, reescrito: barra de navegación flotante, encabezado que se achica al desplazar con las acciones siempre a la vista, menú desplegable que nace del botón, deshacer en lugar de confirmar, isla arriba, patrón de Ajustes en horizontal (lista a la izquierda, ítem abierto a la derecha).
- Cuatro pestañas (Hoy, Cielo, Progreso, Vos) con sus estados vacíos; Vos con Tema (automático, claro, oscuro) y Acerca de Kozmos.
- Dirección de arte B «Luz de día» en tokens, con su versión oscura. Letra Mona Sans y Geist Mono (OFL, sin modificar; procedencia y sha256 en `kozmos/fuentes/PROCEDENCIA.md`).
- Suite propia `kozmos/pruebas/suite.mjs`: 13 pruebas, en verde tres veces seguidas.

## Propuestas y objeciones que cambiaron algo
- **Persona**: «14 constelaciones» en un cielo vacío prometía algo que no está → fuera. Hoy prometía elegir un rumbo que todavía no existe → texto nuevo. El sol era Hoy y también Tema → Tema usa su propio ícono. En horizontal no se leía el texto de Cielo → arreglado. El «⋯» de Vos repetía la lista → fuera; Tema es un menú desplegable.
- **Directora de arte**: el logo negro de Hoy competía con el botón principal → un cielo chico con la próxima estrella. Estados vacíos unificados y alineados a la izquierda. La fila elegida en horizontal perdía su recuadro → arreglado. Títulos de los dos paneles a la misma altura (con prueba). Indicador de la barra en gris, no en negro: el negro queda para la acción.
- **Casandra**: el service worker podía guardar un portal cautivo o un error → solo guarda respuestas buenas y sin redirección (con prueba). Escape borraba el deshacer → arreglado. El foco se perdía al elegir → vuelve al botón. El deshacer ahora se frena mientras lo mirás con el foco o el dedo. Rutas raras (`#/vos/constructor`) → caen en la pantalla correcta. En horizontal, tocar filas de la lista no suma pasos al historial. Dos armados distintos ya no se llaman igual.
- **Tijera**: un solo PR. La isla se muestra en el tablero marcada como estado forzado por la prueba. Tablero con grafito en todas las pantallas, todas las pestañas en horizontal y la captura sin conexión.
- **Soberano**: las dos letras y Playwright pasan, con condiciones cumplidas: archivos sin modificar (si algún día se recortan, cambian de nombre: «Mona» es nombre reservado), procedencia y sha256 anotados, versión de Playwright anotada (1.56.1).

## Bandera roja (Casandra), abierta para la etapa 6
Publicar Kozmos en el mismo origen que Entreno (`nodo-ar.github.io`) comparte el almacenamiento con `barrabici.v4`: borrar los datos del sitio desde Kozmos borraría los de Entreno. Hoy no aplica (la publicación no incluye `kozmos/`). Se levanta con un dominio propio para Kozmos o con la aceptación por escrito de Fer (con una exportación de Entreno antes).

## Lo que no hay todavía
Sesión en curso, serie con descanso y resumen no existen en la etapa 1: el tablero muestra lo que sí hay. La isla no tiene disparador real.

## Decisiones para Fer
1. OK al tablero de la etapa 1.
2. Barra de navegación: píldora con la etiqueta solo en la elegida, o la barra del prototipo con todas las etiquetas.
3. La bandera roja del mismo dominio, para cuando se publique (etapa 6).
