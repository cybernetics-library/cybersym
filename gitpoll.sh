#!/bin/bash

API_PID=""
VIZ_PID=""

function down {
    echo "killing..."
    kill $API_PID
    kill -9 -$VIZ_PID
    exit 0
}

function up {
    echo "starting..."
    python app.py >> /tmp/api.log 2>&1 &
    API_PID=$!

    cd viz
    npm start >> /tmp/viz.log 2>&1 &
    VIZ_PID=$!
    cd ..
}

trap down INT TERM QUIT EXIT

up

while true; do
    echo "checking..."
    git fetch
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse @{u})
    if [ $LOCAL != $REMOTE ]; then
        echo "updated!"
        down
        git pull
    fi
    sleep 2
done