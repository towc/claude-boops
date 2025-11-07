#!/bin/bash
# Notification sound for permission prompts

INPUT=$(cat)
SOUND_DIR="${CLAUDE_PLUGIN_ROOT:-$HOME/.claude/boops}"

# Extract the notification message
MESSAGE=$(echo "$INPUT" | jq -r '.message // ""' 2>/dev/null)

echo "[$(date +%H:%M:%S)] Notification: $MESSAGE" >> /tmp/claude-sound.log
echo "[$(date +%H:%M:%S)] Playing permission-needed sound" >> /tmp/claude-sound.log

# Play permission notification sound
"$SOUND_DIR/play-exclusive.sh" "$SOUND_DIR/permission-needed.wav"
