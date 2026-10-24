# Acta 037 · Kozmos · Con equipo

Fer preguntó si, además de los de gimnasio, faltaban ejercicios para el resto del equipo. Medimos cada equipo contra el motor (tablero https://claude.ai/artifact/SwpwsHZy3i9XvHw8esAHxx): barra, bici y soga estaban bien; con mancuernas o kettlebell no había empuje con peso; los equipos nuevos de la rueda no tenían ningún ejercicio. Fer siguió las recomendaciones: primero las pesas (barra y discos, banco, máquinas, mancuernas y kettlebell), sumar ya anillas y máquina de remo, y las máquinas dibujadas simples junto al maniquí.

## Qué cambió

- **Equipo nuevo** (`K.EQUIPOS`): anillas, barra y discos, banco, máquinas y poleas, máquina de remo. En la bienvenida, las catorce cosas entran en una pantalla sin desplazar (filas bajas de a dos; de a tres en horizontal).
- **18 ejercicios** con su maniquí (`src/poses/gimnasio.js`, piezas nuevas en `piezas/figura.js`): sentadilla, peso muerto, press de banca, press de hombros y remo con barra; prensa, jalón al pecho, remo en polea, press de pecho y curl de piernas en máquina; press de banca y en el piso con mancuernas; sentadilla al pecho y press con kettlebell; flexión de hombros; remo y fondos en anillas; remo en máquina.
- **Versiones de un escalón** (`conPeso` en lista, `total`, `manda`; ver `docs/kozmos-rutinas.md`): con barra o máquinas la versión con kilos es la escalera y tu nivel pone los kilos de arranque; con mancuernas o kettlebell, como antes. La habilidad va con tu cuerpo (`sinPeso`) y kilos y cuerpo llevan cuentas separadas.
- **Empujar arriba**, escalera nueva (flexión de hombros → pies en alto → contra la pared, con press de hombros si tenés con qué). Flexiones, arriba y fondos se turnan entre días; remo y dominada también.
- **Motor**: remo a intervalos y mancuerna a intervalos.
- La sesión pide «Kilos» (no «por mano») con barra, máquina o una kettlebell, y el ícono de los kilos es el de lo que levantás.

## Evidencia

- Árbol: 354.816 caminos (con el equipo nuevo), ninguno falla.
- Sin pantalla: 129 de 129 (nuevas `gimnasio-kilos`, `empujes-se-turnan`; `catalogo-escaleras`, `pesas-primero`, `dia-equilibrio`, `dia-desde-tu-escalon`, `dia-sesiones-viejas`, `nivel-desde` y `rutina-armar-bloques` al día).
- Suite de pantallas y tablero: en el PR.

## Decisiones que esperan a Fer

1. OK al tablero para publicar.
2. Con barra o máquinas, los kilos mandan sobre tu nivel sin peso (recomendado).
3. Los discos detrás del cuerpo (recomendado).

## Lo que sigue

Tanda 2: bandas, cajón y más con paralelas y pared. Tanda 3: sesiones nuevas (boxeo por rounds, remo por metros, Hyrox). Y la rueda de «¿Cómo entrenás?».
