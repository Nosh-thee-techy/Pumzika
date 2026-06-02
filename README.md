<p align="center">
  <img src="docs/assets/hero-banner.svg" alt="Pumzika Smart Host Dashboard" width="100%" />
</p>

<h1 align="center">Pumzika Smart Host Dashboard</h1>

<p align="center">
  <strong>Pricing intelligence for Nairobi short-term rental hosts.</strong><br/>
  Know tonight's price. See the next 30 days. Ask your market anything.
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> ·
  <a href="#the-problem">Problem</a> ·
  <a href="#the-solution">Solution</a> ·
  <a href="docs/README.md">Documentation</a>
</p>

---

## The Problem

Nairobi's short-term rental market is growing fast — Airbnb, Booking.com, and local platforms are filling up Kilimani, Westlands, and Karen. But most hosts still price by guesswork:

- **No data-driven pricing** — hosts set a flat rate and hope for bookings
- **Blind to demand cycles** — weekends, holidays, and events like Madaraka Day or the Nairobi Marathon catch them off guard
- **No neighborhood context** — a 2BR in Kilimani and a 2BR in South C have completely different demand profiles
- **Fragmented tools** — comps live on Airbnb, bookings in spreadsheets, market intel nowhere

**Result:** hosts under-price busy nights (leaving money on the table) and over-price slow weeks (empty calendars).

<p align="center">
  <img src="docs/assets/problem-solution.svg" alt="Problem vs Solution" width="100%" />
</p>

---

## The Solution

**Pumzika** is a Smart Host Dashboard that turns market data into clear pricing decisions — built for Nairobi, powered by machine learning.

| Capability | What it does |
|---|---|
| **Tonight's price** | XGBoost regression trained on 48k+ historical listings predicts the optimal nightly rate for your property |
| **30-day forecast** | Facebook Prophet time series forecasts occupancy % per day, per neighborhood |
| **Neighborhood comps** | Side-by-side comparison with similar listings in your area |
| **Kenya market map** | Drill from all 47 counties down to Nairobi's 15 neighborhoods |
| **Voice AI agent** | Ask "Should I lower my price this weekend?" — get a spoken answer in seconds |

Models train **offline** in a Python notebook. Predictions export as JSON. The dashboard reads them — no live API calls, no latency.

<p align="center">
  <img src="docs/assets/ml-pipeline.svg" alt="ML Pipeline" width="100%" />
</p>

<p align="center">
  <img src="docs/assets/screens-overview.svg" alt="Dashboard, Map, and Voice AI overview" width="100%" />
</p>

