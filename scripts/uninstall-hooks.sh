#!/bin/bash
set -e

SETTINGS_FILE="$HOME/.claude/settings.json"
PLUGIN_ROOT="${CLAUDE_PLUGIN_ROOT:-$(dirname "$(dirname "$0")")}"

echo "Removing claude-boops hooks..."

if [ ! -f "$SETTINGS_FILE" ]; then
    echo "No settings file found at $SETTINGS_FILE"
    exit 0
fi

# Create backup
cp "$SETTINGS_FILE" "$SETTINGS_FILE.backup-$(date +%s)"
echo "Created backup of settings.json"

# Use jq to remove claude-boops hooks
UPDATED_SETTINGS=$(cat "$SETTINGS_FILE" | jq --arg plugin_root "$PLUGIN_ROOT" '
  if .hooks then
    .hooks.Stop = (.hooks.Stop // [] | map(select(.hooks[0].command | contains($plugin_root) | not))) |
    .hooks.Notification = (.hooks.Notification // [] | map(select(.hooks[0].command | contains($plugin_root) | not))) |
    if (.hooks.Stop | length) == 0 then .hooks |= del(.Stop) else . end |
    if (.hooks.Notification | length) == 0 then .hooks |= del(.Notification) else . end |
    if (.hooks | length) == 0 then del(.hooks) else . end
  else
    .
  end
')

echo "$UPDATED_SETTINGS" > "$SETTINGS_FILE"
echo "✓ Hooks removed successfully from $SETTINGS_FILE"
echo ""
echo "Restart Claude Code for changes to take effect."
