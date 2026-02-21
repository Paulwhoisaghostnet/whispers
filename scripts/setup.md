# One-time setup (then push to GitHub)

Run these once before or after pushing to GitHub.

## 1. Database

Create a Postgres database (e.g. [Neon](https://neon.tech) or [Supabase](https://supabase.com)), then:

```bash
cp .env.example .env
# Edit .env and set DATABASE_URL

npm install
npm run db:push
```

## 2. Netlify

- In [Netlify](https://app.netlify.com): **Add new site → Import from Git** and choose `Paulwhoisaghostnet/whispers`.
- Build command: `npm run build:netlify`
- Publish directory: `dist/public`
- Functions directory: `netlify/functions` (auto-detected from `netlify.toml`)
- **Site settings → Environment variables**: add `DATABASE_URL` (your Postgres URL).

After the first deploy, your API base URL is `https://<your-site-name>.netlify.app`.

## 3. Extension (optional)

Build the extension with your Netlify URL and load it in Chrome:

```bash
VITE_API_BASE_URL=https://YOUR-SITE.netlify.app npm run build:extension
```

Then in Chrome: `chrome://extensions` → Load unpacked → select `extension/dist`.
