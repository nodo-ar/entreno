# Backlog · Nodo Entreno

Orden de prioridad. Cada ítem nuevo pasa por el método (`docs/metodo/FASES.md`). Lo marcado **[idea]** necesita el OK del brief antes de construir; lo marcado **[Fer]** es algo que tiene que hacer Fer y vos solo le recordás o preparás.

## Ahora

1. **Respaldo que se puede comprobar.** Verificar que exportar e importar funciona de punta a punta en un teléfono limpio, sin perder nada. Documentar en `docs/` el formato del archivo exportado (nombre, estructura, versión) sin cambiar el nombre interno. Sumar una prueba automática de ida y vuelta (exportar → borrar → importar → comparar).
2. **[error] Texto largo en la notificación de movilidad** (de la vuelta 2). Lunes, miércoles y viernes dice «Sigue: Pecho en el marco de la puerta, otro lado» (48 caracteres; el tope es 40), y «Sigue: Gemelo contra la pared, otro lado» queda justo en 40. Se reproduce con `APP_FECHA=2026-10-05T10:00` en chk274. Cambia lo que se ve: brief y OK de Fer. Propuesta: acortar el nombre con «…» para que entre.
3. **[error] El día futuro elegido se pierde al girar** (de la vuelta 2). En Inicio, en horizontal, si se elige un día que todavía no llegó y se gira a vertical, no se abre su hoja y al volver se pierde la elección (`diaInfo` devuelve vacío para días sin sesiones). Se reproduce con chk259 y `APP_FECHA=2026-10-05T10:00`. Cambia la app: brief.
4. **APK con publicación automática.** Empaquetar la app para Android y publicar cada versión en GitHub Releases desde Actions, con número de versión y notas en palabras de la gente. Que el enlace «última versión» funcione.
   - **[Fer]** Registrarse temprano como desarrollador en la verificación de Google para apps instaladas por fuera de Play Store (cuenta gratuita para aficionados). Google empezó a exigirla en septiembre de 2026 en algunos países y la extiende a todo el mundo en 2027. Antes de dar esto por cerrado, buscá el estado actual de esa regla: cambia seguido.
   - Casandra: en Android 13 o más, las apps instaladas por fuera de la tienda tienen restringidos algunos permisos (accesibilidad, administración del dispositivo). Entreno no los necesita; si alguna función los pidiera, se frena y se consulta.

## Después

5. **Barrido de la suite por días y horas** (de la vuelta 2, Casandra): correr de vez en cuando las pruebas que dependen de la fecha en los siete días y a la 1:30 (`APP_FECHA`), fuera de cada PR, para que la fecha fija no tape errores como los ítems 2 y 3. Avisa, no frena.
6. **Auditoría de coherencia.** Buscar dónde la app resuelve lo mismo de formas distintas (ejemplo conocido: las pestañas Semana/Mes de Resumen frente al selector «Esta semana» de Cuerpo). Entregar la lista con capturas y una propuesta por caso; se arregla de a uno.
7. **Horizontal en todas las pantallas** con el patrón de Ajustes (lista a la izquierda, ítem abierto a la derecha).
8. **Fuentes científicas** en un apartado propio, enumeradas al pie, sin nombres en el texto de las explicaciones.
9. **Prueba automática de la regla de pesos** (de la vuelta 1): todo texto de 13 px o menos en 700; en los segmentados, la elegida en 700 y las demás en 600.
10. **Jerarquía con el tono en listas densas** (de la vuelta 1, la directora de arte): con tanto 700, las líneas de detalle de Progreso pesan casi como su etiqueta. Probar `tinta-suave` en esas líneas, nunca en la barra de descanso ni en el encabezado de la sesión. Cambia color: vuelta propia, con brief y tablero.
11. **«Terminar» frente a «Siguiente»** en la sesión: los dos naranjas y en 700; un solo botón principal por pantalla. Brief y tablero.
12. **Limpiar CSS que no se usa**: `.swfil`, `.cortaseg`, `.intensity`, `.faces`, `.modes`, `.htabs` y las funciones `pickers` / `pickerCards`. Sin cambio visible.
13. **Duraciones de `.segx`** (.25 s y .38 s), que no son tokens del manual de movimiento.

## Ideas (necesitan brief y OK)

14. **[idea] Rutina según los días.** Al empezar, la app pregunta cuántos días por semana vas a entrenar y ofrece rutinas que se adaptan (torso/pierna, Arnold, full body…). Para Fer, «rutina» es el plan semanal, no los ejercicios de una sesión.
15. **[idea] Héroes como desafíos.** Que la app proponga desafíos según el progreso o la rutina.
16. **[idea] Respaldo entre los tuyos.** Una copia cifrada del historial en el teléfono de alguien de confianza, sin servidor (directo si están cerca, por relevos públicos cifrados si están lejos). Es la pieza base de la familia Nodo: arrancar por un boceto y una investigación de las opciones.
17. **[idea] Sesión compartida en pantalla grande.** Varias personas en el mismo espacio, sin login ni base central, con una tele o tablet que muestra dónde está cada uno, si descansa o si la estación está libre. Pensado también para gimnasios y circuitos. Modo boceto.

## Hecho

- **Estabilidad de la suite y pesos de letra**: PR #6, publicado en v269+6. Acta 001.
- **La suite no depende del día**: PR #7, publicado en v269+7. Acta 002.
