#!/bin/bash
set -e  # 에러 발생 시 즉시 스크립트 종료

echo "배포 스크립트 시작"

cd /lico/Backend

# Git 작업
git pull

# 의존성 설치 및 빌드
npm install || exit 5
npm run build chats || exit 6

# 서버 재시작
forever stop dist/apps/chats/main.js || true  # 기존 프로세스가 없어도 오류 발생 방지
forever stop dist/apps/chats/main.js || true  # 기존 프로세스가 없어도 오류 발생 방지
forever start dist/apps/chats/main.js
forever start dist/apps/chats/main.js

echo "배포 성공"
exit 0