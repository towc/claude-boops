# 🔊 Claude Boops

Sound notifications for [Claude Code](https://claude.com/claude-code) - Get audio feedback for different interaction events!

## Features

- 🎵 **6 Different Sounds** for different events (submit, question, permission, success, error, answer)
- 🎨 **Interactive Visual Editor** with drag-to-edit interface
- 📊 **Logarithmic Frequency Control** for better precision
- 🔒 **Directional Drag Locking** prevents accidental changes
- 💾 **Auto-save** changes persist automatically
- 🧠 **Smart Detection** different sounds for success vs error completions

## Quick Start

```bash
git clone https://github.com/towc/claude-boops.git ~/.claude/boops
~/.claude/boops/setup.sh
```

Then restart Claude Code!

## Sounds

| Event | Sound | Description |
|-------|-------|-------------|
| User Submit | `user-submit.wav` | When you press enter |
| Answer Submit | `answer-submit.wav` | When you answer a question or grant permission |
| Permission Needed | `permission-needed.wav` | When permission prompts appear |
| Question | `question.wav` | Multiple choice questions |
| Success | `completion-success.wav` | Normal completions |
| Error | `completion-error.wav` | Errors/failures |

## Customizing Sounds

Edit your sounds with the visual interface:

```bash
~/.claude/boops/settings.sh
```

This will:
1. Start the sound server
2. Open the editor in your browser

### Using the Editor

- **Drag vertically** to change frequency (pitch) - uses logarithmic scale for better low-frequency control
- **Drag horizontally** to change duration (length)
- Direction automatically locks after initial movement
- **Click/release** on a bar to preview the sound
- **Changes auto-save** to config.json
- Click **"Generate Sound Files"** to create WAV files from your config

The editor shows:
- Grid lines for frequency (200, 500, 1000, 2000 Hz)
- Grid lines for time (100ms intervals)
- Color-coded bars (color indicates frequency)
- Frequency and duration labels on each tone

## Sharing Configurations

Share your `config.json` file with friends! It contains all the tone parameters (frequency, duration, volume) for each sound.

To use someone else's config:
1. Copy their `config.json` to `~/.claude/boops/`
2. Run `~/.claude/boops/settings.sh`
3. Click "Generate Sound Files"

## How It Works

Claude Boops uses [Claude Code's hooks system](https://docs.claude.com/en/docs/claude-code/hooks) to trigger sounds at specific events:

- **UserPromptSubmit** - Detects if you're submitting a regular prompt or answering a question
- **Notification** - Plays sound for permission prompts
- **Stop** - Analyzes transcript to determine success vs error sounds
- **PreToolUse** (AskUserQuestion) - Plays sound for multiple choice questions

The bash scripts use `jq` to parse Claude's JSONL transcript format and intelligently select the appropriate sound.

## Requirements

- [Claude Code](https://claude.com/claude-code) installed
- Node.js (for sound generation)
- `jq` (for JSON parsing in bash scripts)
- A sound player: `paplay`, `aplay`, or similar

## File Structure

```
~/.claude/boops/
├── README.md                  # This file
├── setup.sh                   # Installation script
├── settings.sh                # Opens editor and starts server
├── config.json                # Sound configuration
├── sound-tuner.html           # Visual editor
├── sound-server.js            # Backend for generating WAVs
├── smart-submit.sh            # Detects question answers
├── smart-notification.sh      # Handles permission prompts
├── smart-stop.sh              # Detects success vs error
├── play-exclusive.sh          # Plays sounds exclusively
└── *.wav                      # Generated sound files
```

## Troubleshooting

**No sounds playing?**
- Check hooks are installed: `cat ~/.claude/settings.json | jq .hooks`
- Verify scripts are executable: `ls -la ~/.claude/boops/*.sh`
- Check logs: `tail -f /tmp/claude-sound.log`

**Sound server won't start?**
- Make sure port 8765 is available: `lsof -i :8765`
- Check Node.js is installed: `node --version`

**Sounds not saving?**
- Ensure sound-server.js is running
- Check browser console (F12) for errors
- Verify you clicked "Generate Sound Files" button

## Uninstall

```bash
# Remove hooks from settings
jq 'del(.hooks)' ~/.claude/settings.json > ~/.claude/settings.json.tmp
mv ~/.claude/settings.json.tmp ~/.claude/settings.json

# Remove files
rm -rf ~/.claude/boops
```

## Contributing

Pull requests welcome! Some ideas:
- More sound presets
- Volume control in UI
- Waveform preview
- Export/import sound packs

## License

MIT

## Credits

Created for [Claude Code](https://claude.com/claude-code) users who like a little extra feedback 🔊
