# Cómo correr las pruebas (desde v261)

- Todo: `nohup node suite.js prevX.html > suite_runN.txt 2>&1 &` y esperar "pruebas en". ~16 min, 53 pruebas.
- Algunas: `node suite.js prevX.html chk261 chk264`.
- `fast.js`: modo rápido (reloj falso + sin animaciones + espera pedidos de red). Se usa solo con `-r ./fast.js`.
- `suite_lentas.txt`: van en modo normal (gestos, transiciones de vista, rotación, scroll).
- `suite_solas.txt`: van solas al final (chk237, gesto rápido sensible a la carga).
- Si fallan 1 a 3, el corredor las repite en modo normal; si fallan más, no repite (ahorra hasta 15 min). "FALLAN" al final = falla real.
- Tiempo: ~16–17 min con todo en verde; la primera vuelta no baja de eso porque chk259, chk260, chk237, chk257 y chk258 van en modo normal y suman ~14 min.
- Criterio estricto: exit 0, sin FAIL/FALLAS/Error, y "bad 0", "TODO OK" o "BAD []" vacío.
- Detalle de la última vuelta: suite_ultima.log · tiempos: suite_tiempos.json (ordena las más largas primero).
- No usar `pkill -f` con un patrón que esté en el mismo comando (mata la propia consola).
