# Claude Boops 🔔

WARNING: this project was 100% vibe coded, I never checked it. Use at your own peril

Gentle audio notifications for Claude Code. Get instant audio feedback when Claude finishes processing or needs your input - without intrusive popups.

## Features

- 🎵 **Instant feedback** - Hear when Claude is done processing (no more wondering if it's still thinking)
- 🔔 **Distinctive sounds** - Different tones for different events
- 🎯 **Non-intrusive** - Just audio, no popup notifications or visible messages
- 🎨 **Custom sounds** - Specially designed gentle tones that won't annoy you
- ⚡ **Zero latency** - Stop hook fires immediately when responses complete
- 🔇 **Silent execution** - Uses local hooks to avoid cluttering your terminal with "hook succeeded" messages

## Sounds

- **Default sound** (single gentle tone) - Plays when Claude finishes any response
- **Question sound** (rising two-tone) - Plays when Claude needs your input (with ~5-10s delay due to Claude Code notification timing)

## Installation

### From GitHub

```bash
# Add the plugin marketplace
claude plugin marketplace add towc/claude-boops

# Install the plugin
claude plugin install claude-boops@towc-claude-boops

# Run the setup script to configure hooks
CLAUDE_PLUGIN_ROOT=~/.claude/plugins/claude-boops ~/.claude/plugins/claude-boops/scripts/setup-hooks.sh

# Restart Claude Code
```

### Local Installation (for development or testing)

```bash
# Clone the repo
git clone https://github.com/towc/claude-boops.git
cd claude-boops

# Install the plugin from local directory
claude plugin marketplace add $PWD
claude plugin install claude-boops@claude-boops-dev

# Run the setup script to configure hooks
CLAUDE_PLUGIN_ROOT=$PWD ./scripts/setup-hooks.sh

# Restart Claude Code
```

### Uninstalling

To remove the hooks:

```bash
# For GitHub installation
~/.claude/plugins/claude-boops/scripts/uninstall-hooks.sh

# For local installation (from the repo directory)
./scripts/uninstall-hooks.sh

# Then uninstall the plugin
claude plugin uninstall claude-boops
```

## Requirements

- **Linux/Unix**: Requires `paplay` (PulseAudio)
- **macOS**: Need to modify hooks to use `afplay` instead of `paplay`
- **Windows**: Need to modify hooks to use appropriate audio player

## Customization

### Adjust Volume

Edit `~/.claude/settings.json` and add volume control to the paplay commands:

```json
"command": "/path/to/plugin/scripts/play-sound.sh /path/to/plugin/sounds/default.wav --volume=32768"
```

Or modify `scripts/play-sound.sh` to always use a specific volume:

```bash
paplay --volume=32768 "$1" </dev/null >/dev/null 2>&1 &
```

(Volume range: 0-65536, default is 65536)

### Use Different Sounds

Replace the `.wav` files in the plugin's `sounds/` directory with your own. Sound files should be short (< 0.5s) for best experience.

### Regenerate Sounds

```bash
cd sounds
node generate-sounds.js
```

Edit `generate-sounds.js` to customize frequencies and durations.

### Add More Sound Triggers

Edit `~/.claude/settings.json` to add hooks for other events. For example, to add an error sound:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "",
        "hooks": [
          {
            "type": "command",
            "command": "/path/to/plugin/scripts/play-sound.sh /path/to/plugin/sounds/error.wav"
          }
        ]
      }
    ]
  }
}
```

See [Claude Code hooks documentation](https://docs.claude.com/en/docs/claude-code/hooks-guide) for more hook types and options.

## How It Works

The plugin provides sound files and a setup script that configures [local hooks](https://docs.claude.com/en/docs/claude-code/hooks-guide) in your `~/.claude/settings.json`:

- **Stop hook**: Fires when Claude finishes responding (instant)
- **Notification hook**: Fires when Claude Code sends notifications (delayed due to internal batching)

By using local hooks instead of plugin hooks, the sounds play silently without cluttering your terminal with "hook succeeded" messages.

No MCP servers, no external dependencies beyond audio playback - just simple, reliable hooks.

## Troubleshooting

### No sound playing

1. Check `paplay` is installed: `paplay --version`
2. Test sound directly: `paplay /path/to/plugin/sounds/default.wav`
3. Verify hooks are configured: `cat ~/.claude/settings.json` and look for the `hooks` section
4. Check the setup script ran successfully - you should see Stop and Notification hooks in your settings
5. Make sure you restarted Claude Code after running the setup script

### Sounds too quiet/loud

Adjust volume in `scripts/play-sound.sh` (see Customization section)

### Want different audio player

Edit `scripts/play-sound.sh` and replace `paplay` with your preferred audio command:
- macOS: `afplay "$1" </dev/null >/dev/null 2>&1 &`
- Windows: `powershell -c "(New-Object Media.SoundPlayer '$1').PlaySync()" </dev/null >/dev/null 2>&1 &`

### Seeing "hook succeeded" messages

If you're seeing visible hook execution messages, the hooks may have been configured as plugin hooks instead of local hooks. Run the uninstall script and then the setup script again to ensure they're configured as local hooks in `~/.claude/settings.json`.

## Contributing

Contributions welcome! Feel free to:
- Add support for other platforms
- Create alternative sound packs
- Improve the sound generation
- Add more hook examples

## License

MIT License - see LICENSE file

## Credits

Created during a collaborative session between a human and Claude, solving the problem of knowing when Claude Code is done processing without having to constantly watch the terminal.

"Boops" because these gentle notification sounds are like friendly little boops to let you know something happened. 🔔
