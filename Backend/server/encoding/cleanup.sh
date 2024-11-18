#!/bin/bash

#LOG_FILE="/lico/script/cleanup.log"
#exec > >(tee -a "$LOG_FILE") 2>&1


APP_NAME=$1
CHANNEL_ID=$2

echo "Cleanup FFmpeg script for APP_NAME: $APP_NAME, CHANNEL_ID: $CHANNEL_ID"

if [[ "$APP_NAME" == "live" ]]; then
    curl -X DELETE http://192.168.1.9:3000/lives/onair/$CHANNEL_ID
elif [[ "$APP_NAME" == "dev" ]]; then
    curl -X DELETE http://192.168.1.7:3000/lives/onair/$CHANNEL_ID
else
    echo "Error: Unsupported APP_NAME. Exiting."
    exit 1
fi

if [[ -d "/lico/storage/$APP_NAME/$CHANNEL_ID" ]]; then
    rm -rf "/lico/storage/$APP_NAME/$CHANNEL_ID"
    echo "Deleted directory: /lico/storage/$APP_NAME/$CHANNEL_ID"
else
    echo "Directory /lico/storage/$APP_NAME/$CHANNEL_ID does not exist, skipping deletion."