# Backlog · Nodo Entreno

Orden de prioridad. Cada ítem nuevo pasa por el método (`docs/metodo/FASES.md`). Lo marcado **[idea]** necesita el OK del brief antes de construir; lo marcado **[Fer]** es algo que tiene que hacer Fer y vos solo le recordás o preparás.

## Ahora

1. **Estabilidad de la suite y pesos de letra** (decidido, ver `docs/ESTADO.md`). Un PR. Tablero en grafito y en claro con inicio, sesión en curso, isla, serie con descanso, resumen y horizontal. *Hecho en `claude/pesos-y-esperas`; espera el OK de Fer (acta 001).*
2. **La suite no depende del día.** chk249, chk259, chk262, chk263 y chk274 fallan según el día de la semana (los lunes, y chk249 también los domingos), igual en `main`: la semilla y las pruebas usan la fecha real. Fijar la fecha de las pruebas (reloj de la página) para que la suite dé lo mismo cualquier día. Sin cambio visible.
3. **Respaldo que se puede comprobar.** Verificar que exportar e importar funciona de punta a punta en un teléfono limpio, sin perder nada. Documentar en `docs/` el formato del archivo exportado (nombre, estructura, versión) sin cambiar el nombre interno. Sumar una prueba automática de ida y vuelta (exportar → borrar → importar → comparar).
4. **APK con publicación automática.** Empaquetar la app para Android y publicar cada versión en GitHub Releases desde Actions, con número de versión y notas en palabras de la gente. Que el enlace «última versión» funcione. *Kozmos: armado en `kozmos/apk/` (rama `claude/project-thread-985fzq`); falta el secreto `KOZMOS_FIRMA`, la prueba en el teléfono de Fer y el OK para fusionar y publicar la primera versión.*
   - Después de probar en el teléfono: ver si se puede sacar el permiso `INTERNET` (la página la sirve la propia APK) y si el WebView del teléfono de Fer ya respeta las áreas seguras (WebView 140 o más).
   - **[Fer]** Registrarse temprano como desarrollador en la verificación de Google para apps instaladas por fuera de Play Store (cuenta gratuita para aficionados). Google empezó a exigirla en septiembre de 2026 en algunos países y la extiende a todo el mundo en 2027. Antes de dar esto por cerrado, buscá el estado actual de esa regla: cambia seguido.
   - Casandra: en Android 13 o más, las apps instaladas por fuera de la tienda tienen restringidos algunos permisos (accesibilidad, administración del dispositivo). Entreno no los necesita; si alguna función los pidiera, se frena y se consulta.

## Después

5. **Auditoría de coherencia.** Buscar dónde la app resuelve lo mismo de formas distintas (ejemplo conocido: las pestañas Semana/Mes de Resumen frente al selector «Esta semana» de Cuerpo). Entregar la lista con capturas y una propuesta por caso; se arregla de a uno.
6. **Horizontal en todas las pantallas** con el patrón de Ajustes (lista a la izquierda, ítem abierto a la derecha).
7. **Fuentes científicas** en un apartado propio, enumeradas al pie, sin nombres en el texto de las explicaciones.
8. **Prueba automática de la regla de pesos** (de la vuelta 1): todo texto de 13 px o menos en 700; en los segmentados, la elegida en 700 y las demás en 600.
9. **Jerarquía con el tono en listas densas** (de la vuelta 1, la directora de arte): con tanto 700, las líneas de detalle de Progreso pesan casi como su etiqueta. Probar `tinta-suave` en esas líneas, nunca en la barra de descanso ni en el encabezado de la sesión. Cambia color: vuelta propia, con brief y tablero.
10. **«Terminar» frente a «Siguiente»** en la sesión: los dos naranjas y en 700; un solo botón principal por pantalla. Brief y tablero.
11. **Limpiar CSS que no se usa**: `.swfil`, `.cortaseg`, `.intensity`, `.faces`, `.modes`, `.htabs` y las funciones `pickers` / `pickerCards`. Sin cambio visible.
12. **Duraciones de `.segx`** (.25 s y .38 s), que no son tokens del manual de movimiento.

