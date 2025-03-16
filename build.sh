#!/bin/sh
set -ex

elm make src/Main.elm --output=app.js --optimize
python3 -m http.server 8000