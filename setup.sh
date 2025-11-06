#!/bin/bash

# Claude Boops - Installation Script
# Sets up sound notifications for Claude Code

set -e

INSTALL_DIR="$HOME/.claude/boops"
SETTINGS_FILE="$HOME/.claude/settings.json"

echo "🔊 Claude Boops - Sound Notifications for Claude Code"
echo "=================================================="
echo ""

# Check if Claude Code is installed
if [ ! -d "$HOME/.claude" ]; then
    echo "❌ Error: Claude Code directory not found at $HOME/.claude"
    echo "   Please install Claude Code first"
    exit 1
fi

# Check dependencies
echo "📋 Checking dependencies..."
command -v node >/dev/null 2>&1 || { echo "❌ node is required but not installed. Aborting." >&2; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "❌ jq is required but not installed. Aborting." >&2; exit 1; }
echo "✅ All dependencies found"
echo ""

# Make scripts executable
echo "📝 Making scripts executable..."
chmod +x "$INSTALL_DIR"/*.sh

# Backup existing settings
if [ -f "$SETTINGS_FILE" ]; then
    BACKUP_FILE="$SETTINGS_FILE.backup-$(date +%Y%m%d-%H%M%S)"
    echo "💾 Backing up settings to: $BACKUP_FILE"
    cp "$SETTINGS_FILE" "$BACKUP_FILE"
else
    echo "⚠️  No existing settings.json found, creating new one"
    echo '{"enabledPlugins":{}}' > "$SETTINGS_FILE"
fi

# Install hooks
echo "⚙️  Installing hooks..."
HOOKS_CONFIG=$(cat <<'EOF'
{
  "UserPromptSubmit": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "~/.claude/boops/smart-submit.sh"
        }
      ]
    }
  ],
  "Notification": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "~/.claude/boops/smart-notification.sh"
        }
      ]
    }
  ],
  "Stop": [
    {
      "hooks": [
        {
          "type": "command",
          "command": "~/.claude/boops/smart-stop.sh"
        }
      ]
    }
  ],
  "PreToolUse": [
    {
      "matcher": "AskUserQuestion",
      "hooks": [
        {
          "type": "command",
          "command": "~/.claude/boops/play-exclusive.sh ~/.claude/boops/question.wav"
        }
      ]
    }
  ]
}
EOF
)

# Merge with existing settings
MERGED=$(jq --argjson hooks "$HOOKS_CONFIG" '.hooks = $hooks' "$SETTINGS_FILE")
echo "$MERGED" > "$SETTINGS_FILE"

# Generate initial sound files
echo "🎵 Generating sound files..."
cd "$INSTALL_DIR"
node sound-server.js &
SERVER_PID=$!
sleep 2
curl -s -X POST http://localhost:8765/update-sounds > /dev/null 2>&1 || true
kill $SERVER_PID 2>/dev/null || true

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "  1. Restart Claude Code for changes to take effect"
echo "  2. To customize sounds, run: ~/.claude/boops/settings.sh"
echo ""
echo "Sound files are in: $INSTALL_DIR"
