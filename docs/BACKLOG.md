# Backlog · Nodo Entreno

Orden de prioridad. Cada ítem nuevo pasa por el método (`docs/metodo/FASES.md`). Lo marcado **[idea]** necesita el OK del brief antes de construir; lo marcado **[Fer]** es algo que tiene que hacer Fer y vos solo le recordás o preparás.

## Ahora

1. **Estabilidad de la suite y pesos de letra** (decidido, ver `docs/ESTADO.md`). Un PR. Tablero en grafito y en claro con inicio, sesión en curso, isla, serie con descanso, resumen y horizontal.
2. **Respaldo que se puede comprobar.** Verificar que exportar e importar funciona de punta a punta en un teléfono limpio, sin perder nada. Documentar en `docs/` el formato del archivo exportado (nombre, estructura, versión) sin cambiar el nombre interno. Sumar una prueba automática de ida y vuelta (exportar → borrar → importar → comparar).
3. **APK con publicación automática.** Empaquetar la app para Android y publicar cada versión en GitHub Releases desde Actions, con número de versión y notas en palabras de la gente. Que el enlace «última versión» funcione.
   - **[Fer]** Registrarse temprano como desarrollador en la verificación de Google para apps instaladas por fuera de Play Store (cuenta gratuita para aficionados). Google empezó a exigirla en septiembre de 2026 en algunos países y la extiende a todo el mundo en 2027. Antes de dar esto por cerrado, buscá el estado actual de esa regla: cambia seguido.
   - Casandra: en Android 13 o más, las apps instaladas por fuera de la tienda tienen restringidos algunos permisos (accesibilidad, administración del dispositivo). Entreno no los necesita; si alguna función los pidiera, se frena y se consulta.

## Después

4. **Auditoría de coherencia.** Buscar dónde la app resuelve lo mismo de formas distintas (ejemplo conocido: las pestañas Semana/Mes de Resumen frente al selector «Esta semana» de Cuerpo). Entregar la lista con capturas y una propuesta por caso; se arregla de a uno.
5. **Horizontal en todas las pantallas** con el patrón de Ajustes (lista a la izquierda, ítem abierto a la derecha).
6. **Fuentes científicas** en un apartado propio, enumeradas al pie, sin nombres en el texto de las explicaciones.

## Ideas (necesitan brief y OK)

7. **[idea] Rutina según los días.** Al empezar, la app pregunta cuántos días por semana vas a entrenar y ofrece rutinas que se adaptan (torso/pierna, Arnold, full body…). Para Fer, «rutina» es el plan semanal, no los ejercicios de una sesión.
8. **[idea] Héroes como desafíos.** Que la app proponga desafíos según el progreso o la rutina.
9. **[idea] Respaldo entre los tuyos.** Una copia cifrada del historial en el teléfono de alguien de confianza, sin servidor (directo si están cerca, por relevos públicos cifrados si están lejos). Es la pieza base de la familia Nodo: arrancar por un boceto y una investigación de las opciones.
10. **[idea] Sesión compartida en pantalla grande.** Varias personas en el mismo espacio, sin login ni base central, con una tele o tablet que muestra dónde está cada uno, si descansa o si la estación está libre. Pensado también para gimnasios y circuitos. Modo boceto.
