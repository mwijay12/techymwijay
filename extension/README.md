# Mwijay Tech — Browser Extension

A Manifest V3 extension for Chrome and compatible Chromium browsers. The extension provides Swahili/English dictation, read-aloud, quick text clips, and an optional local vault.

## Features

- **Voice dictation:** use the toolbar popup or `Alt+M` (`Command+Shift+M` on macOS). On webpages, focus an editable field and use the injected microphone or shortcut; review the transcript and choose **Insert Text** to add it at the caret.
- **Read aloud:** select text, then use the right-click menu. Browser speech voices and languages vary by platform.
- **Local vault and clips:** save items from the popup or a page selection. Items stay in this browser profile using `chrome.storage.local`; they are **not encrypted and are not synced to an account or cloud**. Do not use this as a password manager for sensitive credentials.
- **Text to speech:** use a local browser voice, or request online speech from the Mwijay Tech web service. Online synthesis requires internet access and is separate from local vault storage.
- **Quick links:** open the web app or Chrome side panel from the popup.

Speech recognition and synthesis are supplied by the browser/operating system. Language support, microphone prompts, and online recognition availability differ between browsers. The microphone permission page only asks for access after the user presses its button.

## Install for development

1. Open `chrome://extensions` (or `edge://extensions`).
2. Enable **Developer mode**.
3. Choose **Load unpacked** and select this `extension/` folder.
4. Pin **Mwijay Tech — Voice Studio & Local Vault** to the toolbar.

After changing extension files, reload the extension from the extensions page.

## Privacy and permissions

- The extension runs a content script on webpages to provide the optional inline microphone and dictation shortcut. The browser therefore requests broad webpage access.
- Vault data and unsent dictation drafts use extension-local storage. The extension does not upload saved vault items or snippets.
- The extension requests access to `techymwijay.vercel.app` only for online TTS. Entered speech text is sent to that service when **Online voice** is selected; choose **Device voice** to keep synthesis local.
- Removing the extension or clearing extension data removes locally stored items. Export/restore and encryption are not currently available.

## Shortcuts

- `Alt+M` (macOS: `Command+Shift+M`): start/stop dictation in the focused editable field.
- Right-click a selection for **Save selection**, **Save as web clip**, or **Read aloud**.

Built by Davie Mwijay — Dar es Salaam, Tanzania.
