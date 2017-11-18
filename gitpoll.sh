#!/bin/bash

while true; do
    git fetch
    LOCAL=$(git rev-parse HEAD)
    REMOTE=$(git rev-parse @{u})
    if [ $LOCAL != $REMOTE ]; then
        if [ ! -z "$1" ]; then
            kill $API_PID
            kill $VIZ_PID
        fi

        git pull

        python app.py >> /tmp/api.log 2>&1 &
        API_PID=$!

        cd viz
        npm start >> /tmp/viz.log 2>&1 &
        VIZ_PID=$!
        cd ..
    fi
done