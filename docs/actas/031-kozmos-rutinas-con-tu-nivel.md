# Acta · Kozmos · vuelta 31 · rutinas con tu nivel · Construir → Probar

Fer pidió que las rutinas usen tu nivel y el mismo molde que Hoy. Boceto con tres opciones (https://claude.ai/artifact/FeZHPvNk5nCdetgXNsAQFg): A, vestir la rutina; B, además la habilidad de Hoy y el tope de la hora; C, rutinas de fuerza como un rumbo con calendario. **Fer eligió A** y aceptó las dos recomendaciones: tu nivel manda sobre dónde arranca la rutina (lo hecho manda sobre los dos) y las rutinas de fuerza suman el cierre de Hoy.

**Equipo**: la persona · Casandra · la tijera · el entrenador (elegido: es una vuelta de cómo se arma un día) · ayudantes: el fiscal (cada parte de cada rutina) y el pulgar (390 × 844 y 844 × 390).

## 1 · Lo que ve la persona
- Siguiendo una rutina, Hoy toca y los días de Planes se ven por partes, como Hoy: Entrada en calor, Fuerza de a dos, Abdomen y Cierre. Sin «en superserie».
- Las escaleras arrancan en tu nivel: con 5 a 9 dominadas, Base de calistenia empieza en dominada, no en dominada negativa. «Tu avance» y «Entrena para» lo cuentan.
- La entrada en calor es la de Hoy, con tu equipo: 100 flexiones ya no pide colgarse.
- Las rutinas de fuerza cierran como Hoy. Base de calistenia pasa de 60 a 65 minutos.
- Correr y los intervalos se leen en tres partes (entrada, motor y vuelta a la calma); la sesión sigue siendo un bloque.
- Arreglo: en la semana de prueba de una rutina, las pruebas iban antes de la entrada en calor. Ahora van después.

## 2 · Lo que cambia por dentro
- `rutina.js`: `nivelDesde` pasa por `armarBloques`, `bloqueSeries` y `escalerasDe`.
- `dia.js`: el cierre sale a una función compartida y `K.dia.deRutina` marca las partes.
- `hoy.js` y `rutinas.js`: la rama de rutina usa `K.dia.deRutina` con tu nivel y `K.dia.deSemanaDePrueba`; `filasMolde` suma «Motor» y «Rango».
- Formato en `docs/kozmos-rutinas.md`, «Las rutinas en el molde».

## 3 · Pruebas
- Nueva sin pantalla: `rutina-en-molde`. Cambiadas a la regla nueva: `hoy-filas-superserie` y `hoy-mas-liviana`.

## 4 · Lo que queda
- Base de calistenia sin barra repite el remo dos veces en un día: arreglar sus datos.
- Los minutos de Base en el catálogo (50) no coinciden con el día armado (65).
