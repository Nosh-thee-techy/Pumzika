# Setup Guide

Everything you need to run Pumzika locally — dashboard, map, voice AI, and ML pipeline.

---

## Prerequisites

| Requirement | Version | Required for |
|---|---|---|
| **Node.js** | 18+ | Dashboard |
| **npm** | 9+ | Package management |
| **Python** | 3.10–3.12 (3.14 works with fallback) | ML pipeline |
| **Git** | Any recent | Clone repo |
| **Mapbox account** | Free tier | Kenya map tiles |
| **Anthropic account** | Optional | Voice AI (Claude) |

---

## Step 1 — Clone and install

```bash
git clone https://github.com/Nosh-thee-techy/Pumzika.git
cd Pumzika
npm install
```

---

## Step 2 — Environment variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Required for Kenya map
VITE_MAPBOX_TOKEN=pk.eyJ1IjoiYOUR_TOKEN_HERE

# Optional — voice AI uses smart mock without this
VITE_ANTHROPIC_API_KEY=sk-ant-YOUR_KEY_HERE
```

### Getting a Mapbox token

1. Go to https://account.mapbox.com/
2. Create a free account
3. Copy your **Default public token** (starts with `pk.`)
4. Paste into `.env`

### Getting an Anthropic API key

1. Go to https://console.anthropic.com/
2. Create an API key
3. Paste into `.env`

> Without the Anthropic key, the voice agent on `/ask` still works using keyword-matched mock responses. Good enough for demos.

---

## Step 3 — Run the dashboard

```bash
npm run dev
```

Open **http://localhost:5173**

### First-time flow

1. **Onboarding** (`/`) — enter property details:
   - Name: `Kilimani Cozy Studio`
   - Neighborhood: `Kilimani`
   - Bedrooms: `2 BR`
   - Current price: `7000`
2. **Dashboard** (`/dashboard`) — see recommended price, calendar, comps
3. **Map** (`/map`) — explore Kenya counties and Nairobi neighborhoods
4. **Ask** (`/ask`) — try *"Should I lower my price this weekend?"*

Property data saves to `localStorage` — refreshing the page keeps your profile.

---

## Step 4 — ML pipeline (optional)

For fresh model predictions:

```bash
# Install Python dependencies
pip install -r requirements-ml.txt

# Export training CSVs + train models + write forecast.json
npm run build:ml
```

Or step by step:

```bash
npm run export:training   # Creates Data/training/*.csv
npm run train:models      # Trains XGBoost + Prophet, writes src/data/forecast.json
```

Open the notebook:

```bash
jupyter notebook notebooks/pumzika_ml.ipynb
```

---

## Step 5 — Production build

```bash
npm run build:ml    # Ensure latest ML predictions
npm run build       # Output to dist/
npm run preview     # Preview production build locally
```

---

## All npm scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start Vite dev server on port 5173 |
| `npm run build` | Build datasets + production bundle → `dist/` |
| `npm run preview` | Serve production build locally |
| `npm run lint` | Run ESLint |
| `npm run build:data` | Regenerate app JSON from source CSVs |
| `npm run export:training` | Export model-ready training CSVs |
| `npm run train:models` | Train XGBoost + Prophet, write forecast.json |
| `npm run build:ml` | Export + train in one command |

---

## Verify everything works

| Check | How | Expected |
|---|---|---|
| Dashboard loads | Visit `/dashboard` after onboarding | Price ticker shows Ksh amount |
| Map renders | Visit `/map` with Mapbox token | Kenya counties visible, clickable |
| Voice works | Visit `/ask`, type a question | Text response appears (spoken if browser supports TTS) |
| ML data loaded | Check `src/data/model-metrics.json` exists | XGBoost MAE and R² present |
| Forecast populated | Check `src/data/forecast.json` | 15 neighborhoods × 30 days |

---

## Common setup issues

| Issue | Fix |
|---|---|
| Map is grey/blank | Add `VITE_MAPBOX_TOKEN` to `.env`, restart dev server |
| `ModuleNotFoundError: pandas` | Run `pip install -r requirements-ml.txt` |
| Training CSVs not found | Run `npm run export:training` before `train:models` |
| Port 5173 in use | Vite picks next port automatically — check terminal output |
| Property stuck on old data | Clear `localStorage` key `pumzika_property` in browser dev tools |

See [Glossary & FAQ](./10-glossary-faq.md) for more troubleshooting.

---

<p align="center"><a href="./01-problem-and-solution.md">← Problem & Solution</a> · <a href="./03-architecture.md">Architecture →</a></p>
