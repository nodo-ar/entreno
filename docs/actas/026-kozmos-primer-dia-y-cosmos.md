# Acta · Kozmos · vuelta 26 · el primer día y Cosmos · Construir → Probar

Fer aprobó (2026-10-22) tres cosas del boceto del motor (secciones 04 «El primer día» y 05 «Cielo → Cosmos»): la pestaña pasa a llamarse Cosmos, «Que Kozmos arme tu día» empieza por tu equipo con todo apagado, y la barra de abajo se va en las pantallas para elegir (opción A: volver arriba, el botón principal abajo). El paso de Tu nivel queda para otro PR.

Rama `claude/project-thread-985fzq`, sin PR.

**Equipo**: la persona · Casandra · la tijera · la cartógrafa (elegida: la navegación cambia) · la tesorera (al azar) · ayudantes: el fiscal (cada «cielo» a la vista, uno por uno), el pulgar (dónde queda el botón en 390 × 844 y 844 × 390) y el comparador (antes y después en claro y grafito).

## 1 · Cielo → Cosmos
Solo cambia lo que se ve. Las rutas (`#/cielo…`), los ids, las clases, las funciones y lo guardado quedan igual.

| Dónde | Antes | Ahora |
| --- | --- | --- |
| La barra | Cielo | **Cosmos** |
| El título de la pantalla (y el de la página) | Cielo | **Tu cosmos** («Tu cosmos · Kozmos») |
| La grilla de constelaciones (lector de pantalla) | Tu cielo | Tu cosmos |
| Hoy, el primer día | Lo que hagas enciende estrellas en tu cielo. | … en tu cosmos. |
| Hoy, al volver después de días | Tu cielo te esperó. Hoy arrancás más suave. | Tu cosmos te esperó. … |
| El ⋯ de la sesión | Mirar el cielo | Mirar tu cosmos |
| El resumen | Ver en el cielo · «Ver X en el cielo» (lector) | Ver en tu cosmos · «Ver X en tu cosmos» |
| El resumen y la constelación completa | Ya es parte de tu cielo. | Ya es parte de tu cosmos. |
| Tu equipo (Vos) | … no aparece en tu cielo ni en lo que toca hoy. | … en tu cosmos … |

El catálogo no tenía ningún «cielo» a la vista. Las constelaciones y las estrellas no cambian. En `kozmos/README.md`, la tabla de pantallas dice Cosmos.

## 2 · El primer día: Tu equipo → Tu rumbo
- «Que Kozmos arme tu día» lleva a **Tu equipo** (`#/hoy/equipo`), con nada marcado y la línea del boceto: «Marcá lo que tenés. Sin nada también se entrena.». «Seguir» lleva a **Tu rumbo**; si no marcaste nada, guarda que no tenés equipo (`[]`).
- Las dos pantallas dicen «Para empezar» y los pasos «Tu equipo · Tu rumbo». Volver desde Tu rumbo va a Tu equipo; desde Tu equipo, a Hoy. «Listo» en Tu rumbo vuelve a Hoy salteando los pasos: atrás no vuelve a pasar por ellos.
- Los pasos salen de una lista (`K.ARMAR` en `hoy.js`): cada pantalla pide el suyo por id, y los números, volver y «Seguir» salen de ahí. Sumar Tu nivel en el medio es sumar una fila. `K.pasos` ahora recibe la lista y el paso (la guía de Hoy, «Elegí cómo · Elegí qué · Empezá», es `K.GUIA`).
- La tarjeta de Hoy dice «Marcá tu equipo y elegí de 1 a 3 constelaciones. Cada día te da lo que toca.» (antes «Elegí de 1 a 3 constelaciones…»), para que el primer paso no sorprenda.
- **Vos → Tu equipo** sigue igual, con una diferencia: quien nunca contestó ya no ve todo marcado. No se ve nada marcado y la fila de Vos dice «Sin elegir» (antes «Todo»). Para el cielo y el motor, `null` sigue siendo «todavía no dijiste» y se muestra todo, como antes: esta vuelta no toca el motor. Marcar algo desde ahí guarda solo lo marcado.

## 3 · Sin barra en las pantallas para elegir
- Tu rumbo y Tu equipo (desde el primer día, desde Hoy o desde Vos en vertical) declaran `sinNav` en su encabezado (`K.enc`), y su botón principal va en `K.pie`: «Seguir» en el paso 1, «Listo» en lo demás. La barra baja con el mismo movimiento que ya tenía (`body.sin-barra`, 0,38 s) y vuelve al salir; con movimiento reducido, sin animar. Mientras no se ve, no toma toques ni foco (`inert`).
- El botón queda pegado abajo (sticky, con el área segura), sobre un degradé del fondo: lo que se desplaza pasa por detrás y lo último de la lista nunca queda tapado. Sticky y no fijo para que entre con la pantalla cuando llega de costado.
- En horizontal (844 × 390): sin el riel, la lista va a la izquierda (hasta 560 px) y el botón abajo a la derecha, al alcance del pulgar, sin tapar la lista. En Vos, Tu equipo es lo abierto a la derecha del patrón de Ajustes: ahí la barra y la lista quedan quietas y no hay «Listo» (no hay nada que cerrar).
- Se fue la regla vieja de `.rumbo-listo` (pegado arriba de la barra).

