---
description: Patch the Claude binary to hide "hook succeeded" messages
---

Patching Claude to hide "hook succeeded" messages...

This will:
1. Find the Claude executable (resolving any symlinks)
2. Create a backup file (e.g., claude.bak.js)
3. Patch the code to suppress "hook succeeded" output
4. Show you how to revert the change if needed

The script will automatically detect if sudo is required.

```bash
${CLAUDE_PLUGIN_ROOT}/hide-hooks.js
```
