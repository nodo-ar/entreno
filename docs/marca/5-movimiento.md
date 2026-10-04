# Movimiento, tacto y sonido

Nodo se mueve, vibra y suena poco y siempre igual. Lo que aparece, aparece una vez y se queda. La vibración confirma lo que hiciste o te avisa que hay que hacer algo. El sonido existe para que no tengas que mirar el teléfono durante una sesión. Nada de esto pide atención.

## Movimiento

| Duración | Para qué |
| --- | --- |
| 200 ms (`rapido`) | Estados de un control: presionado, elegido, marcado |
| 240 ms (`base`) | Cambiar de pantalla, abrir una hoja, un aviso que entra |
| 320 ms (`lento`) | Encender la "o", cambios de tema, el reloj que aparece |

- Una sola curva para todo: `cubic-bezier(.2, .7, .2, 1)`, una salida suave. Nada se pasa de largo ni rebota.
- **Cambiar de pantalla**: lo que sale se desvanece; lo que entra sube 8 px mientras aparece. Volver atrás hace lo mismo hacia abajo.
- **Hojas y menús**: suben desde el borde en 240 ms; el fondo se oscurece al 40 %. Se cierran deslizando hacia abajo o tocando afuera.
- **Encender**: el anillo se dibuja (320 ms), después aparece el punto (200 ms) y por último el halo (320 ms). Para lo que arranca: una sesión, un vínculo, la app al abrir.
- **Respirar**: el halo sube y baja cada 3 s, solo mientras algo está en curso.
- **Números que cambian**: el valor nuevo reemplaza al viejo con un fundido de 200 ms. Los relojes no se animan entre segundos.
- **Listas**: cuando algo entra o sale, lo de abajo se acomoda en 240 ms. Las filas no entran en cascada.
- **Presionado**: el control toma `superficie-alta` (o se oscurece un 8 % si es un botón relleno) en 100 ms. Sin escalas ni hundimientos.
- **Reducir movimiento**: todo pasa a fundidos de 200 ms; sin desplazamientos, sin respiración, sin ondas.

## Gestos

- **Tocar** hace lo que dice el control. Nada se dispara con un toque largo sin que haya otra forma de llegar.
- **Mantener apretado** abre más opciones del elemento (un ejercicio, una sesión, un día). La primera vez se muestra una pista que se descarta sola.
- **Deslizar una fila** hacia la izquierda la borra; al cruzar la mitad, la fila se pone en `superficie-alta`, vibra `umbral` y al soltar se va. Siempre con deshacer.
- **Arrastrar para ordenar**: la fila se levanta (`superficie-alta`, sin sombra), cada lugar que pasa vibra `tic` y al soltar vibra `ok`.
- **Deslizar un número** (peso, repeticiones, minutos) lo cambia de a un paso; cada paso vibra `tic`.
- **Deslizar hacia abajo** cierra hojas y paneles. No hay "tirar para actualizar": todo ya está en tu teléfono.

## Tacto

Seis toques, los mismos en todas las apps.

| Toque | Cuándo | Android | Web |
| --- | --- | --- | --- |
| `tic` | Elegir algo, pasar por un valor, cambiar de pestaña | selección (`selectionChanged`) | 8 ms |
| `ok` | Confirmar: serie hecha, guardar, soltar algo arrastrado | impacto liviano | 14 ms |
| `umbral` | Un gesto cruza su punto: deslizar para borrar, mantener apretado | impacto medio | 10 ms |
| `aviso` | Algo necesita atención: faltan 3 s, no se pudo guardar | notificación de advertencia | 12 · 60 · 12 ms |
| `fin` | Terminó algo y toca seguir: el descanso, una fase, la sesión | notificación de éxito | 180 · 90 · 180 ms |
| `logro` | Récord, escalón, insignia | notificación de éxito | 18 · 40 · 18 · 40 · 30 ms |

- Un toque cada 70 ms como máximo; si chocan dos, gana el de mayor prioridad (de `tic` a `logro`).
- Nunca vibra al desplazarse ni por algo que pasa solo, salvo `fin` y `aviso` durante una sesión: son los que se sienten con el teléfono en el bolsillo.
- Se apaga desde Ajustes · Sesión y respeta la vibración del sistema.

## Sonido

Nueve sonidos cortos, sintetizados en la app: campana suave y gota, en La mayor pentatónica (Mi, La, Do#). Suenan solo durante una sesión o cuando hay que hacer algo. Fuera de eso, Nodo no suena.

| Sonido | Cuándo | Cómo es |
| --- | --- | --- |
| `encender` | Empieza la sesión | La con un brillo en Mi agudo |
| `toque` | Serie hecha | Una gota corta, casi un clic |
| `cuenta` | Faltan 3, 2 y 1 s del descanso | Tres tics suaves en La |
| `campana` | Terminó el descanso, toca seguir | Dos campanadas, La y Mi, que bajan |
| `subir` | La fase pasa a fuerte | Mi y Si, que suben |
| `bajar` | La fase pasa a suave o a aflojar | Si y Mi, que bajan |
| `fin` | Terminó la sesión | Un acorde de La, largo y bajo |
| `logro` | Récord, escalón, insignia | Mi, La, Do# y Mi, en arpegio |
| `aviso` | No se pudo guardar, se perdió el GPS | Dos notas graves y apagadas |

- El volumen sigue al de la música del teléfono y baja la música mientras suena, sin cortarla.
- Las notificaciones usan los mismos sonidos (`campana`, `subir`, `bajar`, `fin`) como sonido del canal de sesión.
- Con el teléfono en silencio, solo vibra.
- Se apaga desde Ajustes · Sesión, por separado de la vibración y de la voz.

## Voz

En las sesiones de cardio y movilidad la app puede hablar. Habla como un compañero que entrena al lado: dice lo que viene, con el número primero, y se calla.

- Fase: "Fuerte. Cuatro minutos. Nivel ocho."
- Descanso terminado: "Sentadilla búlgara. Serie dos."
- Movilidad: "Lado izquierdo. Treinta segundos."
- Fin: "Listo. Cuarenta y dos minutos."
- Nunca felicita, nunca alienta, nunca repite lo que ya dijo.

## Cada evento, completo

| Evento | Movimiento | Tacto | Sonido | Voz |
| --- | --- | --- | --- | --- |
| Elegir (chip, día, pestaña) | El indicador se desliza, 200 ms | `tic` | | |
| Empezar una sesión | Encender + la red pasa a "en curso" | `ok` | `encender` | El nombre de la sesión |
| Serie hecha | El botón se llena con la luz + latido | `ok` | `toque` | |
| Récord en una serie | Latido doble + "Récord" aparece | `logro` | `logro` | |
| Empieza el descanso | El reloj aparece, 320 ms; la red pasa a "descanso" | | | |
| Faltan 3 s | | `aviso` en el 3 | `cuenta` | |
| Termina el descanso | El anillo se apaga + latido | `fin` | `campana` | Lo que sigue |
| Cambia la fase de cardio | El número se funde + latido | `fin` | `subir` o `bajar` | Fase, minutos, nivel |
| Pausa | La red se queda quieta, el halo deja de respirar | `ok` | | |
| Termina la sesión | Pantalla de fin + encender | `fin` | `fin` | Duración |
| Escalón o insignia | Festejo | `logro` | `logro` | |
| Borrar deslizando | La fila se va, 240 ms; aviso con deshacer | `umbral` | | |
| Mantener apretado | El menú sube, 200 ms | `umbral` | | |
| Algo falló | Mensaje en el lugar, sin tapar nada | `aviso` | `aviso` | |
