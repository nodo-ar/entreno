# Acta · Kozmos · vuelta 28 · un molde para cada día · Construir → Probar

Fer aprobó (2026-10-22) el motor B con D1 a D6 y las tres recomendaciones del acta 027: los remos nuevos dentro de la escalera de Remo, Piernas e Isquios con peso desde el primer escalón con mancuernas, y el fondo ruso como está. Sumó una regla: **lo que pide equipo que no marcaste dice «Pide barra» (o lo que pida), nunca «0 de 0»**, en Tu rumbo y en todos lados. Esta vuelta es el segundo de tres PR: **el día del motor B**. Hoy deja de ser «una habilidad y lo que entre» y pasa a ser el mismo molde todos los días.

Rama `claude/project-thread-985fzq`, sin PR.

**Equipo**: la persona · Casandra · la tijera · el entrenador (elegido: un día que tiene que ser entrenable de verdad) · el cronista (al azar) · ayudantes: el fiscal (cada regla del plan contra `K.dia`), el contador (84 rumbos × 4 equipos: sin repetidos, equilibrio, minutos) y el pulgar (Hoy y Tu rumbo en 390 × 844, 360 × 740 y 844 × 390).

## 1 · Lo que ve la persona
- **Hoy, por partes y siempre en el mismo orden**: Entrada en calor (con sus minutos) → Habilidad · descansado (dos, de tus metas) → Fuerza · de a dos (dos superseries) → Abdomen → Cierre. Cada parte es un encabezado chico; la fuerza ya no repite «en superserie» en cada fila.
- **Cada habilidad dice para qué meta es**: «Para Front lever», o «Camino a Flexiones ×30 · para Planche» cuando todavía estás debajo en la escalera. Si un ejercicio sirve a dos metas, va una vez: «Para Front lever y Muscle-up».
- **Kozmos rota**: con tres metas o más, hoy van dos y abajo dice «La próxima: Una pierna». Mañana va la que quedó.
- **Tu rumbo sin tope**: «Elegí las que quieras. Kozmos rota lo que toca cada día.» Abajo, arriba de «Listo», dice cuánto toca cada una: «5 elegidas · cada una, 1 o 2 veces por semana» (con tus días; si no los dijiste, con 3).
- **«Pide barra», nunca «0 de 0»**: en Tu rumbo, en tu cosmos y en la constelación. Hoy arma el día con lo que se puede y dice, en una fila que lleva a Tu equipo, «Muscle-up pide barra».
- **La tarjeta «Llegaste»** sale solo si llegaste a todas tus metas; la de la próxima estrella es la de la primera habilidad del día.
- **El cierre**: si en tu rumbo hay Motor o Movilidad, el cierre es de esa meta; si no, 10 minutos de bici si la marcaste; si no, tres posturas de 40 s según lo que trabajó el día.
- **El resumen** dice los escalones (▲ Empujar…) también sin rutina, cuando el día es del molde.

## 2 · Lo que cambia por dentro
- `src/sesion/dia.js` (`K.dia`): `armar(cielo, rumbo, sesiones, hoy, {ej, equipo, marcas, nivelDesde, dadas, descarga})` devuelve `{bloques, minutos, volviste, ventana, rotacion, pide, pie, molde: true}`. Cada bloque lleva `molde` (entrada, habilidad, fuerza, abdomen, cierre); los de habilidad, `constelaciones`. También `rotar`, `frecuencia`, `ventana`, `deSemanaDePrueba`, `conDadas`, `minutosDe`.
- **Sin repetidos**: dos metas que piden el mismo ejercicio van en un bloque (`constelaciones: [a, b]`); la fuerza no repite la escalera de una habilidad del día; si el patrón de la primera habilidad se repite, se mira una meta más adelante.
- **Equilibrio**: las dos superseries son tirar + piernas y empujar + bisagra (o al revés); lo que falta se decide por lo hecho hoy, después por lo de los últimos 7 días.
- **Sostenidas**: 70 % de tu mejor marca (la mitad del umbral si no hay), tantas series como para sumar un minuto (de 2 a 8), descanso según lo largo (de 45 a 90 s).
- **Volviste** (21 días o más sin entrenar): sostenidas al 70 %, escaleras en descarga, sin ventana.
- **Una hora como mucho**: si pasa de 60 minutos, primero se va el abdomen; si igual pasa, la fuerza baja a 2 series.
- `K.plan.armar` ya no existe: Hoy usa `K.dia.armar` (y `K.dia.deSemanaDePrueba`). Las rutinas siguen como estaban.
- El diario guarda `molde` y `constelaciones` en cada bloque. El rumbo del respaldo acepta tantas como tenga el catálogo, sin repetidas.
- `nivelDesde` y `dadas` entran como opciones, sin pantalla (son del PR3).