---

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.10+ (for ML pipeline)
- [Mapbox token](https://account.mapbox.com/) (for the Kenya map)

### Run the dashboard

```bash
git clone https://github.com/Nosh-thee-techy/Pumzika.git
cd Pumzika
npm install
cp .env.example .env
```

Add your keys to `.env`:

```env
VITE_MAPBOX_TOKEN=your_mapbox_public_token
VITE_ANTHROPIC_API_KEY=your_anthropic_key   # optional — voice AI falls back to smart mock
```

```bash
npm run dev
```

Open **http://localhost:5173** — complete the 60-second onboarding, then explore the dashboard, map, and voice agent.

### Run the ML pipeline (optional)

```bash
pip install -r requirements-ml.txt
npm run build:ml        # export training CSVs + train models + write forecast.json
```

Or step by step:

```bash
npm run export:training   # Data/training/*.csv
npm run train:models      # src/data/forecast.json
```

Open `notebooks/pumzika_ml.ipynb` for the interactive notebook submission.

---

## Features

### Dashboard (`/dashboard`)
- Hero price ticker with confidence score and recommended range
- Pricing signal breakdown (events, comps, occupancy)
- 30-day demand calendar with heat-mapped occupancy levels
- Neighborhood comps table sorted by price
- Occupancy trend chart and pricing guardrails

### Kenya Map (`/map`)
- **Level 1:** All 47 counties colored by demand score
- **Level 2:** Click a county to zoom in — Nairobi shows 15 neighborhood columns
- **Level 3:** Click a neighborhood for listing-level stats
- Toggle data layers: demand, supply, price

### Ask Pumzika (`/ask`)
- Web Speech API for voice input
- Claude API for intelligent answers (or smart mock without a key)
- Text-to-speech responses — demo-ready even offline

---

## Data & Models

| Challenge | Model | Training data | Output |
|---|---|---|---|
| Ch.1 Pricing | **XGBoost** regression | `listings-pricing.csv` — neighborhood, bedrooms, price, occupancy | `recommendedPrice` per day |
| Ch.2 Forecasting | **Facebook Prophet** | `occupancy-daily.csv` — daily occupancy per neighborhood | 30-day occupancy % forecast |

Current model performance (proxy data):

| Metric | Value |
|---|---|
| XGBoost MAE | Ksh 2,940 |
| XGBoost R² | 0.607 |
| Forecast horizon | 30 days × 15 neighborhoods |

Source CSVs in `Data/`:

| File | Records | Used for |
|---|---|---|
| `AB_NYC_2019.csv` | ~49k listings | Pricing comps, occupancy, ratings |
| `hotel_bookings.csv` | ~119k bookings | Seasonal demand patterns, booking dates |

NYC neighbourhoods are rank-matched to Nairobi areas by price tier, then scaled to KSH. See [docs/DOCUMENTATION.md](docs/DOCUMENTATION.md) for the full data pipeline and how to swap in real Nairobi data.

---

## Project Structure

```
Pumzika/
├── Data/                    # Source CSVs + generated training data
│   └── training/            # Model-ready CSVs (export:training)
├── docs/
│   ├── DOCUMENTATION.md     # Full technical documentation
│   └── assets/              # README diagrams and visuals
├── notebooks/
│   ├── pumzika_ml.ipynb     # ML notebook (submission)
│   └── train_models.py      # Training script
├── public/geo/              # Kenya county GeoJSON boundaries
├── scripts/
│   ├── build-datasets.mjs   # CSV → app JSON
│   └── export-training-data.mjs
├── src/
│   ├── components/          # Dashboard, map, voice, layout
│   ├── data/                # Generated JSON (listings, forecast, etc.)
│   ├── pages/               # Dashboard, Map, Ask
│   └── utils/               # priceEngine, forecastEngine, dataService
└── requirements-ml.txt
```

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Build datasets + production bundle |
| `npm run build:data` | Regenerate app JSON from CSVs |
| `npm run export:training` | Export model-ready training CSVs |
| `npm run train:models` | Train XGBoost + Prophet, write forecast.json |
| `npm run build:ml` | Export + train in one step |

---

## Stack

React 19 · Vite 8 · Tailwind CSS v4 · Recharts · deck.gl · Mapbox GL · Framer Motion · Lucide

**ML:** XGBoost · Facebook Prophet · scikit-learn · pandas

**AI:** Anthropic Claude (voice agent) · Web Speech API

---

## Documentation

Full documentation with 10 focused guides:

| Guide | What it covers |
|---|---|
| [Documentation Index](docs/README.md) | Start here — links to everything |
| [Problem & Solution](docs/01-problem-and-solution.md) | Who it's for, pain points, value |
| [Setup Guide](docs/02-setup-guide.md) | Install, env vars, run locally |
| [Architecture](docs/03-architecture.md) | System design, data flow, tech stack |
| [Dataset Guide](docs/04-dataset-guide.md) | CSV schemas, data collection |
| [Machine Learning](docs/05-machine-learning.md) | XGBoost, Prophet, training |
| [Models vs Engines](docs/06-models-vs-engines.md) | Python models vs JS engines |
| [Frontend Guide](docs/07-frontend-guide.md) | Components, hooks, design system |
| [Deployment](docs/08-deployment.md) | Vercel, Netlify, production |
| [Submission Checklist](docs/09-submission-checklist.md) | Hackathon deliverables, demo script |
| [Glossary & FAQ](docs/10-glossary-faq.md) | Terms, troubleshooting, limitations |

**[Complete reference → docs/DOCUMENTATION.md](docs/DOCUMENTATION.md)**

---

## Demo Tips

1. **Onboarding** — enter a Kilimani 2BR at Ksh 7,000 to see the full dashboard populate
2. **Map** — zoom into Nairobi, click Westlands, toggle demand layer
3. **Voice** — go to `/ask`, ask *"Should I lower my price this weekend?"* — works in mock mode without an API key
4. **Calendar** — point out Madaraka Day and Nairobi Marathon demand spikes

---

## License

MIT — built for the Pumzika hackathon challenge.
