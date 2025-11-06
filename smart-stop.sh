#!/bin/bash
# Smart sound selector based on assistant's response

# Read the hook JSON data from stdin
INPUT=$(cat)

SOUND_DIR="$HOME/.claude/boops"

# Extract transcript path from hook JSON
TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // ""' 2>/dev/null)

# Log for debugging
echo "[$(date +%H:%M:%S)] Stop hook - analyzing message" >> /tmp/claude-sound.log
echo "[$(date +%H:%M:%S)] Transcript path: $TRANSCRIPT_PATH" >> /tmp/claude-sound.log

# Read the last assistant message from transcript
MESSAGE=""
if [ -n "$TRANSCRIPT_PATH" ] && [ -f "$TRANSCRIPT_PATH" ]; then
    # Read last 20 lines, find the most recent assistant text message
    MESSAGE=$(tail -20 "$TRANSCRIPT_PATH" | tac | jq -r 'select(.message.role == "assistant") | .message.content[] | select(.type == "text") | .text' 2>/dev/null | head -1)
fi

echo "[$(date +%H:%M:%S)] MESSAGE excerpt: ${MESSAGE:0:200}" >> /tmp/claude-sound.log

# Determine which sound to play based on message content
if echo "$MESSAGE" | grep -qiE "(couldn't|can't|unable|failed|error|problem|issue|sorry|unfortunately)"; then
    # Error/failure indicators
    SOUND="$SOUND_DIR/completion-error.wav"
    echo "[$(date +%H:%M:%S)] Detected error/failure" >> /tmp/claude-sound.log
else
    # Default to success
    SOUND="$SOUND_DIR/completion-success.wav"
    echo "[$(date +%H:%M:%S)] Detected success/completion" >> /tmp/claude-sound.log
fi

# Play the selected sound
"$SOUND_DIR/play-exclusive.sh" "$SOUND"
