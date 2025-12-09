# CircleCI ANSI Colors

A browser extension that adds ANSI color support to CircleCI's Tests tab terminal output.

## Features

- Renders ANSI color codes in CircleCI's Tests tab
- Supports standard colors (30-37, 90-97) and background colors
- Supports bold, italic, underline, and dim text styles
- Works with pytest, tracing, and other colored terminal output

## Installation

### Chrome / Chromium

1. Open `chrome://extensions`
2. Enable **Developer mode** (toggle in top right)
3. Click **Load unpacked**
4. Select this folder

### Firefox

1. Open `about:debugging#/runtime/this-firefox`
2. Click **Load Temporary Add-on**
3. Select `manifest.json` from this folder

> Note: For permanent Firefox installation, the extension needs to be signed by Mozilla.

## How It Works

CircleCI escapes ANSI codes as `#x1B[32m` in their DOM. This extension:

1. Detects `<pre>` elements containing ANSI codes
2. Converts them to colored HTML using `<font>` elements
3. Uses `display:contents` CSS to prevent layout issues

## Supported ANSI Codes

| Code | Effect |
|------|--------|
| 0 | Reset |
| 1 | Bold |
| 2 | Dim |
| 3 | Italic |
| 4 | Underline |
| 30-37 | Standard foreground colors |
| 40-47 | Standard background colors |
| 90-97 | Bright foreground colors |
| 100-107 | Bright background colors |

## License

MIT
