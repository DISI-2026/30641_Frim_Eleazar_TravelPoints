#!/bin/bash

ABS_DIR=$(dirname $PWD/$0)
CONFIG_FILE="$ABS_DIR/mockoon-config.json"
echo "Using config file: $CONFIG_FILE"

docker stop DISI-Mockoon-API 2>/dev/null || true
docker rm DISI-Mockoon-API 2>/dev/null || true

docker run -d \
    -p 3000:3000 \
    --mount type=bind,source=$CONFIG_FILE,target=/data.json \
    --name "DISI-Mockoon-API" \
    mockoon/cli:latest \
    --data data.json \
    --log-transaction \
    --watch \

echo "Application started"
docker logs DISI-Mockoon-API -f | python3 -m json.tool --json-lines
