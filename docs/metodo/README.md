# Equipo Nodo

> En este repo: el método vive en `docs/metodo/`, las plantillas en `docs/metodo/plantillas/`, las herramientas en `tools/` (en la raíz), los agentes en `.claude/agents/` y la orquestación en la skill `.claude/skills/equipo-nodo/`. Las actas van a `docs/actas/` y los registros de versión a `docs/versiones/`.

Cómo se piensa, se investiga, se construye, se prueba y se publica todo lo que hace Nodo: una app, una función, una página, una campaña o una idea loca de un domingo.

Cada proyecto lo trabaja un equipo chico. Tres miembros están siempre; dos invitados cambian en cada proyecto y en cada vuelta, para que nunca se mire lo mismo con los mismos ojos. Cada miembro puede mandar ayudantes que miden y traen evidencia. El equipo propone, se objeta, decide y entrega algo concreto en cada fase. Nada pasa a la fase siguiente sin su entrega.

## Los archivos

| Archivo | Para qué |
| --- | --- |
| `EQUIPO.md` | El núcleo fijo, el plantel de invitados y cómo se eligen |
| `FASES.md` | Las cinco fases, qué entrega cada una y la puerta para pasar a la siguiente |
| `PRUEBAS.md` | Las pruebas de siempre y las que nadie quiere hacer |
| `plantillas/` | Brief, acta del equipo, orden para un ayudante, nota de investigación, tablero y registro de versión |
| `tools/recorredor-ejemplo.js` | El ayudante de la cartógrafa para una página: hace las tareas de navegación y devuelve evidencia (ejemplo de la landing) |
| `tools/elegir-equipo.mjs` | Elige el invitado al azar de cada vuelta, siempre igual para el mismo proyecto y vuelta |
| `CLAUDE.fragmento.md` | Lo que va en el `CLAUDE.md` de cada repo para que Claude Code trabaje así |

## En una línea por fase

1. **Pensar**: un brief de cinco líneas que el equipo discute hasta que alguien pueda decir que no.
2. **Investigar**: lo que ya existe, lo que se intentó, los datos con fuentes y de qué dependemos.
3. **Construir**: lo mínimo que resuelve, una cosa por cambio, con el manual de marca al lado.
4. **Probar**: la suite, las pruebas de campo y el tablero antes y después, en grafito y en claro.
5. **Publicar**: con versión, verificado en producción, con vuelta atrás lista y anotado en el registro.

Las ideas locas tienen su atajo: **modo boceto** (ver `FASES.md`).

## Quién decide

El equipo propone y objeta. La tijera recorta. Casandra puede levantar una bandera roja que frena la publicación. Fer decide cuando hay empate, y da el OK final antes de publicar cualquier cosa que se vea.
