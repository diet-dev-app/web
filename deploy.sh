#!/bin/bash
# Script de despliegue para diet.carlitosry.com
# Sube archivos/carpeta al servidor de producción vía SCP

# Configuración
PRIVATE_KEY="$HOME/.ssh/id_rsa_hyperys1"
USER="hyperys1"
HOST="198.50.159.41"
REMOTE_PATH="/home/hyperys1/public_html/diet.carlitosry.com"

# Carpeta local a desplegar (puedes cambiarla si lo deseas)
LOCAL_PATH="."

# Mensaje de inicio
echo "Iniciando despliegue de $LOCAL_PATH a $USER@$HOST:$REMOTE_PATH"

# Subida de archivos (excluye el propio script y archivos ocultos por defecto)
scp -i "$PRIVATE_KEY" -r $LOCAL_PATH/* "$USER@$HOST:$REMOTE_PATH/"

if [ $? -eq 0 ]; then
  echo "Despliegue completado con éxito."
else
  echo "Error durante el despliegue. Revisa la conexión y los permisos."
fi
