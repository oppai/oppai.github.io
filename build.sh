#!/bin/sh
set -ex

elm make src/Main.elm --output=app.js --optimize
sed -i '' 's/)}});}(this));%/)}});}(this));/' app.js
python3 -m http.server 8000
