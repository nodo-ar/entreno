# Aplicaciones

## Ícono de app

Fondo grafito con `radio-icono`, la forma de la app en grises, un solo nodo encendido con su halo y el filo de luz arriba. Las fuentes de cada ícono (SVG, capas del ícono adaptable de Android, monocromo, notificación, web y tienda) están en el juego de íconos; los SVG finales, en el grupo **Íconos**.

## Pantalla de carga

Fondo `fondo` y el ícono de la app al centro, a 96 px. Sin texto, sin barra de carga. El ícono aparece con un fundido de 240 ms; si la carga dura más de un segundo, el halo respira. Sin sonido ni vibración.

## Notificaciones

- El ícono chico es la silueta blanca de la forma de la app. Sin imagen grande.
- Título: lo que pasa ahora (`Descanso · 1:24`, `Movilidad · 2 de 8`). Cuerpo: lo que sigue (`Sigue: búlgara, serie 3 de 4`).
- Se actualizan en silencio. Suenan una sola vez cuando hay que hacer algo, con los sonidos de la marca: `campana` cuando termina el descanso, `subir` o `bajar` cuando cambia la fase, `fin` cuando termina la sesión.
- Dos botones como máximo, con verbos: `Serie hecha`, `+30 s`, `Saltar`.

## Panel flotante

Una línea arriba con qué estás haciendo y por dónde vas (`etiqueta`), un número grande con lo que importa ahora (`numero-xl`) y la barra de la sesión abajo. Siempre en el tema grafito, con `elevacion`, sobre cualquier app.

## Catálogo y páginas de cada app

La portada del catálogo abre con la frase y el manifiesto sobre grafito, con La red en reposo de fondo y la luz de la marca. Cada app tiene su página con el ícono, una línea que dice qué hace, dos o tres capturas reales y el botón para instalar. Sin testimonios inventados, sin cifras de relleno.

## Tableros

Todo cambio visual se presenta en un tablero antes de publicarse. El tablero también es Nodo:

- Fondo `fondo`, margen `espacio-12`, el logotipo chico arriba a la izquierda.
- Un título en `titulo-l` que diga qué cambia ("La tarjeta del día libre"), no la mecánica ("Cambios en .hero.rest").
- Las pantallas de antes y después lado a lado, del mismo tamaño, con una `linea` entre las dos y su rótulo en `etiqueta`: ANTES, DESPUÉS.
- Capturas reales de la app, con los efectos completos, en grafito y en claro, y con todos los estados que toca el cambio (sesión en curso, isla, horizontal).
- Como mucho tres notas cortas en `cuerpo-s`, `tinta-suave`. Nada de párrafos.
- Sin marcos de teléfono dibujados ni fondos decorativos: la pantalla, con `radio-l`, sobre el grafito.

## README de cada repo

Arriba el ícono y "Nodo" más el nombre de la app, después una línea que diga qué hace en palabras de la persona que la usa. Abajo, cómo correrla. En el mismo tono que todo lo demás.

## Qué sí y qué no

| Sí | No |
| --- | --- |
| Una sola cosa encendida por pantalla | Varios colores de marca compitiendo |
| Grafito, tinta y luz | Degradés violetas, neón, crema con terracota |
| Números claros y grandes | Oraciones que explican lo que un número dice solo |
| Silencio hasta que hay que hacer algo | Avisos para "volver a la app" |
| Deshacer después de la acción | "¿Estás seguro?" |
| Geometría de nodos | Fotos de stock, ilustraciones de personas, emojis |
| Tableros con la pantalla real | Marcos de teléfono dibujados y explicaciones largas |
