# Tezos Chat (Objkt Chat)

Chat for [objkt.com](https://objkt.com) token and collection pages. Anyone can view and post; the **token/collection creator** has admin privileges (delete messages) for that page’s chat.

- **Chrome extension**: popup chat tied to the current tab URL.
- **Backend**: Netlify Functions + Postgres (GitHub → Netlify).
- **Creator = admin**: creator wallet is resolved via [objkt.com Data API](https://data.objkt.com/docs/) from the page URL.

**Repo**: [github.com/Paulwhoisaghostnet/whispers](https://github.com/Paulwhoisaghostnet/whispers)

**CI**: To enable GitHub Actions (build on push/PR), add the workflow file from `.github/workflows/ci.yml` in this repo (e.g. via GitHub UI or a push with a token that has `workflow` scope).

## Quick start

1. **Database**  
   Create a Postgres DB (e.g. [Neon](https://neon.tech) or [Supabase](https://supabase.com)). Set `DATABASE_URL` in your environment.

2. **Schema**  
   From the project root:
   ```bash
   npm install
   DATABASE_URL="postgresql://..." npm run db:push
   ```

3. **Deploy backend (Netlify)**  
   - Connect the repo to Netlify.
   - Build command: `npm run build:netlify`
   - Publish directory: `dist/public`
   - Functions: `netlify/functions`
   - In Netlify **Site settings → Environment variables**, add `DATABASE_URL`.

4. **Extension**  
   Build the extension with your Netlify site URL as the API base:
   ```bash
   VITE_API_BASE_URL=https://your-site.netlify.app npm run build:extension
   ```
   Then load `extension/dist` in Chrome as an unpacked extension (see [extension/README.md](extension/README.md)).

## Local dev

- **Full stack (Express + Vite)**  
  ```bash
  DATABASE_URL="postgresql://..." npm run dev
  ```
  App and API at the port shown (e.g. 5000).

- **Extension against local API**  
  ```bash
  VITE_API_BASE_URL=http://localhost:5000 npm run build:extension
  ```
  Load `extension/dist` in Chrome; ensure the dev server is running.

## API (Netlify Functions)

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/messages?pageUrl=...` | List messages for a page |
| POST | `/api/messages` | Create message (body: `content`, `pageUrl`, `walletAddress`) |
| DELETE | `/api/messages/:id` | Delete message (creator only; header `X-Wallet-Address`) |
| GET | `/api/creator?pageUrl=...` | Get creator address for the page (for admin UI) |

## Project layout

- `client/` – React + Vite UI (used by extension and optional web deploy).
- `server/` – Express app (local dev only; not used on Netlify).
- `netlify/functions/` – Serverless handlers (messages, creator) for Netlify.
- `shared/` – Schema, API route types, creator resolution (objkt.com).
- `extension/` – Chrome extension manifest and build output.

## Environment

See [.env.example](.env.example). Required for the API:

- **DATABASE_URL** – Postgres connection string (serverless-friendly DB recommended for Netlify).

Optional for extension build:

- **VITE_API_BASE_URL** – Backend base URL (e.g. your Netlify site).
