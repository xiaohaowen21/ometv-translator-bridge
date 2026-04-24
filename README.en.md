<div align="center">
  <img src="./assets/logo.svg" alt="OmeTV Translator Bridge Logo" width="104" />
  <h1>OmeTV Translator Bridge</h1>
  <p>A browser extension prototype for translating OmeTV chats with user-provided AI APIs.</p>
  <p><a href="./README.md">简体中文</a> | <strong>English</strong></p>
  <p>
    <img src="https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?style=flat-square" alt="Chrome Manifest V3" />
    <img src="https://img.shields.io/badge/status-prototype-F59E0B?style=flat-square" alt="Prototype status" />
    <img src="https://img.shields.io/badge/testing-not%20tested%20yet-E11D48?style=flat-square" alt="Not tested yet" />
    <img src="https://img.shields.io/github/issues/xiaohaowen21/ometv-translator-bridge?style=flat-square" alt="GitHub issues" />
    <img src="https://img.shields.io/github/stars/xiaohaowen21/ometv-translator-bridge?style=flat-square" alt="GitHub stars" />
    <img src="https://img.shields.io/github/forks/xiaohaowen21/ometv-translator-bridge?style=flat-square" alt="GitHub forks" />
  </p>
</div>

---

> [!WARNING]
> This repository has not been tested in real OmeTV conversations yet.
> The current code should be treated as an early prototype rather than a production-ready extension.

## Description

`OmeTV Translator Bridge` is an open-source Chrome extension prototype designed to reduce language barriers during OmeTV text chats.

Instead of shipping a paid backend, the extension is built around user-owned configuration:

- Users provide their own `API Base URL`
- Users provide their own `API Key`
- Users choose their own compatible model
- Settings are stored locally with `chrome.storage.sync`

## What It Tries To Do

- Detect the partner's language from incoming text
- Translate incoming messages into the user's native language
- Infer the partner's language from the ongoing conversation
- Translate the user's outgoing draft before sending
- Leave room for future speech-related experiments

## Current Status

Already implemented:

- Chrome Manifest V3 extension scaffold
- Options page for API configuration
- Popup with basic readiness status
- Background service worker for OpenAI-compatible translation requests
- OmeTV page injection panel
- Incoming message observation and translation rendering
- Outgoing draft interception after partner-language detection
- API connectivity test button

Not validated yet:

- Real OmeTV DOM compatibility
- Reliable submit behavior across all input states
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

Before opening OmeTV, it is recommended to use the `Test API` button first.

## Project Structure

- `manifest.json`: extension manifest
- `src/background.js`: service worker and API bridge
- `src/content.js`: OmeTV DOM observer and translation injection logic
- `src/options.*`: settings page
- `src/popup.*`: popup UI
- `assets/logo.svg`: repository logo used by the README

## Known Limitations

- DOM targeting is still heuristic and may require selector tuning
- Host permissions are intentionally broad for OpenAI-compatible endpoints
- Error handling is still basic
- No automated tests exist yet
- No real-world OmeTV validation has been completed yet

## Roadmap

- Test against the live OmeTV interface
- Harden selectors and message classification
- Improve outgoing send compatibility
- Add provider presets and stronger configuration validation
- Explore optional speech input and playback modes
