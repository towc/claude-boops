#!/bin/bash

# Claude Boops - Settings Interface
# Opens the sound tuner and starts the server

# Detect script location - works for both marketplace and manual install
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BOOPS_DIR="${CLAUDE_PLUGIN_ROOT:-${SCRIPT_DIR}}"

echo "🔊 Claude Boops - Sound Editor"
echo "=============================="
echo ""

# Check if sound-server.js exists in the boops directory
if [ ! -f "$BOOPS_DIR/sound-server.js" ]; then
    echo "❌ Error: Claude Boops not properly installed"
    echo "   Missing sound-server.js in $BOOPS_DIR"
    exit 1
fi

cd "$BOOPS_DIR"

# Check if server is already running
if lsof -Pi :8765 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "⚠️  Server already running on port 8765"
    echo "   Please stop the existing server first or use that instance"
    exit 1
fi

echo "🚀 Starting sound server on port 8765..."
echo "   Press Ctrl+C to stop the server and exit"
echo ""

# Run server in foreground - Ctrl+C will naturally kill it
node sound-server.js &
SERVER_PID=$!

# Wait for server to start
sleep 1

# Open the tuner from the server
echo "🎨 Opening sound tuner at http://localhost:8765"
xdg-open "http://localhost:8765" 2>/dev/null || \
    open "http://localhost:8765" 2>/dev/null || \
    echo "   Please open: http://localhost:8765 in your browser"

# Wait for server process
wait $SERVER_PID
