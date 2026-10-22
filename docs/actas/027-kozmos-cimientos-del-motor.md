# Acta · Kozmos · vuelta 27 · los cimientos del motor · Construir → Probar

Fer aprobó (2026-10-22) el motor B «un molde para cada día» con las recomendaciones D1 a D6 del plan. Esta vuelta es el primero de tres PR: **los cimientos**. Datos y funciones puras detrás de la pantalla de siempre: Hoy (`K.plan.armar`) no cambia. Lo único que se ve es lo que trae el catálogo: los kilos por serie en las rutinas con mancuernas, las dos flexiones de Un brazo que ya no piden barra y los dos remos nuevos sin barra.

Rama `claude/project-thread-985fzq`, sin PR.

**Equipo**: la persona · Casandra · la tijera · la ingeniera de campo (elegida: kilos, equipo de la casa y dibujos que tienen que ser ciertos) · la cartógrafa (al azar) · ayudantes: el fiscal (cada afirmación del plan contra el código), el comparador (deRutina de main contra el de ahora, byte a byte) y el pulgar (el campo de kilos en 390 × 844 y 844 × 390).

## 1 · Lo que cambia en el catálogo
- **Patrones**: cada escalera dice lo que entrena (`patron`: tirar y remo → tirar; empujar y fondos → empujar; piernas; isquios → bisagra; L-sit y bandera acostada → abdomen; cadera y puente → movilidad). Las habilidades que no están en una escalera lo dicen en `ejercicios.json` (front lever → tirar; planche, parada de manos → empujar; bandera → abdomen, empujar y tirar; muscle-up y fondo ruso → tirar y empujar; y algunos más).
- **Equipo**: front lever y sus pasos, colgado a un brazo y fondo ruso piden barra; la bandera pide poste; la parada de manos contra la pared y la flexión contra la pared piden pared; los saltos dobles y cruzados de soga piden soga.
- **Un brazo** (D6): «Flexión cargando un brazo ×5» y «Flexión a un brazo ×3» ya no piden barra. Sin barra, la constelación las muestra para hacer.
- **Remos sin barra** (D4): «Remo debajo de la mesa» y «Remo con toalla en la puerta», con su dibujo (mesa y puerta nuevas en el motor de la figura).
- **Kilos con mancuernas** (D3): remo con mancuerna 2/6/16, sentadilla búlgara 2/6/14, peso muerto a una pierna 2/8/16 (`carga`/`kgInicial`/`hastaKg`). Con mancuernas, el primer escalón de Piernas es la sentadilla con mancuernas (2/4/16) y el de Isquios el peso muerto rumano (2/6/20) (`conPeso`).
- **Entrada en calor**: `catalogo/entradas.json`, 15 piezas (pulso, general, barra, manos, piernas y la última), como `K.ENTRADAS`.
- **Caminos**: cuatro estrellas dicen por qué escalera se llega cuando no se deduce: el fondo ruso y las dos primeras de Lastre por los fondos y la dominada, la dominada a un brazo por la negativa a un brazo.

## 2 · Lo que cambia en el motor (funciones puras)
- **La regla de los kilos**, dentro de `escalon`: arrancás en kgInicial; el tope dos veces (o una con «Sobró») suma 2 kg y vuelve al mínimo; si pasarías de hastaKg, subís de escalón (sin kilos); dos veces sin el mínimo, 2 kg menos (nunca debajo de kgInicial); ya en kgInicial, el escalón de abajo. Los kilos que pusiste mandan. Se leen de `kg` (o `lastreKg`, como antes).
- **La serie guarda `kg`**, nunca `lastreKg`: no pide tu peso y no hace marcas de % de tu peso (no enciende Lastre). La sesión dice «8 repeticiones · con 8 kg por mano» y el descanso pide «Kilos por mano» (se ve «kg por mano», de a 1 kg). Las filas de Hoy y de los días de la rutina dicen «3 × 8–12 · 8 kg». El resumen: «▲ Remo · +2 kg · ahora 8 kg» (y «▼ −2 kg» al bajar el peso).
- `K.rutina.armarBloques(familia, bloques, ctx)`: lo que deRutina hacía por dentro. Con el catálogo de main, el código de main y el de ahora dan lo mismo, byte a byte, en las 26 rutinas (todos los días, cinco equipos, con y sin descarga, con y sin historia).
- `K.rutina.escalonDe(id, {ej, equipo, sesiones, marcas, desde})` y `escalonesTodos(ctx)`: el escalón de cualquier escalera fuera de una rutina, con un escalón de arranque opcional.
- `src/sesion/caminos.js` (`K.caminos`): `patronDe`, `caminoDe` (el camino a una estrella si estás debajo en su escalera, «Camino a …») y `entrada` (la entrada en calor de un día: bici o saltos, una pieza por lo que pide el día, lo general y la última; de 5 a 6 minutos; solo con tu equipo).
- Respaldo: la serie acepta `kg` de 0 a 200. El formato sigue en 2 (las versiones de antes lo dejan pasar).

