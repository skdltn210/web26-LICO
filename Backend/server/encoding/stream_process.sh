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

ffmpeg -rw_timeout 10000000 -r 30 -i "rtmp://192.168.1.6:1935/$APP_NAME/$STREAM_KEY" \
        -filter_complex "[0:v]split=3[720p][for480p][for360p];[for480p]scale=854:480[480p];[for360p]scale=640:360[360p]" \
        -map "[720p]" -map 0:a -c:v:0 libx264 -b:v:0 2800k -s:v:0 1280x720 -preset ultrafast -g 30 -tune zerolatency -profile:v:0 baseline -c:a:0 aac -b:a:0 128k \
        -map "[480p]" -map 0:a -c:v:1 libx264 -b:v:1 1200k -preset ultrafast -g 30 -tune zerolatency -profile:v:1 baseline -c:a:1 copy \
        -map "[360p]" -map 0:a -c:v:2 libx264 -b:v:2 600k -preset ultrafast -g 30 -tune zerolatency -profile:v:2 baseline -c:a:2 copy \
        -keyint_min 30 -hls_time 1 -hls_segment_type fmp4 -hls_flags delete_segments+independent_segments+append_list \
        -hls_list_size 3 -hls_delete_threshold 5 \
        -hls_segment_filename "/lico/storage/$APP_NAME/$CHANNEL_ID/%v/%03d.m4s" \
        -master_pl_name "index.m3u8" \
        -var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2" \
        -f hls "/lico/storage/$APP_NAME/$CHANNEL_ID/%v/index.m3u8" \
        -map 0:v -vf "fps=1/10,scale=426:240" -update 1 "/lico/storage/$APP_NAME/$CHANNEL_ID/thumbnail.jpg"



/lico/script/cleanup.sh "$APP_NAME" "$CHANNEL_ID"