# Íconos Nodo — la "o" encendida

Una carpeta por app (`nodo`, `entreno`, `gastos`, `pizarra`). Todas salen de los mismos dibujos: fondo grafito (#12151B a #0A0C10), lo apagado en un solo gris plano (#4A505A), filo de luz arriba y la "o" encendida (anillo y punto) en la luz de cada app. La referencia es el manual de marca Nodo, sección Identidad visual · La familia.

| Carpeta | Para qué |
| --- | --- |
| `svg/<app>.svg` | Ícono completo redondeado (fuente de verdad) |
| `svg/<app>-redondo.svg` | Versión circular |
| `svg/<app>-frente.svg`, `-fondo.svg` | Capas adaptables de Android (108 u., dibujo en la zona segura) |
| `svg/<app>-monocromo.svg` | Ícono temático de Android 13+ (una tinta) |
| `svg/<app>-notificacion.svg` | Silueta blanca para la barra de estado y el `badge` web |
| `svg/<app>-maskable.svg` | Maskable para el manifiesto web |
| `svg/<app>-glifo-claro.svg` | El dibujo sin cuadrado, para fondos claros |
| `assets/` | Fuentes 1024 px para `@capacitor/assets` (icon-only, foreground, background, monochrome) |
| `web/` | icon-192, icon-512, maskable-512, apple-touch-icon, favicon-32 |
| `tienda/play-512.png` | Ícono para catálogo / F-Droid / Play |
| `android/drawable-*/ic_stat_<app>.png` | Ícono chico de notificación, mdpi a xxxhdpi |

No redibujar: si hace falta otro tamaño, exportarlo de los SVG.