## Lo que difiere del plan (y por qué)
- **El remo en el poste no pide poste**: su indicación dice «un poste o marco firme» y un marco de puerta hay en todas las casas. Taggearlo dejaba sin primer escalón de remo a quien marcó su equipo.
- **Rodillas sobre los codos y la flexión con pies en alto no piden pared**: no la usan. La constelación entera sí la pide; queda anotado como excepción en la prueba de coherencia (igual que Lastre, que pide barra y paralelas, y los intervalos de Motor, que piden bici).
- **El fondo ruso pide barra, no paralelas**: su estrella pide barra; si pidiera paralelas, quien tiene solo barra perdería medio Muscle-up. La indicación dice «En paralelas»: decisión 3.
- **Los remos nuevos entran en la escalera de remo** como variantes del mismo escalón (`tambien`), no solo en el catálogo: sin barra, el remo invertido es el remo debajo de la mesa; sin mancuernas, el remo con mancuerna es la toalla en la puerta (sin kilos). Así la captura del remo debajo de la mesa sale de una sesión real y el que no tiene barra no queda trabado arriba de todo en el remo. Se ve: con solo barra, Remo pasa de 3 a 4 escalones; con solo mancuernas, de 2 a 3. Sin decir tu equipo, nada cambia.
- **Los kilos de `conPeso`** no estaban en el plan: sentadilla con mancuernas 2/4/16, peso muerto rumano 2/6/20.
- **Al volver a un escalón con kilos** arrancás con los últimos que usaste ahí (si no hay, kgInicial).
- **Un evento nuevo, «menos-peso»** (▼ en el resumen), para la carga de menos.
- **Arreglo de paso**: en una superserie con dos ejercicios con carga, la propuesta de kilos tomaba los del otro ejercicio (pasaba ya con el lastre de Calistenia con lastre: dominada y fondo). Ahora cada ejercicio arranca con los suyos.
- **La entrada en calor** apunta a 5 minutos y nunca pasa de 6 (de 5:00 a 6:00), no 5 ± 1.
- **Dos saltos de soga** (doble y cruzado) no pedían soga: lo encontró la prueba de coherencia.

## Probar
- Sin pantalla: 91 (antes 80), en verde. Nuevas: catalogo-patrones, catalogo-equipo-coherente, catalogo-entradas, catalogo-caminos, escalera-fuera-de-rutina, escalera-desde, escalera-kilos (también: `kg` no hace marca de %, el respaldo lo lleva y rechaza 900 kg), escalera-con-peso, entrada-elige, camino-de-estrella y rutina-armar-bloques. Más estricta: catalogo-escaleras (variantes sin repetir, patrón y kilos coherentes). Ninguna se debilitó.
- De pantallas: 94 (antes 93), en verde. Nueva: **serie-con-kilos** (Hoy y los días dicen los kilos; la serie «con 8 kg por mano» y «▲ más peso»; el descanso pide «Kilos por mano» con los de la serie, sin tu peso ni lastre; el + suma de a 1; en la superserie la sentadilla arranca con sus 4 kg y el remo sigue con los 9 que pusiste; lo guardado lleva `kg`, sin `lastreKg` ni `pesoKg`, no hace marcas y vuelve entero del respaldo; el resumen dice +2 kg).
- Dibujos: los dos remos nuevos pasan la revisión del maniquí (articulaciones posibles, nada bajo el piso) y se miraron al lado del remo en el poste, el invertido y el de mancuerna, en claro y grafito.
- Tablero: capturas antes y después en grafito y en claro en el scratchpad (`m17/antes` y `m17/despues`, mismos nombres).

