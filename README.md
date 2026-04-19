# Slack Deep Link

Slack Deep Link is an Obsidian plugin that automatically converts Slack URLs into deep links that open directly in the Slack desktop app when pasted into a note.

When you copy a message link from Slack and paste it into Obsidian, the plugin converts the `https://...slack.com/...` URL into a `slack://...` deep link wrapped in Markdown link syntax. You can also paste the original HTTPS URL as a plain Markdown link using the shift paste shortcut.

## Installation

This plugin is not yet available in the Obsidian community plugin browser. Install it manually using [BRAT](https://github.com/TfTHacker/obsidian42-brat).

1. Install the BRAT plugin from the Obsidian community plugins browser
2. Open BRAT settings and click **Add Beta Plugin**
3. Enter `https://github.com/HeRoMo/obsidian-slack-deep-link` and click **Add Plugin**
4. Enable **Slack Deep Link** in Settings > Community Plugins

## How to use

### Setup

Before using the plugin, register your Slack workspace(s) in Settings > Slack Deep Link.

| Field | Description |
|-------|-------------|
| Domain | Your workspace domain, e.g. `example.slack.com` |
| Team ID | Your workspace Team ID, e.g. `TXXXXXXXXX` |

You can add multiple workspaces. The Team ID can be found in your Slack workspace URL or admin settings.

### Pasting Slack links

Copy a message link in Slack via **Copy link** and paste it into an Obsidian note.

| Shortcut | Slack URL | Other |
|----------|-----------|-------|
| `Cmd+V` / `Ctrl+V` | `[slack app](slack://...)` — opens in Slack desktop app | Default paste |
| `Cmd+Shift+V` / `Ctrl+Shift+V` | `[slack](https://...)` — plain HTTPS link | Default paste |

If text is selected when you paste, the selected text is used as the link label instead of the default.

### Using with Auto Link Title

If you have the [Auto Link Title](https://github.com/zolrath/obsidian-auto-link-title) plugin installed, `Cmd+Shift+V` / `Ctrl+Shift+V` may conflict. To resolve this, go to Settings > Hotkeys and clear the hotkey assigned to Auto Link Title's **Normal paste** command, then assign it to Slack Deep Link's **Paste Slack link as plain URL** command.

`Cmd+V` / `Ctrl+V` works with Auto Link Title without any configuration.
