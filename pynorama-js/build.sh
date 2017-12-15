#!/bin/bash

cd $(dirname $0)
node_modules/webpack/bin/webpack.js --config webpack.legacy.config.babel.js
node_modules/webpack/bin/webpack.js --config webpack.config.babel.js

cd ..
cp pynorama-js/bin/. pynorama/static/ -a -v
