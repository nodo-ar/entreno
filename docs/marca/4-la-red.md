# La red

El fondo de todas las apps de Nodo es una grilla de puntos: la red de personas, en reposo. Una sola luz, la de la app, nace del nodo encendido (lo que está en curso o lo próximo que hay que hacer) y se apaga hacia los bordes. Detrás de los puntos hay un degradé muy suave del mismo color: es la luz ambiente, el único degradé de la marca.

## En Nodo Entreno

Entreno conserva su fondo de puntos actual, con su luz de colores en movimiento: es parte de la app que ya funciona. La red de una sola luz es para el catálogo, las páginas de cada app y las apps nuevas de la familia.

## Cómo se arma

- **Puntos** cada 14 px, de 1.1 px de radio, en `linea` (grafito) o en un gris un poco más oscuro que `linea` (claro).
- **Luz**: los puntos cercanos al nodo crecen hasta 2.7 px y toman el color de la app. La intensidad baja como una campana: a unos 200 px del nodo ya casi no hay luz.
- **Luz ambiente**: un degradé radial del color de la app, al 22 % en grafito y al 12 % en claro, que se desvanece del todo antes del borde de la pantalla.
- **El nodo** es siempre un elemento real de la pantalla: la "o" de la tarjeta de hoy, el reloj del descanso, el botón principal. La red no se ilumina sola en un lugar vacío.
- **Una sola luz por pantalla.** Si en la pantalla no hay nada en curso ni nada próximo, la red queda en reposo.

## Estados

| Estado | Cuándo | Qué hace la red |
| --- | --- | --- |
| Reposo | Casi siempre: listas, ajustes, historial | Corriente muy lenta en los puntos, luz tenue. Intensidad 0.25. |
| En curso | Una sesión, un vínculo, una carga | La luz se junta alrededor del nodo y respira cada 3 s (0.85 a 1). Intensidad 0.6. |
| Latido | Serie hecha, gasto cargado, algo confirmado | Una onda sale del nodo y cruza la red en 1.8 s. |
| Descanso | Una cuenta regresiva | La luz se achica con el tiempo que queda; cuando se apaga, toca seguir. |
| Festejo | Récord, escalón, insignia | Tres ondas separadas por 380 ms y el halo crece una vez. Dura menos de 3 s. |

## Reglas

- La red siempre va detrás del contenido. Las tarjetas son `superficie` casi opaca (92 %): la red se intuye, nunca se lee a través del texto.
- Con "reducir movimiento" la red queda quieta: sin corriente ni ondas. La luz cambia solo de intensidad.
- En el modo ahorro, puntos fijos en `linea` sin luz ni degradé. La pantalla tiene que funcionar igual.
- Dibujala en un canvas a 30 cuadros por segundo como máximo, y pausala cuando la app no está a la vista.
- En el panel flotante y en las notificaciones no hay red.
- Fuera de las apps (catálogo, páginas de cada app, tableros), la red va en reposo con la luz de la marca (`luz`).
