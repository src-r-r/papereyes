# Paper4Eyes

Firefox browser extension that applies a subtle paper texture overlay to web pages for a more comfortable reading experience.

## Installation

1. Open Firefox and navigate to `about:debugging`
2. Click **This Firefox** > **Load Temporary Add-on**
3. Select any file in this project (e.g., `manifest.json`)

## Usage

- Click the extension icon to open the popup
- Toggle the paper texture on/off for the current domain
- Adjust **Intensity** (noise opacity) and **Grain Size** (blur radius)
- Choose a **Blend Mode** to change how the texture interacts with page colors:
  - **Multiply** - works on both light and dark backgrounds
  - **Overlay** - enhances contrast
  - **Soft Light** - gentle, natural paper feel
  - **Screen** - brightens, good for dark pages
  - **Color Dodge** - strong brightening effect
  - **Hard Light** - bold, high-contrast blend

## Development

```bash
npm install
npm test           # Run unit tests
npm run lint       # Check code style
npm run lint:fix   # Auto-fix code style
npm run format     # Format with Prettier
```

## Project Structure

```
paper4eyes/
├── manifest.json              # WebExtensions Manifest V3
├── src/
│   ├── background/
│   │   └── background.js      # Seed default settings on install
│   ├── content/
│   │   └── content.js         # Inject overlay canvas into pages
│   ├── popup/
│   │   ├── popup.html         # Extension popup UI
│   │   └── popup.js           # Popup controller
│   ├── options/
│   │   ├── options.html       # Settings page
│   │   └── options.js         # Options page controller
│   ├── lib/
│   │   └── noise.js           # Pure noise generation utilities (UMD)
│   └── icons/
└── tests/
    └── noise.test.js          # Unit tests for noise.js
```

## License

MIT
