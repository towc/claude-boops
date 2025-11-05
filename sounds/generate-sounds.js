const fs = require('fs');
const path = require('path');

// Simple WAV file generator
function generateWAV(frequencies, durations, sampleRate = 44100) {
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
  buffer.writeUInt32LE(16, 16); // fmt chunk size
  buffer.writeUInt16LE(1, 20); // audio format (PCM)
  buffer.writeUInt16LE(channels, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * channels * bitsPerSample / 8, 28); // byte rate
  buffer.writeUInt16LE(channels * bitsPerSample / 8, 32); // block align
  buffer.writeUInt16LE(bitsPerSample, 34);
  buffer.write('data', 36);
  buffer.writeUInt32LE(totalSamples * 2, 40);

  // Generate audio samples
  let offset = 44;
  let globalSample = 0;

  for (let toneIdx = 0; toneIdx < frequencies.length; toneIdx++) {
    const freq = frequencies[toneIdx];
    const duration = durations[toneIdx];
    const samples = Math.floor(sampleRate * duration);
    const fadeInSamples = Math.min(samples * 0.1, 500);
    const fadeOutSamples = Math.min(samples * 0.1, 500);

    for (let i = 0; i < samples; i++) {
      const t = globalSample / sampleRate;
      let amplitude = 0.3;

      // Fade in/out for smoother sound
      if (i < fadeInSamples) {
        amplitude *= i / fadeInSamples;
      } else if (i > samples - fadeOutSamples) {
        amplitude *= (samples - i) / fadeOutSamples;
      }

      const sample = Math.sin(2 * Math.PI * freq * t) * amplitude * 32767;
      buffer.writeInt16LE(Math.round(sample), offset);
      offset += 2;
      globalSample++;
    }
  }

  return buffer;
}

// Claude-specific sound themes - gentle, short, distinctive
const sounds = {
  'question.wav': {
    frequencies: [600, 800], // Rising tone: "hey?"
    durations: [0.08, 0.08]
  },
  'error.wav': {
    frequencies: [700, 500], // Quick descending: subtle error
    durations: [0.06, 0.1]
  },
  'success.wav': {
    frequencies: [500, 650, 800], // Pleasant ascending: "done!"
    durations: [0.07, 0.07, 0.1]
  },
  'default.wav': {
    frequencies: [650], // Single gentle tone
    durations: [0.12]
  }
};

// Generate all sounds
for (const [filename, { frequencies, durations }] of Object.entries(sounds)) {
  const wav = generateWAV(frequencies, durations);
  const filepath = path.join(__dirname, filename);
  fs.writeFileSync(filepath, wav);
  console.log(`Generated ${filename}`);
}

console.log('All Claude sounds generated successfully!');
