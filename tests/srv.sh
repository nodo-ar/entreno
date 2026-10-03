#!/bin/bash
# Sirve la raíz del repo en el puerto 8765 (las pruebas apuntan ahí hasta la etapa 3).
cd "$(dirname "$0")/.."
curl -s -o /dev/null http://127.0.0.1:8765/ || { setsid nohup python3 -m http.server 8765 >/dev/null 2>&1 < /dev/null & sleep 1.5; }
