# Íconos de la familia Nodo

Una carpeta por app: `entreno`, `gastos` y `nodo` (la marca, para el catálogo).

Estilo: fondo grafito igual en todas, dibujo en grises que toma el color de la app del lado que mira al nodo encendido, un solo nodo encendido con un halo suave, y un filo de luz fino en el borde de arriba. Colores: Entreno `#FF6B3D` (el ember de la app), Gastos `#43CF9A`, Nodo `#E6E8EB`.

## Qué hay en cada carpeta

- `svg/`: los originales. `<app>.svg` es el ícono completo con su forma; `-frente`, `-fondo` y `-monocromo` son las capas del ícono adaptable de Android (108 unidades, el dibujo dentro de la zona segura); `-notificacion` es la silueta blanca para la barra de estado; `-maskable` es para la web.
- `assets/`: fuentes de 1024 px para `@capacitor/assets` (etapa 5). Copiarlas a `assets/` en la raíz del repo y correr `npx @capacitor/assets generate --android`.
- `web/`: para el manifiesto y la página (etapa 1): `icon-192.png`, `icon-512.png`, `maskable-512.png` (purpose "maskable"), `apple-touch-icon.png` y `favicon-32.png`.
- `android/drawable-*/ic_stat_<app>.png`: el ícono chico de la notificación, en todas las densidades.
- `tienda/play-512.png`: para Play Store, si algún día se publica ahí.

Los PNG salen de los SVG; si se cambia un SVG, hay que regenerarlos.
