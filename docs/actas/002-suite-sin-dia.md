# Acta · Nodo Entreno · vuelta 2 (corta) · fase Construir → Probar

Ítem 2 del backlog: la suite no depende del día. Rama `claude/suite-fecha-fija` (sale de `main`). Sin cambio visible: solo pruebas.

**Equipo**: la tijera · Casandra · el fiscal (ayudante de Casandra). Vuelta corta: no hay cambio visible.

## Problema
En la suite 10 veces seguidas del lunes 5 (madrugada, UTC), chk249, chk259, chk262, chk263 y chk274 fallaron siempre, igual en `main`. La semilla (`tests/seed.js`) arma 140 días de historial relativos a «hoy» y según el día de la semana. Además, la app usa la fecha y la hora del teléfono.

## Diagnóstico (matriz: cada prueba en los siete días, a las 10:00)
| Prueba | L | M | X | J | V | S | D | Por qué |
|---|---|---|---|---|---|---|---|---|
| chk249 | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ | Lunes y domingo la semilla deja la sesión de hoy ya hecha; la prueba espera «Empezar». La app hace bien. |
| chk259 | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | El lunes, el «otro día» que elige la prueba es el martes (futuro). Al girar, ese día se pierde. **Error real de la app** (ítem nuevo del backlog). |
| chk262 | ✗ | ✗ | ✓ | ✓ | ✓ | ✓ | ✓ | Al rearmar la sesión, la app vuelve al primer ejercicio con series pendientes; lunes y martes el plan corto trae 3 series en vez de 2. La prueba espera el ejercicio 2. |
| chk263 | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | Depende de la hora: a la 1:30 falla cualquier día (una sesión de prueba creada «hace 2 h» cae en el día anterior y cambia el orden del nombre). |
| chk274 | ✗ | ✓ | ✗ | ✗ | ✗ | ✗ | ✗ | (a) La primera postura de dos lados: la prueba esperaba la postura 2 después de un solo «siguiente». (b) **Error real de la app**: lunes, miércoles y viernes la notificación dice «Sigue: Pecho en el marco de la puerta, otro lado» (48 caracteres; el tope es 40). |

El fiscal confirmó cada fila con el código y con corridas propias (`.equipo/vuelta2/fiscal/`).

## Propuestas
- **La tijera**: lo mínimo es la fecha fija más el arreglo de chk274, en un PR propio desde `main` (la primera rama salía de la del PR #6). Los dos errores reales van al backlog con brief. Un barrido aparte por los siete días y la madrugada.
- **Casandra**: aprobar la fecha fija con dos condiciones: un barrido semanal que avise sin frenar, y los dos errores reales como ítems numerados del backlog. Riesgos: que la fecha fija tape errores de ciertos días; falsos verdes si la fecha no se aplica (un navegador abierto por otro camino); diferencias del `Date` reemplazado (`Intl` sin fecha, zona horaria). Sin bandera roja.

## Objeciones que cambiaron algo
- La tijera: la rama salía de `claude/pesos-y-esperas` → se rearmó desde `main` (`claude/suite-fecha-fija`); los cambios no dependen del PR #6.
- Casandra: sin control, una prueba podría correr con la fecha real y dar verde según el día → `seed.js` frena la prueba si la página no ve el día fijo.

## Decisiones
- Fecha y hora fijas para toda la suite: jueves 2026-10-08 a las 10:00 (`tests/fecha.js`, `APP_FECHA` para cambiarlas). En modo rápido, `fast.js` arranca su reloj falso en el mismo momento.
- chk274: si la primera postura es de dos lados, primero tiene que sonar el otro lado y después la postura 2.
- Al backlog, numerados: el texto largo de la notificación de movilidad; el día futuro que se pierde al girar; el barrido por días y horas.

## Queda para después
- El texto de la notificación de movilidad que pasa de 40 caracteres (el fiscal: «Sigue: Gemelo contra la pared, otro lado» queda justo en 40).
- El día futuro elegido que se pierde al girar el teléfono.
- El barrido de la suite por los siete días y a la 1:30, que avise sin frenar.

## Bandera roja
Ninguna.

## Entrega de esta fase
- Rama `claude/suite-fecha-fija` y su PR.
- Matriz y evidencia del fiscal en `.equipo/vuelta2/` (local).
