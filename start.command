#!/bin/bash
# Abre el sitio en un servidor local con no-cache (para iterar sin problemas de caché)
cd "$(dirname "$0")"
PORT=8042
echo "Sirviendo Flujo de Alta de Paciente · ACHS en http://localhost:$PORT  (Ctrl+C para detener)"
( sleep 1; open "http://localhost:$PORT" ) &
python3 serve.py $PORT
