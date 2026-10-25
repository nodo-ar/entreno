# Acta 042 · Kozmos · Bíceps y tríceps

Fer aprobó el motor por días («Dale»), que salió como kozmos-49. Esta vuelta es el paso 2 del orden aprobado en `docs/kozmos-motor.md`: las escaleras de bíceps y tríceps, con sus dibujos.

## Qué cambió

- **Bíceps**: curl agarrado del marco de la puerta → remo invertido con las palmas hacia vos → dominada con las palmas hacia vos → curl con tu peso en la barra baja.
- **Tríceps**: extensión en la mesa → en la barra baja → en el piso.
- Con peso, en el primer escalón de cada una: barra con discos o polea (mandan los kilos), mancuernas, kettlebell o banda. Es la misma regla que el resto de las escaleras.
- 16 ejercicios nuevos con su maniquí (`src/poses/brazos.js`). En los de tu cuerpo, la mano no se mueve del marco, la barra o la mesa y los pies no se mueven del piso: el ángulo del tronco y el del codo se calcularon para que así sea en cada cuadro.
- «Dominada supina» pasa a llamarse «Dominada con las palmas hacia vos» (nombres claros). El id no cambia.
- Tu nivel de tirar y de empujar dice dónde arrancan los brazos, un escalón conservador.
- Arreglo del orden: de un par que no entra en tus minutos, entra el primero solo. Antes se salteaba el par entero y, en media hora de arriba sin equipo, quedaba un tríceps donde cabía el remo.

## Evidencia

- Prueba nueva `brazos`: las dos escaleras; cada versión con su equipo; con nada, mancuernas, kettlebell, bandas, máquinas y barra con discos, el día de tirar trae su curl y el de empujar su tríceps; en media hora de arriba va el remo y no los brazos.
- Sin pantalla: 133 de 133. Suite de pantallas y tablero: en el PR.

## Decisiones que esperan a Fer

1. OK al tablero para publicar.
2. Tu nivel no pregunta por los brazos: los deduce de tirar y empujar (recomendado, la bienvenida queda igual de corta).

## Lo que queda

El tríceps en la mesa se ve con el borde de la mesa, no la mesa entera: el encuadre del maniquí deja afuera lo que está más allá de las manos.
