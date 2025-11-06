#!/usr/bin/env node
const http = require('http');
const fs = require('fs');
const path = require('path');

// Use the directory where this script is located
const SOUNDS_DIR = __dirname;
const CONFIG_FILE = path.join(SOUNDS_DIR, 'config.json');
const PORT = 8765;

// WAV file generator
function generateWAV(frequencies, durations, volumes, sampleRate = 44100) {
  const channels = 1;
  const bitsPerSample = 16;

  let totalSamples = 0;
  durations.forEach(d => totalSamples += Math.floor(sampleRate * d));

  const buffer = Buffer.alloc(44 + totalSamples * 2);

  // WAV header
  buffer.write('RIFF', 0);
  buffer.writeUInt32LE(36 + totalSamples * 2, 4);
  buffer.write('WAVE', 8);
  buffer.write('fmt ', 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * bitsPerSample / 8, 28);
  buffer.writeUInt16LE(channels * bitsPerSample / 8, 32);
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(totalSamples * 2, 40);

  // Generate audio samples
  let offset = 44;
  let globalSample = 0;

  for (let toneIdx = 0; toneIdx < frequencies.length; toneIdx++) {
    const freq = frequencies[toneIdx];
    const duration = durations[toneIdx];
    const volume = volumes[toneIdx];
    const samples = Math.floor(sampleRate * duration);
    const fadeInSamples = Math.min(samples * 0.1, 500);
    const fadeOutSamples = Math.min(samples * 0.1, 500);

    for (let i = 0; i < samples; i++) {
      if (freq === 0) {
        buffer.writeInt16LE(0, offset);
      } else {
        const t = globalSample / sampleRate;
        let amplitude = volume;

        if (i < fadeInSamples) {
          amplitude *= i / fadeInSamples;
        } else if (i > samples - fadeOutSamples) {
          amplitude *= (samples - i) / fadeOutSamples;
        }

        const sample = Math.sin(2 * Math.PI * freq * t) * amplitude * 32767;
        buffer.writeInt16LE(Math.round(sample), offset);
      }
      offset += 2;
      globalSample++;
    }
  }

  return buffer;
}

function generateAllSounds() {
  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));

  for (const [soundId, soundConfig] of Object.entries(config)) {
    const frequencies = soundConfig.tones.map(t => t.silent ? 0 : t.freq);
    const durations = soundConfig.tones.map(t => t.duration);
    const volumes = soundConfig.tones.map(t => t.volume);

    const wav = generateWAV(frequencies, durations, volumes);
    const filepath = path.join(SOUNDS_DIR, `${soundId}.wav`);
    fs.writeFileSync(filepath, wav);
    console.log(`✓ Generated ${soundId}.wav`);
  }
}

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
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(html);
    } catch (error) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
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
  } else if (req.method === 'POST' && req.url === '/update-sounds') {
    try {
      generateAllSounds();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        message: 'All sounds generated successfully!'
      }));
    } catch (error) {
      console.error('✗ Error generating sounds:', error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: error.message }));
    }
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