## Lo que difiere del plan (y por qué)
- **`K.plan.armar` se borró** en vez de quedar al lado: dos motores para lo mismo era la forma segura de que diverjan (la tijera). Siete pruebas de `plan-*` se reescribieron porque el motor B reemplaza lo que medían: plan-rumbo (ya no hay Motor ni Movilidad de regalo; el cierre sale del rumbo), plan-no-repite-ayer, plan-volviste (70 % del 70 %: 20 s), plan-equipo (ahora dice qué pide), plan-ventana (la prueba toma el lugar de la habilidad) y el final de semana-de-prueba-sesion y plan-solo-con-prueba (con el molde).
- **La ventana de prueba reemplaza el bloque de habilidad** de esa meta, no se suma: sumarla llevaba días de 70 minutos.
- **La línea de frecuencia va fija abajo, arriba de «Listo»**, no debajo del texto: con 14 constelaciones, arriba quedaba lejos de lo que estás tocando.
- **El descanso de las sostenidas depende de lo largas que son** (de 45 a 90 s): con 8 series cortas a 90 s el día pasaba la hora.
- **La fuerza baja a 2 series** si sin abdomen el día sigue pasando la hora (con 5 metas y todo el equipo pasaba).
- **Si no queda escalera libre de un lado, se usa la del otro**: sin barra, con dos metas de tirar, una superserie quedaba sola.
- **Un tramo salteado en menos de 1 s no se guarda** (lo que pasa al saltear la entrada): no hay nada hecho que guardar.
- **La entrada en calor ya no cuenta como bici** en las calorías (backlog de la vuelta 27): el bloque se guarda con `ejercicio: null`.
- **«Pide …» vale también en tu cosmos** y en la constelación, no solo en Tu rumbo (la regla de Fer dice «en todos lados»).
- **Las rutinas** usan `K.dia.ventana` para su prueba del día, la misma regla que Hoy.
- **Base de calistenia sin barra** (remo repetido) queda en el backlog: está en los datos de la rutina, no en el molde.

## Probar
- Sin pantalla: 105 (antes 91), en verde. Nuevas: dia-molde, dia-sin-repetidos (84 rumbos × 4 equipos), dia-dos-metas-un-ejercicio, dia-equilibrio, dia-desde-tu-escalon, dia-rotacion, dia-rotacion-ventana, dia-frecuencia, dia-equipo, dia-volviste, dia-semana-de-prueba, dia-sesiones-viejas, respaldo-rumbo-sin-tope y dia-serie-escalera. Reescritas: las siete de arriba.
- De pantallas: 98 (antes 94). Nuevas: hoy-molde, rumbo-sin-tope, hoy-rota, hoy-molde-horizontal. Más estricta: sin-desborde-360 (Hoy, Tu rumbo y tu cosmos con seis metas, y cada bloque de la sesión). Adaptadas a la entrada en calor (la sesión ahora empieza por ella): las de sesión que miran la habilidad la saltean con un ayudante (`empezar`); sesion-entera hace la entrada entera, «Serie 2 de 2», enciende Colgado 60 s y cuenta las series contra lo guardado; aviso-y-deshacer usa un aviso de error (ya no existe «Hasta 3»); sesion-isla-y-pausa mira el bloque 2 (el 0 es la entrada). rutina-superserie deja correr 20 s de la entrada antes de saltearla (lo que corrió queda como tramos; salteada al toque no se guarda); peso-y-calorias recorre el día entero del molde (más pasos, con tramos al final) y las calorías siguen entre 150 y 400. Ninguna se debilitó ni se salteó.
- Tablero: antes (`main` 6e0976f) y después, en grafito y en claro, 390 × 844 y 844 × 390, en el scratchpad (`m18/antes`, `m18/despues`). Sin errores de consola ni desbordes, también a 360 px.

## Objeciones que cambiaron algo
- El entrenador: ocho series de 30 s con 90 s de descanso son 16 minutos de una sola cosa → descanso según lo largo.
- El entrenador: una superserie de uno no es superserie → el otro lado cuando no queda escalera libre.
- Casandra: «cada una, 2 veces por semana» mentía con metas que piden equipo → «las que podés, cada una…».
- Casandra: saltear la entrada guardaba una serie de 0 s y corría todos los índices del diario → no se guarda.
- La persona: «en superserie» debajo de «Fuerza · de a dos» se lee dos veces → fuera, en el molde.
- El cronista: con cinco metas, la fila de dónde sale el día no entraba → «Front lever · Planche y 3 más».
- La tijera: un solo motor (`K.plan.armar` fuera), sin dependencias nuevas.

## Para Fer (decisiones)
1. **Con bici, el cierre es bici y se va el abdomen** (el día llega a la hora). ¿OK, o preferís que el cierre con bici sea de 5 minutos y quede el abdomen? Recomiendo 5 minutos de bici y que quede el abdomen: el core es lo que más se pierde.
2. **La línea «5 elegidas · cada una, 1 o 2 veces por semana»** va fija abajo, arriba de «Listo». ¿OK? Recomiendo que sí: se ve mientras elegís.
3. **La ventana de prueba toma el lugar de la habilidad** de esa meta ese día (no se suma). ¿OK? Recomiendo que sí: el día queda en la hora y la prueba se hace descansado.

## Para el PR3 (Tu nivel)
- `K.dia.armar` ya acepta `nivelDesde` (`{fondos: "fondo", tirar: "dominada"}`: el escalón de arranque por escalera; va a `escalonesTodos` como `desde` y a cada bloque de fuerza) y `dadas` (ids de estrellas que tu nivel da por hechas; `K.dia.conDadas` las cuenta como encendidas para elegir la próxima, sin escribir marcas). Falta la pantalla, guardarlos en el perfil y llevarlos en el respaldo.
- `dia-desde-tu-escalon` ya prueba que el nivel mueve la fuerza y el camino, que lo hecho manda sobre el nivel y que las dadas corren la próxima. Falta la prueba de pantalla.
- El primer día (guía de 3 pasos) va a tener uno más con Tu nivel: primer-dia y primer-dia-equipo cuentan los pasos.
- Las dadas no encienden nada en el cosmos: si Fer quiere que se vean encendidas, es otra decisión (y otra migración del diario).

## Al backlog
- Base de calistenia sin barra repite remo (sigue, en los datos de la rutina).
- El cierre con bici se lleva el abdomen (decisión 1).
