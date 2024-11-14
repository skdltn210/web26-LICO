#!/bin/bash

#LOG_FILE="/lico/script/logfile.log"
#exec > >(tee -a "$LOG_FILE") 2>&1

APP_NAME=$1
STREAM_KEY=$2

echo "Starting FFmpeg script for APP_NAME: $APP_NAME, STREAM_KEY: $STREAM_KEY"

# API 요청으로 채널 아이디 획득
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

# ffmpeg으로 인코딩
ffmpeg -i "rtmp://192.168.1.6:1935/$APP_NAME/$STREAM_KEY" -y\
        -rw_timeout 1000000 \
    -map 0:v -map 0:a -c:a aac -b:a 192k -c:v libx264 -b:v:3 5000k -s:v:3 1920x1080 -preset superfast -profile:v baseline \
    -map 0:v -map 0:a -c:a aac -b:a 128k -c:v libx264 -b:v:2 3000k -s:v:2 1280x720 -preset superfast -profile:v baseline \
    -map 0:v -map 0:a -c:a aac -b:a 128k -c:v libx264 -b:v:1 1500k -s:v:1 854x480 -preset superfast -profile:v baseline \
    -map 0:v -map 0:a -c:a aac -b:a 128k -c:v libx264 -b:v:0 800k -s:v:0 640x360 -preset superfast -profile:v baseline \
    -hls_time 2 -hls_flags delete_segments -hls_list_size 5 \
    -hls_segment_filename "/lico/storage/$APP_NAME/$CHANNEL_ID/%v/%03d.ts" \ # APP_NAME(환경), CHANNEL_ID(채널 아이디)를 이용하여 오브젝트 스토리지 저장 경로를 동적으로 생성
    -master_pl_name "index.m3u8" \
    -var_stream_map "v:0,a:0 v:1,a:1 v:2,a:2 v:3,a:3" \
    -f hls "/lico/storage/$APP_NAME/$CHANNEL_ID/%v/index.m3u8" \
    -map 0:v -vf "fps=1/10" -update 1 -s 426x240 \
    "/lico/storage/$APP_NAME/$CHANNEL_ID/thumbnail.png"