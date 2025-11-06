#!/bin/bash
LOCK_FILE="/tmp/claude-sound.lock"
SOUND_FILE="$1"

# Log when hook fires
echo "[$(date +%H:%M:%S)] Hook fired: $SOUND_FILE" >> /tmp/claude-sound.log 2>&1

# Kill any currently playing Claude sound
if [ -f "$LOCK_FILE" ]; then
    OLD_PID=$(cat "$LOCK_FILE" 2>/dev/null)
    if [ -n "$OLD_PID" ]; then
        kill "$OLD_PID" 2>/dev/null
    fi
fi

# Play the new sound in background
paplay "$SOUND_FILE" >> /tmp/claude-sound.log 2>&1 &
PLAY_PID=$!
echo $! > "$LOCK_FILE"
echo "[$(date +%H:%M:%S)] Started paplay PID: $PLAY_PID" >> /tmp/claude-sound.log 2>&1

# Exit immediately without waiting (non-blocking)
