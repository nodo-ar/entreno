# Acta 040 · Kozmos · Cómo entrenás, en Vos

Fer aprobó la rueda con las recomendaciones («Dale»). Salió como kozmos-47. Esta vuelta suma «Cómo entrenás» en Vos como menú desplegable. Después siguen las pruebas en el teléfono.

## Qué cambió

- Vos tiene la fila «Cómo entrenás» debajo de Tu equipo. Es un menú con las once formas de la rueda, cada una con su figura. Cada toque suma o saca una (`K.menuFormas`, `perfil.formas`).
- Cuando sumás una forma, tu equipo suma lo que esa forma usa y te faltaba. Cuando la sacás, el equipo no pierde nada.
- La fila dice el nombre de la forma o, si son varias, «N formas», como «N cosas» en Tu equipo.
- Arreglo: el respaldo descartaba `enfoque` y `formas`, porque no estaban en la lista de claves válidas del perfil. Ahora los guarda y los trae.
- Arreglo: en horizontal, «Tus días» se partía en dos renglones. Ahora los nombres de los ajustes de Vos van en una línea, y lo elegido pasa abajo si no entra.
- Los menús largos se desplazan adentro y no se salen de la pantalla (`max-height` en `.pop`).

## Evidencia

- Prueba nueva `como-entrenas-vos`: el menú, sumar y sacar, el equipo, el respaldo y el menú en horizontal.
- Capturas antes y después en claro y grafito, sin desbordes ni errores. Suite y tablero: en el PR.

## Decisiones que esperan a Fer

1. OK al tablero para publicar.
2. Que sumar una forma agregue su equipo (recomendado).
