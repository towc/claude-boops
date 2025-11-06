#!/bin/bash

# Claude Boops - Settings Interface
# Opens the sound tuner and starts the server

BOOPS_DIR="$HOME/.claude/boops"

echo "🔊 Claude Boops - Sound Editor"
echo "=============================="
echo ""

# Check if installed
if [ ! -d "$BOOPS_DIR" ]; then
    echo "❌ Error: Claude Boops not installed"
    echo "   Run setup.sh first"
    exit 1
fi

cd "$BOOPS_DIR"

# Check if server is already running
if lsof -Pi :8765 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "ℹ️  Server already running on port 8765"
else
    echo "🚀 Starting sound server on port 8765..."
    node sound-server.js &
    SERVER_PID=$!
    echo "   Server PID: $SERVER_PID"

    # Save PID for cleanup
    echo $SERVER_PID > /tmp/claude-boops-server.pid

    sleep 1
fi

# Open the tuner
echo "🎨 Opening sound tuner in browser..."
xdg-open "$BOOPS_DIR/sound-tuner.html" 2>/dev/null || \
    open "$BOOPS_DIR/sound-tuner.html" 2>/dev/null || \
    echo "   Please open: $BOOPS_DIR/sound-tuner.html in your browser"

echo ""
echo "✅ Sound editor is now running!"
echo ""
echo "To stop the server:"
echo "  kill \$(cat /tmp/claude-boops-server.pid)"
