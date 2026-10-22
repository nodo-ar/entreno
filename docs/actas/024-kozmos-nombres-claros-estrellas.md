# Acta · Kozmos · vuelta 24 · nombres claros para las estrellas · Construir → Probar

Fer aprobó la lista de nombres de estrellas (la misma regla que para pruebas y rutinas: qué hacés, en palabras de todos los días) y la recomendación de que cada ejercicio se llame igual que su estrella en toda la app. Esta vuelta la aplica.

Rama `claude/project-thread-985fzq`, sin PR.

**Equipo**: la persona · Casandra · la tijera · ayudantes: el fiscal (ninguna palabra de jerga en estrellas, ejercicios y escaleras; ningún id cambiado contra `main`, en pruebas puras) y el comparador (antes y después en claro y grafito, 390 × 844 y 844 × 390).

## Lo que Fer aprobó
1. Las 60 estrellas de la lista cambian de nombre (más las de Lastre de 10, 50 y 100 %, «igual en las de 50 % y 100 %»). Las que ya se entendían quedan igual. Las constelaciones guardan su nombre y «L-sit» se queda.
2. El ejercicio de cada estrella se llama igual que ella, sin el número ni el tiempo: en Hoy dice «Sentadilla a una pierna», no «Pistol».
3. Lo guardado sigue contando: cambia el nombre, no la estrella.

## Construir
- **Catálogo**: 64 estrellas en `constelaciones.json` y 49 ejercicios en `ejercicios.json` cambian de nombre. **Ningún id cambió**: las marcas, las sesiones y el respaldo siguen igual. La clave `barrabici.v4` y el archivo de exportación, sin tocar.
- **Un ejercicio detrás de varias estrellas**: toma el nombre común sin la medida. «Alcance en pike» (dos estrellas, 5 y 10 cm) pasa a «Sentado, manos más allá de los pies». «Bandera humana» pasa a «Bandera completa», como sus dos estrellas y al lado de «Bandera con rodillas recogidas» y «Bandera con piernas abiertas».
- **Ejercicios sin estrella con la misma jerga**: «Dragon flag negativa» pasa a «Bandera acostada, bajar lento» y «Remo en front lever tuck» a «Remo en horizontal con rodillas al pecho», para que «dragon flag» y «tuck» no queden vivos en otro lado. Las dos indicaciones que decían «en tuck» ahora dicen «con la rodilla al pecho».
- **Textos que nombraban la jerga** (commit aparte, se puede sacar entero si Fer no lo quiere): la escalera «Dragon flag» pasa a «Bandera acostada»; las metas de Parada de manos, Draco, Una pierna, Espagat y Soga, el texto de cuatro escaleras, el de «Alcance de piernas» y el de «Abdomen de gimnasta» dicen lo mismo con las palabras nuevas.
- **Nombres más largos en la pantalla**: con nombres de 30 a 45 letras aparecieron dos cortes feos.
  - La medida quedaba sola en un renglón («Parada de manos contra la pared 30» / «s»). `K.nw` mantiene el número con su medida («30 s», «×8», «+25 %», «5 cm») en las filas de la constelación, las marcas, la próxima estrella, el título de la prueba y el resumen. El texto que se lee no cambia.
  - La página entera usa `text-wrap: pretty`: el último renglón no queda con una sola palabra. Los títulos siguen con `balance`.
  - **La isla se salía de la pantalla** con un nombre largo (con «Sentadilla a una pierna hasta una silla · ▲ nuevo 0:12» ocupaba de −77 a 467 px en un teléfono de 390). Ya pasaba con «Extensión de tríceps sobre la cabeza». Ahora el nombre se corta con «…» y el reloj queda siempre entero.
  - **La serie en horizontal**: la figura medía siempre 184 px debajo del título, así que un título de dos renglones la sacaba por abajo de la pantalla. Ya pasaba con 32 de los 161 ejercicios con dibujo en 844 × 390 (y con 137 en un teléfono de 740 × 360); con los nombres nuevos eran 69. Ahora la figura y su número (o su anillo) van juntos en `.ses-cuerpo` y la figura usa el alto que queda, hasta 184 px: entran los 161 en 844 × 390, 740 × 360 y 915 × 412. En vertical, `.ses-cuerpo` no cuenta para el diseño (`display: contents`) y todo queda donde estaba; en horizontal, con un título de un renglón, la figura queda igual y el número y «Listo» se corren 2 o 3 px.

## Probar
- Sin pantalla: 80 (antes 79). Nueva: **catalogo-nombres-claros** (ninguna estrella, ejercicio ni escalera dice Tuck, Straddle, Pike, Pistol, Shrimp, Nórdico, Dragon flag, Planche lean, Cuervo, Criss-cross, Double under, Muscle-up, arquera, pseudo planche, V-sit ni Cosaca; las constelaciones siguen llamándose Muscle-up, Front lever, Planche, Draco y Espagat; «L-sit» sigue; los ids de constelaciones, estrellas, ejercicios, escaleras y pruebas son los mismos que en `origin/main`). Falla con el catálogo de antes («Cuervo 10 s»).
- De pantallas: 88, en verde. Ocho comparaciones de la suite esperaban el nombre viejo («Colgado activo 60 s», «Tuck 20 s»): ahora esperan el nuevo. Ninguna se salteó.
- Tablero: capturas antes y después en grafito y en claro en el scratchpad (`m14/antes` y `m14/despues`, mismos nombres): inicio (Hoy), Cielo, Parada de manos, Front lever, Draco, Una pierna y Planche con sus estrellas, la rutina Calistenia con lastre, la sesión en curso con su isla, la serie con descanso, la isla del descanso, el resumen y las tres constelaciones en horizontal (844 × 390), más la isla con el nombre más largo.

## Objeciones que cambiaron algo
- Casandra: «Cambiar el nombre no cambia la estrella» tiene que estar probado, no prometido → la prueba compara todos los ids con `main`.
- La persona: en un teléfono de 390 px la medida colgando sola en un renglón se lee como un error → número y medida van juntos.
- Casandra: la suite marcó que en horizontal la figura de «Colgado con hombros firmes» quedaba afuera → la figura se adapta al alto que queda (la falla venía de antes, con otros nombres largos).
- La tijera: nada de achicar la letra ni de cortar nombres en las filas; solo donde no entra (la isla) se corta, y el reloj nunca.

## Para Fer (decisiones)
1. **Los textos de las constelaciones** (meta de Draco, Una pierna, Soga…) y la escalera «Dragon flag»: los pasé a las palabras nuevas en un commit aparte. ¿Quedan o vuelven como estaban?
2. **«Parada de manos · Parada de manos contra la pared»** en Hoy: la fila antepone la constelación y el nombre nuevo ya la dice. Se puede sacar la constelación cuando el nombre ya la incluye.
3. **«Horizontal completo»** como nombre del ejercicio del front lever: afuera de la constelación no dice que es colgado. Si se lee raro en una rutina, «Horizontal colgado completo».

## Al backlog
- La fila de Hoy repite la constelación cuando el ejercicio ya la nombra (decisión 2).
- «Qué es cada estrella»: con los nombres nuevos se entiende solo; queda abierto si hace falta la línea de explicación en el menú de Estrella.
