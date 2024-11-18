#!/bin/bash

#LOG_FILE="/lico/script/logfile.log"
#exec > >(tee -a "$LOG_FILE") 2>&1

APP_NAME=$1
STREAM_KEY=$2

echo "Starting FFmpeg script for APP_NAME: $APP_NAME, STREAM_KEY: $STREAM_KEY"

if [[ "$APP_NAME" == "live" ]]; then
    CHANNEL_ID=$(curl -s http://192.168.1.9:3000/lives/channel-id/$STREAM_KEY | jq -r '.channelId')
elif [[ "$APP_NAME" == "dev" ]]; then
    CHANNEL_ID=$(curl -s http://192.168.1.7:3000/lives/channel-id/$STREAM_KEY | jq -r '.channelId')
else
    echo "Error: Unsupported APP_NAME. Exiting."
    exit 1
fi


if [[ -z "$CHANNEL_ID" ]]; then
    echo "Error: CHANNEL_ID is empty. Exiting."
    exit 1
fi

ffmpeg -rw_timeout 10000000 -r 30 -i "rtmp://192.168.1.6:1935/$APP_NAME/$STREAM_KEY" -y\
    -map 0:v -map 0:a -c:a aac -b:a 128k -c:v libx264 -b:v:2 2800k -s:v:2 1280x720 -preset veryfast -g 30 -tune zerolatency -profile:v baseline \
    -map 0:v -map 0:a -c:a aac -b:a 128k -c:v libx264 -b:v:1 1200k -s:v:1 854x480 -preset veryfast -g 30 -tune zerolatency -profile:v baseline \
    -map 0:v -map 0:a -c:a aac -b:a 128k -c:v libx264 -b:v:0 600k -s:v:0 640x360 -preset veryfast -g 30 -tune zerolatency -profile:v baseline \
    -keyint_min 30  -hls_time 1 -hls_segment_type fmp4 -hls_flags delete_segments+independent_segments+append_list -hls_list_size 3 -hls_delete_threshold 5 \
    -hls_segment_filename "/lico/storage/$APP_NAME/$CHANNEL_ID/%v/%03d.m4s" \
    -master_pl_name "index.m3u8" \
    -var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2" \
    -f hls "/lico/storage/$APP_NAME/$CHANNEL_ID/%v/index.m3u8" \
    -map 0:v -vf "fps=1/10" -update 1 -s 426x240 \
    "/lico/storage/$APP_NAME/$CHANNEL_ID/thumbnail.png"


/lico/script/cleanup.sh "$APP_NAME" "$CHANNEL_ID"