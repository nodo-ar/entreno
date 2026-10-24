# Acta 036 · Kozmos · Cada camino, su día

Fer pidió probar todas las combinaciones de la bienvenida contra el motor y verlas en un árbol. Recorrimos 107.184 días y aparecieron los problemas: el día tenía siempre forma de día de fuerza, cómo entrenás solo sumaba equipo y el tiempo no se respetaba (tablero https://claude.ai/artifact/JJHFGNTHiKB83PLZcEpoxe). Fer aprobó la propuesta («Me encanta todo… Mandale») y pidió una cosa más: que quede claro que lo que elegís primero se lleva más tiempo, y que el reparto se vea al elegir el tiempo.

## Qué cambió

- **El reparto** (`sesion/dia.js`): lo que elegís entrenar se guarda en orden (`perfil.enfoque`) y se reparte el tiempo del día: una cosa, todo; dos, 60 y 40; tres, 50, 30 y 20. Cada cosa tiene su parte: la fuerza, sus habilidades, pares y abdomen; la resistencia, su meta y el motor a intervalos; la flexibilidad, su meta y posturas, siempre al final.
- **Cómo te gusta entrenar orienta el día** (`perfil.formas`, que guardará la rueda): correr, bici, soga y pesas rusas eligen el motor y la meta de resistencia; yoga, posturas de un minuto que empiezan con gato y camello. Motor nuevo: trote y caminata.
- **El tiempo justo**: el día dura lo que elegiste, cinco minutos menos como mucho. Con poco tiempo para todo, van menos cosas por día y se turnan. Con 15 minutos o menos, entrada corta y sin cierre.
- **Arreglos**: «Remo agarrado de un poste» pasa a «Remo agarrado del marco de la puerta» (siempre se hizo así; el nombre hacía creer que pedía un poste). En días cortos, piernas y bisagra se turnan. La bici ya no se repite en el mismo día. La tarjeta de la próxima estrella muestra la meta de lo que elegiste primero.
- **Se ve el reparto**: en la bienvenida, cada cosa elegida lleva su número y la frase «Lo primero que elegís se lleva más tiempo»; debajo del reloj, una barra con los minutos de cada parte y, si no entra todo, cuántas cosas van por día. En Vos, el menú del tiempo dice el reparto de cada opción.
- **El árbol como prueba** (`kozmos/pruebas/arbol.mjs`): los 202.752 caminos (ahora importa el orden) cumplen el tiempo, el reparto, el equipo, sin repetidos y con la flexibilidad al final. Una muestra corre en las pruebas sin pantalla.

## Evidencia

- Sin pantalla: 127 de 127 (nuevas `arbol-caminos`, `arbol-formas`, `arbol-turnos`; `plan-rumbo` y `dia-equipo` reescritas: rango y motor ya no van al cierre, tienen su parte).
- El árbol entero: 202.752 caminos, ninguno falla.
- Suite completa y tablero: en el PR.

## Decisiones que esperan a Fer

1. OK al tablero para publicar.
2. El reparto va por el orden de elección (60/40 para la primera y la segunda), en lugar de los pares fijos del primer tablero (fuerza y flexibilidad 70/30): así la regla se dice en una frase.

## Lo que sigue

Ejercicios de gimnasio (barra y discos, banco, máquinas, bandas, cajón) y después la rueda de «¿Cómo entrenás?» en la bienvenida y en Vos, que guarda `perfil.formas`.
