# Acta · Kozmos · vuelta 11 · logo en movimiento e íconos propios · fase Construir → Probar

Fer pidió usar el logo de Kozmos en animaciones y transiciones, e íconos que tengan que ver con la app, nada genérico. Cuatro bocetos, todos aprobados: los cinco momentos del logo, la familia de íconos «Órbitas» y las hazañas como constelación (boceto 1); la barra circular (boceto 2); la estrella de color por pestaña y Vos en pirámide (boceto 3); la píldora que se desliza (boceto 4). Rama `claude/project-thread-985fzq`.

**Equipo**: la persona · Casandra · la tijera · el animador (elegido: todo el cambio es movimiento) · la abuela (al azar).

## Qué se construyó
- `kozmos/src/piezas/movimiento.js` y `.css` (`K.mov`): arranque al abrir (una vez por apertura, nunca sobre una sesión en curso), disco que se abre al empezar una sesión, estrella que vuela a su lugar en el resumen, logo que gira mientras se guarda o se trae un respaldo, órbita al terminar una rutina (resumen y Hoy).
- Barra: íconos nuevos; la estrella de cada pestaña (Hoy naranja, Cielo aqua, Progreso lima) existe solo en la elegida y llega orbitando con la píldora. Apagados, los íconos están enteros. Vos son las tres familias en pirámide; al elegirla se prenden y llega la de arriba.
- Cambiar de pestaña: las pantallas giran sobre un centro lejano, hacia el lado de la pestaña. La píldora se desliza derecho.
- Menús que nacen como círculo desde su botón; la isla nace del anillo del descanso.
- Hazañas con su figura (`figura` en `hazanas.json`, `K.dibujo.figura`): en la lista, el detalle, el resumen (se prende al completarla) y Progreso.
- Pruebas: `hazanas-figura` (sin pantalla) y `logo-en-movimiento` (arranque, estrella de la barra, pantalla vieja que se va, Vos prendida, almacenamiento bloqueado, sesión en curso, movimiento reducido).

## Propuestas y objeciones que cambiaron algo
- **Animador**: todo más corto y sin exagerar. Giro 460 → 320 ms y 16° → 9° con el centro a tres pantallas; la que se va se apaga a los 200 ms. Estrella de la barra 680 → 420 ms, −300° → −180°, sin agrandarse a 1,25. Menú 340/200 → 240/160 ms. Arranque 1,3 → 0,8 s. Isla 780 → 600 ms.
- **Animador y persona**: el disco al empezar era de tinta y en grafito destellaba blanco a pantalla completa. Ahora es gris suave (`--s2`).
- **Persona**: el arranque dejaba pasar toques a botones que no se veían. Ahora los frena mientras tapa (0,8 s).
- **Casandra (sin banderas rojas)**: el arranque tiraba un error si el navegador bloquea el almacenamiento; no tapaba una sesión en curso pero sí se comía su primer toque; no tenía red si la animación no terminaba. Arreglado los tres, con pruebas. La pantalla que se va vuelve a llevar `aria-hidden` y `pointer-events:none` además de `inert`.
- **Tijera**: sacadas clases sin uso y una animación de más en la isla; la isla recupera su entrada normal después de nacer del anillo. El arreglo de `deshacer` (un aviso que se va no toca el tiempo del nuevo) queda en este PR porque el menú nuevo lo destapó en la suite.
- **Abuela y persona (objeción, sin cambio)**: sin nombre, los íconos de Progreso y Vos no se adivinan, y la pirámide se confunde con el ⋯. La regla de Fer es el nombre solo en la elegida: se lo preguntamos en el tablero.

## Lo que no hay todavía
- El maniquí y los dibujos de los ejercicios: PR propio.
- Medir el giro en un Android de gama media real.

## Al backlog
- Dos íconos para lo mismo (fecha, Cielo y Cambiar el rumbo).
- La órbita de rutina terminada se anima en cada redibujo de Hoy.
- Medir el giro en el teléfono.
- Ayudante para empezar la sesión en `hoy.js`.

## Respuesta de Fer
(pendiente)
