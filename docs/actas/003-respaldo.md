# Acta · Nodo Entreno · vuelta 3 (corta) · fase Construir → Probar

Respaldo que se puede comprobar (backlog 1). Rama `claude/respaldo` (sale de `main`).

**Equipo**: la tijera · Casandra · el revoltoso (ayudante del atacante) · el fiscal (ayudante de Casandra). Vuelta corta: el cambio no se ve, salvo los textos de algunos avisos (ver «Decisiones»).

## Qué se hizo primero
- `tests/t_chk276.js`: exportar desde un teléfono con historia, abrir un teléfono limpio, importar y comparar sesiones, diario, medidas y ajustes.
- `docs/respaldo.md`: el formato del archivo.
- La prueba encontró dos errores:
  - **En un teléfono nuevo no entraban los ajustes** (días, equipamiento, progresiones): el perfil recién creado siempre parecía «más nuevo» que el respaldo.
  - **Deshacer dejaba subidas de nivel fantasma**: el registro de progresiones (`skUp`) se recalcula al importar.

## Propuestas
- **La tijera**: es lo mínimo y va en un solo PR. Si los arreglos fueran aparte, la prueba entraría fallando, o los arreglos sin prueba. Las fotos que no viajan son una decisión de producto: idea para Fer, con opciones.
- **Casandra**: importar tiene que validar antes de tocar nada y confirmar que se guardó. Riesgos: un dato malo que rompe a la mitad; el almacenamiento lleno sin aviso; los ajustes de otra persona o de una versión vieja.
  - **BANDERA ROJA**: «puede aparecer "importado" sin que nada se haya guardado».
  - Objeción al arreglo de «sin historia»: un perfil sin sesiones también puede tener ajustes cargados a mano.

## Ayudantes
- **Revoltoso**: armó 23 respaldos a partir de uno real. Nunca se borró lo que ya había y deshacer anduvo siempre. Pero:
  - un `ej` que no es lista, una serie `null` o unos ajustes con días imposibles entraban sin aviso y rompían Progreso y el detalle de sesiones, incluso después de recargar;
  - un respaldo de 20 MB decía «importado», no guardaba nada y tampoco lo que se anotaba después;
  - entraban ids repetidos, fechas imposibles («Invalid Date»), números negativos y nombres de 10.000 caracteres;
  - dos pestañas abiertas se pisan (no es solo de importar).
- **Fiscal**: el documento se sostiene salvo tres cosas:
  - el nombre del archivo vuelve guiones los acentos («José María» → `jose-mari-a`);
  - la importación no leía `v`;
  - el ejemplo de `ver` no era real.

## Objeciones que cambiaron algo
- Casandra y el revoltoso → `importar` revisa todo antes de tocar nada: descarta y cuenta las sesiones imposibles, ignora diario y medidas con fechas imposibles y rechaza ajustes con días o lugares mal armados.
- Casandra y el revoltoso → se aplica en memoria y se guarda una sola vez (`lsSave` ahora dice si pudo); si no hay lugar, vuelve todo como estaba y avisa.
- El fiscal → el nombre del archivo pierde los acentos; un respaldo con `v` mayor que 1 avisa y no toca nada; `docs/respaldo.md` dice lo que el código hace.
- Casandra a «sin historia»: se mantiene, con deshacer, y queda documentado. La tijera lo acepta como riesgo.

## Decisiones
- Un solo PR: la prueba, los arreglos y el documento.
- Textos de aviso nuevos o cambiados (se ven; llevan tablero chico):
  - «· N descartadas» al final del aviso de importación;
  - «No hay lugar en el teléfono para este respaldo»;
  - «Ese respaldo es de una versión más nueva: actualizá la app»;
  - «No había nada que se pudiera importar».
- chk276 pasa a tener 26 verificaciones; contra la versión publicada fallan 9.

## Queda para después
- **[idea] Fotos en el respaldo**: hoy solo viven en el teléfono. Decisión de producto de Fer, con opciones.
- **[error] Dos pestañas se pisan**: un guardado desde una pestaña vieja borra lo que guardó la otra (no es solo de importar).
- **[idea] Exportar todos los perfiles juntos.**

## Bandera roja
Bajada: los dos casos de Casandra (un dato malo; el almacenamiento lleno) tienen su prueba en chk276 y no tocan nada, o avisan.

## Entrega de esta fase
- Rama `claude/respaldo` y su PR.
- Evidencia en `.equipo/vuelta3/` (local): casos y capturas del revoltoso, tabla del fiscal.
