# Acta 041 · Kozmos · Motor por días

Fer probó a fondo el simulador del motor y pidió que el orden respete principales y secundarios, y que resistencia y flexibilidad no tengan huecos. Aprobó todas las reglas y las recomendaciones («Dale sí a todo»). Las reglas quedaron escritas en `docs/kozmos-motor.md`. Esta vuelta construye la primera parte: el tipo de día de fuerza y el orden.

## Qué cambió

- Cada día de fuerza tiene su tipo (`plan.dia`), según `perfil.semana` (por ahora siempre «Que Kozmos elija», `auto`) y tus días: con 3 o menos, cuerpo entero; con 4, arriba y abajo; con 5 o 6, empujar, tirar y piernas. El ciclo avanza con cada día que tuvo fuerza (`K.dia.tipoDelDia`).
- Los movimientos del tipo de día van en orden: principales, secundarios, accesorios y abdomen (`K.dia.MOV`). Se turnan dentro de cada escalón, van de a dos solo si no se pisan, y si falta tiempo se cae lo último. Se cortan movimientos antes que series.
- Las habilidades van en el día de su movimiento; en cuerpo entero, todas.
- «Hoy toca» dice el tipo de día.
- `K.dia.armar` acepta `semana`, `dias` y `tipo` (este último fuerza el tipo, para pruebas).

## Evidencia

- Pruebas nuevas: `dia-tu-semana` y `dia-orden` (180 casos). Las que esperaban el día de cuerpo entero de antes se ajustaron a las reglas nuevas (`empujes-se-turnan`, `dia-equilibrio`, `dia-desde-tu-escalon`, `dia-equipo`, `dia-semana-de-prueba`, `dia-a-tu-tiempo`, `hoy-molde`).
- Capturas antes y después con el perfil de Fer, en claro y grafito, sin desbordes ni errores.

## Lo que sigue (en este orden)

1. Escaleras de bíceps y tríceps, con sus dibujos.
2. Versiones por forma con su propia progresión, y las que faltan (kettlebell para tirar, empujar y abdomen; gimnasio para fondos y abdomen).
3. Resistencia suave y fuerte, y flexibilidad por zonas.
4. «¿Cómo repartís tu semana?» en la bienvenida y en Vos; aire y flexibilidad en Tu nivel.
5. Secuencias de yoga.

## Decisiones que esperan a Fer

1. OK al tablero para publicar.
2. El día de abajo con la sentadilla búlgara como camino a una pierna: queda así hasta las versiones con kettlebell (recomendado).
