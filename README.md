# 🔊 Claude Boops

Sound notifications for [Claude Code](https://claude.com/claude-code) - Get audio feedback for different interaction events!

## ⚠️ Warning

**This project was entirely vibecoded with Claude and is provided as-is.** Use at your own risk!

- All code was generated through conversational AI development
- No formal testing or QA process
- May contain bugs, security issues, or unexpected behavior
- Modifies your Claude Code settings.json (backups are created)
- Runs a local server on port 8765

**If you encounter issues:** Check `/tmp/claude-sound.log` or open an issue on GitHub.

## Features

- 🎵 **6 Different Sounds** for different events (submit, question, permission, success, error, answer)
- ⚡ **Dynamic Sound Generation** - sounds generated on-the-fly from config.json
- 🎨 **Interactive Visual Editor** with drag-to-edit interface (optional)
- 📊 **Logarithmic Frequency Control** for better precision
- 🔒 **Directional Drag Locking** prevents accidental changes
- 💾 **Auto-save** changes persist automatically
- 🎧 **Custom Sound Files** - optionally use your own audio files
- 🧠 **Smart Detection** - different sounds for success vs error completions, skips redundant sounds

## Quick Start

### Easy Installation (Recommended)

Install as a Claude Code plugin:

```bash
# Add the marketplace
/plugin marketplace add towc/claude-boops

# Install the plugin (automatically enabled)
/plugin install claude-boops
```

Then restart Claude Code!

### Manual Installation (Alternative)

If you prefer manual installation:

```bash
git clone https://github.com/towc/claude-boops.git ~/.claude/boops
~/.claude/boops/setup.sh
```

Then restart Claude Code!

The plugin works immediately after installation - sounds are generated dynamically from config.json. You can customize the sounds by editing config.json directly or using the visual editor (see Customizing Sounds section).

## Sounds

| Event | Config ID | Description |
|-------|-----------|-------------|
| User Submit | `user-submit` | When you press enter |
| Answer Submit | `answer-submit` | When you answer a question or grant permission |
| Permission Needed | `permission-needed` | When permission prompts appear |
| Question | `question` | Multiple choice questions |
| Success | `completion-success` | Normal completions (skipped if a question was asked) |
| Error | `completion-error` | Errors/failures |

## Customizing Sounds

Sounds are generated dynamically from `config.json` - changes take effect immediately after restarting Claude Code!

### Option 1: Edit config.json Directly

Edit `config.json` in the plugin directory. Each sound has:
- `tones`: Array of tone objects with `freq` (Hz), `duration` (seconds), `volume` (0-1), and `silent` (boolean)
- `filepath` (optional): Path to a custom sound file to use instead of generating tones

Example with custom file:
```json
{
  "user-submit": {
    "name": "User Submit",
    "description": "When you press enter",
    "filepath": "/path/to/my-sound.wav"
  }
}
```

Example with generated tones:
```json
{
  "user-submit": {
    "name": "User Submit",
    "description": "When you press enter",
    "tones": [
      { "freq": 340, "duration": 0.09, "volume": 0.25, "silent": false }
    ]
  }
}
```

### Option 2: Visual Editor (Optional)

Use the interactive visual editor to design sounds:

**If installed as a plugin:** Type `/settings` in Claude Code for instructions

**If installed manually:** Run `~/.claude/boops/settings.sh`

This will:
1. Start the sound server
2. Open the editor in your browser

**Using the Editor:**
- **Drag vertically** to change frequency (pitch) - uses logarithmic scale for better low-frequency control
- **Drag horizontally** to change duration (length)
- Direction automatically locks after initial movement
- **Click/release** on a bar to preview the sound
- **Changes auto-save** to config.json and take effect after restarting Claude Code

The editor shows:
- Grid lines for frequency (200, 500, 1000, 2000 Hz)
- Grid lines for time (100ms intervals)
- Color-coded bars (color indicates frequency)
- Frequency and duration labels on each tone

## Sharing Configurations

Share your `config.json` file with friends! It contains all the tone parameters (frequency, duration, volume) for each sound.

To use someone else's config:
1. Copy their `config.json` to the plugin directory
2. Restart Claude Code

## How It Works

Claude Boops uses [Claude Code's hooks system](https://docs.claude.com/en/docs/claude-code/hooks) to trigger sounds at specific events:

- **UserPromptSubmit** - Detects if you're submitting a regular prompt or answering a question
- **Notification** - Plays sound for permission prompts
- **Stop** - Analyzes transcript to determine success vs error sounds (skips if a question was just asked)
- **PreToolUse** (AskUserQuestion) - Plays sound for multiple choice questions

The `play-sound.js` script:
1. Parses Claude's JSONL transcript format to intelligently select the appropriate sound
2. Generates WAV data on-the-fly from config.json (or uses a custom file if specified)
3. Plays the sound via `paplay` with exclusive playback (stops any currently playing sound)
4. Automatically cleans up temporary files

## Requirements

- [Claude Code](https://claude.com/claude-code) installed
- Node.js (for sound generation and playback logic)
- A sound player: `paplay` (or `aplay`)

## File Structure

```
claude-boops/
├── .claude-plugin/
│   ├── plugin.json            # Plugin metadata
│   └── marketplace.json       # Marketplace listing
├── commands/
│   └── settings.md            # /settings command for customization
├── hooks/
│   └── hooks.json             # Hook definitions (auto-installed)
├── README.md                  # This file
├── setup.sh                   # Manual installation script
├── settings.sh                # Opens editor and starts server
├── config.json                # Sound configuration
├── sound-tuner.html           # Visual editor
├── sound-server.js            # Backend for generating WAVs
├── smart-submit.sh            # Detects question answers
├── smart-notification.sh      # Handles permission prompts
├── smart-stop.sh              # Detects success vs error
├── play-exclusive.sh          # Plays sounds exclusively
└── *.wav                      # Pre-generated sound files
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

### If Installed as Plugin

```bash
/plugin disable claude-boops
/plugin uninstall claude-boops
```

### If Installed Manually

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
