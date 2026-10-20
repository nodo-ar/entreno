# Acta · Kozmos · vuelta 10 · etapa 5, rutinas y hazañas · fase Construir → Probar

Quinta etapa de Kozmos: las 26 rutinas y las 8 hazañas en el catálogo nuevo, y Tus días. Rama `claude/project-thread-985fzq` (sale de `main` con la etapa 4 fusionada). Todo en `kozmos/`; Entreno no se toca.

**Equipo**: la persona · Casandra · la tijera · la ingeniera de campo (elegida: teléfono de gama media, manos transpiradas, pantalla apagada) · la abogada (al azar).

## Qué se construyó
- **Catálogo** (`kozmos/catalogo/rutinas/<id>.json`, `hazanas.json`, formato en `docs/kozmos-rutinas.md`): 26 rutinas con 549 sesiones, 8 hazañas con tres niveles cada una, 92 ejercicios nuevos (155 en total). Lo convirtió un script desde el catálogo de Entreno; los tramos repetidos se escriben con `repetir`.
- **Motor**: superseries (dos bloques del mismo grupo se alternan serie a serie, sin descanso entre medio), tramos que corren solos con pitido y vibración (cardio, intervalos, cada minuto, movilidad) y circuitos para las hazañas (por tiempo o todas las vueltas que entren, con 5 s para acomodarse).
- **Rutinas** (desde el ⋯ de Hoy): la lista por familia y cada rutina con semanas, días, minutos, a qué estrellas entrena, su semana y la fuente al pie. Seguir una rutina se hace sin confirmar y se puede deshacer. Hoy muestra por dónde vas y la sesión que toca; el resumen dice lo que sigue.
- **Hazañas** (desde el ⋯ de Hoy): nivel en un menú, lo que se hace, tu mejor marca por nivel y resumen con récord.
- **Tus días** (Vos): los días de la semana que entrenás. Los otros, Hoy dice «Hoy descansás», lo que sigue y cuándo, con «Entrenar igual».
- **Cielo y Progreso**: cada constelación lista las rutinas que llevan ahí; cada sesión en Progreso dice de qué rutina o hazaña fue.
- **Respaldo**: suma la rutina que seguís, tus días y los datos de rutina y hazaña de cada sesión.
- Pruebas: 45 sin pantalla y 48 de pantallas.

## Propuestas y objeciones que cambiaron algo
- **Casandra (bandera roja, bajada)**: el respaldo descartaba las sesiones de rutina con entrada en calor (8 de 26 rutinas): el tramo sin ejercicio se guardaba sin el campo y la lectura lo rechazaba. Arreglado en el registro y en la lectura (que también acepta lo ya guardado), con una prueba de pantalla que hace una sesión real de Base de calistenia y la lee de vuelta entera.
- **Casandra**: cortar con ✕ a los 40 s hacía avanzar la rutina. Ahora una sesión cortada cuenta solo si hiciste al menos la mitad (la ingeniera objetó que nunca contar traba al que corta por tiempo). Con prueba.
- **Casandra**: «Lleva a» prometía estrellas que 15 rutinas no pueden encender solas (se encienden con una prueba). Ahora dice «Entrena para»; corregir la lista queda para Fer.
- **Persona**: Draco (cada minuto) duraba 4:15 en vez de 12 min, porque el ítem de 30 s pisaba el minuto: arreglado, el tramo dura 60 s y dice «30 s y descansás». Pegaso decía «0 pasadas fuertes»: arreglado. El resumen decía «Sagitario, Sí.»: ahora «Sagitario, hecha.» y el dato es el tiempo.
- **Persona (de la revisión del tablero)**: con rutina, Hoy metía una prueba de bici de 40 min antes de la sesión. Ahora la ventana abre solo para lo que la rutina entrena, y nunca una prueba de minutos. Entre los dos ejercicios de una superserie no hay destello de fin de descanso.
- **Tijera**: este PR se queda con los arreglos verificados; renombrar rutinas, achicar el catálogo y los avisos con pantalla apagada van al backlog.
- **Ingeniera de campo**: sin desborde a 360 px ni en 844 × 390. La página pesa 652 kB (83 kB comprimida) contra 184 kB (53 kB) de la etapa 4; con la CPU frenada ×4 tarda 162 ms en estar lista contra 71 ms. Los cambios de tramo no suenan con la pantalla apagada (solo el fin del descanso queda programado): al backlog, con la objeción de Casandra de desprogramarlos al pausar, saltear o cortar.
- **Abogada**: nombres de personas en títulos («10×1 de Gibala», «Programa Armstrong», «Tabata en bici») contra la regla de fuentes al pie, y revisar «Tabata» como marca antes del APK. Lo decide Fer. Los planes publicados quedan acreditados al pie sin copiar su texto.

## Simplificaciones de la conversión (a la vista)
- Las condiciones de nivel de Entreno (por ejemplo, «si hacés 3 dominadas») no existen: con barra, la app elige siempre la primera alternativa.
- La entrada en calor ahora va por tiempo, no como lista para tildar.
- Armstrong descansa «10 s por cada repetición» en una nota, con un descanso fijo.
- Dominadas y fondos con lastre se anotan en repeticiones; las estrellas de Lastre se encienden con su prueba.
- Las rutinas de cardio quedan con un solo modo: De 0 a 5 km y De 5 a 10 km corriendo; las de intervalos, en bici.

## Lo que no hay todavía
- El maniquí y los dibujos de los ejercicios: PR propio, después de esta etapa.
- Prueba en un Android real: los pitidos de tramo con la pantalla bloqueada.

## Al backlog
- [decisión de Fer] «Entrena para» en 15 rutinas que no encienden esas estrellas por sí solas: corregir `alimenta` o sumar mediciones.
- [decisión de Fer] Nombres de personas en títulos de rutinas.
- Campanas programadas para cada cambio de tramo (pantalla apagada), desprogramadas al pausar, saltear o cortar.
- Achicar el catálogo: sesiones repetidas por referencia (Lastre tiene 24 sesiones y 2 distintas).
- «−1» más separado de «Vuelta»; «Seguir esta rutina» visible sin desplazar.
- Aviso cuando la rutina pide más días por semana que tus días.
- Aviso de salud en Acerca (antes del APK, por las reglas de la tienda).
- Las estrellas de intervalos piden bici: con kettlebell y sin bici, kb1515 no las enciende.

## Decisiones para Fer
1. OK al tablero de la etapa 5.
2. «Entrena para»: ¿corrijo la lista de cada rutina para que solo nombre lo que enciende sola, o queda así?
3. Nombres de personas en títulos («Programa Armstrong», «10×1 de Gibala», «Tabata en bici»): ¿los cambio por nombres propios de Kozmos?
