# Acta · Kozmos · vuelta 22 · los íconos B en todas las pantallas · Pensar → Investigar → Construir → Probar

Rama `claude/project-thread-985fzq`, sin PR.

**Equipo**: la persona · Casandra · la tijera · la directora de arte (elegida: es oficio visual) · la cartógrafa (azar) · ayudantes: el fiscal (cada anillo contra los datos, en pruebas puras), el comparador (antes y después en claro y grafito) y el estrangulador (cuánto tarda en armarse el Cielo).

## Lo que Fer aprobó
1. El Cielo pasa a B: cada constelación es la figura de su última estrella adentro de un anillo de avance que se cierra como los de Actividad; la pista en el color suave de la familia, el satélite del logo en la punta del arco; completa, el anillo cerrado con el satélite arriba a la derecha. La constelación abierta puede guardar las estrellas como fondo tenue.
2. Todo lo demás que dibujaba una prueba, una constelación o una rutina con el dibujo viejo o un ícono genérico usa los mismos íconos B.
3. La tarjeta «Tu rutina» de Planes lleva su círculo, como las filas de rutinas.
4. Las medallas sin ganar quedan calladas en grafito.
5. Las rutinas con la misma figura se distinguen por el nombre y el dato.

## Pensar
- **La persona**: en el Cielo busca «la del front lever»; la figura en su anillo se reconoce sin leer y el anillo dice cuánto falta, igual que en el reloj.
- **La directora de arte**: un anillo fino, la figura en tinta adentro, el color solo en el arco. La figura de la meta (la última estrella) es la que dice qué habilidad es.
- **La cartógrafa**: una misma cosa, un mismo dibujo. Una estrella en una fila («Entrena para», «Enciende») lleva el anillo de su constelación, porque la fila lleva a la constelación.
- **Casandra**: la bandera y el dragon flag, sin poste ni banco, eran una persona acostada.
- **La tijera**: las listas de texto de Progreso («Estrellas encendidas este mes», «Lo que se apaga») siguen con el punto de color de la familia: no son íconos.

## Construir
- **`K.icono.constelacion(c, px, etiqueta, {desde})`** en `src/piezas/iconos.js`: la figura sale de la última estrella con pose; el anillo, de `encendidas / total`. Con `desde`, el arco crece solo lo nuevo (resumen y después de anotar). Nada se elige por id: el encuadre suma, por pose, el momento o la vista de lo que de perfil no se lee (muscle-up, dominada a un brazo de frente, dragon flag arriba, pancake de perfil con piso, nórdico y espagat con piso), y el pictograma ahora dibuja el poste de la bandera y el banco del dragon flag.
- **El Cielo**: una grilla de tres columnas (figura en su anillo de 76 px, nombre y «n de m») en lugar del cielo de estrellas; la lista, con el anillo a 40 px. La primera vez que abrís el Cielo los arcos se cierran hasta donde llegaste y el satélite los acompaña; después quedan quietos y, con movimiento reducido, nunca se mueven.
- **La constelación abierta**: la figura en su anillo (96 px) centrada sobre las estrellas de la constelación, tenues de fondo. La línea de qué es queda arriba, como antes.
- **Hoy**: la próxima estrella con su anillo (64 px, como la próxima prueba en Planes); «Sale de tu rutina» con el círculo de la rutina y «Sale de tu rumbo» con el anillo de la primera constelación; el primer día y el rumbo vacío muestran tres anillos, uno por familia; «¿Solo por hoy?» con su medalla; Tu rumbo con anillos.
- **Planes**: la tarjeta «Tu rutina» con su círculo de 40 px; «Entrena para» y «Enciende» con el anillo de la constelación (antes, el maniquí con disco y un punto).
- **Progreso**: cada sesión con lo que fue: la medalla (a color si tuvo magnitud), el anillo de la constelación o el círculo de la rutina.
- **El resumen**: una prueba es su medalla grande (el satélite llega orbitando) y, si encendió estrellas, el anillo de cada constelación creciendo; una sesión del rumbo, el anillo de su constelación.
- **Se fue**: el cielo de estrellas en zigzag, el anillo de lista, la figura de las hazañas (`K.dibujo.grande`, `anillo`, `figura`) y `figura` de las 8 pruebas en `hazanas.json` (163 líneas menos en el catálogo). `docs/kozmos-rutinas.md` al día.
- Cada pictograma se guarda la primera vez: el Cielo arma sus 28 anillos en pocos milisegundos y después salen de la memoria.

## Probar
- Sin pantalla: 79 (antes 78). Nuevas, que fallan con `main`: **iconos-b-constelacion** (la figura es la de la última estrella; pista, arco y satélite según el avance; completa con el satélite arriba a la derecha; la figura no toca el anillo; el arco crece solo lo nuevo; front lever, parada de manos, planche, bandera, dragon flag y muscle-up se leen a 40 px; poste y banco; ningún id de constelación en el código) y **hazanas-sin-figura** (reemplaza a hazanas-figura).
- De pantallas: 84 (antes 80). Nuevas, que fallan con `main`: **iconos-b-cielo** (grilla de 76 px, lista de 40 px, avance, completa y vacía, la abierta con su anillo y las estrellas tenues, horizontal), **iconos-b-en-todas** (primer día, Hoy con rumbo y con rutina, Tu rumbo, «Entrena para», «Enciende», Progreso, el resumen, y ningún dibujo viejo en ninguna pantalla) e **iconos-b-cielo-llega** (los arcos se cierran la primera vez, después no; con movimiento reducido, nunca); **iconos-b-cielo-rapido** es una guarda. Cambiadas: cielo-catalogo y anotar-enciende-y-queda miran la grilla; anotar mira que el anillo crezca en el resumen; planes-iconos-b pide el círculo en «Tu rutina» (ya no pide que el resto siga como estaba).
- Tablero antes (`main`) y después, claro y grafito, en 390 × 844: el Cielo, su lista, Front lever, Front lever abajo, Parada de manos, Planes con pruebas y con «Tu rutina», la prueba, la rutina, Progreso, Hoy (con rutina, con rumbo y el primer día), Tu rumbo, la sesión, el descanso, la isla, el resumen y el de una prueba; en 844 × 390, el Cielo, Planes y una rutina. Sin errores en la página y sin desbordar.

## Objeciones que cambiaron algo
- Casandra: la bandera y el dragon flag no se leían → el poste y el banco.
- La directora de arte: el texto de la constelación quedaba encima de las estrellas → la figura en su anillo va centrada sobre ellas y el texto vuelve arriba.
- La cartógrafa: «Entrena para» mostraba el maniquí con disco y «Enciende» un punto → los dos, el anillo de la constelación.

## Casandra
1. **La figura en el anillo a 40 px es chica** (unos 28 px): se reconoce, pero muscle-up y un brazo piden mirar dos veces. Mirarlo en el teléfono.
2. **Una misma figura para dos constelaciones**: no pasa hoy, pero si el catálogo suma una con la misma meta, se distingue solo por el nombre.
3. **El resumen de una sesión de rutina** muestra el anillo de la constelación hacia la que va la rutina, aunque no haya encendido nada: se lee como «hacia dónde vas».
4. Sin probar en un teléfono real.

## La tijera
- Fuera: las listas de texto de Progreso y del resumen («Estrella nueva») siguen con el punto de color; Anotar sigue con su ícono de estrella en el menú.

## Bandera roja
Ninguna.
