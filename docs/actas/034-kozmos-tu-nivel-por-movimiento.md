# Acta 034 · Kozmos · Tu nivel, movimiento por movimiento

Primer paso del motor que Fer aprobó para la bienvenida («Si perfecto, dále»): los cuatro niveles (Inicial, Intermedio, Avanzado, Experto) y el nivel por movimiento. Después vienen pesas primero en cada escalera, los minutos que elegís, las escaleras de kettlebell y las rutinas de movilidad y motor con progresión.

## Qué cambió

- **Cinco movimientos, cuatro niveles** (`sesion/nivel.js`): Empujar, Tirar (solo con barra), Piernas, Atrás de las piernas y Abdomen. Cada nivel es un ejercicio que se ve (texto y figura) con su escalón de arranque y lo que da por hecho. Reemplaza las cuatro preguntas por cantidad. La tabla está en `docs/kozmos-rutinas.md` («Tu nivel»).
- **Un movimiento mueve solo sus escaleras**: antes, las flexiones decidían también el abdomen (L-sit); ahora el abdomen es su propio movimiento.
- **Lo de antes no se pierde** (`K.nivel.normal`): lo guardado con las preguntas por cantidad (y un respaldo viejo) se lee por movimiento, un escalón abajo ante la duda, y las escaleras arrancan donde arrancaban. La parada de manos ya no se pregunta: se prueba haciéndola. Al cambiar un nivel se guarda la forma nueva.
- **Tu nivel en pantalla**: cada fila muestra la figura del ejercicio de tu nivel y, debajo, el ejercicio en palabras (o la pregunta, si no elegiste). El menú muestra los cuatro niveles con su figura y «No sé» al final (`K.menu` acepta `fig`).

## Evidencia

- Sin pantalla: 122 de 122. Suite de pantalla: 108 de 108.
- Pruebas nuevas o rehechas: `nivel-desde`, `nivel-dadas`, `nivel-no-se`, `nivel-de-antes` (la forma de antes), `respaldo-nivel`; en pantalla `primer-dia-nivel`, `vos-tu-nivel` (con Abdomen experto: dos dadas en Draco), `nivel-horizontal`, `rumbo-arrancas-en`.
- Tablero en grafito y en claro, antes y después: https://claude.ai/artifact/Nfj7Pk46PiX3zWbhM3dRMT

## Decisión que espera a Fer

1. OK al tablero para publicar la versión 42.
