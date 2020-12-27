#!/bin/sh

elm-make src/Main.elm --output app.js
python -m SimpleHTTPServer 8000
