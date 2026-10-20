# Acta · Kozmos · vuelta 8 · etapa 3, la sesión · fase Construir → Probar

Tercera etapa de Kozmos: Hoy arma la sesión, la app la lleva con sus relojes y el resumen muestra lo que encendiste. Rama `claude/project-thread-985fzq` (sale de `main` con la etapa 2 fusionada). Todo en `kozmos/`; Entreno no se toca.

**Equipo**: la persona · Casandra · la tijera · la ingeniera de campo (invitada: la sesión se usa transpirado, con el teléfono en el piso) · Marco Aurelio (al azar).

## Qué se construyó
- **Rumbo**: hasta tres constelaciones, elegidas desde Hoy. Queda en el perfil.
- **Plan del día** (`src/sesion/plan.js`, funciones puras): un bloque por constelación del rumbo que apunta a su próxima estrella con su mismo ejercicio. Objetivo: tu mejor marca más un 10 % (minutos, +5); cerca de la estrella (80 %), la estrella misma; sin marca, la mitad. Siempre suma un bloque corto de rango y uno de motor. No repite la misma constelación de fuerza dos días seguidos si hay otra. Después de 21 días o más sin entrenar, arranca al 70 %. Orden: fuerza, rango, motor.
- **Motor de sesión** (`src/sesion/motor.js`): relojes tomados de la hora real (no se atrasan con la pantalla apagada), 5 s de «Preparate» con pitido en las series por tiempo, vibración al llegar al objetivo, descanso con − y + de 15 s, campana programada en Web Audio al final del descanso, pantalla encendida (wake lock), pausa y saltear. La sesión en curso vive en `localStorage` (`kozmos.vivo.v1`) y se recupera al volver; si pasaron más de 12 h se guarda como cortada. Dos pestañas quedan sincronizadas.
- **Pantallas**: Hoy (próxima estrella, «Hoy toca», Empezar), Rumbo, Sesión (serie, descanso con anillo y anotar, cierre), isla arriba cuando salís de la sesión, y Resumen (estrella nueva o «Lo hecho cuenta.»). Cortar con la ✕ guarda lo hecho y ofrece deshacer.
- **Diario** v2: suma `sesiones`, con migración desde v1 (con prueba). Cada serie cuenta como marca para el cielo; la sesión guarda qué estrellas encendió.
- `catalogo/ejercicios.json`: 63 ejercicios con nombre e indicación corta.
- Pruebas: 28 sin pantalla y 31 de pantallas (10 nuevas), con una sesión entera sobre un reloj falso.

## Propuestas y objeciones que cambiaron algo
- **Casandra (bandera roja, bajada)**: una sesión que quedaba abierta se perdía. Ahora, si venció, se guarda como cortada al abrir y avisa (con prueba). También: dos pestañas sincronizadas, validación de la constelación al recuperar, el resumen guarda lo que encendió, `fin ≥ inicio`, sin campanazo instantáneo al recuperar un descanso vencido, y deshacer devuelve también lo que estabas anotando.
- **Ingeniera de campo**: campana programada en Web Audio (suena aunque el navegador frene los relojes), destello de toda la pantalla al terminar el descanso, cuenta de 5 s antes de cada serie por tiempo, reloj del descanso más grande, ✕ y ⋯ de 48 px, y 4 px de desborde vertical arreglados.
- **Persona**: «Preparate», sí o no de un toque para lo que no se mide, el pie no repite el número, Listo fijo con tilde llena en Rumbo y el reloj de toda la sesión grande en el cierre.
- **Tijera**: sumó − y + al descanso y unificó código repetido. Pedía sacar pausa, saltear y las reglas del plan (70 %, no repetir, extras); se quedan porque están en el documento de arquitectura que Fer aprobó.
- **Marco Aurelio**: los textos («Lo hecho cuenta.», «Tu cielo te esperó. Hoy arrancás más suave.», «Llegaste.»).

## Lo que no hay todavía
- Calorías: piden peso y una tabla de esfuerzo por ejercicio. Propuesta: etapa 4, con Progreso.
- Prueba en un Android real: vibración, campana con la pantalla bloqueada y wake lock. El audio queda bloqueado después de recuperar una sesión hasta el primer toque (regla del navegador).
- Sin respaldo de wake lock con video para navegadores viejos.

## Notas
- La fecha de una sesión es la de su inicio, aunque termine pasada la medianoche.
- El peso para Lastre se guarda antes de la sesión, en Anotar.
- Kozmos usa Mona Sans y Geist Mono (dirección de arte B aprobada), no Nodo Reloj.

## Decisiones para Fer
1. OK al tablero de la etapa 3 (https://claude.ai/artifact/9EP8UbgMRQKH16nkVWDYtQ).
2. Calorías en la etapa 4.
3. Las reglas del plan del día (10 %, no repetir fuerza, 70 % al volver).

**Respuesta de Fer (2026-10-20)**: «ok, dale seguí». Tablero aprobado; calorías en la etapa 4; las reglas del plan del día quedan como están. Sigue la etapa 4.
