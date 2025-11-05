#!/bin/bash
# Play sound silently in background
paplay "$1" </dev/null >/dev/null 2>&1 &
# Return JSON to suppress output
echo '{"suppressOutput": true}'
