#!/bin/bash
cd $(dirname $0)

if [ -z $1 ]; then
    echo "Please provide port of the webpack-dev-server as argument."
    echo "Usage: ./debug.sh [PORT]"
    exit 1
fi

#start webpack first to generate files for workbox
node_modules/webpack/bin/webpack.js --config webpack.config.babel.js
#start webpack dev
node_modules/webpack-dev-server/bin/webpack-dev-server.js \
  --host 0.0.0.0 --public --disable-host-check --port $1 \
  --config webpack.config.babel.js
