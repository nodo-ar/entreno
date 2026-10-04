# Identidad visual

## El símbolo

La "o" encendida: un anillo con un punto adentro. Es la misma "o" con que termina el logotipo, y el punto es el nodo encendido: sos vos, tu teléfono, presente dentro de la red. El símbolo y el logotipo dicen lo mismo con una sola forma.

- Vive siempre sobre un cuadrado grafito (`fondo`) con `radio-icono`, un filo de luz fino en el borde de arriba y el halo de `luz` alrededor de la "o".
- Sobre fondos claros, sin el cuadrado, usá la versión en tinta: anillo y punto en `tinta`, sin halo (asset `Marca/nodo-simbolo-tinta.svg`).
- No lo rotes, no lo estires, no le cambies el grosor del anillo ni le saques el punto.

## El logotipo

"nodo" en minúsculas, dibujado a partir de Mona Sans semibold con ancho expandido (la base de Nodo Sans Ancha). La última "o" tiene un punto adentro: el nodo encendido.

- Sobre grafito, `Marca/nodo-logotipo-luz.svg`; sobre claro, `Marca/nodo-logotipo-tinta.svg`.
- Aire mínimo alrededor: la altura de la "n" en todos los lados. Altura mínima: 16 px.
- Con el símbolo, el logotipo va a la derecha, centrado en altura, separado por medio símbolo.
- Nunca en mayúsculas, nunca con contorno, nunca sobre una foto.

## La familia

Cada app es "Nodo" más su nombre: **Nodo Entreno**, **Nodo Gastos**, **Nodo Pizarra**. Escrito, "Nodo" va en `tinta-suave` y el nombre de la app en `tinta`; en el ícono no hay texto.

Todos los íconos comparten el fondo grafito, un solo gris plano para lo apagado (`#4a505a`, sin degradés), el filo de luz y la "o" encendida con su halo. Cambian la forma de lo apagado y el color de la luz:

| App | Forma | Luz |
| --- | --- | --- |
| Nodo (marca) | la "o" encendida sola | `luz` |
| Entreno | media barra con su disco; en la punta, la "o" encendida | `entreno` |
| Gastos | el signo dividir; el punto de arriba es la "o" encendida | `gastos` |
| Pizarra | una pantalla con dos nodos unidos; el de la derecha es la "o" encendida | `pizarra` |

Una app nueva sigue la misma receta: una forma simple en el gris plano que diga qué hace, una sola "o" encendida en el lugar donde pasa lo importante, y un color propio que no se confunda con los otros en lo claro ni en lo oscuro.

- La "o" lleva siempre anillo y punto, con el punto al 42 % del radio del anillo.
- En el monocromo de Android y en el ícono de notificación, todo pasa a una sola tinta: la "o" queda como anillo y punto, sin halo.

## Color

Nodo Entreno parte de la app que ya existe: conserva su naranja, aqua y lima, sus tarjetas con degradé y sus fotos. La marca se aplica como pulido (letra, grafito más frío, bordes finos, movimiento sin rebote), no como rediseño.


El grafito es el silencio; la luz es lo único que habla. Un pantallazo de Nodo es casi todo grafito y tinta, con una sola cosa encendida.

- Fondos: `fondo` para la pantalla, `superficie` para tarjetas, `superficie-alta` para lo que flota.
- Texto: `tinta` para lo principal, `tinta-suave` para lo secundario, `tinta-tenue` para etiquetas y pistas.
- Luz: el color de la app, en un solo elemento por pantalla. Si dos cosas compiten por la luz, una de las dos está de más.
- Dentro de Entreno, los colores con significado siguen como hasta ahora: fuerza en `entreno`, cardio en aqua, movilidad en lima, récords en ámbar. Esos colores viven dentro de la app; la marca se presenta solo con su luz.

## Tipografía

Tres familias propias, derivadas de Mona Sans y Geist Mono (licencia SIL OFL 1.1). Viajan dentro de cada app, así se ven igual en cualquier teléfono.

- **Nodo Sans Ancha** (Medium, Semibold) para títulos y nombres de sesión: ancho expandido, con presencia.
- **Nodo Sans** (Regular, Medium, Semibold, Bold) para todo lo que se lee. Cifras tabulares por defecto, con cero sin barra.
- **Nodo Mono** (Regular, Medium) para los números que se leen de un vistazo: relojes, kilos, repeticiones, montos.
- **Cada punto es un nodo**: en las tres, los puntos de la i, la j, el punto, los dos puntos, el punto medio, la diéresis y el signo dividir son círculos.
- **El cero de Nodo Mono lleva su nodo**: un punto en el centro, del mismo tamaño que los dos puntos del reloj.
- **◉ (U+25C9)** es el nodo encendido, con las proporciones del ícono. Sirve para nombrar en un texto lo que está en curso.
- En una frase, los números van en Nodo Sans ("serie 2 de 4"); Nodo Mono es para el número suelto que importa ("6 × 19,5 kg", "0:45").
- Jerarquía por tamaño y peso, nunca por color de marca. La luz no es un color de texto, salvo para nombrar el estado en curso.

## Forma y espacio

- Grilla de 4 px. Margen lateral mínimo `espacio-4`, entre tarjetas `espacio-6`, entre secciones `espacio-8`.
- Radios: `radio-s`, `radio-m`, `radio-l`. Nada de pastillas gigantes ni de esquinas vivas.
- Separá con superficies y `linea`. Sin sombras, salvo los halos de la luz y la `elevacion` del panel flotante.
- El fondo es **La red**: una grilla de puntos con una sola luz que nace del nodo encendido. Ver la sección La red.

## Movimiento

Calmo, preciso, sin rebote: 200, 240 y 320 ms con una sola curva de salida suave. El detalle, junto con el tacto y el sonido, está en la sección **Movimiento, tacto y sonido**.

## Iconografía

- Trazo de 1.75 px a 24 px, puntas y uniones redondeadas, sin relleno. Relleno solo para el estado activo.
- Los íconos van en `tinta` o `tinta-suave`; en la luz, solo el del estado en curso.
- Para el ícono chico de las notificaciones de Android, la silueta blanca de la forma de cada app, con la "o" como anillo y punto.
- Sin emojis, nunca.
