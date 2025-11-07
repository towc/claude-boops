# Sharing Sound Presets

The Claude Boops sound tuner supports custom presets that can be easily shared with others!

## How to Create Your Own Preset

1. Open the sound tuner (`/claude-boops:settings`)
2. Select a preset as a starting point or use "Custom"
3. Edit the sounds to your liking
4. Copy the `config.json` file from `~/.claude/plugins/marketplaces/claude-boops-marketplace/config.json`

## Preset Format

Presets are defined in the `_presets` section of `config.json`. Here's the structure:

```json
{
  "_presets": {
    "your-preset-name": {
      "name": "Display Name",
      "description": "Short description of the preset",
      "sounds": {
        "user-submit": {
          "tones": [
            {"freq": 440, "start": 0, "duration": 0.1, "volume": 0.25}
          ]
        },
        "permission-needed": {
          "tones": [...]
        },
        "question": {
          "tones": [...]
        },
        "completion-normal": {
          "tones": [...]
        },
        "completion-success": {
          "tones": [...]
        },
        "completion-error": {
          "tones": [...]
        }
      }
    }
  }
}
```

### Tone Parameters

- **freq**: Frequency in Hz (20-20000, but 200-2000 is most audible)
- **start**: Start time in seconds (allows overlapping/simultaneous tones)
- **duration**: Length in seconds (0.03-0.5 recommended)
- **volume**: Volume level (0.0-1.0, but 0.15-0.4 recommended)

## Example: Creating a "Space" Preset

```json
{
  "_presets": {
    "space": {
      "name": "Space",
      "description": "Sci-fi futuristic sounds",
      "sounds": {
        "user-submit": {
          "tones": [
            {"freq": 880, "start": 0, "duration": 0.05, "volume": 0.2},
            {"freq": 1760, "start": 0, "duration": 0.05, "volume": 0.15}
          ]
        },
        "permission-needed": {
          "tones": [
            {"freq": 1047, "start": 0, "duration": 0.08, "volume": 0.25},
            {"freq": 784, "start": 0.08, "duration": 0.08, "volume": 0.23},
            {"freq": 587, "start": 0.16, "duration": 0.08, "volume": 0.21}
          ]
        },
        "question": {
          "tones": [
            {"freq": 587, "start": 0, "duration": 0.08, "volume": 0.25},
            {"freq": 880, "start": 0.08, "duration": 0.08, "volume": 0.25},
            {"freq": 1175, "start": 0.16, "duration": 0.1, "volume": 0.23}
          ]
        },
        "completion-normal": {
          "tones": [
            {"freq": 880, "start": 0, "duration": 0.1, "volume": 0.22},
            {"freq": 1047, "start": 0.1, "duration": 0.1, "volume": 0.2}
          ]
        },
        "completion-success": {
          "tones": [
            {"freq": 587, "start": 0, "duration": 0.08, "volume": 0.22},
            {"freq": 784, "start": 0.08, "duration": 0.08, "volume": 0.24},
            {"freq": 1047, "start": 0.16, "duration": 0.08, "volume": 0.26},
            {"freq": 1319, "start": 0.24, "duration": 0.12, "volume": 0.28}
          ]
        },
        "completion-error": {
          "tones": [
            {"freq": 740, "start": 0, "duration": 0.12, "volume": 0.32},
            {"freq": 622, "start": 0.12, "duration": 0.14, "volume": 0.34}
          ]
        }
      }
    }
  }
}
```

## Sharing Your Preset

To share your preset with others:

1. Copy just your preset entry from the `_presets` section
2. Share it as a JSON snippet
3. Others can add it to their `config.json` file

Example share format:
```json
// Add this to your config.json "_presets" section:
"your-preset-name": {
  "name": "Display Name",
  "description": "Description",
  "sounds": { ... }
}
```

## Tips for Good Presets

- **Keep it subtle**: Volumes between 0.15-0.35 work best
- **Stay audible**: Frequencies 200-2000 Hz are clearest
- **Be distinct**: Each sound category should be recognizable
- **Test with simulator**: Use the demo to ensure sounds are distinguishable
- **Consider context**: Think about coding environments (quiet office vs home)

## Musical Theory Tips

- **Ascending = Positive**: Questions, success sounds go up in pitch
- **Descending = Negative**: Errors, warnings go down in pitch
- **Use intervals**: Major third (+4 semitones), Perfect fifth (+7 semitones)
- **Natural notes**: Stick to C, D, E, F, G, A, B for harmony
- **Avoid dissonance**: Unless you want harsh error sounds!

## Preset Philosophy Examples

- **Retro**: 8-bit video game (high freq, short duration, chiptune-like)
- **Professional**: Corporate (low-mid freq, neutral, unobtrusive)
- **Zen**: Meditation bells (long sustain, low volume, peaceful)
- **Chirpy**: Bird sounds (very high freq, ultra-short, nature-inspired)
- **Bass**: Deep rumbles (very low freq, long duration, tactile)

Happy sound designing! 🔊
