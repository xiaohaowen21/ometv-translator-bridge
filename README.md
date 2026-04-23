<div align="center">
  <h1>OmeTV Translator Bridge</h1>
  <p>Open-source browser extension prototype for translating OmeTV chats with user-provided AI APIs.</p>
  <p><a href="./README.zh-CN.md">简体中文</a> | <strong>English</strong></p>
</div>

> [!WARNING]
> This project has not been tested in real OmeTV conversations yet.
> Treat the current implementation as an early prototype.
> Real-world DOM compatibility, message detection, submit behavior, and API compatibility may still break.

## Description

`OmeTV Translator Bridge` is a Chrome Manifest V3 extension prototype designed to help users communicate on OmeTV when they speak different languages.

This project is built for open-source use:

- It does not include any built-in paid API service.
- Every user is expected to provide their own API key, base URL, and model.
- Settings are stored locally with `chrome.storage.sync`.

## Current Scope

- Detect the language of the partner's incoming text automatically
- Translate incoming text into the user's native language
- Infer the partner's language from the conversation
- Translate the user's outgoing draft into the partner's language before sending
- Keep the structure open for future speech-related experiments

## Implemented

- Chrome MV3 extension scaffold
- Options page for API configuration
- Popup with basic readiness status
- Background service worker for OpenAI-compatible translation requests
- OmeTV page injection panel
- Incoming message observation and translation rendering
- Outgoing draft interception after partner-language detection
- API connectivity test button in settings

## Not Tested Yet

- Real OmeTV page compatibility
- Real submit behavior across different input states
- Stability of partner-language inference
- Long-session reliability
- Speech input and speech playback routing

## Quick Start

1. Open `chrome://extensions`
2. Enable Developer Mode
3. Click `Load unpacked`
4. Select this repository folder

## Configuration

Open the extension settings page and fill in:

- `API Base URL`
- `API Key`
- `Model`
- `Your native language`

Use the `Test API` button before opening OmeTV whenever possible.

## Project Structure

- `manifest.json`: extension manifest
- `src/background.js`: service worker and API bridge
- `src/content.js`: OmeTV DOM observer and translation injection logic
- `src/options.*`: settings page
- `src/popup.*`: popup UI

## Known Limitations

- DOM targeting is still heuristic and may require selector tuning
- Broad host permissions are currently enabled for OpenAI-compatible endpoints
- Error handling is still basic
- No automated tests exist yet
- No real-world OmeTV validation has been completed yet

## Roadmap

- Test against the live OmeTV interface
- Harden selectors and message classification
- Improve outgoing send compatibility
- Add provider presets and stronger configuration validation
- Explore optional speech input and playback modes