## Kozmos (de la vuelta 6)

- **Uso del «⋯»**: queda la pieza, sin pantalla que la necesite todavía.
- **Fijar Playwright en un `package.json`** (el soberano). PR aparte.
- **Pruebas que faltan** (Casandra): cambio de versión con la app abierta y red lenta.
- **Dominio propio para Kozmos** (decidido por Fer): conseguirlo y configurarlo antes de publicar, en la etapa 6. Ahí se baja la bandera roja de Casandra.
- **Dejar escrita la letra de Kozmos** (Mona Sans y Geist Mono en lugar de la tipografía Nodo): viene de la dirección de arte B.
- ~~**Aviso y deshacer a la vez** (Casandra): un aviso de error cierra el deshacer que estaba pendiente.~~ Hecho en la vuelta 23: el deshacer espera detrás del aviso y vuelve con el tiempo que le quedaba.
- ~~**La fecha de Anotar pasada la medianoche** (Casandra): con la app abierta, «Hoy» queda en ayer.~~ Hecho en la vuelta 23: a la medianoche y al volver a la app, Hoy y el día sin elegir de Anotar pasan al día nuevo.
- **Qué es cada estrella** (la persona): «Bolita», «Tuck» o «Draco» no se entienden solos. Una línea de explicación en el menú de Estrella cuando llegue el catálogo de ejercicios (etapa 5). *Vuelta 24: las estrellas y sus ejercicios ya dicen qué hacés; mirar con Fer si la línea todavía hace falta.*
- **La fila de Hoy repite la constelación** (coherencia, vuelta 24): «Parada de manos · Parada de manos contra la pared». Sacar la constelación cuando el nombre del ejercicio ya la dice; lo decide Fer.
- **«Horizontal completo» fuera del Cielo** (la persona, vuelta 24): en una rutina no dice que es colgado de la barra. Si Fer lo ve raro, «Horizontal colgado completo».
- **Tu peso como dato fijo en Lastre** (la persona): hoy se ve como otro selector, aunque queda guardado.
- **Probar la sesión en un Android real** (la ingeniera de campo, el soberano): vibración, campana con pantalla bloqueada, wake lock, y guardar y traer el respaldo desde la app instalada.
- **Respaldo más estricto** (Casandra): validar `familia` y `encendio` de cada registro. Traducir ids a nombres para quien lo lea (el soberano).
- ~~**El deshacer dura lo que dura el aviso** (Casandra).~~ Hecho en la vuelta 23, misma causa que «Aviso y deshacer a la vez»: el deshacer ya no muere con el aviso que lo tapa. Si se quiere más que 5 s, es diseño: lo decide Fer.
- ~~**Deshacer en cada elección** (Fer, 2026-10-22): el deshacer aparecía al elegir rumbo, equipo, días, tema, avisos, peso o la persona.~~ Hecho en la vuelta 25: solo aparece al borrar, terminar o reemplazar. *Espera el OK de Fer al tablero.*
- ~~**Tu rumbo con equipo que no marcaste** (Casandra, vuelta 26): «0 de 0».~~ Hecho en la vuelta 28 con la regla de Fer: «Pide barra» (o lo que pida) en Tu rumbo, tu cosmos y la constelación; Hoy dice qué piden con atajo a Tu equipo. *Espera el OK de Fer al tablero.*
- ~~**Dos guías el primer día** (coherencia, vuelta 26)~~: hecho en la vuelta 29, una sola guía «Tu equipo · Tu nivel · Tu rumbo». *Espera el OK de Fer al tablero.*
- ~~**Tu nivel en el primer día** (Fer, boceto del motor)~~: hecho en la vuelta 29. *Espera el OK de Fer al tablero.*
- **Horizontal de Tu rumbo, Tu equipo y Tu nivel** (la persona, vuelta 26): la columna derecha queda vacía arriba del botón.
- ~~**Las rutinas no usan tu nivel**~~: hecho en la vuelta 31.
- **Cambiar tu nivel renueva su fecha** (Casandra, vuelta 29): un intento que no llegó antes de cambiarlo vuelve a no contar para sacar una dada.
- **Atajos entre pestañas** (la cartógrafa): Tu equipo abierto desde Hoy o el cielo vuelve a Vos, no a donde estabas.
- **Progreso en horizontal** (la cartógrafa): al borrar la sesión abierta se muestra la siguiente sin avisar; «Tus sesiones» queda abajo en la columna izquierda; el ⋯ no deja claro a qué lado pertenece.
- **`AVISOS` definido en dos lugares** (la tijera).
- ~~Tus días~~: hecho en la etapa 5. Aclaración: son los días de la semana que entrenás, no un calendario (el acta 009 decía «calendario»).
- ~~El maniquí y los dibujos de los ejercicios~~: hecho en el PR del maniquí (actas 012 y 013).
- Maniquí, lo que sigue (acta 013): vista de frente y de tres cuartos para lo lateral; mano con orientación; tronco que se curva; escorzo; bici más grande con el pedaleo rehecho; ritmo por tramo en los ciclos; miniaturas en «Hoy toca».
- ~~**Vista de frente para lo lateral**~~: hecho en `claude/project-thread-985fzq` (motor 3D, `tools/vistas.mjs`). 24 ejercicios cambian de vista; espera el OK de Fer al tablero.
- **Vistas que faltan** (la tijera): flexión arquera, front lever y planche straddle, paseo con maleta, pecho y bíceps en la pared se siguen viendo de perfil. Escribirlos en `tools/vistas.mjs` cuando se estudie cada movimiento.
- **Apoyos que se deslizan en las poses de perfil** (Casandra): la revisión de apoyos quietos corre solo en las poses 3D. En perfil se deslizan unos px las manos o los pies de flexión, flexión cerrada, inclinada, pseudo planche y arquera, sentadilla y sentadilla profunda, cuervo, remo invertido, peso muerto a una pierna y plancha en dos apoyos. En el muscle-up y el curl femoral deslizante el desliz es parte del movimiento. Arreglarlos cambia dibujos que hoy están aprobados: vuelta propia con tablero.
- **Tronco en dos piezas y rotación de hombro** (la tijera): para el gato-camello, el dragon flag y el antebrazo contra la pared.
- **Miniaturas en «Hoy toca» y en la Constelación** (coherencia): hoy la persona aparece en la sesión, el circuito y «Entrena para», pero no en esas dos listas.
- **Medir la figura en el teléfono de Fer** (la ingeniera de campo): ms por cuadro y batería en 10 minutos de serie, con y sin movimiento reducido.
- ~~«Entrena para»~~: Fer decidió dejarlo así (2026-10-20).
- ~~Nombres de personas en títulos~~: renombradas (2026-10-20).
- ~~Logo de Kozmos en animaciones y transiciones; íconos propios~~: hecho en el PR del logo en movimiento (acta 011). Los dibujos de ejercicios siguen con el maniquí.
- **Dos íconos para lo mismo** (la tijera, la abuela): la fecha usa `cal` en Cielo y Tus días usa `dias`. ~~El ícono de Cielo en la barra es el mismo de «Cambiar el rumbo»~~: el rumbo tiene la estrella polar desde la vuelta 16.
- **La órbita de rutina terminada se anima en cada redibujo de Hoy** (Casandra): que se anime solo la primera vez.
- **Medir el giro de pestañas en un Android de gama media** (el animador, la persona): si pierde cuadros, girar solo lo visible.
- **Un ayudante para empezar la sesión** (la tijera): `K.mov.iris(btn); K.sesion.empezar(...)` se repite tres veces en `hoy.js`.
- **Pitidos de tramo con la pantalla apagada** (la ingeniera de campo): programar la campana de cada cambio de tramo y desprogramarla al pausar, saltear o cortar (Casandra).
- **Achicar el catálogo de rutinas** (la ingeniera de campo): 408 kB de JSON; sesiones repetidas por referencia.
- **«−1» pegado a «Vuelta» y «Seguir esta rutina» abajo del pliegue** (la ingeniera de campo).
- **Rutina con más días que tus días** (la persona): avisar cuando pide 5 por semana y entrenás 3.
- **Aviso de salud en Acerca** (la abogada): antes del APK.
- **Intervalos piden bici** (conversión): con kettlebell y sin bici, kb1515 no enciende las estrellas de intervalos.
- **Condiciones de nivel de Entreno** (conversión): «si hacés 3 dominadas» no existe; la app elige siempre la primera alternativa que tu equipo permite.
- **Wake lock con video** para navegadores sin la API (la ingeniera de campo).
- **Audio después de recuperar una sesión**: queda mudo hasta el primer toque.
- **Biblioteca en la barra**: los bocetos de miniaturas la mostraban; el prototipo tiene Progreso y Vos. Definir con Fer cuando haya ejercicios.
- ~~**Rediseño de Planes, rutinas y hazañas con progresión real**~~: Modelo A (escaleras), pasos 0 a 2, hecho en la vuelta 17 (acta 017).
- ~~**Modelo B de progresión: ciclos con semana de prueba**~~: hecho en la vuelta 18 (acta 018).
- ~~**Íconos, opción B**~~: Planes en la vuelta 21 (acta 021); el Cielo y todas las demás pantallas en la vuelta 22 (acta 022). La tarjeta «Tu rutina» lleva su círculo.
- ~~**Dos formas de dibujar una prueba**~~ (coherencia, vuelta 21): cerrado en la vuelta 22, la prueba es su medalla en todas partes.
- ~~**La tarjeta «Tu rutina» sin ícono**~~: cerrado en la vuelta 22.
- **La figura en el anillo a 40 px** (Casandra, vuelta 22): unos 28 px; muscle-up y un brazo piden mirar dos veces. Revisar en el teléfono; si cuesta, la figura puede ir un poco más grande en las filas.
- **Puntos de color en las listas de texto** (coherencia, vuelta 22): «Estrellas encendidas este mes», «Lo que se apaga» y «Estrella nueva» siguen con el punto de la familia, no con el anillo. Mirar con Fer si las filas de Progreso pasan a filas con ícono.
- **La parada de manos a 40 px** (la directora de arte, vuelta 21): de frente con brazos abiertos y piso se reconoce, pero la cabeza queda chica por lo alta que es.
- **Dibujos propios para las pruebas nuevas** (vuelta 18): Sentarte y pararte, Alcance de piernas, 12 minutos en bici y 1000 saltos de soga usan el dibujo de sentadilla profunda, pike, bici y soga.
- **La semana de prueba es larga** (Casandra, vuelta 18): hasta 3 estrellas y 2 hazañas antes de la descarga. Mirar con Fer si conviene repartir las pruebas en los días de esa semana.
- **Hazañas de antes sin escala** (el historiador, vuelta 18): las sesiones por niveles no guardaron qué midieron; se ven como «versión anterior» y no encienden.
- **Compresión según el largo de la pierna** (vuelta 18): hoy la escala es fija desde la punta de los pies.
- **Hoy con muchas escaleras** (Casandra, vuelta 17): las escaleritas entran hasta siete en una fila; con más, pasan a dos. Si Fer prefiere filas con el ejercicio, mostrar solo las de la sesión de hoy para no tapar «Empezar».
- ~~**El escalón es de la persona, no de la rutina**~~: lo dice una línea debajo de «Seguir esta rutina» (vuelta 18).
- **Pirámides viejas sin evaluar** (el historiador, vuelta 17): las sesiones guardadas antes de las escaleras con objetivos distintos por serie ubican el escalón pero no suben ni bajan.
- **Color de la estrella de Planes** (vuelta 16): va en tinta, como Vos, porque naranja, aqua y lima ya son de Hoy, Cielo y Progreso. Preguntar a Fer si quiere otro.
- **Ícono de rutina y de Vos** (la abuela, vuelta 16): las tres lunas de la rutina y los tres puntos de Vos se parecen un poco a 20 px; mirarlo en el teléfono.
- ~~**Superseries: Hoy las junta, la rutina no**~~: hecho en la vuelta 20 (acta 020). Una fila por ejercicio en los dos lados, la superserie junta con «en superserie», y «Empezar» fijo al alcance del pulgar.
- ~~**La última semana es de prueba**~~: hecho en la vuelta 20. Siete rutinas terminan en su meta, completa; la prueba pasa a la semana anterior (`bloque.meta`).
- ~~**100 flexiones no pide las 100**~~: hecho en la vuelta 20 con el OK de Fer. El último día es el intento de las 100 seguidas.
- **Dos maneras de contar los minutos en las notas** (coherencia, vuelta 20): Bici suave y larga dice los minutos de lo suave («55 min en zona 2», fila «Bici 55 min»); Mucho suave, poco fuerte y el cruzado de Correr de 5 a 10 km, los del día entero («50 min suaves», fila «Bici 42 min»). Elegir una y emparejar las notas.
- **Mucho suave, poco fuerte termina con dos semanas livianas** (vuelta 20): la 8 es de prueba (descarga) y la 9 ya es liviana en el catálogo («Semana liviana»).
- **«▲ nuevo» en las filas** (coherencia, vuelta 20): la sesión dice «▲ nuevo» en el escalón nuevo; las filas de Hoy y de los días solo dicen «más liviana».
- ~~**Notas del catálogo que no cierran**~~: arregladas en la vuelta 20 (40 min suaves; «si terminás los 8 con aire para otro, subí un nivel de resistencia»; los 1000 saltos cuentan 10 min con `dura`).
- ~~**Marca de descarga en los días**~~: hecho en la vuelta 20; la fila dice «más liviana».
- **Planes vive en `rutinas.js`** (la tijera): renombrar a `planes.js` cuando llegue el rediseño. Sigue ahí después de la vuelta 19.
- **Dos bloques de la misma escalera en un día** (Casandra, vuelta 27): Base de calistenia sin barra tiene `[tirar, remo]` y `remo` el mismo día, y los dos caen en el mismo escalón de remo. El molde del motor B no lo repite (vuelta 28: la fuerza nunca repite una escalera del día), pero la rutina sí: está en sus datos. Arreglarlo en el catálogo, con su prueba.
- **«La vez pasada» con kilos** (la persona, vuelta 27): en el descanso de una serie con mancuernas dice solo las repeticiones, no los kilos.
- ~~**La entrada en calor con bici cuenta como bici** (la ingeniera de campo, vuelta 27).~~ Hecho en la vuelta 28: el bloque de la entrada se guarda sin ejercicio y cuenta por su familia, no como bici.
- **Filas largas con kilos a 390 px** (el pulgar, vuelta 27): las filas de remo con «· 8 kg» al final van en dos renglones.
- ~~**Decisiones de la vuelta 27** (acta 027).~~ Decididas por Fer (2026-10-22): los remos nuevos en la escalera de Remo, Piernas e Isquios con peso desde el primer escalón y el fondo ruso como está.
- **El cierre con bici se lleva el abdomen** (el entrenador, vuelta 28): con bici, el cierre de 10 minutos lleva el día a la hora y el abdomen se cae. Lo decide Fer (acta 028, decisión 1).
- ~~**Dos maneras de mostrar las partes de un día**~~ (hecho en la vuelta 31) (coherencia, vuelta 28): Hoy con el molde va por partes con encabezados («Fuerza · de a dos»); los días de una rutina, en filas sueltas con «en superserie». Emparejarlas cuando las rutinas pasen al molde.
- ~~**Tu nivel** (PR3)~~: hecho en la vuelta 29 (acta 029): pantalla, perfil, respaldo y las dadas en tu cosmos. *Espera el OK de Fer al tablero.*

