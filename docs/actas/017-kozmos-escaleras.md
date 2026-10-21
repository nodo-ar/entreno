# Acta · Kozmos · vuelta 17 · escaleras de progresión (Modelo A, pasos 0 a 2) · Pensar → Investigar → Construir → Probar

Fer eligió el Modelo A de la investigación de progresión («escaleras»): cada ejercicio de fuerza y de rango es un escalón de una escalera, y la app te sube o te baja según lo que hiciste, sin fechas. Esta vuelta hace los pasos 0, 1 y 2. El Modelo B (ciclos con semana de prueba) y los íconos quedan para después.

Rama `claude/project-thread-985fzq`, sin PR.

**Equipo**: la persona · Casandra · la tijera · el historiador (elegido: el diario viejo tiene que seguir cargando y contando) · la abogada (al azar) · ayudantes: el fiscal (las reglas, una por una, en pruebas puras) y el recorredor (los estados de la sesión en claro, grafito y horizontal).

## Pensar
- El escalón **no se guarda**: sale del diario cada vez. Así no hay estado que migrar, el respaldo sigue igual y una sesión borrada (o deshecha) corrige sola el escalón.
- Lo que la persona ve: dónde está en cada escalera (Hoy y Planes), si la serie de hoy es un escalón nuevo (la sesión y la isla) y qué cambió al terminar (el resumen, con ▲ = ▼).
- Lo que la persona toca: nada obligatorio. «Sobró · Justo · No llegué» es un toque opcional; sin tocar, valen las repeticiones.

## Investigar
- Doble progresión (rango de repeticiones; cuando se completa, se sube la dificultad), la regla de dos sesiones para subir y bajar, la descarga a la mitad del volumen al estancarse y los sostenes por volumen total (60 s) en vez de por serie: lo que ya traía el informe de progresión. Las explicaciones de la app no nombran a nadie.
- **Paso 0, lo que estaba mal**:
  - Lastre, Base de calistenia y Primera dominada prometían cosas que la app no hacía (sumar peso, subir de nivel, «semana 4: tu primera dominada»). Textos reescritos para decir lo que hace ahora.
  - Perseo Intermedio repetía las repeticiones del Completo (5 · 10 · 15, solo con menos minutos): pasa a 4 · 8 · 12, entre el Inicial (3 · 6 · 9) y el Completo.
  - Estrellas de «Entrena para» que ninguna escalera de la rutina mide: prueba nueva que lo impide. Salieron muscle-up explosiva de EMOM y HIIT en barra (rutinas de motor) y se recortaron las de espagat, hombros y Starting Stretching.
  - Siete ejercicios de barra (dominada explosiva, arquera, a un brazo y su negativa, y los tres muscle-up) no decían que piden barra: sin barra, la app los ofrecía igual.

## Construir
- **`catalogo/escaleras.json`**, 10 escaleras:
  - Tirar: colgado activo (60 s) → dominada asistida 5–8 → negativa 3–5 → dominada → explosiva 3–5 → arquera 3–5 → negativa a un brazo 1–3.
  - Remo: remo en poste 8–12 → con mancuerna 8–12 → invertido → en front lever tuck 3–6.
  - Empujar: inclinada 6–10 → flexión → con pausa → declinada → arquera 3–6 → pseudo planche 3–6 → a un brazo 1–3.
  - Fondos: flexión cerrada → fondo en banco 6–10 → fondo.
  - Piernas: sentadilla 8–12 → zancada 6–10 → búlgara → pistol a la silla → shrimp 3–6 → pistol 3–6.
  - Isquios: puente de glúteo 8–12 → peso muerto a una pierna 6–10 → curl deslizante 6–10 → nórdico negativo 3–5 → nórdico 1–3.
  - L-sit (sostenes): plancha 60 s → hollow 45 → L-sit 25 → L-sit alto 15 → V-sit 10.
  - Dragon flag: hollow rock 12–20 → negativa 3–6 → bolita 3–6 → una pierna 3–5 → dragon flag 3–5.
  - Cadera (sostenes): sentadilla profunda 60 s → cosaca 30 → espagat lateral a 90° 20.
  - Puente: muñecas 30 s → hombros en la pared 30 → puente 20.
