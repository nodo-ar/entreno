# Acta · Kozmos · vuelta 21 · los íconos, opción B en Planes · Pensar → Investigar → Construir → Probar

Rama `claude/project-thread-985fzq` (PR #28). Esta acta reemplaza la de la primera versión de la vuelta.

**Equipo**: la persona · Casandra · la tijera · la directora de arte (elegida: es oficio visual) · la tesorera (azar) · ayudantes: el fiscal (cada ícono contra los datos, en pruebas puras), el comparador (antes y después en claro y grafito) y el estrangulador (cuánto tarda en armarse Planes).

## Lo que pasó con la primera versión
- La primera versión (asterismo en grande: estrellas en las articulaciones unidas por líneas; maniquí de línea en marcos distintos en las filas) llegó a todas las pantallas.
- **Fer no la aprobó: no se entendía.** Pidió íconos que la gente reconozca a primera vista, siguiendo los patrones que ya existen, y que lo de Kozmos quede en los detalles (el color de cada familia, el puntito del logo, el movimiento), como en la barra, las transiciones y los menús.

## Pensar
- **La persona**: en Planes busca «la de bici» o «la de dominadas». Una persona haciendo eso se reconoce sin leer; una constelación o un marco con significado propio hay que aprenderlos.
- **La directora de arte**: lo que la gente ya conoce de Apple Fitness, Salud, Strava, Garmin y los símbolos de Apple y Google: la figura llena haciendo la actividad, el aparato cuando manda, los logros como medallas y el avance como anillo.
- **Casandra**: hay seis rutinas de bici y tres de dominadas; con la figura sola se ven iguales.
- **La tijera**: esta vuelta cambia solo Planes. El Cielo, Hoy, Progreso y el resumen quedan como en `main` hasta que Fer lo vea en el teléfono.

## Investigar: tres opciones en un boceto (no se publica)
- **A · Pictograma clásico**: la figura llena sobre un círculo del color de su familia. Se entiende de una, pero el avance queda solo en el texto.
- **B · Pictograma con anillo**: la misma figura; las constelaciones adentro de un anillo que se cierra como los de Actividad, con el puntito del logo en la punta; las pruebas como medallas; las rutinas, la figura sola.
- **C · Por equipamiento**: el dibujo de la barra, la bici o la soga. Lo más nítido en chico, pero muchas cosas usan lo mismo.

**Fer eligió B** y aceptó las tres recomendaciones:
1. Se arma primero en Planes, para probarlo en el teléfono antes de cambiar lo demás.
2. Después, el Cielo también pasa al pictograma con anillo (la constelación abierta puede guardar las estrellas sobre el cuerpo como fondo tenue).
3. Las rutinas que comparten figura (seis de bici, tres de dominadas) se distinguen por el nombre y el dato de la derecha, no por el ícono.

## Construir
- **Todo lo demás vuelve a `main`**: Hoy, el Cielo, la constelación, Progreso, el resumen y el catálogo (las pruebas conservan su `figura`, que todavía usan Hoy, Progreso y el resumen).
- **`src/piezas/iconos.js` (`K.icono`), nuevo**: el pictograma sale del maniquí (`K.fig`): trazos gruesos y redondos, la cabeza aparte y un hueco fino donde un miembro pasa por delante de otro. Lleva lo que se usa: la barra, la bici, la soga, la kettlebell, las mancuernas, las paralelas y la pared.
  - **Prueba**: una medalla con la figura de lo que mide. A color cuando ya tenés una magnitud, con el satélite del logo; en gris cuando todavía no.
  - **Rutina**: la figura sola sobre un círculo del color suave de su familia. La figura es lo que más series lleva (de una escalera, el escalón hacia el que entrena); sin series, lo que más tiempo se hace (bici, trote, soga).
  - **El encuadre**: una tabla corta, por pose, para lo que de perfil y a 40 px no se lee: las dominadas de frente y colgadas (la ancha), la parada de manos de frente con los brazos abiertos y el piso, el planche y lo que se apoya en el piso con su línea, el alcance de piernas sentado, y el momento justo de la kettlebell, las mancuernas y los fondos. Ningún ícono se elige por el id de una prueba o una rutina.
  - Cada ícono se calcula una vez por apertura y queda guardado.
- **En Planes**: las filas de pruebas y de rutinas (40 px), la tarjeta de la próxima prueba (64 px) y la cabecera de la prueba abierta (88 px), que en horizontal se ve al lado de la lista.
- **El movimiento**: la primera vez que abrís Planes, el satélite de cada medalla ganada llega orbitando, como el puntito del logo; después queda quieto. Con movimiento reducido, nunca se mueve.
- **Colores**: solo los tokens (`--fu`, `--mo`, `--ra`, sus versiones suaves, `--off`, `--s1`, `--s2`).
- `K.fig.muestra(id, u)` da la pose de un ejercicio en un momento del movimiento.

## Probar
- Sin pantalla: 78 (antes 75). Nuevas, que fallan con `main` porque el módulo no existe: **iconos-b-poses** (cada figura contra los datos; el encuadre solo nombra poses que existen y solo cambia la manera de mirar), **iconos-b-dibujo** (medallas a color o en gris, rutinas en su familia, solo tokens, nada fuera de la caja) e **iconos-b-legibles-40px** (front lever, parada de manos, planche, dominada, flexión, bici, L-sit y soga llenan su círculo y a 40 px el trazo y la cabeza se ven).
- De pantallas: 80 (antes 77). Nuevas: **planes-iconos-b** (cada fila de Planes con su medalla o su figura a 40 px, ganada a color con satélite y el resto en gris, la familia en cada rutina, la próxima a 64 px, la prueba abierta a 88 px, Hoy, el Cielo y Progreso sin cambios, horizontal sin desbordar) y **planes-iconos-satelite** (orbita la primera vez, después no; con movimiento reducido, nunca), que fallan con `main`; **planes-iconos-rapidos** (Planes por primera vez en menos de 250 ms y después sale de la memoria) es una guarda que también pasa con `main`. **planes-proxima-prueba** ahora pide la medalla en la tarjeta.
- Se fueron las pruebas de la primera versión (asterismo, marcos, vuelta de la semana).
- Tablero antes (`main`) y después, claro y grafito: Planes con las pruebas, con las rutinas y abajo de todo, la prueba abierta, Hoy, la sesión, el descanso, la isla, el resumen y, en horizontal (844 × 390), Planes y Planes con una prueba abierta.

## Objeciones que cambiaron algo
- La persona al boceto: la dominada arquera no dice «dominada» → las dominadas se ven de frente, colgadas de una barra ancha.
- La directora de arte: front lever, parada de manos y planche no se leían a 40 px → parada de frente con los brazos abiertos y el piso; planche con el piso; la barra del front lever corta para que no se confunda con el cuerpo.
- Casandra: la kettlebell, las mancuernas y los fondos eran una persona parada → el aparato en la mano y el momento que más dice.
- La tesorera: el satélite girando cada vez que cambiás de familia cansa → solo la primera vez.

## Casandra
1. **Front lever, parada de manos y planche** no están en Planes: se ven en el Cielo, en la vuelta que sigue. Ya pasan la prueba de 40 px, pero la parada (tan alta) queda con la cabeza chica.
2. **Las medallas sin ganar en grafito** son oscuras sobre la tarjeta: se leen, pero bajito. Mirarlo en el teléfono.
3. **Coherencia por un tiempo**: Planes usa medallas y la persona nueva; Hoy, Progreso y el resumen siguen con la constelación dibujada de la prueba. Se resuelve cuando Fer apruebe Planes.
4. Sin probar en un teléfono real.

## La tijera
- Fuera: el anillo de las constelaciones (va con el Cielo), la tarjeta «Tu rutina» (sin ícono, como en `main`) y las filas «Enciende» y «Entrena para».

## Bandera roja
Ninguna.