## Probar
- Sin pantalla: 80, en verde.
- De pantallas: 93 (antes 90), en verde. Ninguna se salteó.
  - Nuevas: **cosmos-nombre** (la barra dice Cosmos, el título Tu cosmos, y ninguna pantalla muestra «cielo», tampoco en etiquetas para el lector: Hoy, Cosmos, una constelación, Anotar, Planes, Progreso, Vos, Tu equipo, Tu rumbo, la sesión con su menú y la isla, y el resumen), **primer-dia-equipo** (Tu equipo sin nada marcado, volver, Seguir guarda `[]`, volver desde Tu rumbo, marcar barra y pared, Listo llega a Hoy con plan y sin pasos de más en la pila, y Vos → Tu equipo sin cambios) y **sin-nav-al-elegir** (sin barra en Tu equipo y Tu rumbo, en el primer día y fuera de él, el botón dentro de los 120 px de abajo y sin tapar la última fila, la barra vuelve en Hoy; en 390 × 844 y 844 × 390).
  - Cambiadas: **cinco-pestanas** (además, que la barra diga Cosmos), **encabezado-compacto**, **rutas-raras**, **anotar-enciende-y-queda**, **anotar-tipos**, **volver-sin-pasos-de-mas**, **sesion-isla-y-pausa** y **escalera-isla** esperaban el título «Cielo» (ahora «Tu cosmos»); **sesion-entera** y **primer-dia** pasan por Tu equipo (marcan la barra, porque el front lever la pide); **tu-equipo** (sin elegir dice «Sin elegir», nada marcado y el cielo igual que antes; marcar desde nada guarda solo lo marcado) y **sin-deshacer-al-elegir** (el primer toque en la soga ahora la marca).
- Tablero: capturas antes y después en grafito y en claro en el scratchpad (`m16/antes` y `m16/despues`, mismos nombres).

## Objeciones que cambiaron algo
- La persona: con el botón fijo, lo último de la lista quedaba debajo → el botón va al final del contenido, pegado abajo, y la prueba mide que la última fila quede libre.
- La cartógrafa: «Listo» al final del primer día dejaba Tu equipo y Tu rumbo en el botón atrás → volver a una pantalla saltea las de adentro de ella (`K.volver`), solo cuando todo lo del medio es de esa pantalla; en los demás casos, igual que antes.
- La cartógrafa: en horizontal, esconder la barra al abrir Tu equipo en Vos movía el riel en cada fila de Ajustes → ahí queda la barra y no hay «Listo».
- Casandra: un fijo (`position: fixed`) dentro de una pantalla que entra de costado salta durante la animación → sticky.
- Casandra: con la barra escondida, el teclado podía seguir llegando a sus botones → `inert`.
- La tijera: nada de un tercer componente de pasos; el mismo `K.pasos` con otra lista.
- La tesorera: la vuelta suma 4,8 kB a la página (931,8 → 936,6 kB) y ninguna dependencia.

## Para Fer (decisiones)
1. **Dos guías el primer día**: Hoy sigue con «Elegí cómo · Elegí qué · Empezá» y adentro de «Que Kozmos arme tu día» aparecen «Tu equipo · Tu rumbo». ¿Te cierra así, o preferís una sola línea («Elegí cómo · Tu equipo · Tu rumbo · Empezá»)? Recomiendo dejarlo así hasta que llegue Tu nivel y mirarlo con los tres pasos.
2. **Tu rumbo con equipo que no marcaste**: las constelaciones que piden algo que no tenés dicen «0 de 0» (por ejemplo, Parada de manos sin pared libre) y, si elegís una, Hoy dice «Lo que sigue pide barra». ¿Las marcamos en la fila («Pide barra»)? Es otra vuelta, con el motor.
3. **«Sin elegir»** en la fila de Tu equipo de Vos para quien nunca contestó (antes decía «Todo» y mostraba todo marcado). ¿OK?

## Al backlog
- Tu rumbo muestra «0 de 0» en lo que pide equipo que no marcaste (decisión 2).
- En horizontal, Tu rumbo y Tu equipo dejan la columna derecha vacía arriba del botón.