- **Dos ejercicios nuevos**, con su dibujo: dominada asistida (un pie en una silla) y flexión con pausa. Los dos pasan la revisión de poses.
- **El motor** (`src/sesion/rutina.js`): subir con el tope dos veces (o una si sobró), sumar uno por serie, bajar con dos sesiones sin el mínimo, descarga al trabarse (tres sesiones sin mejorar) y nueva prueba, sostenes de 60 s del 50 al 80 % de tu mejor marca y, si no llegás a 5 s, un escalón abajo. Con lastre, en vez de subir de escalón se suman 2,5 kg.
- **Rutinas**: Base, Gimnasta, Lastre, Primera dominada, Cinco días de dominadas, 100 flexiones y las de rango (cadera, espagat, hombros, Starting Stretching, tronco) pasan a bloques de escalera. Las de motor quedan como estaban.
- **Lo que se ve**:
  - En el descanso, «Sobró · Justo · No llegué» abajo, al lado de lo que anotás, como los botones de «¿Salió?». Lo elegido va en tinta; lo que dirían las repeticiones, con borde punteado. Tocar de nuevo lo saca.
  - La serie dice «▲ nuevo», «▼ más fácil» o «más liviana» (descarga), y el lugar dice la escalera («Bloque 2 de 5 · Tirar»).
  - La isla: «Dominada · ▲ nuevo 0:12».
  - El resumen: «Tus escalones», una fila por escalera con ▲ (lima), = o ▼ (naranja), qué cambió y lo que toca la próxima.
  - Hoy, «Tu avance»: cada escalera dibujada como una escalerita en una sola fila (lo subido en tinta, el escalón de ahora en su color), con su nombre y «4/7». Las rutinas de motor siguen con la barra de sesiones.
  - Planes, en la rutina: lo mismo («Tus escalones» si la seguís, «Sus escaleras» si no).
  - Con lastre, el descanso pide repeticiones y kilos; la serie también enciende las estrellas de % de tu peso.

## Probar
- Sin pantalla: 59 (antes 48). Nuevas: catalogo-escaleras, rutina-alimenta-alcanzable, escalera-sumar, escalera-subir, escalera-bajar, escalera-trabado, escalera-sostenes, escalera-inferir, escalera-equipo-y-viejas, escalera-carga y escalera-en-la-rutina.
- De pantallas: 66 (antes 60). Nuevas: escalera-sensacion (el toque, que se guarda y viaja en el respaldo), escalera-isla, escalera-resumen (▲ = ▼), escalera-hoy (igual en Hoy y en Planes), escalera-diario-viejo y escalera-horizontal.
- Tablero antes y después, en claro y grafito: Hoy, la sesión, el descanso con el toque, la isla, el resumen, la rutina en Planes y, en horizontal (844 × 390), Hoy, el descanso y el resumen.

## Casandra
1. **El escalón es tuyo, no de la rutina.** Si hacés dominadas en Base y después empezás Primera dominada, arrancás en la dominada, no en colgarte. Es lo que pide el modelo, pero puede sorprender.
2. **Sesiones viejas**: cuentan para la rutina y ubican el escalón por el ejercicio que hicieron. Las que tenían objetivos distintos por serie (pirámides) no se evalúan para subir o bajar: sin rango guardado, la app no sabe si llegaste.
3. **«Sobró» sin tocar**: dos o más repeticiones arriba del objetivo cuentan como «sobró» y alcanza una vez para subir. Si alguien anota de más sin querer, sube antes de tiempo. Deshacer (borrar la sesión) lo corrige.
4. **Resuelta en la vuelta**: la primera versión de «Tu avance» (una fila por escalera) empujaba «Empezar» abajo del pliegue y el aviso de deshacer lo tapaba justo después de elegir la rutina (lo agarraron rutina-superserie y maniqui). Se rehízo como escaleritas en una fila.
5. Sin probar en un teléfono real.

## La tijera
- El rango suelto ya no tiene su propia cuenta: es una escalera de un escalón y usa las mismas reglas.
- Se fue el bloque suelto de hollow de Gimnasta (lo cubre la escalera de L-sit).
- No se hizo un estado guardado del escalón, ni pantallas nuevas: todo entra en las que ya estaban.
- Se fue la vista en filas de «Tu avance»: Hoy y Planes usan la misma escalerita.

## La abogada
- «No llegué» no es un aviso de salud ni lo pretende. El aviso de salud en Acerca sigue en el backlog, antes de publicar.

## Lo que no hay todavía
- Modelo B (ciclos con semana de prueba) y los íconos nuevos. Fer aprobó los íconos: asterismo en grande, pictograma del maniquí en chico; van después de B.

## Esperando a Fer
- El OK al tablero.
- Si «trabado» como tres sesiones sin mejorar (total de repeticiones o mejor sostén) le cierra.
- Si la escalerita de «Tu avance» le gusta o prefiere filas con el nombre del ejercicio (más alto, empuja «Empezar»).
