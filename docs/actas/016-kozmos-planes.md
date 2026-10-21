# Acta · Kozmos · vuelta 16 · la pestaña Planes · fase Construir → Probar

Fer eligió la opción C del boceto de Hoy (https://claude.ai/artifact/XL1YmmX9t8Fsd1VeayNL8t): «la C es muy superior». Decidió el nombre «Planes», hazañas arriba y rutinas abajo. Planes en sí, y el contenido de rutinas y hazañas, se rediseñan después de una investigación aparte: en esta vuelta no se tocan el catálogo ni las reglas de progresión.

Rama `claude/project-thread-985fzq`, sin PR todavía.

**Equipo**: la persona · Casandra · la tijera · la cartógrafa (elegida: cambia la navegación) · un ayudante que midió nombres cortados, el botón atrás y los pasos del historial.

## Qué se construyó
- **Pestaña Planes** en la barra: Hoy, Planes, Cielo, Progreso, Vos. Píldora con el nombre solo en la elegida, como las demás. Rutas `#/planes`, `#/planes/rutinas/<id>` y `#/planes/hazanas/<id>`.
- **Rutas viejas**: `#/hoy/rutinas…` y `#/hoy/hazanas…` pasan a las nuevas sin sumar pasos al botón atrás (enlaces guardados, la sesión de una hazaña que quedó abierta). Lo hace `K.rutaNueva` en `app.js`.
- **El «⋯» de Hoy** queda con lo de hoy: cambiar el rumbo, dejar la rutina (si seguís una) y anotar algo hecho.
- **Planes, limpia y simple**: hazañas arriba en grilla con la figura de su constelación; rutinas abajo, por familia, igual que antes. En horizontal, patrón de Ajustes: la lista a la izquierda y lo abierto a la derecha (tu rutina si seguís una; si no, la primera hazaña).
- **De dónde sale lo de hoy**: arriba de Hoy, una fila «Sale de tu rumbo: Front lever · Motor» o «Sale de tu rutina: Base de calistenia · sem 1 de 8». Un toque lleva a cambiarlo (Tu rumbo o la rutina en Planes). La tarjeta de la rutina pasa a llamarse «Tu avance» para no repetir el nombre.
- **El primer día, en tres pasos** (Elegí cómo · Elegí qué · Empezá): Hoy ofrece «Que Kozmos arme tu día», «Seguí una rutina» y, por si es solo por hoy, una hazaña. Tu rumbo y Planes muestran el paso 2; Hoy con rumbo o rutina, el paso 3. Se va con la primera sesión o la primera marca, y no aparece durante una sesión.
- **Íconos propios** (lo que el boceto dejó anotado):
  - Planes: la cumbre con su estrella (*per aspera ad astra*). Ya no se parece al calendario de «Anotar algo hecho».
  - Rutina: tres fases de la luna, de nueva a llena (las semanas). Ya no es la órbita que se leía como un ojo.
  - Rumbo: la estrella polar. Lo usan la fila de origen y «Cambiar el rumbo»; antes era el mismo ícono de Cielo (era uno de los «dos íconos para lo mismo» del backlog).
- **«Andrómeda» entra**: en horizontal la grilla pasa a dos columnas con la figura al lado del nombre.
- **APK**: el botón atrás recorre Planes (rutina → Planes → Hoy → sale; entrando directo, sube a Planes y después a Hoy). No hizo falta tocar `android.js`: la regla ya era general.

## Pruebas
- 48 sin pantalla, igual que antes.
- De pantallas, nuevas: planes-pestana, rutas-viejas, origen-de-hoy, primer-dia y apk-planes. Cambiadas: cinco-pestanas (antes cuatro; además mira que el nombre se vea solo en la elegida), planes-horizontal (antes rutinas-horizontal; mira que ningún nombre de hazaña quede cortado), sesion-entera (el primer día arranca en el paso 1), y las de rutinas y hazañas con las rutas nuevas.
- Tablero antes y después, en claro y grafito: Hoy sin rumbo, Hoy el primer día, Hoy con rumbo, Hoy con rutina, el «⋯», Tu rumbo, Planes, una rutina, sesión, descanso, isla, resumen, y en horizontal (844 × 390) Hoy y Planes.

## Casandra
1. Una sesión de hazaña que quedó abierta guarda su origen con la ruta vieja: la redirección la cubre (prueba rutas-viejas y apk-planes).
2. El primer día depende de no tener sesiones ni marcas. Quien trae un respaldo deja de verlo, que es lo esperable.
3. Sin probar en un teléfono real: el ancho de la barra con cinco pestañas en un Android angosto (en 360 px de prueba entra).

## La tijera
- Planes vive en `pantallas/rutinas.js` (el nombre del archivo quedó). Se fueron las dos listas viejas (Rutinas y Hazañas) y su constante `FAM`, que no se usaba.

## Lo que no hay todavía
- El rediseño de Planes, rutinas y hazañas con progresión real, después de la investigación.
- La estrella de Planes en la barra va en tinta, sin color propio (los tres colores ya son de Hoy, Cielo y Progreso).

## Esperando a Fer
- El OK al tablero.
