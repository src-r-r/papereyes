# Development

## Setup

```bash
npm install
```

## Commands

| Command | Description |
|---|---|
| `npm test` | Run unit tests |
| `npm run lint` | Check code style |
| `npm run lint:fix` | Auto-fix code style |
| `npm run format` | Format with Prettier |
| `npm run package` | Build `.xpi` for AMO submission |

## Loading in Firefox (Development)

1. Open Firefox and navigate to `about:debugging`
2. Click **This Firefox** > **Load Temporary Add-on**
3. Select any file in this project (e.g., `manifest.json`)

## Project Structure

```
papereyes/
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
├── tests/
│   └── noise.test.js          # Unit tests for noise.js
├── privacy-policy.md          # Privacy policy for AMO
└── DEVELOPMENT.md             # This file
```

## Publishing to AMO

1. Run `npm run package` to generate `dist/papereyes.xpi`
2. Go to [Mozilla Add-ons Developer Hub](https://addons.mozilla.org/developers/)
3. Submit the `.xpi` file
4. Ensure the following are set on the AMO listing page:
   - Summary description
   - Full description
   - Privacy policy URL
   - Promotional screenshot (640x400 minimum)

## License

MIT
