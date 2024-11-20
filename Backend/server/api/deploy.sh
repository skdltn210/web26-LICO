#!/bin/bash

BRANCH_NAME=$1

if [ -z "$BRANCH_NAME" ]; then
  echo "Error: Branch name is required."
  exit 1
fi

cd /root/lico/Backend

git reset --hard
git pull origin "$BRANCH_NAME"

# 의존성 설치
npm install

npm run build

forever stop dist/main.js
forever start dist/main.js
