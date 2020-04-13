#!/bin/bash

inotifywait js/ -m -r -q -e close_write --format '%w%f' | while read FILE
do
    js=$(ls js/ | grep -vi "init.js" | sed 's/^/js\//' | xargs cat)
    init=$(cat js/init.js)
    out="$js"$'\n'"$init"
    out=$(echo "$out" | sed 's/export class/class/' | sed 's/export var/var/' | sed 's/^import.*//' | sed 's/^"use strict";//')
    echo "$out" > editor.js
done
