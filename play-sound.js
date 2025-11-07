#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Use the directory where this script is located
const PLUGIN_DIR = __dirname;
const CONFIG_FILE = path.join(PLUGIN_DIR, 'config.json');
const LOCK_FILE = '/tmp/claude-sound.lock';
const LOG_FILE = '/tmp/claude-sound.log';

// WAV file generator (same as sound-server.js)
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

function log(message) {
  const timestamp = new Date().toTimeString().split(' ')[0];
  fs.appendFileSync(LOG_FILE, `[${timestamp}] ${message}\n`);
}

function killPreviousSound() {
  try {
    if (fs.existsSync(LOCK_FILE)) {
      const oldPid = fs.readFileSync(LOCK_FILE, 'utf8').trim();
      if (oldPid) {
        try {
          process.kill(parseInt(oldPid), 'SIGTERM');
        } catch (e) {
          // Process might already be dead, that's fine
        }
      }
    }
  } catch (e) {
    // Ignore errors
  }
}

function playSound(soundId) {
  try {
    // Load config
    const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    const soundConfig = config[soundId];

    if (!soundConfig) {
      log(`Error: Sound "${soundId}" not found in config`);
      process.exit(1);
    }

    // Kill previous sound
    killPreviousSound();

    log(`Playing: ${soundId}`);

    let player;

    // Check if custom filepath is specified
    if (soundConfig.filepath) {
      const filepath = soundConfig.filepath.startsWith('/')
        ? soundConfig.filepath
        : path.join(PLUGIN_DIR, soundConfig.filepath);

      if (!fs.existsSync(filepath)) {
        log(`Error: Sound file not found: ${filepath}`);
        process.exit(1);
      }

      log(`Using custom sound file: ${filepath}`);
      // Play file directly
      player = spawn('paplay', [filepath], {
        stdio: ['ignore', 'ignore', 'ignore'],
        detached: true
      });
      player.unref(); // Allow parent to exit independently
    } else {
      // Generate WAV dynamically from tones
      const frequencies = soundConfig.tones.map(t => t.silent ? 0 : t.freq);
      const durations = soundConfig.tones.map(t => t.duration);
      const volumes = soundConfig.tones.map(t => t.volume);
      const wav = generateWAV(frequencies, durations, volumes);

      // Write to temp file (paplay doesn't support stdin reliably)
      const tempFile = `/tmp/claude-sound-${soundId}-${Date.now()}.wav`;
      fs.writeFileSync(tempFile, wav);

      // Play temp file and delete when done
      player = spawn('paplay', [tempFile], {
        stdio: ['ignore', 'ignore', 'ignore'],
        detached: true
      });
      player.unref(); // Allow parent to exit independently

      player.on('exit', () => {
        try {
          fs.unlinkSync(tempFile);
        } catch (e) {
          // Ignore cleanup errors
        }
      });
    }

    // Write PID to lock file
    fs.writeFileSync(LOCK_FILE, player.pid.toString());
    log(`Started paplay PID: ${player.pid}`);

    player.on('error', (err) => {
      log(`Error playing sound: ${err.message}`);
    });

  } catch (error) {
    log(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Smart detection logic
async function determineSound(hookType, hookData) {
  if (hookType === 'notification') {
    return 'permission-needed';
  }

  if (hookType === 'question') {
    return 'question';
  }

  if (hookType === 'submit') {
    // Always use user-submit for all prompt submissions
    return 'user-submit';
  }

  if (hookType === 'stop') {
    // Check if completion was success or error
    const transcriptPath = hookData?.transcript_path;
    if (transcriptPath && fs.existsSync(transcriptPath)) {
      try {
        const transcript = fs.readFileSync(transcriptPath, 'utf8')
          .split('\n')
          .filter(line => line.trim())
          .map(line => JSON.parse(line));

        // Get the last assistant message
        const lastEntry = transcript.slice(-20).reverse()
          .find(entry => entry.message?.role === 'assistant');
        const lastText = lastEntry?.message?.content
          ?.find(c => c.type === 'text')?.text || '';

        // Check for question in the same response - don't play completion sound
        const lastTool = lastEntry?.message?.content
          ?.find(c => c.type === 'tool_use')?.name || '';

        if (lastTool === 'AskUserQuestion') {
          log('Skipping completion sound (question was asked)');
          return null; // Don't play any sound
        }

        // Check for error indicators - only at the START of the message (first 300 chars)
        // and only for actual failure statements, not just mentions of problems
        const messageStart = lastText.slice(0, 300).toLowerCase();
        const hasActualError =
          /^(i'm sorry,? (but )?i (couldn't|wasn't able|failed|can't))/i.test(messageStart) ||
          /^unfortunately,? i (couldn't|wasn't able|failed|can't)/i.test(messageStart) ||
          /the .{1,30} (failed|didn't work|couldn't be)/i.test(messageStart) ||
          /\b(failed with|error:|fatal|exception|crashed)\b/i.test(messageStart);

        if (hasActualError) {
          return 'completion-error';
        }
      } catch (e) {
        log(`Error reading transcript: ${e.message}`);
      }
    }
    return 'completion-success';
  }

  return null;
}

// Main
(async () => {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.error('Usage: play-sound.js <hook-type> [hook-data-json]');
    console.error('Hook types: submit, notification, question, stop');
    process.exit(1);
  }

  const hookType = args[0];
  let hookData = {};

  // Read stdin if available (for hook data)
  if (!process.stdin.isTTY) {
    const chunks = [];
    for await (const chunk of process.stdin) {
      chunks.push(chunk);
    }
    const input = Buffer.concat(chunks).toString();
    if (input.trim()) {
      try {
        hookData = JSON.parse(input);
      } catch (e) {
        log(`Error parsing hook data: ${e.message}`);
      }
    }
  }

  const soundId = await determineSound(hookType, hookData);

  if (soundId) {
    playSound(soundId);
  } else {
    log(`No sound to play for ${hookType}`);
  }
})();
