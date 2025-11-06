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
