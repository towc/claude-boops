#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');

// Use the directory where this script is located
const SOUNDS_DIR = __dirname;
const CONFIG_FILE = path.join(SOUNDS_DIR, 'config.json');
const PORT = 8007; // BOOP!

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'GET' && req.url === '/') {
    // Serve the HTML tuner page
    try {
      const html = fs.readFileSync(path.join(SOUNDS_DIR, 'sound-tuner.html'), 'utf8');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Error loading tuner page');
    }
  } else if (req.method === 'GET' && req.url === '/config') {
    try {
      if (fs.existsSync(CONFIG_FILE)) {
        const config = fs.readFileSync(CONFIG_FILE, 'utf8');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(config);
      } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Config file not found' }));
      }
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  } else if (req.method === 'POST' && req.url === '/config') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const config = JSON.parse(body);
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
        console.log('✓ Saved config.json');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true }));
      } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: error.message }));
      }
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(PORT, 'localhost', () => {
  console.log(`🔊 Sound server listening on http://localhost:${PORT}`);
  console.log(`Sounds directory: ${SOUNDS_DIR}`);
  console.log(`\n   Open http://localhost:${PORT} in your browser to edit sounds\n`);
});