## Ideas (necesitan brief y OK)

13. **[idea] Rutina según los días.** Al empezar, la app pregunta cuántos días por semana vas a entrenar y ofrece rutinas que se adaptan (torso/pierna, Arnold, full body…). Para Fer, «rutina» es el plan semanal, no los ejercicios de una sesión.
14. **[idea] Héroes como desafíos.** Que la app proponga desafíos según el progreso o la rutina.
15. **[idea] Respaldo entre los tuyos.** Una copia cifrada del historial en el teléfono de alguien de confianza, sin servidor (directo si están cerca, por relevos públicos cifrados si están lejos). Es la pieza base de la familia Nodo: arrancar por un boceto y una investigación de las opciones.
16. **[idea] Sesión compartida en pantalla grande.** Varias personas en el mismo espacio, sin login ni base central, con una tele o tablet que muestra dónde está cada uno, si descansa o si la estación está libre. Pensado también para gimnasios y circuitos. Modo boceto.

## Vuelta 30 · sin el «·»

- **La entrada en calor: ¿la pieza como título?** (la persona, vuelta 30): arriba dice «Entrada en calor» y la pieza va abajo con su dosis. Lo decide Fer (acta 030, decisión 2).
- **Lo suave en etiquetas chicas** (Casandra, vuelta 30): `.lb .q` usa `--ink-3`, con poco contraste en claro. Lo decide Fer (acta 030, decisión 3).
- ~~**Filas largas con kilos a 390 px** (vuelta 27).~~ Hecho en la vuelta 30: los kilos van debajo de lo que toca, en la misma columna.
- ~~**rumbo-sin-tope depende del día**~~ (hecho, PR #40) (vuelta 30): no fija la fecha; con martes, jueves y sábado sembrados (`dias: [1, 3, 5]`), un día que no toca Hoy dice «Hoy descansás» y no aparece «Muscle-up pide barra». Falla igual en `main`. Fijarle la fecha con `conReloj`.

## Vuelta 31 · rutinas con tu nivel

- **Minutos de Base de calistenia** (Casandra): el catálogo dice 50 y el día armado da 65.
- ~~**[idea] Planes más visual** (Fer)~~: hecho en la vuelta 32 (opción A, estantes). *Espera el OK de Fer al tablero.*

## Vuelta 32 · Planes en estantes

- **«Para vos» en horizontal** (el pulgar): las dos tarjetas van una debajo de la otra y ocupan la primera pantalla de la lista. Probar lado a lado, más bajas.
- **Dos pruebas de sentarse** (la persona): «Sentarte y pararte» (del piso) y «Silla, un minuto» se parecen de nombre. Lo decide Fer.
- **Pruebas nuevas que no encienden estrellas** (la tijera): cinco de las seis dan solo su medalla. Si Fer quiere, sumar estrellas que midan lo mismo (por ejemplo, una de plancha en Draco).
- **El cuerpo de las rutinas de rango** (la directora de arte): marca cadera y piernas, pero no dice que es flexibilidad. Una marca de «estirar» en el cuerpo, si Fer lo pide.
- **Coherencia**: los ejercicios de una rutina («Sus ejercicios», con su persona) y los de Hoy (filas con nombre) ahora abren la misma página, pero se ven distinto. Las miniaturas en «Hoy toca» siguen pendientes (ver «Miniaturas en "Hoy toca"»).
