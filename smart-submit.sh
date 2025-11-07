#!/bin/bash

# Read from stdin
INPUT=$(cat)
# Detect script location - works for both marketplace and manual install
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
SOUND_DIR="${CLAUDE_PLUGIN_ROOT:-${SCRIPT_DIR}}"

# Extract transcript path from hook JSON
TRANSCRIPT_PATH=$(echo "$INPUT" | jq -r '.transcript_path // ""' 2>/dev/null)

# Default to regular user-submit sound
SOUND="$SOUND_DIR/user-submit.wav"

# Check if we're responding to a question or permission request
if [ -n "$TRANSCRIPT_PATH" ] && [ -f "$TRANSCRIPT_PATH" ]; then
    # Look at the last few assistant messages to see if there was a question or permission request
    LAST_ASSISTANT=$(tail -50 "$TRANSCRIPT_PATH" | tac | jq -r 'select(.message.role == "assistant") | .message.content[] | select(.type == "text") | .text' 2>/dev/null | head -1)

    # Check if the last assistant message contained a question or permission request
    if echo "$LAST_ASSISTANT" | grep -qiE "(which.*\?|what.*\?|would you like|choose|select one|permission)"; then
        SOUND="$SOUND_DIR/answer-submit.wav"
    fi

    # Also check for tool_use blocks that might indicate a pending question/permission
    LAST_TOOL=$(tail -50 "$TRANSCRIPT_PATH" | tac | jq -r 'select(.message.role == "assistant") | .message.content[] | select(.type == "tool_use") | .name' 2>/dev/null | head -1)

    if [ "$LAST_TOOL" = "AskUserQuestion" ]; then
        SOUND="$SOUND_DIR/answer-submit.wav"
    fi
fi

echo "[$(date +%H:%M:%S)] Playing: $(basename "$SOUND")" >> /tmp/claude-sound.log

"$SOUND_DIR/play-exclusive.sh" "$SOUND"
