# Acta 033 · Kozmos · la Base sin barra, los minutos y el remo

Vuelta corta de arreglos (la tijera, Casandra y el fiscal), después de publicar la versión 40. Fer: «seguí».

## Qué cambió

- **Sin barra, un solo remo por día** (`K.rutina.armarBloques`): un bloque con alternativas (`["tirar", "remo"]`) que cae en una escalera que otro bloque del día ya hace deja de duplicarla: queda la primera vez y la otra se saltea. Con barra, nada cambia. La prueba `rutina-armar-bloques` acepta solo ese cambio contra `main`; `escalera-en-la-rutina` lo revisa en los tres días y con tres equipos.
- **Los minutos de cada rutina** (`minutos` en el catálogo) son la mediana de sus días como los arma Hoy, con todo el equipo y sin historia. Cambiaron ocho: armstrong 25 → 45, base_cali 50 → 65, cien 15 → 25, espagat 20 → 10, hombros 12 → 10, lastre 50 → 60, prim_dom 25 → 40, z2 45 → 55. Prueba nueva `rutina-minutos` (5 de tolerancia, así 11, 18 o 22 siguen diciendo lo suyo).
- **Remo, de 4 a 5 escalones**: arriba de todo, «Remo invertido a un brazo» (`remo-un-brazo`, barra, rango 3–6), con su pose en `poses/barra.js` (el de adelante tira; el de atrás va a lo largo del cuerpo).
- **Fondos queda en 3**: un escalón con lastre en la escalera choca con los caminos de Lastre (`lastre.fondo-25`) y con la regla de que los kilos de una escalera son de mancuernas; el fondo ruso pide barra por decisión de la vuelta 27. Anotado en el backlog.

## Evidencia

- Sin pantalla: 121 de 121. Suite de pantalla: 108 de 108 (`serie-con-kilos` ajustada: el remo sigue en superserie con la sentadilla).
- Tablero en grafito y en claro, antes y después: https://claude.ai/artifact/G5YjK7T6hC2H47bLzxqPNd

## Decisión que espera a Fer

1. OK al tablero para publicar la versión 41.
