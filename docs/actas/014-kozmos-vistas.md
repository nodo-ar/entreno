# Acta · Kozmos · vuelta 14 · el maniquí con vistas de frente, tres cuartos y desde arriba · fase Construir → Probar

Fer aprobó el maniquí de la vuelta 13 («Impecable todo, sigamos con las vistas»). Primero se hizo un boceto (https://claude.ai/artifact/LqhKgfASSLUWtoEWeT8kBV) con nueve ejercicios de perfil al lado de su vista nueva y tres preguntas. Fer: «sí a todas tus recomendaciones»:
1. La mariposa va desde arriba, como en Bend.
2. De frente, el lado lejano queda apenas más oscuro.
3. Cambian de vista solo los ejercicios que de perfil no se entienden; tres cuartos para muy pocos.

Rama `claude/project-thread-985fzq`, PR nuevo.

**Equipo**: la persona · Casandra · la tijera · la directora de arte (elegida: es dibujo) · un ayudante que estudió cada movimiento y comparó cámaras.

## Qué se construyó
- **Motor con profundidad** (`kozmos/src/piezas/figura.js`): esqueleto en 3D con cámara (giro y altura), partes ordenadas por profundidad. Campos nuevos de pose: `abd`, `gira`, `inclina`, `rueda`; por ejercicio o pose, `vista` y `alzada`. Las poses de perfil van por un camino 2D y salen idénticas a las aprobadas (2358 cuadros comparados, cero diferencias).
- **24 ejercicios con vista nueva**, mismo id y sin copia de perfil:
  - de frente: saltos de tijera, plancha lateral (y con pierna), cosaca, espagat lateral, dorsal arriba, hombro cruzado, dorsal de costado, soga cruzada, las tres banderas menos la de rodillas, dominada ancha y arquera;
  - de frente y desde lo alto: espagat lateral a 90, pancake, piernas abiertas;
  - tres cuartos: plancha lateral con rodillas y bandera con rodillas (de frente se perdía el «rodillas al pecho»);
  - desde arriba: mariposa, aductores acostado, rodilla cruzada, glúteo con banda IT, glúteo tobillo-rodilla y cuádriceps de costado.
- Sentadilla, flexión y zancada siguen de perfil (lo controla una prueba).
- **Herramienta** `kozmos/tools/vistas.mjs`: escribe `kozmos/src/poses/vistas.js` resolviendo codos y rodillas y dejando quietos los apoyos.
- **Revisión**: rangos de hombro y cadera en 3D y apoyos que no se deslizan (en las vistas nuevas).
- **Dibujo**: zapatillas con forma de frente y desde arriba, cadera con short sin abultar, manga que no parece hombrera, colchoneta con perspectiva, sin cara de espaldas, sin colchoneta colgado del poste en otra vista.

## Pruebas
- 48 sin pantalla (nueva: «poses-en-otra-vista»).
- 52 de pantallas, completa en verde.
- Costo por cuadro: perfil 0,16 ms de promedio; vistas nuevas 0,28 ms (peor 0,46 ms).

## Lo que no hay todavía
- Otros que ganarían con otra vista: flexión arquera, front lever y planche abiertos, paseo con maleta y los de pared.
- Soga cruzada: cuando pasa detrás del cuerpo casi no se ve.
- Control de apoyos en las poses de perfil: marcaría 15 que se corren unos px; arreglarlo cambia dibujos aprobados, va en otra vuelta.

## Respuesta de Fer
Pendiente: tablero de la vuelta 14.