## Objeciones que cambiaron algo
- La ingeniera de campo: «Kilos» a secas no dice si es una mancuerna o las dos → «Kilos por mano», y la serie dice «con 8 kg por mano».
- La ingeniera de campo: el remo en el poste dice «o marco firme» → no pide poste (arriba).
- Casandra: guardar los kilos de las mancuernas como `lastreKg` encendía Lastre con un remo → campo propio `kg`, con prueba.
- Casandra: sin decir tu equipo, `conPeso` habría cambiado la sentadilla de todos → solo con equipo marcado.
- La tijera: nada de un segundo `deRutina` para el motor B; el mismo `armarBloques`, probado byte a byte contra main.
- La cartógrafa: el remo debajo de la mesa como escalón propio movía los números de todas las escaleras → variante del mismo escalón.
- La tijera: la vuelta suma 16,9 kB a la página (936,6 → 953,5 kB), ninguna dependencia.

## Para Fer (decisiones)
1. **Los remos nuevos dentro de la escalera de Remo**: sin barra, el remo invertido es el remo debajo de la mesa; sin mancuernas, el remo con mancuerna es la toalla en la puerta. ¿OK? Recomiendo que sí: sin eso, el que no tiene barra se queda en el primer escalón para siempre.
2. **Con mancuernas, el primer escalón de Piernas e Isquios es con peso** (sentadilla con mancuernas desde 4 kg, peso muerto rumano desde 6 kg). ¿OK, o preferís que el peso arranque recién en la búlgara y el peso muerto a una pierna? Recomiendo que sí: el que tiene mancuernas progresa más parejo.
3. **El fondo ruso** pide barra (como su estrella) y la indicación dice «En paralelas». ¿Le cambiamos la indicación («En la barra o en paralelas…»)? Recomiendo dejar la estrella como está y revisar la indicación con un dibujo cuando toque Muscle-up.

## Para el PR2 (lo que el próximo necesita saber)
- `escalon` ya entiende series fuera de rutina si llevan `escalera` (y `rango`, `n`): el día del motor tiene que escribirlas en cada serie de un bloque de escalera. Las series con `estrella` no mueven escaleras (`pertenece`): un bloque de habilidad no lleva `escalera`.
- `armarBloques(familia, [{escalera, series, rango?, desde?, grupo?, descanso?, familia?}…], {ej, equipo, sesiones, marcas, descarga})` arma los bloques del molde con `escalera`, `rango`, `n`, kilos y superseries (mismo `grupo`; descanso 0 en el primero). Acepta `familia` por bloque.
- `escalonesTodos({ej, equipo, sesiones, marcas, desde: {tirar: "…"}})` para `caminoDe` y para el equilibrio (cada escalón trae `patron`, `paso.k` y `total`). `desde` acepta variantes (`remo-mesa`).
- `caminos.entrada(bloques, {equipo, ej})` devuelve un bloque de tramos listo; la pieza de bici lleva `ejercicio: "bici"` y las calorías cuentan toda la entrada como bici (ver backlog).
- Ojo con Base de calistenia sin barra: `[tirar, remo]` y `remo` en el mismo día (dos bloques de la misma escalera); el molde no tiene que repetirlo.
- Las pruebas que el plan dice que se rompen en el PR2 (plan-rumbo, plan-no-repite-ayer, plan-volviste, plan-equipo, plan-ventana, sin-deshacer-al-elegir, primer-dia) siguen en verde: esta vuelta no tocó `K.plan.armar`.

## Al backlog
- Dos bloques de la misma escalera en un día (Base de calistenia sin barra).
- «La vez pasada» del descanso con kilos dice solo las repeticiones.
- Las calorías cuentan la entrada en calor con bici como bici entera.
- Con kilos, las filas de los remos largos van en dos renglones a 390 px.
