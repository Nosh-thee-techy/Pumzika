# Deployment Guide

How to deploy Pumzika to production — Vercel, Netlify, or any static host.

---

## Important: what gets deployed

Pumzika deploys as a **static site**. This includes:

| Included in deployment | NOT deployed |
|---|---|
| React dashboard (HTML/JS/CSS) | Python ML models |
| Baked `forecast.json` predictions | Training CSVs |
| Listings, neighborhoods, county data | Jupyter notebook runtime |
| Client-side pricing engines | Live model API |

The ML models train locally. Their output (`forecast.json`) is committed or built before deployment.

---

## Pre-deployment checklist

```bash
# 1. Ensure ML predictions are fresh
npm run build:ml

# 2. Verify model metrics
cat src/data/model-metrics.json

# 3. Build production bundle
npm run build

# 4. Test locally
npm run preview
```

---

## Environment variables

Set these in your hosting platform **before** building:

| Variable | Required | Value |
|---|---|---|
| `VITE_MAPBOX_TOKEN` | Yes | `pk.eyJ...` (Mapbox public token) |
| `VITE_ANTHROPIC_API_KEY` | No | `sk-ant-...` (Claude API key) |

> Vite inlines `VITE_*` variables at **build time**. Changing them requires a rebuild.

---

## Vercel (recommended)

### Option A — Git integration

1. Go to https://vercel.com/new
2. Import `Nosh-thee-techy/Pumzika` from GitHub
3. Framework preset: **Vite**
4. Add environment variables:
   - `VITE_MAPBOX_TOKEN`
   - `VITE_ANTHROPIC_API_KEY` (optional)
5. Build command: `npm run build`
6. Output directory: `dist`
7. Deploy

### Option B — CLI

```bash
npm i -g vercel
vercel
# Follow prompts, set env vars when asked
vercel --prod
```

### Vercel settings

| Setting | Value |
|---|---|
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Node.js Version | 18.x or 20.x |

---

## Netlify

1. Go to https://app.netlify.com/start
2. Connect GitHub repo
3. Build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
4. Environment variables → add `VITE_MAPBOX_TOKEN` and optional `VITE_ANTHROPIC_API_KEY`
5. Deploy

Or create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "20"
```

---

## GitHub Pages

1. Install gh-pages: `npm install -D gh-pages`
2. Add to `package.json`:

```json
{
  "scripts": {
    "deploy": "npm run build && gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/Pumzika"
}
```

3. Set `base` in `vite.config.js`:

```javascript
export default defineConfig({
  base: '/Pumzika/',
  // ...
});
```

4. Run `npm run deploy`

---

## Manual static deploy

```bash
npm run build:ml
npm run build
# Upload contents of dist/ to any static file host
```

Works with: AWS S3 + CloudFront, Cloudflare Pages, Firebase Hosting, any web server.

---

## Post-deployment verification

| Check | URL | Expected |
|---|---|---|
| App loads | `/` | Onboarding form appears |
| Dashboard | `/dashboard` | Requires onboarding first |
| Map tiles | `/map` | Kenya counties visible (not grey) |
| Voice agent | `/ask` | Input field and mic button work |
| Assets load | DevTools Network tab | No 404s on JS/CSS |

---

## SPA routing

Pumzika uses client-side routing (`react-router-dom`). Configure your host to serve `index.html` for all routes:

**Vercel / Netlify:** Handled automatically.

**Nginx:**

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

**Apache (.htaccess):**

```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

---

## Updating predictions in production

When you retrain models:

```bash
npm run build:ml     # Retrain + update forecast.json
git add src/data/forecast.json src/data/model-metrics.json
git commit -m "Retrain models with updated data"
git push             # Triggers redeploy on Vercel/Netlify
```

---

## Security notes

- Never commit `.env` — it is gitignored
- Mapbox public tokens (`pk.`) are safe for client-side use
- Anthropic API key is exposed in client bundle (Vite inlines it) — for production, consider a backend proxy
- No user data leaves the browser except API calls to Mapbox and Anthropic

---

<p align="center"><a href="./07-frontend-guide.md">← Frontend Guide</a> · <a href="./09-submission-checklist.md">Submission Checklist →</a></p>
