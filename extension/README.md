# Whispers – Chrome Extension

Load the built extension in Chrome:

1. Run `npm run build:extension` from the project root.
2. Open `chrome://extensions`.
3. Enable **Developer mode** (top right).
4. Click **Load unpacked** and select the `extension/dist` folder.

## Backend (API)

The extension UI talks to your chat API. You must either:

- **Option A – Same-origin dev:** Run the full app (`npm run dev`) and use the extension while the dev server is running. Set the API base when building:
  ```bash
  VITE_API_BASE_URL=http://localhost:5000 npm run build:extension
  ```
  (Use the port your Express server uses.)

- **Option B – Netlify (recommended):** Deploy this repo to Netlify; the serverless API runs under `/api/*`. Then build the extension with your Netlify site URL:
  ```bash
  VITE_API_BASE_URL=https://your-site.netlify.app npm run build:extension
  ```

Without `VITE_API_BASE_URL`, the extension will send requests to the same origin as the popup (`chrome-extension://...`), which will not reach your server.

## Current tab URL

The popup uses the **current tab’s URL** as the chat context (`pageUrl`). If no tab is available, it falls back to `https://objkt.com/general-chat`.
