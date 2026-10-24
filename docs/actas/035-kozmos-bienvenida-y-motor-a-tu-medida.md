# Acta 035 · Kozmos · La bienvenida, y el motor a tu medida

Fer aprobó el plan del motor («Si perfecto, dále») y pidió que fuerza, movilidad y motor tengan rutinas para hacer por tu cuenta, con variedad y progresión. Después aclaró que quería ver la bienvenida, no el motor por partes («Pero que tiene que ver las capturas del tablero con el de bienvenida que veníamos haciendo?????»). Acordamos no publicar de a pedazos: todo junto, sin publicar, con la bienvenida arriba y un solo tablero de punta a punta («Dale a ver»). Este PR suma a lo del acta 034.

## Qué cambió

- **Pesas primero** (`sesion/rutina.js`, `pantallas/pantallas.js`): una mancuerna o una kettlebell cuentan como «pesa» (`K.rutina.conPesa`, `K.tuEquipo`). En cada escalera, si tenés con qué, arranca en el primer escalón con kilos: el remo empieza a un brazo con la pesa, no agarrado de un poste. Tres ejercicios se renombraron en palabras de todos los días: «Remo a un brazo con pesa», «Sentadilla con pesa» y «Peso muerto rumano con pesa».
- **Tu tiempo** (`sesion/dia.js`, Vos): el día entra en los minutos que elegís. Para achicar, en orden: sin abdomen, fuerza a 2 series, la bici del cierre pasa a posturas, se va un par de fuerza y después la segunda habilidad. Para agrandar: fuerza a 4 series y **motor a intervalos** antes del cierre (kettlebell, bici, soga o sin nada), que sube un escalón cada tres veces. Medido: a 30 minutos, días de 25 a 30; a 90, de 80 a 90.
- **Cinco rutinas nuevas** (`catalogo/rutinas/`), para que cada familia tenga algo en cada nivel y con progresión: Fuerza en casa (1), Fuerza con una pesa (2), Movilidad con fuerza (2), Movilidad avanzada (3) y Swing para empezar (motor, 1). Ahora son 31. Tabla en `docs/kozmos-rutinas.md`.
- **La bienvenida** (`pantallas/bienvenida.js` y `.css`), la primera vez que se abre la app: el logo se arma; qué querés entrenar (uno o más); qué tenés (todo tu equipo o «Nada, solo el piso»); cuánto tiempo (un reloj de una hora que se gira, de 10 a 60) y cuántos días; tu nivel, eligiéndolo con figuras por movimiento o con una prueba de un minuto que prende tu primera estrella; y tu primer día, armado por el mismo motor de Hoy. «Empezar» abre la sesión con el iris; «Empezar más tarde» deja Hoy armado.
  - Guarda todo junto al llegar al primer día: equipo, minutos, días (repartidos desde hoy), rumbo, nivel y la fecha. La prueba queda como una sesión de prueba, igual que la de Planes.
  - Quien ya usa la app no la ve. Si se cierra a la mitad, sigue en el mismo paso con lo elegido. El atrás de Android vuelve un paso.
  - Con menos movimiento en el teléfono: fundidos cortos, sin giros ni chispas. En horizontal, la pregunta a la izquierda y las opciones a la derecha.

## Evidencia

- Sin pantalla: 124 de 124. Pruebas nuevas de pantalla: `bienvenida-elijo`, `bienvenida-prueba`, `bienvenida-retoma`, `bienvenida-ya-usa`, `solo-kettlebell`, `tu-tiempo`.
- Suite completa y tablero: en el PR #44.

## Decisiones que esperan a Fer

1. OK al tablero de punta a punta para publicar.
