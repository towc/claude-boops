#!/bin/bash
set -e

SETTINGS_FILE="$HOME/.claude/settings.json"
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(dirname "$(dirname "$0")")}"

echo "Setting up claude-boops hooks..."

# Create backup
if [ -f "$SETTINGS_FILE" ]; then
    cp "$SETTINGS_FILE" "$SETTINGS_FILE.backup-$(date +%s)"
    echo "Created backup of settings.json"
fi

# Read existing settings or create empty object
if [ -f "$SETTINGS_FILE" ]; then
    SETTINGS=$(cat "$SETTINGS_FILE")
else
    SETTINGS='{}'
    mkdir -p "$(dirname "$SETTINGS_FILE")"
fi

# Use jq to merge hooks into settings
UPDATED_SETTINGS=$(echo "$SETTINGS" | jq --arg plugin_root "$PLUGIN_ROOT" '
  .hooks = (.hooks // {}) |
  .hooks.Stop = (.hooks.Stop // []) + [{
    "matcher": "",
    "hooks": [{
      "type": "command",
      "command": ($plugin_root + "/scripts/play-sound.sh " + $plugin_root + "/sounds/default.wav")
    }]
  }] |
  .hooks.Notification = (.hooks.Notification // []) + [{
    "matcher": "",
    "hooks": [{
      "type": "command",
      "command": ($plugin_root + "/scripts/play-sound.sh " + $plugin_root + "/sounds/question.wav")
    }]
  }]
')

echo "$UPDATED_SETTINGS" > "$SETTINGS_FILE"
echo "✓ Hooks configured successfully in $SETTINGS_FILE"
echo ""
echo "The following hooks were added:"
echo "  - Stop: plays default.wav when Claude finishes responding"
echo "  - Notification: plays question.wav when you receive notifications"
echo ""
echo "Restart Claude Code for changes to take effect."
